import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Generate Audio menggunakan OpenAI TTS
    // Voice options: 'alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'
    // 'onyx' biasanya terdengar berat dan profesional (cocok untuk Mr. Paul)
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy", 
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());

    // Kembalikan audio sebagai response
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": buffer.length,
      },
    });

  } catch (error) {
    console.error("TTS Error:", error);
    return NextResponse.json({ error: "TTS Failed" }, { status: 500 });
  }
}