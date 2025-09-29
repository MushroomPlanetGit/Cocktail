import { ai } from '../genkit';
import { z } from 'zod';
import { flow } from 'genkit/flow';

export const refineContent = flow(
  {
    name: 'refineContent',
    inputSchema: z.object({
      text: z.string(),
      style: z.string(),
    }),
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

    return result.text();
  }
);
