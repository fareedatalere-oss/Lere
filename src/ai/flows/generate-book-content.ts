'use server';
/**
 * @fileOverview A Genkit flow that generates educational content for books in the library.
 *
 * - generateBookContent - A function that generates a chapter or summary for a specific book.
 * - GenerateBookContentInput - The input type (title and author).
 * - GenerateBookContentOutput - The return type (string).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBookContentInputSchema = z.object({
  title: z.string().describe('The title of the book.'),
  author: z.string().describe('The author of the book.'),
  category: z.string().describe('The category of the book.'),
});
export type GenerateBookContentInput = z.infer<typeof GenerateBookContentInputSchema>;

const GenerateBookContentOutputSchema = z.string().describe('The generated educational content of the book.');
export type GenerateBookContentOutput = z.infer<typeof GenerateBookContentOutputSchema>;

export async function generateBookContent(input: GenerateBookContentInput): Promise<GenerateBookContentOutput> {
  return generateBookContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBookContentPrompt',
  input: {schema: GenerateBookContentInputSchema},
  output: {schema: GenerateBookContentOutputSchema},
  prompt: `You are an expert educational assistant. Generate a highly detailed, accurate, and professional introduction or first chapter for the following book. 
  
  Title: {{{title}}}
  Author: {{{author}}}
  Category: {{{category}}}

  The content should be educational, structured with clear paragraphs, and informative. Provide at least 500 words of "real" text as if it were taken directly from a textbook or professional resource. Do not include any introductory filler text like "Here is the content...".`,
});

const generateBookContentFlow = ai.defineFlow(
  {
    name: 'generateBookContentFlow',
    inputSchema: GenerateBookContentInputSchema,
    outputSchema: GenerateBookContentOutputSchema,
  },
  async (input) => {
    if (!process.env.GOOGLE_GENAI_API_KEY && !process.env.GEMINI_API_KEY) {
      return "ERROR: Missing Gemini API Key. Please add your API key to the environment variables.";
    }

    try {
      const {output} = await prompt(input);
      if (!output) return "Content generation completed but returned empty text.";
      return output;
    } catch (error: any) {
      console.error("Genkit Flow Error:", error);
      return `Failed to generate content: ${error.message || "Unknown AI error"}`;
    }
  }
);
