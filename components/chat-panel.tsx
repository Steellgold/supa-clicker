import { createClient } from "@/lib/supabase/client";
import { Tables } from "@/lib/supabase/supabase";
import type { User } from "@supabase/supabase-js";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const supabase = createClient();

type Message = Tables<"messages">;

type UserProfile = {
  username: string;
  display_name: string | null;
  avatar_url: string | null;
};

export const ChatPanel = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }: { data: { user: User | null } }) => {
      setUser(data.user);
      if (data.user) {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("username, display_name, avatar_url")
          .eq("user_id", data.user.id)
          .single();
        setProfile(profile as UserProfile);
      }
    });
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true });
      if (!error && data) {
        setMessages(data as Message[]);
      }
      setLoading(false);
    };
    fetchMessages();
    const subscription = supabase
      .channel("public:messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload: { new: Message }) => {
          setMessages((msgs) => [...msgs, payload.new]);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !user) return;
    await supabase.from("messages").insert({
      user_id: user.id,
      username: profile?.display_name || profile?.username || "Anonyme",
      content: newMessage.trim(),
    });
    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-full border rounded bg-white dark:bg-neutral-900">
      <div className="flex-1 overflow-y-auto space-y-2 px-4 py-2 bg-neutral-50 dark:bg-neutral-800">
        {loading ? (
          <div>Loading...</div>
        ) : messages.length === 0 ? (
          <div className="text-neutral-400">No messages yet.</div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex flex-col text-sm">
              <span className="font-semibold text-neutral-700 dark:text-neutral-200">
                {msg.username || "Anonyme"}
                <span className="ml-2 text-xs text-neutral-400">
                  {msg.created_at && new Date(msg.created_at).toLocaleTimeString()}
                </span>
              </span>
              <span className="text-neutral-800 dark:text-neutral-100 break-words">{msg.content}</span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Write a message..."
          className="flex-1"
          maxLength={500}
          disabled={!user}
        />

        <Button size="lg" type="submit" disabled={!newMessage.trim() || !user}>
          Send
        </Button>
      </form>
    </div>
  );
}; 