
import { GoogleGenAI } from "@google/genai";
import { fileToBase64 } from '../utils/fileUtils';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY is not set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function extractTextFromImage(imageFile: File): Promise<string> {
    try {
        const base64Data = await fileToBase64(imageFile);
        const imagePart = {
            inlineData: {
                mimeType: imageFile.type,
                data: base64Data,
            },
        };

        const textPart = {
            text: "이 이미지에서 보이는 모든 문자나 숫자를 순서대로 정확하게 추출해줘. 다른 설명은 추가하지 마."
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });
        
        return response.text;

    } catch (error) {
        console.error("Error generating content from Gemini:", error);
        throw new Error("Failed to extract text from image using Gemini API.");
    }
}
