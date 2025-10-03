
'use server';

import {
  generateQuizQuestion,
  GenerateQuizQuestionInputSchema,
  GenerateQuizQuestionOutput,
} from '@/ai/flows/generate-quiz-question';
import {
  generateWhatAmIPuzzle,
  GenerateWhatAmIPuzzleOutput,
} from '@/ai/flows/generate-what-am-i-puzzle';
import {
    generateCrossword,
    GenerateCrosswordOutput,
} from '@/ai/flows/generate-crossword';
import { z } from 'zod';

const quizActionSchema = z.object({
  category: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

export async function generateQuizQuestionAction(input: z.infer<typeof quizActionSchema>): Promise<{ question: GenerateQuizQuestionOutput | null; error: string | null; }> {
  const validatedFields = quizActionSchema.safeParse(input);

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

export async function generateWhatAmIPuzzleAction(): Promise<{ puzzle: GenerateWhatAmIPuzzleOutput | null; error: string | null; }> {
  try {
    const puzzle = await generateWhatAmIPuzzle();
    return {
      puzzle,
      error: null,
    };
  } catch (error) {
    console.error(error);
    return {
      puzzle: null,
      error: 'An unexpected error occurred while generating the puzzle.',
    };
  }
}

export async function generateCrosswordAction(): Promise<{ crossword: GenerateCrosswordOutput | null; error: string | null; }> {
    try {
        const crossword = await generateCrossword();
        return {
            crossword,
            error: null,
        };
    } catch (error) {
        console.error(error);
        return {
            crossword: null,
            error: 'An unexpected error occurred while generating the crossword puzzle.',
        };
    }
}

    