'use server';
import { refineContent } from '@/ai/flows/content';
import { run } from '@genkit-ai/next/server';
import { z } from 'zod';

const refineSchema = z.object({
  text: z.string().min(10, "Please enter at least 10 characters."),
  style: z.string(),
});

export async function refineContentAction(prevState: any, formData: FormData) {
  const input = {
    text: formData.get('text'),
    style: formData.get('style'),
  };

  const validatedFields = refineSchema.safeParse(input);

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
      refinedText: null,
    };
  }

  try {
    const refinedText = await run(refineContent, validatedFields.data);
    return {
      message: 'Content refined successfully.',
      refinedText,
      errors: null,
    };
  } catch (error) {
    console.error(error);
    return {
      message: 'An unexpected error occurred while refining content.',
      refinedText: null,
      errors: null,
    };
  }
}
