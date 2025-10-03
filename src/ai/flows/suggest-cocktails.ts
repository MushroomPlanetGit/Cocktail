
'use server';
/**
 * @fileOverview An AI flow for suggesting cocktails based on available ingredients.
 *
 * - suggestCocktails - The main function to call the flow.
 * - SuggestCocktailsInputSchema - The Zod schema for the flow's input.
 * - CocktailSuggestion - The TypeScript type for a single suggestion object.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const SuggestCocktailsInputSchema = z.object({
  ingredients: z
    .array(z.string())
    .describe('A list of ingredients the user has in their bar.'),
});

const CocktailSuggestionSchema = z.object({
  name: z.string().describe('The name of the suggested cocktail.'),
  matchType: z
    .enum(['perfect', 'partial'])
    .describe(
      'Whether the user has all ingredients ("perfect") or is missing some ("partial").'
    ),
  missingIngredients: z
    .array(z.string())
    .describe('A list of ingredients the user is missing for this cocktail. Empty for a perfect match.'),
  rationale: z
    .string()
    .describe(
      'A short, friendly explanation of why this cocktail is a good suggestion.'
    ),
});

export const SuggestCocktailsOutputSchema = z.array(CocktailSuggestionSchema);

export type CocktailSuggestion = z.infer<typeof CocktailSuggestionSchema>;

export async function suggestCocktails(
  input: z.infer<typeof SuggestCocktailsInputSchema>
): Promise<CocktailSuggestion[]> {
  return suggestCocktailsFlow(input);
}

const suggestCocktailsPrompt = ai.definePrompt({
  name: 'suggestCocktailsPrompt',
  input: { schema: SuggestCocktailsInputSchema },
  output: { schema: SuggestCocktailsOutputSchema },
  prompt: `You are an expert mixologist AI. Your goal is to help a user figure out what cocktails they can make with the ingredients they have on hand.

Analyze the user's ingredient list:
{{{json ingredients}}}

Based on this list, suggest 3-5 cocktails. Follow these rules precisely:
1.  **Prioritize Perfect Matches:** First, find cocktails where the user has ALL the necessary ingredients. For these, set 'matchType' to "perfect" and 'missingIngredients' to an empty array.
2.  **Suggest Partial Matches:** If you can't find enough perfect matches, suggest cocktails where the user is only missing ONE or TWO common ingredients (like a specific fruit juice, simple syrup, or bitters). For these, set 'matchType' to "partial" and list the exact missing ingredients in 'missingIngredients'.
3.  **Provide a Rationale:** For every suggestion, write a brief, encouraging 'rationale'. For example, "A classic for a reason, and you have the most important spirits!" or "You're just one simple ingredient away from this tropical classic."
4.  **Vary Suggestions:** Do not suggest multiple cocktails that are very similar (e.g., three different types of martinis). Provide a variety of styles if possible.
5.  **Format Correctly:** Your final output must be a JSON array that strictly adheres to the provided output schema.`,
});

const suggestCocktailsFlow = ai.defineFlow(
  {
    name: 'suggestCocktailsFlow',
    inputSchema: SuggestCocktailsInputSchema,
    outputSchema: SuggestCocktailsOutputSchema,
  },
  async (input) => {
    const { output } = await suggestCocktailsPrompt(input);
    return output!;
  }
);
