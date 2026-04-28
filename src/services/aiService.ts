import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const botModel = "gemini-3-flash-preview";

export async function generateBotResponse(
  userText: string, 
  userGender: string, 
  userCountry: string,
  chatHistory: { role: 'user' | 'model', text: string }[]
) {
  try {
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
      ...chatHistory.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      })),
      {
        role: 'user',
        parts: [{ text: userText }]
      }
    ];

    const response = await ai.models.generateContent({
      model: botModel,
      contents: contents as any,
      config: {
        systemInstruction,
        temperature: 0.9,
      },
    });

    return response.text || "Sorry, I'm a bit distracted right now! 😊";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Oops, something went wrong! Let's talk later? ❤️";
  }
}
