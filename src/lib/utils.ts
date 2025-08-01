import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { generateObject } from "ai";
import { createAzure } from "@ai-sdk/azure";
import z from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function calculatePercentage(score: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((score / total) * 100);
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GenerateQuiz(userInput: string) {
  const azure = createAzure({
    resourceName: "beksl-mcqgvjfg-swedencentral",
    apiKey: process.env.NEXT_PUBLIC_AZURE_API_KEY,
  });

  const { object } = await generateObject({
    model: azure("o4-mini"),
    output: 'no-schema',
    prompt: `
You are an AI quiz generator.

Generate a quiz based on the following topic: "${userInput}"

Return the output as a JSON object with this exact structure:
{
  "title": string,
  "description": string,
  "tags": string[],
  "difficulty": "easy" | "medium" | "hard",
  "estimatedTime": number, // in minutes
  "totalPoints": number,
  "questions": [
    {
      "type": "multiple_choice" | "checkbox" | "short_answer",
      "question": string,
      "options": string[], // for multiple_choice and checkbox only
      "correctAnswers": string[] | string,
      "explanation": string,
      "points": number
    }
  ]
}

Guidelines:
- Include 5–10 questions.
- Assign each question 1–10 points based on difficulty.
- "totalPoints" should be the sum of all questions' points.
- Make sure "correctAnswers" are exact matches from options (if applicable).
- Avoid extra commentary — output **only the valid JSON object**.
`,
  });

  return { object };
}
