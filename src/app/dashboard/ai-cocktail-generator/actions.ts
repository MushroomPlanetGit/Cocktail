
'use server';
import { generateCocktail, GenerateCocktailOutput } from '@/ai/flows/generate-cocktail';
import { z } from 'zod';

const generateSchema = z.object({
  description: z.string().min(10, "Please describe your desired cocktail in at least 10 characters."),
});

type ActionState = {
  message: string | null;
  recipe: GenerateCocktailOutput | null;
  errors: { description?: string[] } | null;
}

export async function generateCocktailAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const input = {
    description: formData.get('description'),
  };

  const validatedFields = generateSchema.safeParse(input);

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
      recipe: null,
    };
  }

  try {
    const recipe = await generateCocktail(validatedFields.data);
    return {
      message: 'Recipe generated successfully.',
      recipe,
      errors: null,
    };
  } catch (error) {
    console.error(error);
    return {
      message: 'An unexpected error occurred while generating the recipe.',
      recipe: null,
      errors: null,
    };
  }
}
