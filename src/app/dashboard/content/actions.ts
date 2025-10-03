
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { collection, addDoc } from 'firebase/firestore';
import { getAuthenticatedAppForUser } from '@/firebase/get-authenticated-app-for-user';
import { redirect } from 'next/navigation';
import { smartSearchCocktails } from '@/ai/flows/smart-search-cocktails';
import type { Cocktail } from '@/types/cocktail';


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
    const { currentUser, firestore } = await getAuthenticatedAppForUser();

    if (!currentUser || !firestore) {
        return {
            message: "You must be logged in to add a cocktail.",
            errors: null,
            success: false,
        }
    }


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

  try {
    const cocktailsCollection = collection(firestore, 'cocktails');
    const newCocktailData = {
        ...validatedFields.data,
        userId: currentUser.uid,
        // The form fields for ingredients and tools are strings, but our schema expects arrays
        // We will split them by newline for ingredients and comma for tools
        ingredients: validatedFields.data.ingredients.split('\n').filter(i => i.trim() !== ''),
        tools: validatedFields.data.tools.split(',').map(t => t.trim()).filter(t => t !== ''),
    };

    // Use the slug as the document ID for easy lookup
    // This requires a bit more work than addDoc, using setDoc with a doc ref
    const { doc, setDoc } = await import('firebase/firestore');
    const docRef = doc(cocktailsCollection, validatedFields.data.slug);
    await setDoc(docRef, newCocktailData);

  } catch (error) {
     console.error("Error adding cocktail to Firestore:", error);
     return {
        message: 'There was a problem adding the cocktail. The URL slug may already exist.',
        errors: null,
        success: false,
     }
  }

  revalidatePath('/dashboard/content');
  // Redirect after successful submission to prevent re-submissions
  redirect('/dashboard/content');
}


const searchSchema = z.object({
  query: z.string(),
  cocktails: z.array(z.any()), // We pass the full cocktail list to the AI
});

export async function smartSearchAction(input: { query: string, cocktails: Cocktail[] }): Promise<{ cocktailSlugs: string[] | null; error: string | null; }> {
  const validatedFields = searchSchema.safeParse(input);

  if (!validatedFields.success) {
    return {
      cocktailSlugs: null,
      error: 'Invalid input for smart search.',
    };
  }
  
  if (validatedFields.data.cocktails.length === 0) {
      return { cocktailSlugs: [], error: null };
  }

  try {
    const result = await smartSearchCocktails(validatedFields.data);
    return {
      cocktailSlugs: result.cocktailSlugs,
      error: null,
    };
  } catch (error) {
    console.error(error);
    return {
      cocktailSlugs: null,
      error: 'An unexpected error occurred while searching for cocktails.',
    };
  }
}
