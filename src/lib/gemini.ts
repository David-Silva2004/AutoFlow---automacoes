import { GoogleGenAI } from "@google/genai";

// Initialize the API client.
export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function runAutomation(systemInstruction: string, prompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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
