"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { ChatWindow } from "@/components/ai-chat/chat-window";
import { getChatSession, setChatSession } from "@/lib/ai-chat/local-storage";
import { ChatSession, ChatMessage } from "@/lib/ai-chat/types";
import { Button } from "@/components/ui/button";
import { RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { getArtworkById } from "@/lib/supabase-data";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { StickyNoteIcon, ExhibitNavIcon, UserIcon } from "@/components/shared-icons";

interface AiChatSessionPageProps {
  params: Promise<{ sessionId: string }>;
}

export default function AiChatSessionPage({ params }: AiChatSessionPageProps) {
  const { sessionId } = React.use(params);
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);

  // 跳过 useEffect 写回的 ref
  const skipNextMessagesEffect = React.useRef(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push(`/auth/login?redirect=/ai-chat/session/${sessionId}`);
    }
  }, [isAuthLoading, user, router, sessionId]);

  useEffect(() => {
    async function ensureSession() {
      // 1. try to read from localStorage
      let localSession = getChatSession(sessionId);
      // check if artworkData is complete
      const isArtworkDataComplete = (artworkData: any) => {
        return (
          artworkData &&
          artworkData.id &&
          artworkData.title &&
          artworkData.artist &&
          artworkData.metadata
        );
      };
      if (localSession) {
        if (!isArtworkDataComplete(localSession.artworkData)) {
          // fetch artwork data to complete
          try {
            const artworkData = await getArtworkById(sessionId);
            const artworkForSession = {
              id: artworkData.id,
              title: artworkData.title,
              artist: artworkData.artist,
              description: artworkData.curator_notes || artworkData.description || '',
              imageUrl: artworkData.image_url || artworkData.imageUrl || '/placeholder.svg',
              metadata: {
                artwork_date: artworkData.artwork_date || artworkData.date || '',
                curator: artworkData.curator || null,
                collection: artworkData.collection || null,
              },
            };
            localSession = { ...localSession, artworkData: artworkForSession };
            setChatSession(localSession); // write back to localStorage
          } catch (e) {
            router.push("/ai-chat");
            return;
          }
        }
        setSession(localSession);
        setMessages(localSession.messages || []);
        setIsLoading(false);
        return;
      }
      // 2. fallback to artwork initialization
      let artworkData: any = null;
      try {
        artworkData = await getArtworkById(sessionId);
      } catch (e) {
        router.push("/ai-chat");
        return;
      }
      // Store curator, collection, artwork_date in metadata
      const artworkForSession = {
        id: artworkData.id,
        title: artworkData.title,
        artist: artworkData.artist,
        description: artworkData.curator_notes || artworkData.description || '',
        imageUrl: artworkData.image_url || artworkData.imageUrl || '/placeholder.svg',
        metadata: {
          artwork_date: artworkData.artwork_date || artworkData.date || '',
          curator: artworkData.curator || null,
          collection: artworkData.collection || null,
        },
      };
      const now = Date.now();
      const chatSession = {
        id: sessionId,
        artworkId: artworkData.id,
        artworkData: artworkForSession,
        messages: [],
        createdAt: now,
        updatedAt: now,
      };
      setSession(chatSession);
      setMessages([]);
      setIsLoading(false);
    }
    ensureSession();
  }, [sessionId, router]);

  // write back to localStorage when messages change
  useEffect(() => {
    if (session) {
      if (skipNextMessagesEffect.current) {
        skipNextMessagesEffect.current = false;
        return; // skip this write back
      }
      const updatedSession = { ...session, messages, updatedAt: Date.now() };
      setSession(updatedSession);
      setChatSession(updatedSession);
    }
  }, [messages]);

  const handleNewMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  };

  const handleClearSession = () => {
    if (confirm("Are you sure you want to clear this conversation? This action cannot be undone.")) {
      if (session) {
        // only clear messages, keep other session info
        const clearedSession = { ...session, messages: [], updatedAt: Date.now() };
        setChatSession(clearedSession); // write back to localStorage
        setSession(clearedSession); // ensure UI response immediately
        skipNextMessagesEffect.current = true; // 跳过下一次 useEffect
        setMessages([]);
      }
    }
  };

  // Format description with simple markdown (bold and italic)
  const formatDescription = (text: string) => {
    if (!text) return ""
    let formatted = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    formatted = formatted.replace(/\*(.*?)\*/g, "<em>$1</em>")
    return formatted
  }

  // Don't render until auth is loaded and user is present
  if (isAuthLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D2B877] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-foreground">Session Not Found</h1>
            <p className="text-muted-foreground mb-6">
              Please check the link or return to the home page to start again.
            </p>
            <Button 
              onClick={() => router.push("/ai-chat")}
              className="bg-[#D2B877] text-black hover:bg-[#E8C987]"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { artworkData } = session;
  const imageUrl = artworkData.imageUrl || "/placeholder.svg";
  const title = artworkData.title || "Untitled";
  const artist = artworkData.artist || "Unknown Artist";
  const metadata = artworkData.metadata || {};
  const artworkDate = metadata.artwork_date || null;
  const curator = metadata.curator;
  const collection = metadata.collection;
  const curatorName = curator?.username || "Unknown Curator";
  const curatorId = curator?.id;
  const collectionTitle = collection?.title || "Unknown Collection";
  const collectionId = collection?.id;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 container py-8 px-4 md:px-8">
        {/* Top navigation breadcrumb - match artwork page style */}
        <div className="mb-8 flex items-center gap-2 text-base font-medium font-sans text-[#222] dark:text-foreground">
          {curator && curatorId && (
            <Link
              href={`/profile/${curatorId}`}
              className="hover:text-[#D2B877] dark:hover:text-[#E8C987] transition-colors underline underline-offset-2 cursor-pointer max-w-[120px] truncate"
              tabIndex={0}
              title={curatorName}
            >
              {curatorName}
            </Link>
          )}
          <span className="mx-1 text-muted-foreground">/</span>
          {collection && collectionId && (
            <Link
              href={`/collections/${collectionId}`}
              className="hover:text-[#D2B877] dark:hover:text-[#E8C987] transition-colors underline underline-offset-2 cursor-pointer max-w-[120px] truncate"
              tabIndex={0}
              title={collectionTitle}
            >
              {collectionTitle}
            </Link>
          )}
          <span className="mx-1 text-muted-foreground">/</span>
          <Link
            href={`/artwork/${artworkData.id}`}
            className="hover:text-[#D2B877] dark:hover:text-[#E8C987] transition-colors underline underline-offset-2 cursor-pointer max-w-[120px] truncate"
            tabIndex={0}
            title={title}
          >
            {title}
          </Link>
          <span className="mx-1 text-muted-foreground">/</span>
          <span className="text-[#D2B877] font-semibold whitespace-nowrap">Discover with AI</span>
        </div>

        {/* Action buttons */}
        <div className="mb-8 flex items-center justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearSession}
            disabled={messages.length === 0}
            className="border-[#D2B877]/50 text-[#D2B877] hover:bg-[#D2B877] hover:text-black"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear Chat
          </Button>
        </div>

        {/* Main content area */}
        <div className="flex flex-col lg:flex-row lg:items-stretch lg:gap-12 max-w-[1800px] mx-auto">
          {/* Artwork image container - Left side */}
          <div className="w-full lg:w-1/2 xl:w-1/2 mb-6 lg:mb-0 flex flex-col">
            <div className="relative w-full h-full flex-1 px-0 md:px-4">
              {imageUrl ? (
                <div className="relative w-full h-full min-h-[30vh] lg:min-h-[60vh] max-h-[40vh] lg:max-h-[85vh]">
                  <Image
                    src={imageUrl}
                    alt={title + (artist ? ` by ${artist}` : "")}
                    fill
                    className="object-contain rounded-xl lg:rounded-none"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              ) : (
                <div className="w-full h-full min-h-[30vh] lg:min-h-[60vh] max-h-[40vh] lg:max-h-[85vh]">
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-900 flex items-center justify-center flex-col rounded-xl lg:rounded-none">
                    <div className="mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-500"
                      >
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                        <line x1="2" x2="22" y1="2" y2="22"></line>
                      </svg>
                    </div>
                    <div className="text-gray-400">Image unavailable</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chat Window - Right side */}
          <div className="w-full lg:w-1/2 xl:w-1/2 flex flex-col">
            <Card className="flex flex-col flex-1 h-full min-h-[40vh] lg:min-h-[70vh] bg-[#f8f8f8] dark:bg-[#18181c] border border-border rounded-xl overflow-hidden shadow-lg">
              <CardContent className="p-0 flex flex-col flex-1 h-full min-h-0">
                <ChatWindow
                  sessionId={sessionId}
                  messages={messages}
                  artworkData={session.artworkData}
                  onNewMessage={handleNewMessage}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
} 