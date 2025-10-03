'use server';
/**
 * @fileOverview An AI flow for performing a "smart search" on a list of cocktails.
 *
 * - smartSearchCocktails - The main function to call the flow.
 * - SmartSearchCocktailsInputSchema - The Zod schema for the flow's input.
 * - SmartSearchCocktailsOutputSchema - The Zod schema for the flow's output.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { Cocktail } from '@/types/cocktail';


export const SmartSearchCocktailsInputSchema = z.object({
  query: z
    .string()
    .describe('The user\'s natural language search query. e.g., "something refreshing for summer" or "a classic whiskey drink"'),
  cocktails: z.array(z.any()).describe('The full list of available cocktail objects to search through.'),
});

export const SmartSearchCocktailsOutputSchema = z.object({
    cocktailSlugs: z.array(z.string()).describe('An array of URL-friendly slugs for the cocktails that best match the user\'s query.'),
});

export type SmartSearchCocktailsInput = z.infer<typeof SmartSearchCocktailsInputSchema>;
export type SmartSearchCocktailsOutput = z.infer<typeof SmartSearchCocktailsOutputSchema>;

export async function smartSearchCocktails(
  input: SmartSearchCocktailsInput
): Promise<SmartSearchCocktailsOutput> {
  return smartSearchCocktailsFlow(input);
}

const smartSearchCocktailsPrompt = ai.definePrompt({
  name: 'smartSearchCocktailsPrompt',
  input: { schema: SmartSearchCocktailsInputSchema },
  output: { schema: SmartSearchCocktailsOutputSchema },
  prompt: `You are an expert mixologist and search specialist. Your task is to analyze a user's search query and a list of available cocktails to find the best matches.

User's Search Query: "{{{query}}}"

Available Cocktails (JSON format):
{{{json cocktails}}}

Instructions:
1.  Carefully read the user's query to understand their intent. They might mention ingredients, taste profiles (e.g., "sweet", "sour", "refreshing"), occasions (e.g., "summer party"), or cocktail types (e.g., "a classic gin drink").
2.  Analyze the provided list of cocktails. Pay attention to each cocktail's 'name', 'description', 'baseSpirit', 'style', and 'ingredients'.
3.  Compare the user's query intent with the details of each cocktail.
4.  Identify the cocktails that are the most relevant matches.
5.  Return a JSON object containing a single key, 'cocktailSlugs', which is an array of the 'slug' values for the matching cocktails.
6.  If no cocktails are a good match, return an empty array for 'cocktailSlugs'.
7.  Do not include cocktails that are a poor match. Only return relevant results.`,
});

const smartSearchCocktailsFlow = ai.defineFlow(
  {
    name: 'smartSearchCocktailsFlow',
    inputSchema: SmartSearchCocktailsInputSchema,
    outputSchema: SmartSearchCocktailsOutputSchema,
  },
  async (input) => {
    // The AI can struggle with very large lists. We'll simplify the data passed to it.
    const simplifiedCocktails = input.cocktails.map((c: Cocktail) => ({
        slug: c.slug,
        name: c.name,
        description: c.description,
        baseSpirit: c.baseSpirit,
        style: c.style,
        ingredients: c.ingredients,
    }));
    
    const { output } = await smartSearchCocktailsPrompt({
        query: input.query,
        cocktails: simplifiedCocktails,
    });
    return output!;
  }
);
