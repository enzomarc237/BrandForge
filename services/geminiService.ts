import { GoogleGenAI, Type, Schema } from "@google/genai";
import { BrandStrategy, ImageAspectRatio, ImageSize, SearchResult } from "../types";
import { MODEL_NAMES } from "../constants";

// Helper to get client with latest key
const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Retry helper
async function retryOperation<T>(operation: () => Promise<T>, retries = 2, delay = 1000): Promise<T> {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      console.warn(`Attempt ${i + 1} failed:`, error);
      lastError = error;
      // Don't retry if it's a client error (4xx) unless it's a rate limit (429)
      if (error.status && error.status >= 400 && error.status < 500 && error.status !== 429) {
        throw error;
      }
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  throw lastError;
}

export const generateBrandStrategy = async (mission: string): Promise<BrandStrategy> => {
  return retryOperation(async () => {
    const ai = getClient();
    
    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        brandName: { type: Type.STRING, description: "A creative name for the brand based on the mission." },
        tagline: { type: Type.STRING, description: "A catchy tagline." },
        brandVoice: {
          type: Type.OBJECT,
          properties: {
            tone: { type: Type.STRING, description: "A description of the brand's tone (e.g., authoritative but approachable)." },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-5 descriptive words for the voice." },
            copyExamples: {
              type: Type.OBJECT,
              properties: {
                website: { type: Type.STRING, description: "Example website copy demonstrating the voice." },
                social: { type: Type.STRING, description: "Example social media post demonstrating the voice." }
              },
              required: ["website", "social"]
            }
          },
          required: ["tone", "keywords", "copyExamples"]
        },
        palette: {
          type: Type.ARRAY,
          description: "A cohesive palette of 8 colors (5 primary + 3 accents).",
          items: {
            type: Type.OBJECT,
            properties: {
              hex: { type: Type.STRING, description: "Hex color code (e.g., #FFFFFF)." },
              name: { type: Type.STRING, description: "Creative name for the color." },
              usage: { type: Type.STRING, description: "Specific usage recommendation (e.g., 'Use for CTA buttons', 'Use for backgrounds')." },
            },
            required: ["hex", "name", "usage"]
          }
        },
        typography: {
          type: Type.OBJECT,
          properties: {
            headerFont: { type: Type.STRING, description: "A Google Font name for headers." },
            bodyFont: { type: Type.STRING, description: "A Google Font name for body text." },
            reasoning: { type: Type.STRING, description: "Why these fonts were chosen." },
          },
          required: ["headerFont", "bodyFont", "reasoning"]
        },
        logoConcepts: {
          type: Type.ARRAY,
          description: "5 distinct logo design variations based on the mission.",
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "A short title for this design direction (e.g., 'Minimalist', 'Abstract')." },
              description: { type: Type.STRING, description: "Reasoning behind this concept." },
              primaryPrompt: { type: Type.STRING, description: "A highly detailed image generation prompt for the primary logo." },
              secondaryPrompt: { type: Type.STRING, description: "A detailed prompt for a simplified secondary brand mark or icon." }
            },
            required: ["title", "description", "primaryPrompt", "secondaryPrompt"]
          }
        }
      },
      required: ["brandName", "tagline", "brandVoice", "palette", "typography", "logoConcepts"]
    };

    const response = await ai.models.generateContent({
      model: MODEL_NAMES.STRATEGY,
      contents: `You are a world-class brand strategist. Create a comprehensive brand identity for the following company mission: "${mission}".
      
      Requirements:
      1. **Color Palette**: Generate exactly 8 colors. 5 core brand colors and 3 specific accent colors. Provide specific usage instructions for each.
      2. **Brand Voice**: Define the tone, provide 3-5 keywords, and write sample copy for a website and a social post.
      3. **Logos**: Create 5 distinct design concepts for the logo. Each concept must have a Primary Logo prompt and a Secondary Mark prompt.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        thinkingConfig: { thinkingBudget: 2048 }, // Reduced from 10240 to prevent timeouts
      }
    });

    const text = response.text;
    if (!text) throw new Error("No strategy generated");
    return JSON.parse(text) as BrandStrategy;
  });
};

export const generateBrandImage = async (
  prompt: string, 
  aspectRatio: ImageAspectRatio = ImageAspectRatio.SQUARE,
  size: ImageSize = ImageSize.SIZE_1K,
  model: string = MODEL_NAMES.LOGO_GEN
): Promise<string> => {
  return retryOperation(async () => {
    const ai = getClient();
    
    const imageConfig: any = {
      aspectRatio: aspectRatio,
    };

    // Only add imageSize for the Pro model that supports it
    if (model === 'gemini-3-pro-image-preview') {
      imageConfig.imageSize = size;
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        imageConfig
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  });
};

export const editImage = async (base64Image: string, instruction: string): Promise<string> => {
  return retryOperation(async () => {
    const ai = getClient();
    // Strip prefix if present
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

    const response = await ai.models.generateContent({
      model: MODEL_NAMES.IMAGE_EDIT,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/png', data: base64Data } },
          { text: instruction }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Image edit failed or returned no image.");
  });
};

export const analyzeImage = async (base64Image: string, prompt: string): Promise<string> => {
  return retryOperation(async () => {
    const ai = getClient();
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    
    const response = await ai.models.generateContent({
      model: MODEL_NAMES.ANALYSIS,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/png', data: base64Data } },
          { text: prompt }
        ]
      }
    });

    return response.text || "No analysis available.";
  });
};

export const searchMarket = async (query: string): Promise<{ text: string; links: SearchResult[] }> => {
  return retryOperation(async () => {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: MODEL_NAMES.RESEARCH,
      contents: `Conduct market research for: ${query}. Provide a concise summary of competitors or trends.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text || "No results found.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const links: SearchResult[] = chunks
      .map((c: any) => c.web ? { title: c.web.title, url: c.web.uri } : null)
      .filter((l: any) => l !== null);

    return { text, links };
  });
};

export const streamChat = async (
  history: {role: 'user' | 'model', text: string}[], 
  newMessage: string
) => {
  const ai = getClient();
  const chat = ai.chats.create({
    model: MODEL_NAMES.CHAT,
    history: history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    }))
  });

  return await chat.sendMessageStream({ message: newMessage });
};