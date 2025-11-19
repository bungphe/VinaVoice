import { GoogleGenAI, Modality } from "@google/genai";
import { VoiceName, ReadingStyle, STYLE_OPTIONS } from "../types";

// Initialize the client
// Note: API Key is assumed to be in process.env.API_KEY as per instructions
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSpeech = async (
  text: string, 
  voice: VoiceName, 
  style: ReadingStyle = ReadingStyle.Natural
): Promise<string | undefined> => {
  try {
    // Find the prompt prefix for the selected style
    const selectedStyleOption = STYLE_OPTIONS.find(s => s.id === style);
    const promptPrefix = selectedStyleOption?.promptPrefix || '';

    // Construct the final text to send to the model.
    // By prepending an instruction, we guide the TTS model's prosody and emotion.
    // The model is smart enough to distinguish the instruction from the content to be read 
    // if phrased as a directive followed by content.
    const finalInput = promptPrefix 
      ? `${promptPrefix}\n\n${text}`
      : text;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: {
        parts: [{ text: finalInput }],
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    // Access the base64 string from the candidate parts
    // The structure is candidates[0].content.parts[0].inlineData.data
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    return base64Audio;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};