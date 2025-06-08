import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { ChatRequest } from "@/lib/ai-chat/types";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const body: ChatRequest = await req.json();
    const { message, artworkData, chatHistory } = body;

    if (!message || !artworkData) {
      return NextResponse.json(
        { success: false, error: "Message and artwork data are required" },
        { status: 400 }
      );
    }

    // 添加系统提示（英文）
    const messages: any[] = [
      {
        role: "system",
        content: `You are a professional art analyst and critic. The user will discuss an artwork with you. Please provide insightful, professional answers based on the image content and user-provided information. Maintain a friendly and educational tone.\n\nArtwork info:\nTitle: ${artworkData.title || 'Unknown'}\nArtist: ${artworkData.artist || 'Unknown'}\nDescription: ${artworkData.description || 'No description'}\n\nPlease answer in the same language as the user.`
      }
    ];

    // 只保留最近10条user/assistant消息，按原始顺序
    const last10 = chatHistory.slice(-10);
    last10.forEach(msg => {
      if (msg.role === 'user') {
        messages.push({
          role: "user",
          content: [
            { type: "input_text", text: msg.content }
          ]
        });
      } else if (msg.role === 'assistant') {
        messages.push({
          role: "assistant",
          content: msg.content
        });
      }
    });

    // 添加当前用户消息（带图片）
    const userMessage: any = {
      role: "user",
      content: [
        { type: "input_text", text: message }
      ]
    };
    if (artworkData.imageUrl) {
      userMessage.content.push({
        type: "input_image",
        image_url: artworkData.imageUrl,
        detail: "low"
      });
    }
    messages.push(userMessage);

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const stream = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: messages,
      stream: true,
    });

    const encoder = new TextEncoder();

    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            for await (const event of stream) {
              if (event.type === "response.output_text.delta") {
                controller.enqueue(encoder.encode(event.delta));
              } else if (event.type === "error") {
                controller.enqueue(encoder.encode(`[ERROR] ${event.message}\n`));
                controller.close();
                return;
              } else if (event.type === "response.failed") {
                controller.enqueue(encoder.encode(`[FAILED] ${event.response?.error?.message || "Unknown error"}\n`));
                controller.close();
                return;
              }
            }
            controller.close();
          } catch (err) {
            controller.enqueue(encoder.encode(`[ERROR] ${err instanceof Error ? err.message : String(err)}\n`));
            controller.close();
          }
        },
      }),
      {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "Transfer-Encoding": "chunked",
        },
      }
    );

  } catch (error) {
    console.error("OpenAI API Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Internal server error" 
      },
      { status: 500 }
    );
  }
} 