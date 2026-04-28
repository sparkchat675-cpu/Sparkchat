import { GoogleGenAI } from "@google/genai";

// Use the specific key provided by the user
const USER_API_KEY = "AIzaSyC7J0goUOxAq6jmhfm8I6orufTOEXMrhI8";

export async function generateBotResponse(
  userText: string, 
  userGender: string, 
  userCountry: string,
  chatHistory: { role: 'user' | 'model', text: string }[]
) {
  try {
    const apiKey = USER_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : '');
    
    if (!apiKey) {
      throw new Error("No Gemini API key available.");
    }

    const ai = new GoogleGenAI({ apiKey });

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
      ...chatHistory.filter(h => h.role === 'user' || h.role === 'model').map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      })),
      {
        role: 'user',
        parts: [{ text: userText }]
      }
    ];

    const validContents: any[] = [];
    contents.forEach((item) => {
      if (validContents.length === 0) {
        if (item.role === 'user') {
          validContents.push(item);
        }
      } else if (item.role !== validContents[validContents.length - 1].role) {
        validContents.push(item);
      } else {
        validContents[validContents.length - 1].parts[0].text += " " + item.parts[0].text;
      }
    });

    if (validContents.length === 0) {
      validContents.push({
        role: 'user',
        parts: [{ text: userText }]
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: validContents,
      config: {
        systemInstruction,
        temperature: 0.9,
      },
    });

    if (!response.text) {
      console.error("Empty AI response:", response);
      return "Sorry, connection is a bit slow! Let's try again? 😊";
    }

    return response.text;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    if (error?.message?.includes("API key not valid")) {
       return "Oops! My brain is a bit fuzzy (Invalid Key). Let's talk later? ❤️";
    }
    
    return "Oops, something went wrong! Let's talk later? ❤️";
  }
}
