
'use server';
/**
 * @fileOverview An AI flow for identifying the name of a spirit or ingredient from a photo of its label.
 *
 * - identifyIngredient - The main function to call the flow.
 * - IdentifyIngredientInputSchema - The Zod schema for the flow's input.
 * - IdentifyIngredientOutputSchema - The Zod schema for the flow's output.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const IdentifyIngredientInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a bottle's label, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type IdentifyIngredientInput = z.infer<
  typeof IdentifyIngredientInputSchema
>;

export const IdentifyIngredientOutputSchema = z.object({
    ingredientName: z.string().describe('The identified name of the ingredient from the label.')
});
export type IdentifyIngredientOutput = z.infer<typeof IdentifyIngredientOutputSchema>;


export async function identifyIngredient(
  input: IdentifyIngredientInput
): Promise<IdentifyIngredientOutput> {
  return identifyIngredientFlow(input);
}

const identifyIngredientPrompt = ai.definePrompt({
  name: 'identifyIngredientPrompt',
  input: { schema: IdentifyIngredientInputSchema },
  output: { schema: IdentifyIngredientOutputSchema },
  prompt: `You are an expert at reading labels on liquor and ingredient bottles. Your task is to analyze the provided image and extract the primary brand or product name.

Follow these rules precisely:
1.  Analyze the image provided: {{media url=photoDataUri}}
2.  Identify the most prominent text on the label, which is usually the product's name.
3.  Return only the name of the product. Do not include the type of liquor (e.g., "Vodka", "Whiskey") unless it is part of the brand name itself (e.g., "Maker's Mark").
4.  For example, if the label says "Ketel One Vodka", you should return "Ketel One". If it says "Angostura Aromatic Bitters", return "Angostura Aromatic Bitters". If it's "Hendrick's Gin", return "Hendrick's".
5.  Format the output as specified in the schema.`,
});

const identifyIngredientFlow = ai.defineFlow(
  {
    name: 'identifyIngredientFlow',
    inputSchema: IdentifyIngredientInputSchema,
    outputSchema: IdentifyIngredientOutputSchema,
  },
  async (input) => {
    const { output } = await identifyIngredientPrompt(input);
    return output!;
  }
);
