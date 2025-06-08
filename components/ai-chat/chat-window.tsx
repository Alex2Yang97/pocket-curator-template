"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage as ChatMessageType, ArtworkData } from "@/lib/ai-chat/types";
import { ChatMessage } from "./chat-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Bot } from "lucide-react";
import { sendChatMessage } from "@/lib/ai-chat/api";
import { addMessageToSession } from "@/lib/ai-chat/local-storage";

interface ChatWindowProps {
  sessionId: string;
  messages: ChatMessageType[];
  artworkData: ArtworkData;
  onNewMessage: (message: ChatMessageType) => void;
}

export function ChatWindow({ 
  sessionId, 
  messages, 
  artworkData, 
  onNewMessage 
}: ChatWindowProps) {
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingAssistantMessage, setPendingAssistantMessage] = useState<ChatMessageType | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pendingAssistantMessage]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessageType = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: Date.now(),
    };

    addMessageToSession(sessionId, userMessage);
    onNewMessage(userMessage);
    setInputMessage("");
    setIsLoading(true);

    // only maintain assistant messages in local state
    const assistantMessageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    let aiText = "";
    setPendingAssistantMessage({
      id: assistantMessageId,
      role: 'assistant',
      content: "",
      timestamp: Date.now(),
    });

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: userMessage.content,
          artworkData,
          chatHistory: messages,
        }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          aiText += chunk;
          setPendingAssistantMessage({
            id: assistantMessageId,
            role: 'assistant',
            content: aiText,
            timestamp: Date.now(),
          });
        }
      }
      // after stream ends, merge to chat history
      const finalAssistantMessage = {
        id: assistantMessageId,
        role: 'assistant' as const,
        content: aiText,
        timestamp: Date.now(),
      };
      addMessageToSession(sessionId, finalAssistantMessage);
      onNewMessage(finalAssistantMessage);
      setPendingAssistantMessage(null);
    } catch (error) {
      const errorMessage: ChatMessageType = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        role: 'assistant' as const,
        content: 'Sorry, AI response failed, please try again later.',
        timestamp: Date.now(),
      };
      addMessageToSession(sessionId, errorMessage);
      onNewMessage(errorMessage);
      setPendingAssistantMessage(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* chat header */}
      <div className="p-4 border-b border-border bg-muted/60">
        <h2 className="font-semibold text-lg text-foreground">AI Art Insight Chat</h2>
        <p className="text-sm text-muted-foreground">
          Discuss "{artworkData.title}" with AI
        </p>
      </div>

      {/* messages area */}
      <div className="flex-1 min-h-0 bg-background max-h-[60vh] lg:max-h-[70vh] overflow-y-auto">
        <div className="min-h-full">
          {messages.length === 0 && !pendingAssistantMessage ? (
            <div className="flex items-center justify-center h-full p-8">
              <div className="text-center">
                <Bot className="w-12 h-12 mx-auto mb-4 text-[#D2B877]" />
                <h3 className="font-medium mb-2 text-foreground">Start a conversation</h3>
                <p className="text-sm text-muted-foreground">
                  Ask me anything about this artwork
                </p>
              </div>
            </div>
          ) : (
            <div>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {pendingAssistantMessage && (
                <ChatMessage key={pendingAssistantMessage.id} message={pendingAssistantMessage} />
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* input area */}
      <div className="p-4 border-t border-border bg-muted/60">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your question..."
            disabled={isLoading}
            className="flex-1 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-[#D2B877]"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            size="icon"
            className="bg-gradient-to-r from-[#D2B877] to-[#E8C987] text-black hover:from-[#E8C987] hover:to-[#D2B877]"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 