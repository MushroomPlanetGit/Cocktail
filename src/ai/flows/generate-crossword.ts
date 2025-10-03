'use server';
/**
 * @fileOverview A flow for generating mixology-themed crossword puzzles.
 *
 * - generateCrossword - Generates a single crossword puzzle.
 * - GenerateCrosswordInput - The input schema for the flow.
 * - GenerateCrosswordOutput - The output schema for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GenerateCrosswordInputSchema = z.object({
  category: z
    .string()
    .describe('The category for the crossword puzzle (e.g., Gin, Whiskey, Cocktail History).'),
  difficulty: z
    .enum(['easy', 'medium', 'hard'])
    .describe('The difficulty of the puzzle.'),
});
export type GenerateCrosswordInput = z.infer<typeof GenerateCrosswordInputSchema>;


export const CrosswordCluesSchema = z.object({
    num: z.number().describe('The clue number, corresponding to a position on the grid.'),
    clue: z.string().describe('The clue for the word.'),
    answer: z.string().describe('The answer word.'),
    row: z.number().describe('The starting row index (0-based) of the answer on the grid.'),
    col: z.number().describe('The starting column index (0-based) of the answer on the grid.'),
});
export type CrosswordClues = z.infer<typeof CrosswordCluesSchema>;

export const GenerateCrosswordOutputSchema = z.object({
  rows: z.number().describe('The number of rows in the grid.'),
  cols: z.number().describe('The number of columns in the grid.'),
  layout: z.array(z.array(z.string())).describe('A 2D array representing the solved crossword grid. "X" denotes a black square.'),
  clues: z.object({
    across: z.array(CrosswordCluesSchema).describe('The clues for words that go across.'),
    down: z.array(CrosswordCluesSchema).describe('The clues for words that go down.'),
  }).describe('The lists of clues for the puzzle.'),
});
export type GenerateCrosswordOutput = z.infer<typeof GenerateCrosswordOutputSchema>;

export async function generateCrossword(input: GenerateCrosswordInput): Promise<GenerateCrosswordOutput> {
  return generateCrosswordFlow(input);
}

const generateCrosswordPrompt = ai.definePrompt({
  name: 'generateCrosswordPrompt',
  input: {schema: GenerateCrosswordInputSchema},
  output: {schema: GenerateCrosswordOutputSchema},
  prompt: `You are a master puzzle creator specializing in mixology and cocktails. Your task is to generate a complete, valid, and solvable 10x10 crossword puzzle.

Follow these instructions precisely:
1.  **Theme/Category:** The entire puzzle (all answers and clues) must be related to the specified category: {{{category}}}.
2.  **Difficulty:** The clues should match the specified difficulty level: {{{difficulty}}}.
3.  **Grid Size:** The grid must be exactly 10 rows by 10 columns.
4.  **Output Structure:** You must generate the puzzle data in the exact JSON format specified by the output schema.
5.  **Layout:**
    *   The 'layout' must be a 10x10 2D array of strings.
    *   Each string in the layout is either a single uppercase letter (A-Z) representing the solved puzzle, or 'X' for a black, unused square.
    *   The grid should be reasonably filled and have good connectivity. Avoid having too many black squares.
6.  **Clues:**
    *   Provide clues for both "across" and "down" words.
    *   Each clue object must contain the clue number ('num'), the clue text ('clue'), the answer ('answer'), the starting row ('row'), and the starting column ('col').
    *   Clue numbers must correspond to the starting cell of an answer in the grid. A single cell can have both an across and a down clue number.
    *   Ensure every answer in the grid has a corresponding clue.
    *   Clues should be clever and appropriate for a mixology enthusiast.
    
Make sure the final puzzle is solvable and all intersections are correct. Double-check your work before outputting the final JSON.`,
});

const generateCrosswordFlow = ai.defineFlow(
  {
    name: 'generateCrosswordFlow',
    inputSchema: GenerateCrosswordInputSchema,
    outputSchema: GenerateCrosswordOutputSchema,
  },
  async (input) => {
    const {output} = await generateCrosswordPrompt(input);
    return output!;
  }
);
