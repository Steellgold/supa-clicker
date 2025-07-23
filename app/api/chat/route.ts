import { createClient as createServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_BURST = 5;
const RATE_LIMIT_MIN_INTERVAL = 2000;
const userMessageTimestamps = new Map<string, number[]>();

const isUserRateLimited = (userId: string): boolean => {
  const now = Date.now();
  const timestamps = userMessageTimestamps.get(userId) || [];
  const recent = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW);
  
  if (recent.length >= RATE_LIMIT_BURST) return true;
  if (recent.length > 0 && now - recent[recent.length - 1] < RATE_LIMIT_MIN_INTERVAL) return true;
  
  recent.push(now);
  userMessageTimestamps.set(userId, recent);
  return false;
}

const isLengthValid = (content: string): boolean => {
  return content.length > 1 && content.length < 1000;
}

const areMessagesTooSimilar = (a: string, b: string): boolean => {
  const clean = (str: string) =>
    str.toLowerCase().replace(/\s+/g, " ").trim();

  const levenshtein = (s1: string, s2: string): number => {
    const len1 = s1.length;
    const len2 = s2.length;
    const dp = Array.from({ length: len1 + 1 }, () =>
      new Array(len2 + 1).fill(0)
    );

    for (let i = 0; i <= len1; i++) dp[i][0] = i;
    for (let j = 0; j <= len2; j++) dp[0][j] = j;

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,       // Delete
          dp[i][j - 1] + 1,       // Insert
          dp[i - 1][j - 1] + cost // Substitute
        );
      }
    }

    return dp[len1][len2];
  };

  const msg1 = clean(a);
  const msg2 = clean(b);
  const distance = levenshtein(msg1, msg2);
  const maxLength = Math.max(msg1.length, msg2.length);
  const similarity = 1 - distance / maxLength;

  return similarity >= 0.9;
}


export const POST = async (request: NextRequest) => {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const content = (body.content || "").trim();

    const { data: previousMessage } = await supabase
      .from("messages")
      .select("content")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (previousMessage && areMessagesTooSimilar(content, previousMessage.content)) {
      return NextResponse.json({ error: "Message too similar to previous message" }, { status: 400 });
    }

    if (!isLengthValid(content)) {
      return NextResponse.json({ error: "Message too short or too long" }, { status: 400 });
    }

    const { data: inserted, error: insertError } = await supabase
      .from("messages")
      .insert({ user_id: user.id, content })
      .select("id").single();

    if (insertError || !inserted) {
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }

    const messageId = inserted.id;

    const limited = isUserRateLimited(user.id);
    if (!limited) {
      (async () => {
        try {
          const moderation = await openai.moderations.create({
            model: "omni-moderation-latest",
            input: content,
          });

          const flagged = moderation.results?.[0]?.flagged || false;

          if (flagged) {
            console.error("Message flagged by moderation", content);
            await supabase.from("messages").delete().eq("id", messageId);
          }

        } catch (err) {
          console.error("Failed to moderate message", content, err);
          await supabase.from("messages").delete().eq("id", messageId);
        }
      })();
    }

    return NextResponse.json({ success: true, rateLimited: limited });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}