'use server';

import { ai } from '../genkit';
import { z } from 'zod';

const RefineContentInputSchema = z.object({
  text: z.string(),
  style: z.string(),
});

const refineContentFlow = ai.defineFlow(
  {
    name: 'refineContentFlow',
    inputSchema: RefineContentInputSchema,
    outputSchema: z.string(),
  },
  async ({ text, style }) => {
    const prompt = `Refine the following text to have a ${style} tone. Only return the refined text, without any additional explanations or introductory phrases:

    Text: "${text}"`;

    const result = await ai.generate({
      prompt,
      model: 'gemini-pro',
      config: {
        temperature: 0.7,
      },
    });

    return result.text;
  }
);

export async function refineContent(input: z.infer<typeof RefineContentInputSchema>): Promise<string> {
  return refineContentFlow(input);
}
