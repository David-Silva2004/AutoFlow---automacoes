import { GoogleGenAI } from "@google/genai";
delete process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({});
async function test() {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Hello"
        });
        console.log("SUCCESS!");
    } catch (e: any) {
        console.error("ERROR:", e.message);
    }
}
test();
