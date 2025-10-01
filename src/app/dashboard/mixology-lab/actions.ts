
'use server';

import {
  generateQuizQuestion,
  GenerateQuizQuestionInputSchema,
  GenerateQuizQuestionOutput,
} from '@/ai/flows/generate-quiz-question';
import { z } from 'zod';

const actionSchema = z.object({
  category: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

export async function generateQuizQuestionAction(input: z.infer<typeof actionSchema>): Promise<{ question: GenerateQuizQuestionOutput | null; error: string | null; }> {
  const validatedFields = actionSchema.safeParse(input);

  if (!validatedFields.success) {
    return {
      question: null,
      error: 'Invalid input.',
    };
  }

  try {
    const question = await generateQuizQuestion(validatedFields.data);
    return {
      question,
      error: null,
    };
  } catch (error) {
    console.error(error);
    return {
      question: null,
      error: 'An unexpected error occurred while generating the quiz question.',
    };
  }
}
