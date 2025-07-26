import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import React, { useEffect, useRef, useState, ReactElement } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/auth-context";
import { Send } from "lucide-react";

type Message = {
  content: string | null;
  created_at: string | null;
  display_name: string | null;
  username: string | null;
	avatar_url: string | null;
};

const parseMarkdown = (text: string) => {
  if (!text) return null;
  
  const parts: (string | ReactElement)[] = [];
  let currentText = text;
  
  const boldRegex = /\*\*(.*?)\*\*/g;
  let boldMatch;
  while ((boldMatch = boldRegex.exec(currentText)) !== null) {
    const beforeBold = currentText.substring(0, boldMatch.index);
    if (beforeBold) parts.push(beforeBold);
    parts.push(<strong key={`bold-${parts.length}`}>{boldMatch[1]}</strong>);
    currentText = currentText.substring(boldMatch.index + boldMatch[0].length);
    boldRegex.lastIndex = 0;
  }
  if (currentText) parts.push(currentText);
  
  const italicParts: (string | ReactElement)[] = [];
  parts.forEach((part, index) => {
    if (typeof part === "string") {
      const italicRegex = /\*(.*?)\*/g;
      let italicMatch;
      let currentPart = part;
      while ((italicMatch = italicRegex.exec(currentPart)) !== null) {
        const beforeItalic = currentPart.substring(0, italicMatch.index);
        if (beforeItalic) italicParts.push(beforeItalic);
        italicParts.push(<em key={`italic-${index}-${italicParts.length}`}>{italicMatch[1]}</em>);
        currentPart = currentPart.substring(italicMatch.index + italicMatch[0].length);
        italicRegex.lastIndex = 0;
      }
      if (currentPart) italicParts.push(currentPart);
    } else {
      italicParts.push(part);
    }
  });
  
  const finalParts: (string | ReactElement)[] = [];
  italicParts.forEach((part, index) => {
    if (typeof part === "string") {
      const underlineRegex = /__(.*?)__/g;
      let underlineMatch;
      let currentPart = part;
      while ((underlineMatch = underlineRegex.exec(currentPart)) !== null) {
        const beforeUnderline = currentPart.substring(0, underlineMatch.index);
        if (beforeUnderline) finalParts.push(beforeUnderline);
        finalParts.push(<u key={`underline-${index}-${finalParts.length}`}>{underlineMatch[1]}</u>);
        currentPart = currentPart.substring(underlineMatch.index + underlineMatch[0].length);
        underlineRegex.lastIndex = 0;
      }
      if (currentPart) finalParts.push(currentPart);
    } else {
      finalParts.push(part);
    }
  });
  
  return finalParts.length > 0 ? finalParts : text;
};

const parseMentions = (text: string | (string | ReactElement)[] | null, currentUsername?: string, onlineUsers: string[] = []) => {
  if (!text) return null;
  
  const textString = Array.isArray(text) ? text.map(part => typeof part === 'string' ? part : '').join('') : text;
  
  const parts: (string | ReactElement)[] = [];
  const mentionRegex = /@([a-zA-Z0-9_]+)/g;
  let lastIndex = 0;
  let match;
  
  while ((match = mentionRegex.exec(textString)) !== null) {
    const beforeMention = textString.substring(lastIndex, match.index);
    if (beforeMention) parts.push(beforeMention);
    
    const mentionedUsername = match[1];
    const isCurrentUser = mentionedUsername === currentUsername;
    const userExists = onlineUsers.includes(mentionedUsername);
    
    if (userExists) {
      parts.push(
        <Link
          key={`mention-${match.index}`}
          href={`/${mentionedUsername}`}
          className={cn(
            "px-1 rounded",
            isCurrentUser 
              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50"
              : "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50",
            "cursor-pointer",
          )}
        >
          @{mentionedUsername}
        </Link>
      );
    } else {
      parts.push(`@${mentionedUsername}`);
    }
    
    lastIndex = match.index + match[0].length;
  }
  
  const afterMention = textString.substring(lastIndex);
  if (afterMention) parts.push(afterMention);
  
  return parts.length > 0 ? parts : textString;
};

export const ChatPanel = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState<number>(0);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { user, userProfile } = useAuth();

  const supabase = createClient();

  useEffect(() => {
    const container = messagesEndRef.current?.parentElement?.parentElement;
    if (container) {
      const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 10;
      if (isAtBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages]);

  useEffect(() => {
    const fetchOnlineUsers = async () => {
      try {
        const { data, error } = await supabase
          .from("public_profiles")
          .select("username")
          .not("username", "is", null)
          .limit(50);
        
        if (!error && data) {
          setOnlineUsers(data.map(p => p.username).filter((username): username is string => username !== null));
        }
      } catch (error) {
        console.error("Error fetching online users:", error);
      }
    };

    fetchOnlineUsers();
    const interval = setInterval(fetchOnlineUsers, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("chat_messages_public")
          .select("*")
          .order("created_at", { ascending: true })
          .limit(50);
        
        if (!error && data) {
          setMessages(data);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
      setLoading(false);
    };

    fetchMessages();

    const subscription = supabase
      .channel("public:chat_messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        async (payload: { new: any }) => {
          const { data: messageData } = await supabase
            .from("chat_messages_public")
            .select("*")
            .eq("created_at", payload.new.created_at)
            .eq("content", payload.new.content)
            .single();
          
          if (messageData) {
            setMessages((msgs) => [...msgs, messageData]);
          }
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

    const now = Date.now();
    if (now - lastMessageTime < 2000) return;

    const trimmedMessage = newMessage.trim();
    if (trimmedMessage.length < 2 || trimmedMessage.length > 500) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.content === trimmedMessage && lastMessage.username === user.user_metadata?.username) {
      return;
    }

    try {
      await supabase.from("chat_messages").insert({
        content: trimmedMessage,
        user_id: user.id
      });

			setNewMessage("");
      setLastMessageTime(now);
      setShowMentions(false);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);
    
    const lastAtSymbol = value.lastIndexOf("@");
    if (lastAtSymbol !== -1) {
      const afterAt = value.substring(lastAtSymbol + 1);
      const beforeAt = value.substring(0, lastAtSymbol);
      
      if (!afterAt.includes(" ")) {
        setMentionFilter(afterAt);
        setShowMentions(true);
        return;
      }
    }
    
    setShowMentions(false);
  };

  const insertMention = (username: string) => {
    const lastAtSymbol = newMessage.lastIndexOf("@");
    const beforeAt = newMessage.substring(0, lastAtSymbol);
    const afterAt = newMessage.substring(lastAtSymbol + 1);
    const afterUsername = afterAt.substring(afterAt.indexOf(" ") !== -1 ? afterAt.indexOf(" ") : afterAt.length);
    
    setNewMessage(beforeAt + "@" + username + " " + afterUsername);
    setShowMentions(false);
  };

  return (
    <div className="flex flex-col h-full border bg-white dark:bg-neutral-900">
      <ScrollArea className="flex-1 px-4 py-2 bg-neutral-50 dark:bg-neutral-800" style={{ maxHeight: "calc(100vh - 210px)" }}>
        <div className="space-y-2">
					{loading ? (
						<div>Loading...</div>
					) : messages.length === 0 ? (
						<div className="text-neutral-400">No messages yet.</div>
					) : (
						messages.map((msg, index) => {
							const prevMsg = index > 0 ? messages[index - 1] : null;
							const isSameUser = prevMsg && 
								(prevMsg.username === msg.username) && 
								(prevMsg.display_name === msg.display_name);
							
							const isWithinTimeLimit = prevMsg && msg.created_at && prevMsg.created_at && 
								(() => {
									const prevDate = new Date(prevMsg.created_at);
									const currentDate = new Date(msg.created_at);
									return prevDate.getHours() === currentDate.getHours() && 
												prevDate.getMinutes() === currentDate.getMinutes();
								})();
							
							let consecutiveCount = 1;
							let i = index - 1;
							while (i >= 0) {
								const checkMsg = messages[i];
								if (checkMsg.username === msg.username && 
										checkMsg.display_name === msg.display_name &&
										checkMsg.created_at && msg.created_at) {
									const checkDate = new Date(checkMsg.created_at);
									const currentDate = new Date(msg.created_at);
									if (checkDate.getHours() === currentDate.getHours() && 
											checkDate.getMinutes() === currentDate.getMinutes()) {
										consecutiveCount++;
										i--;
									} else {
										break;
									}
								} else {
									break;
								}
							}
							
							const shouldGroup = isSameUser && isWithinTimeLimit && consecutiveCount <= 5;

							if (shouldGroup) {
								return (
									<div key={`${msg.created_at}-${index}`} className="flex flex-col text-sm ml-11">
										<span className="text-neutral-800 dark:text-neutral-100 break-words">
											{parseMentions(parseMarkdown(msg.content || ""), userProfile?.username, onlineUsers)}
										</span>
									</div>
								);
							}

							return (
								<div key={`${msg.created_at}-${index}`} className="flex flex-row gap-2.5 items-center">
									<Avatar className="mb-0.5">
										<AvatarImage
											src={msg.avatar_url || ""}
											style={{
												imageRendering: "pixelated"
											}}
										/>
										<AvatarFallback>
											{msg.display_name?.charAt(0) || msg.username?.charAt(0)}
										</AvatarFallback>
									</Avatar>

									<div className="flex flex-col text-sm">
										<span className="font-semibold text-neutral-700 dark:text-neutral-200">
											{msg.display_name || msg.username}
											<span className="ml-2 text-xs text-neutral-400">
												{msg.created_at ? new Date(msg.created_at).toLocaleTimeString() : ""}
											</span>
										</span>

										<span className="text-neutral-800 dark:text-neutral-100 break-words">
											{parseMentions(parseMarkdown(msg.content || ""), userProfile?.username, onlineUsers)}
										</span>
									</div>
								</div>
							);
						})
					)}

        	<div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSend} className="flex gap-2 p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 relative">
        <div className="flex-1 relative">
          <Input
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Write a message..."
            className="w-full"
            maxLength={500}
            disabled={!user}
          />
          
          {showMentions && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg max-h-40 overflow-y-auto z-10">
              {onlineUsers
                .filter(username => 
                  username.toLowerCase().includes(mentionFilter.toLowerCase()) &&
                  username !== user?.user_metadata?.username
                )
                .slice(0, 5)
                .map((username, index) => (
                  <button
                    key={username}
                    type="button"
                    onClick={() => insertMention(username)}
                    className="w-full px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 text-sm"
                  >
                    @{username}
                  </button>
                ))}
              {onlineUsers.filter(username => 
                username.toLowerCase().includes(mentionFilter.toLowerCase()) &&
                username !== user?.user_metadata?.username
              ).length === 0 && (
                <div className="px-3 py-2 text-neutral-500 text-sm">
                  No users found
                </div>
              )}
            </div>
          )}
        </div>

        <Button size="lg" type="submit" disabled={!newMessage.trim() || !user} className="w-6">
          <Send />
        </Button>
      </form>
    </div>
  );
}; 