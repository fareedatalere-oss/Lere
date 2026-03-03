'use server';
/**
 * @fileOverview A Genkit flow that generates a fun and engaging ice-breaker question or topic for calls.
 *
 * - generateCallIceBreaker - A function that initiates the ice-breaker generation process.
 * - GenerateCallIceBreakerInput - The input type for the generateCallIceBreaker function (void).
 * - GenerateCallIceBreakerOutput - The return type for the generateCallIceBreaker function (string).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCallIceBreakerInputSchema = z.void().describe('No input required for generating an ice-breaker.');
export type GenerateCallIceBreakerInput = z.infer<typeof GenerateCallIceBreakerInputSchema>;

const GenerateCallIceBreakerOutputSchema = z.string().describe('A fun and engaging ice-breaker question or topic suggestion.');
export type GenerateCallIceBreakerOutput = z.infer<typeof GenerateCallIceBreakerOutputSchema>;

export async function generateCallIceBreaker(): Promise<GenerateCallIceBreakerOutput> {
  return generateCallIceBreakerFlow();
}

const prompt = ai.definePrompt({
  name: 'generateCallIceBreakerPrompt',
  input: {schema: GenerateCallIceBreakerInputSchema},
  output: {schema: GenerateCallIceBreakerOutputSchema},
  prompt: `Generate a fun, engaging question or topic suggestion to help users initiate conversations before a call. The suggestion should be lighthearted and suitable for starting a friendly chat. Provide only the question or topic, without any additional text or introductory phrases.`,
});

const generateCallIceBreakerFlow = ai.defineFlow(
  {
    name: 'generateCallIceBreakerFlow',
    inputSchema: GenerateCallIceBreakerInputSchema,
    outputSchema: GenerateCallIceBreakerOutputSchema,
  },
  async () => {
    const {output} = await prompt({});
    return output!;
  }
);
