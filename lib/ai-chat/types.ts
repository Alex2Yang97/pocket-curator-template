export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  artworkId: string;
  artworkData: ArtworkData;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface ArtworkData {
  id: string;
  title: string;
  artist?: string;
  description?: string;
  imageUrl: string;
  base64Image?: string;
  metadata?: Record<string, any>;
}

export interface ChatRequest {
  sessionId: string;
  message: string;
  artworkData: ArtworkData;
  chatHistory: ChatMessage[];
}

export interface ChatResponse {
  success: boolean;
  message?: string;
  error?: string;
} 