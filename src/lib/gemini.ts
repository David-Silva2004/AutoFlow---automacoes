import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

export function getAIClient(): GoogleGenAI {
  if (!aiInstance) {
    // Vercel build time evaluates this to undefined if missing. We must handle it.
    const key = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY2 || "";
    aiInstance = new GoogleGenAI({ 
      apiKey: key 
    });
  }
  return aiInstance;
}

export async function runAutomation(systemInstruction: string, prompt: string) {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

