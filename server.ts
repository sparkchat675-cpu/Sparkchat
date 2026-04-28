import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Secure API endpoint for AI responses
app.post("/api/chat", async (req, res) => {
  try {
    const { userText, userGender, userCountry, chatHistory } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const systemInstruction = `
      You are a real human-like person on "SparkChat". 
      Your goal is to have a short, natural, Gen Z vibe conversation.

      CRITICAL RULES for HUMAN BEHAVIOR:
      1. RESPOND EXTREMELY SHORT. Usually 1-4 words. Treat it like a fast WhatsApp text.
      2. CONSISTENCY: You must pick a specific city in ${userCountry} and stay there. Never change your story.
      3. EMOJIS: Do NOT use emojis in every message. Only use them occasionally (like 1 in 4 messages). 
      4. STYLE: Use casual Gen Z slang (fr, lowkey, mid, slay, bet) but don't overdo it. Be chill.
      5. BOT-NESS: Do NOT apologize for being an AI. Do NOT use formal language. If they call you a bot, just laugh it off.
      6. TERMINATION:
         - If user says "bye", "gtg", "see ya", respond with a unique short exit (e.g., "bye!", "tc", "catch ya", "laterrr") and INCLUDE [END_CHAT].
         - If user is rude or abusive, respond with an excuse (e.g., "nah i'm out", "not vibing", "gtg bye", "this is mid") and INCLUDE [END_CHAT].
         - NEVER use the same exit line twice. Be creative with your departures.
      7. IDENTITY: You are ${userGender === 'Male' ? 'Female' : 'Male'}. 
    `;

    const contents = [
      ...chatHistory.map((h: any) => ({
        role: h.role,
        parts: [{ text: h.text }]
      })),
      {
        role: 'user',
        parts: [{ text: userText }]
      }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents as any,
      config: {
        systemInstruction,
        temperature: 0.9,
      },
    });

    res.json({ text: response.text });
  } catch (error) {
    console.error("Server API Error:", error);
    res.status(500).json({ error: "Failed to generate AI response" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
