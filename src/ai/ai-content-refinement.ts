'use server';

/**
 * @fileOverview Provides an AI tool to refine written content based on a selected style.
 *
 * - refineContent - A function that refines the content based on the selected style.
 * - RefineContentInput - The input type for the refineContent function.
 * - RefineContentOutput - The return type for the refineContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RefineContentInputSchema = z.object({
  content: z.string().describe('The content to be refined.'),
  style: z
    .string()
    .describe(
      'The desired style for the content (e.g., formal, casual, persuasive).'
    ),
});
export type RefineContentInput = z.infer<typeof RefineContentInputSchema>;

const RefineContentOutputSchema = z.object({
  refinedContent: z.string().describe('The refined content.'),
});

export type RefineContentOutput = z.infer<typeof RefineContentOutputSchema>;

export async function refineContent(input: RefineContentInput): Promise<RefineContentOutput> {
  return refineContentFlow(input);
}

const refineContentPrompt = ai.definePrompt({
  name: 'refineContentPrompt',
  input: {schema: RefineContentInputSchema},
  output: {schema: RefineContentOutputSchema},
  prompt: `You are an AI content refinement tool. Please refine the provided content to match the specified style.

Content: {{{content}}}
Style: {{{style}}}

Refined Content:`, // No Handlebars logic.
});

const refineContentFlow = ai.defineFlow(
  {
    name: 'refineContentFlow',
    inputSchema: RefineContentInputSchema,
    outputSchema: RefineContentOutputSchema,
  },
  async input => {
    const {output} = await refineContentPrompt(input);
    return output!;
  }
);
