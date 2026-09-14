import { GoogleGenAI, Type, Schema } from "@google/genai";

// Helper function to call Gemini with a single retry for 503 errors
async function callGeminiWithRetry(ai: GoogleGenAI, config: any, retries = 1, delay = 1000): Promise<any> {
  try {
    return await ai.models.generateContent(config);
  } catch (err: any) {
    if (retries > 0 && err.status === 503) {
      console.log(`Gemini API 503 error. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return callGeminiWithRetry(ai, config, retries - 1, delay * 2);
    }
    throw err;
  }
}

// We'll initialize inside the function so it doesn't crash on boot if the key is missing.
export async function generateProjectRoadmap(teamName: string, description: string, memberSkills: string[]) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = `
    You are an expert technical project manager and software architect.
    A student team wants to build a project based on the following details:
    
    Team Name: ${teamName}
    Project Description: ${description || "No specific description provided, infer a basic web/app project."}
    Combined Skills of Members: ${memberSkills.length > 0 ? memberSkills.join(", ") : "No skills provided yet."}
    
    Generate a 4-6 phase execution roadmap for this project, tailored to their specific skills and description.
    Each phase should have a title, short description, and estimated duration in weeks.
  `;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      phases: {
        type: Type.ARRAY,
        description: "The 4-6 execution phases of the project.",
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Title of the phase" },
            description: { type: Type.STRING, description: "Short description of the phase." },
            durationWeeks: { type: Type.INTEGER, description: "Estimated duration in weeks." }
          },
          required: ["title", "description", "durationWeeks"]
        }
      }
    },
    required: ["phases"]
  };

  const response = await callGeminiWithRetry(ai, {
    model: "gemini-flash-latest",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.7,
    }
  });

  if (!response.text) {
    throw new Error("Failed to generate AI response.");
  }

  return JSON.parse(response.text);
}

export async function askAIAssistant(teamName: string, description: string, memberSkills: string[], question: string) {
  if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured.");
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = `You are an expert technical project mentor for a student team.
Team Name: ${teamName}
Project Description: ${description || 'No specific description provided, infer a basic web/app project.'}
Combined Skills of Members: ${memberSkills.length > 0 ? memberSkills.join(', ') : 'No skills provided yet.'}

Answer the team's question based on their stack and context. Be helpful, technical, and concise. If you are unsure or the question is outside your knowledge, explicitly state that you don't know rather than guess.

Question: ${question}`;

  const response = await callGeminiWithRetry(ai, {
    model: "gemini-flash-latest",
    contents: prompt,
    config: {
      temperature: 0.3,
    }
  });

  if (!response.text) throw new Error("Failed to generate AI response.");
  return response.text;
}
