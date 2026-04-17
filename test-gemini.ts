import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

console.log("Key available:", !!process.env.GEMINI_API_KEY);
if (process.env.GEMINI_API_KEY) {
    console.log("Key length:", process.env.GEMINI_API_KEY.length);
    console.log("Key starts with:", process.env.GEMINI_API_KEY.substring(0, 5));
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function test() {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Hello"
        });
        console.log("2.5 SUCCESS!");
    } catch (e: any) {
        console.error("2.5 ERROR:", e.message);
    }
    
    try {
        const response2 = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: "Hello"
        });
        console.log("3.0 SUCCESS!");
    } catch (e: any) {
        console.error("3.0 ERROR:", e.message);
    }
}
test();
