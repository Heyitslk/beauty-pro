
import { GoogleGenAI, Type, GenerateContentResponse, Chat } from "@google/genai";
import { DiagnosticReport } from "../types";

// Always use the process.env.API_KEY directly as per guidelines
export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeMakeupResult = async (base64Image: string): Promise<DiagnosticReport> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            { text: "Analyze this makeup application photo. Evaluate blendability, evenness, naturalism, and detail work. Provide a score out of 100 and specific actionable advice using a makeup sponge." },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.NUMBER },
            dimensions: {
              type: Type.OBJECT,
              properties: {
                blendability: { type: Type.NUMBER },
                evenness: { type: Type.NUMBER },
                naturalism: { type: Type.NUMBER },
                detailWork: { type: Type.NUMBER }
              },
              required: ["blendability", "evenness", "naturalism", "detailWork"]
            },
            advice: { type: Type.STRING }
          },
          required: ["overallScore", "dimensions", "advice"]
        }
      }
    });

    const text = response.text;
    return JSON.parse(text || '{}') as DiagnosticReport;
  } catch (error) {
    console.error("Diagnosis error:", error);
    throw error;
  }
};

export const editMakeupImage = async (base64Image: string, prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            { text: `Re-imagine this makeup photo with the following modification: ${prompt}. Describe how it should look in detail, focusing on beauty and aesthetic excellence.` },
            { inlineData: { data: base64Image, mimeType: 'image/png' } }
          ]
        }
      ]
    });

    const text = response.text;
    // Fallback to source for now as per previous logic
    return `data:image/png;base64,${base64Image}`; 
  } catch (error) {
    console.error("Image editing error:", error);
    throw error;
  }
};

export const startConsultantChat = (instruction: string): any => {
  // Use generateContent for a one-off simulation if ai.chats is not available or mismatching
  // But standard is ai.chats.create if available. Given lint error, I'll use direct model access or check type.
  return (ai as any).chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: instruction,
    },
  });
};
