
'use server';
/**
 * @fileOverview An AI flow for generating a unique cocktail recipe from a user's description.
 *
 * - generateCocktail - The main function to call the flow.
 * - GenerateCocktailInputSchema - The Zod schema for the flow's input.
 * - GenerateCocktailOutputSchema - The Zod schema for the flow's output.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const GenerateCocktailInputSchema = z.object({
  description: z.string().describe('A natural language description of the desired cocktail (e.g., "a smoky, citrusy drink with mezcal").'),
});
export type GenerateCocktailInput = z.infer<typeof GenerateCocktailInputSchema>;


export const GenerateCocktailOutputSchema = z.object({
    name: z.string().describe('A creative and fitting name for the generated cocktail.'),
    ingredients: z.array(z.string()).describe('A list of all ingredients with precise measurements (e.g., "2 oz Mezcal", "1 oz Lime Juice").'),
    directions: z.string().describe('Step-by-step instructions for preparing the cocktail.'),
    glassware: z.string().describe('The recommended type of glassware for serving the cocktail (e.g., "Coupe Glass", "Rocks Glass").')
});
export type GenerateCocktailOutput = z.infer<typeof GenerateCocktailOutputSchema>;

export async function generateCocktail(input: GenerateCocktailInput): Promise<GenerateCocktailOutput> {
  return generateCocktailFlow(input);
}

const generateCocktailPrompt = ai.definePrompt({
  name: 'generateCocktailPrompt',
  input: {schema: GenerateCocktailInputSchema},
  output: {schema: GenerateCocktailOutputSchema},
  prompt: `You are an world-renowned, creative master mixologist. Your task is to invent a unique, delicious, and well-balanced cocktail recipe based on a user's request.

User's Request: "{{{description}}}"

Follow these instructions precisely:
1.  **Analyze the Request:** Carefully consider the user's description, including any specified spirits, flavors (sweet, sour, smoky, bitter), moods (refreshing, warming), or occasions.
2.  **Invent a Recipe:** Create a brand-new recipe that creatively meets the user's request. Do not just find an existing classic cocktail.
3.  **Create a Name:** Give the cocktail a creative, memorable, and fitting name.
4.  **List Ingredients:** Provide a clear list of all ingredients with precise, standard measurements (in ounces or other appropriate units).
5.  **Write Directions:** Provide clear, step-by-step instructions for how to mix and serve the drink. Include any special techniques like muddling, shaking, or stirring.
6.  **Suggest Glassware:** Recommend the appropriate type of glass for the cocktail.
7.  **Ensure Quality:** The final recipe should be well-balanced and sound delicious.
8.  **Output Format:** Your final output must be a single JSON object that strictly adheres to the specified output schema.
`,
});

const generateCocktailFlow = ai.defineFlow(
  {
    name: 'generateCocktailFlow',
    inputSchema: GenerateCocktailInputSchema,
    outputSchema: GenerateCocktailOutputSchema,
  },
  async (input) => {
    const {output} = await generateCocktailPrompt(input);
    return output!;
  }
);
