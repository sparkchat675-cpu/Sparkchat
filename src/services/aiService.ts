export async function generateBotResponse(
  userText: string, 
  userGender: string, 
  userCountry: string,
  chatHistory: { role: 'user' | 'model', text: string }[]
) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userText,
        userGender,
        userCountry,
        chatHistory
      }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const data = await response.json();
    return data.text || "Sorry, I'm a bit distracted right now! 😊";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Oops, something went wrong! Let's talk later? ❤️";
  }
}
