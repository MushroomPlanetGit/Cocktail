
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const cocktailFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  slug: z.string().min(2, { message: 'Slug must be at least 2 characters.' }).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'Slug must be in kebab-case.'}),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  baseSpirit: z.enum(['vodka', 'gin', 'rum', 'tequila', 'whiskey']),
  style: z.enum(['classic', 'modern', 'tropical', 'sour']),
  ingredients: z.string().min(10, { message: 'Please list at least one ingredient.' }),
  directions: z.string().min(20, { message: 'Directions must be at least 20 characters.' }),
  tools: z.string().min(3, { message: 'Please list at least one tool.' }),
  history: z.string().min(20, { message: 'History must be at least 20 characters.' }),
  glassware: z.string().min(3, { message: 'Please specify the glassware.' }),
  fact: z.string().min(10, { message: 'Fun fact must be at least 10 characters.' }),
});

export async function addCocktailAction(prevState: any, formData: FormData) {
  const validatedFields = cocktailFormSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description'),
    baseSpirit: formData.get('baseSpirit'),
    style: formData.get('style'),
    ingredients: formData.get('ingredients'),
    directions: formData.get('directions'),
    tools: formData.get('tools'),
    history: formData.get('history'),
    glassware: formData.get('glassware'),
    fact: formData.get('fact'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data. Please check the errors below.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  // In a real application, you would save this data to your database (e.g., Firestore).
  // For now, we'll just log it to the console.
  console.log('New cocktail submitted:', validatedFields.data);
  
  // Here is where you would add the logic to save to a database
  // e.g., await saveCocktailToFirestore(validatedFields.data);

  revalidatePath('/dashboard/content');

  return {
    message: `Cocktail "${validatedFields.data.name}" has been added successfully!`,
    errors: null,
    success: true,
  };
}
