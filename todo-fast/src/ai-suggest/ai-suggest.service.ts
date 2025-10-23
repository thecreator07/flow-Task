import { Injectable, InternalServerErrorException } from "@nestjs/common";
import OpenAI from "openai";

@Injectable()
export class AiSuggestService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.GEMINI_API_KEY,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    });
  }

  async suggestTaskDescriptionImprovements(
    taskDescription: string,
  ): Promise<string> {
    try {
      const prompt = `
      You are an expert productivity assistant. Improve the following task description to make it clearer, more actionable, and professional.
      Keep it concise (max 25 words) but detailed enough for a team context.

      rule:
      not special words like **,__,-- etc.

      Task Description: "${taskDescription}"
      `;

      const response = await this.openai.chat.completions.create({
        model: "gemini-2.5-flash", // or 'gpt-4o' if you want more accuracy
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that improves task descriptions.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      });

      const suggestion = response.choices[0]?.message?.content?.trim();

      return suggestion || "No suggestion generated.";
    } catch (error) {
      console.error("Error generating AI suggestion:", error);
      throw new InternalServerErrorException(
        "Failed to generate AI suggestion",
      );
    }
  }
}
