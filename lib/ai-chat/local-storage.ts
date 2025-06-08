import { ChatSession, ChatMessage } from './types';

const STORAGE_PREFIX = 'ai-chat-session-';

export function getChatSession(sessionId: string): ChatSession | null {
  if (typeof window === "undefined") return null;
  
  try {
    const data = localStorage.getItem(`${STORAGE_PREFIX}${sessionId}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting chat session:', error);
    return null;
  }
}

export function setChatSession(session: ChatSession): void {
  if (typeof window === "undefined") return;
  
  try {
    const updatedSession = { ...session, updatedAt: Date.now() };
    localStorage.setItem(
      `${STORAGE_PREFIX}${session.id}`, 
      JSON.stringify(updatedSession)
    );
  } catch (error) {
    console.error('Error setting chat session:', error);
  }
}

export function addMessageToSession(sessionId: string, message: ChatMessage): void {
  const session = getChatSession(sessionId);
  if (!session) return;
  
  session.messages.push(message);
  setChatSession(session);
}

export function clearChatSession(sessionId: string): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${sessionId}`);
  } catch (error) {
    console.error('Error clearing chat session:', error);
  }
}

export function getAllChatSessions(): ChatSession[] {
  if (typeof window === "undefined") return [];
  
  try {
    const sessions: ChatSession[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        const data = localStorage.getItem(key);
        if (data) {
          sessions.push(JSON.parse(data));
        }
      }
    }
    return sessions.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (error) {
    console.error('Error getting all chat sessions:', error);
    return [];
  }
}

export function createChatSession(artworkData: any): ChatSession {
  if (!artworkData.id) {
    throw new Error('artworkData.id is required for session creation');
  }
  const sessionId = artworkData.id;

  // try to reuse existing session
  const existingSession = getChatSession(sessionId);
  if (existingSession) {
    return existingSession;
  }

  // do not store base64Image
  const { base64Image, ...artworkDataForStorage } = artworkData;

  const now = Date.now();
  const session: ChatSession = {
    id: sessionId,
    artworkId: artworkData.id,
    artworkData: artworkDataForStorage,
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
  setChatSession(session);
  return session;
} 