import { createClient } from "@/lib/supabase/client";
import { Tables } from "@/lib/supabase/supabase";
import type { User } from "@supabase/supabase-js";
import { User as UserIcon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const supabase = createClient();

type Message = Tables<"messages">;

type UserProfile = {
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

export const ChatPanel = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: { data: { user: User | null } }) => {
      setUser(data.user);
    });
  }, []);

  // Fetch messages and user profiles
  useEffect(() => {
    const fetchMessagesAndProfiles = async () => {
      setLoading(true);
      const { data: msgs, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true });
      if (!error && msgs) {
        setMessages(msgs as Message[]);
        // Get unique user_ids
        const userIds = Array.from(new Set((msgs as Message[]).map((m) => m.user_id)));
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from("user_profiles")
            .select("id, username, display_name, avatar_url")
            .in("id", userIds);
          if (profilesData) {
            const profileMap: Record<string, UserProfile> = {};
            for (const p of profilesData) {
              profileMap[p.id] = {
                username: p.username,
                display_name: p.display_name,
                avatar_url: p.avatar_url,
              };
            }
            setProfiles(profileMap);
          }
        }
      }
      setLoading(false);
    };
    fetchMessagesAndProfiles();
    const subscription = supabase
      .channel("public:messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload: { new: Message }) => {
          setMessages((msgs) => [...msgs, payload.new]);
          // Fetch profile for new user if not already present
          const userId = payload.new.user_id;
          if (!profiles[userId]) {
            supabase
              .from("user_profiles")
              .select("id, username, display_name, avatar_url")
              .eq("id", userId)
              .single()
              .then(({ data }) => {
                if (data) {
                  setProfiles((prev) => ({
                    ...prev,
                    [userId]: {
                      username: data.username,
                      display_name: data.display_name,
                      avatar_url: data.avatar_url,
                    },
                  }));
                }
              });
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Envoi via API
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !user) return;
    try {
      const res = await fetch("http://localhost:3000/api/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to send message");
        return;
      }
      setNewMessage("");
    } catch (err) {
      alert("Failed to send message");
    }
  };

  return (
    <div className="flex flex-col h-full border rounded bg-white dark:bg-neutral-900">
      <div className="flex-1 overflow-y-auto space-y-2 px-4 py-2 bg-neutral-50 dark:bg-neutral-800">
        {loading ? (
          <div>Loading...</div>
        ) : messages.length === 0 ? (
          <div className="text-neutral-400">No messages yet.</div>
        ) : (
          messages.map((msg) => {
            const profile = profiles[msg.user_id];
            const displayName = profile?.display_name || profile?.username || "Anonymous";
            return (
              <div key={msg.id} className="flex items-center gap-2.5 text-sm">
                <Avatar>
                  {profile?.avatar_url ? (
                    <AvatarImage src={profile.avatar_url} alt={displayName} />
                  ) : (
                    <AvatarFallback>
                      <UserIcon className="w-4 h-4 text-neutral-400" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-semibold text-neutral-700 dark:text-neutral-200">
                    {displayName}
                    <span className="ml-2 text-xs text-neutral-400">
                      {msg.created_at && new Date(msg.created_at).toLocaleTimeString()}
                    </span>
                  </span>
                  <span className="text-neutral-800 dark:text-neutral-100 break-words">{msg.content}</span>
                </div>
              </div>
            );
          })
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