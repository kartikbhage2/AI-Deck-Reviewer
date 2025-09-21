
import { GoogleGenAI } from "@google/genai";
import { DECK_REVIEWER_SYSTEM_PROMPT } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToGenerativePart = async (file: File) => {
    const base64EncodedData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            const base64Data = result.split(',')[1];
            resolve(base64Data);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });

    return {
        inlineData: {
            data: base64EncodedData,
            mimeType: file.type,
        },
    };
};

const formatSlidesForPrompt = (slides: string[]): string => {
  return slides.map((content, index) => {
    return `Slide ${index + 1}:\n${content.trim()}`;
  }).join('\n\n---\n\n');
};

export const reviewDeck = async (source: string[] | File): Promise<string> => {
  if (!source) {
    throw new Error("No slides or file provided for review.");
  }

  let contents;

  if (Array.isArray(source)) {
    if (source.length === 0 || source.every(s => !s.trim())) {
      throw new Error("No slides provided for review.");
    }
    contents = formatSlidesForPrompt(source);
  } else {
    const filePart = await fileToGenerativePart(source);
    contents = {
      parts: [
        filePart,
        { text: "Please review the attached presentation deck, following all instructions as if this were text content." }
      ]
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: DECK_REVIEWER_SYSTEM_PROMPT,
        temperature: 0.5,
        topP: 0.95,
      }
    });
    
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
       throw new Error("The provided API key is not valid. Please check your configuration.");
    }
    throw new Error("Failed to get a response from the AI. Please try again later.");
  }
};
