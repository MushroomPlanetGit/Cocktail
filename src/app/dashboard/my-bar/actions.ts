'use server';

import {
  suggestCocktails,
  SuggestCocktailsInputSchema,
  type CocktailSuggestion,
} from '@/ai/flows/suggest-cocktails';
import { z } from 'zod';

export async function suggestCocktailsAction(
  input: z.infer<typeof SuggestCocktailsInputSchema>
): Promise<{ suggestions: CocktailSuggestion[] | null; error: string | null }> {
  const validatedFields = SuggestCocktailsInputSchema.safeParse(input);

  if (!validatedFields.success) {
    return {
      suggestions: null,
      error: 'Invalid input.',
    };
  }
  
  if (validatedFields.data.ingredients.length === 0) {
     return {
      suggestions: [],
      error: null,
    };
  }

  try {
    const suggestions = await suggestCocktails(validatedFields.data);
    return {
      suggestions,
      error: null,
    };
  } catch (error) {
    console.error(error);
    return {
      suggestions: null,
      error: 'An unexpected error occurred while generating suggestions.',
    };
  }
}
