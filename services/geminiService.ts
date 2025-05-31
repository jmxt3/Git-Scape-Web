
// Fix: Remove Message from import as it's not an exported member
import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { GEMINI_MODEL_TEXT } from '../constants';
import { Candidate } from '../types'; // Import Candidate from types.ts

// Ensure process.env is polyfilled or available if this runs in a browser context
// For this exercise, assuming process.env.API_KEY is made available.

export class GeminiService {
  private ai: GoogleGenAI;
  public readonly apiKey: string; // Made public readonly

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("Gemini API key is required.");
    }
    this.apiKey = apiKey;
    // Fix: Correct initialization according to guidelines
    this.ai = new GoogleGenAI({ apiKey: this.apiKey });
  }

  // Initializes a new chat session with a system instruction.
  public createChatSession(systemInstructionText: string): Chat {
    // The @google/genai SDK currently doesn't directly support system instructions
    // in the same way some other models do (e.g. a dedicated 'system' role in the `history`).
    // Instead, we prepend the system instruction to the *first user message* or structure
    // the initial `contents` to include it as context.
    // For an ongoing chat, the initial `Message` can serve as a form of system prompt.
    
    // For @google/genai, the system instruction is passed in the config object.
    return this.ai.chats.create({
        model: GEMINI_MODEL_TEXT,
        config: {
            systemInstruction: systemInstructionText,
            // Add other chat configs if needed, e.g., temperature
        }
    });
  }

  // Sends a message to an existing chat session.
  public async sendChatMessage(chat: Chat, userMessage: string): Promise<GenerateContentResponse> {
    try {
      const response: GenerateContentResponse = await chat.sendMessage({ message: userMessage });
      // The response already is GenerateContentResponse, so no need to extract .text here.
      // The caller (RepoChat.tsx) will handle the response object.
      return response;
    } catch (error: any) {
      console.error("Error sending chat message via Gemini API:", error);
      if (error.message) {
        if (error.message.includes("API key not valid") || error.message.includes("permission denied")) {
          throw new Error("Gemini API Error: Invalid API Key or insufficient permissions. Please check your API key.");
        }
        throw new Error(`Gemini API Chat Error: ${error.message}`);
      }
      throw new Error("An unknown error occurred while communicating with the Gemini API for chat.");
    }
  }

  // Fix: Add summarizeText method as required by GeminiSummarizer.tsx
  public async summarizeText(prompt: string): Promise<string> {
    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: GEMINI_MODEL_TEXT,
        contents: prompt,
      });
      // Correct way to get text output as per guidelines
      return response.text;
    } catch (error: any) {
      console.error("Error summarizing text via Gemini API:", error);
      if (error.message) {
        if (error.message.includes("API key not valid") || error.message.includes("permission denied")) {
          throw new Error("Gemini API Error: Invalid API Key or insufficient permissions. Please check your API key.");
        }
        throw new Error(`Gemini API Summarization Error: ${error.message}`);
      }
      throw new Error("An unknown error occurred while communicating with the Gemini API for summarization.");
    }
  }

  public async generateContentWithGoogleSearch(prompt: string): Promise<{ text: string; candidates?: Candidate[] }> {
    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: GEMINI_MODEL_TEXT, // Ensure this model supports Google Search or adjust if needed
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });
      
      return {
        text: response.text,
        candidates: response.candidates as Candidate[] | undefined
      };
    } catch (error: any) {
      console.error("Error calling Gemini API with Google Search:", error);
      throw new Error(`Gemini API (Search) Error: ${error.message || 'Unknown error'}`);
    }
  }
}
