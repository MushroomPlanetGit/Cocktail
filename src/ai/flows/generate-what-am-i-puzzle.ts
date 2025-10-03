
'use server';
/**
 * @fileOverview A flow for generating "What Am I?" puzzles for mixology.
 *
 * - generateWhatAmIPuzzle - Generates a single puzzle.
 * - GenerateWhatAmIPuzzleOutput - The output schema for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GenerateWhatAmIPuzzleOutputSchema = z.object({
  clues: z
    .array(z.string())
    .min(3)
    .max(5)
    .describe('A list of 3 to 5 clues for the puzzle.'),
  answer: z.string().describe('The correct answer to the puzzle (e.g., the name of a cocktail or spirit).'),
});
export type GenerateWhatAmIPuzzleOutput = z.infer<
  typeof GenerateWhatAmIPuzzleOutputSchema
>;

export async function generateWhatAmIPuzzle(): Promise<GenerateWhatAmIPuzzleOutput> {
  return generateWhatAmIPuzzleFlow();
}

const generateWhatAmIPuzzlePrompt = ai.definePrompt({
  name: 'generateWhatAmIPuzzlePrompt',
  output: {schema: GenerateWhatAmIPuzzleOutputSchema},
  prompt: `You are an expert mixologist creating a "What Am I?" puzzle game.

Generate a single puzzle about a well-known cocktail, spirit, or bar tool.

- Provide between 3 and 5 interesting and distinct clues.
- The clues should start easy and get progressively more specific.
- Provide the final answer.
- Ensure the puzzle is different each time.`,
});

const generateWhatAmIPuzzleFlow = ai.defineFlow(
  {
    name: 'generateWhatAmIPuzzleFlow',
    outputSchema: GenerateWhatAmIPuzzleOutputSchema,
  },
  async () => {
    const {output} = await generateWhatAmIPuzzlePrompt();
    return output!;
  }
);
