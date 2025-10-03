
'use server';
/**
 * @fileOverview A flow for generating mixology quiz questions.
 *
 * - generateQuizQuestion - Generates a single quiz question.
 * - GenerateQuizQuestionInput - The input schema for the flow.
 * - GenerateQuizQuestionOutput - The output schema for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GenerateQuizQuestionInputSchema = z.object({
  category: z
    .string()
    .describe('The category for the quiz question (e.g., Gin, Whiskey, Cocktail History).'),
  difficulty: z
    .enum(['easy', 'medium', 'hard'])
    .describe('The difficulty of the question.'),
});
export type GenerateQuizQuestionInput = z.infer<
  typeof GenerateQuizQuestionInputSchema
>;

export const GenerateQuizQuestionOutputSchema = z.object({
  question: z.string().describe('The quiz question itself.'),
  answers: z.array(
    z.object({
      text: z.string().describe('The text of the answer choice.'),
      correct: z.boolean().describe('Whether this answer is the correct one.'),
    })
  ).length(4).describe('An array of 4 possible answers.'),
  explanation: z
    .string()
    .describe(
      'A brief explanation of the correct answer, providing context or a fun fact.'
    ),
});
export type GenerateQuizQuestionOutput = z.infer<
  typeof GenerateQuizQuestionOutputSchema
>;

export async function generateQuizQuestion(
  input: GenerateQuizQuestionInput
): Promise<GenerateQuizQuestionOutput> {
  return generateQuizQuestionFlow(input);
}

const generateQuizQuestionPrompt = ai.definePrompt({
  name: 'generateQuizQuestionPrompt',
  input: {schema: GenerateQuizQuestionInputSchema},
  output: {schema: GenerateQuizQuestionOutputSchema},
  prompt: `You are an expert mixologist designing a quiz. Generate a single, unique multiple-choice question based on the provided category and difficulty.

- The question should be challenging but fair for the specified difficulty level.
- You must provide exactly 4 answer choices.
- Exactly one of the answers must be correct.
- Provide a brief, interesting explanation for the correct answer.

Category: {{{category}}}
Difficulty: {{{difficulty}}}`,
});

const generateQuizQuestionFlow = ai.defineFlow(
  {
    name: 'generateQuizQuestionFlow',
    inputSchema: GenerateQuizQuestionInputSchema,
    outputSchema: GenerateQuizQuestionOutputSchema,
  },
  async input => {
    const {output} = await generateQuizQuestionPrompt(input);
    return output!;
  }
);
