'use server';

import {
  suggestCocktails,
  SuggestCocktailsInputSchema,
  type CocktailSuggestion,
} from '@/ai/flows/suggest-cocktails';
import {
  identifyIngredient,
  IdentifyIngredientInputSchema,
  IdentifyIngredientOutput,
} from '@/ai/flows/identify-ingredient';
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


export async function identifyIngredientAction(
  input: z.infer<typeof IdentifyIngredientInputSchema>
): Promise<{ ingredient: IdentifyIngredientOutput | null; error: string | null }> {
  const validatedFields = IdentifyIngredientInputSchema.safeParse(input);

  if (!validatedFields.success) {
    return {
      ingredient: null,
      error: 'Invalid input for ingredient identification.',
    };
  }

  try {
    const ingredient = await identifyIngredient(validatedFields.data);
    return {
      ingredient,
      error: null,
    };
  } catch (error) {
    console.error(error);
    return {
      ingredient: null,
      error: 'An unexpected error occurred while identifying the ingredient.',
    };
  }
}
