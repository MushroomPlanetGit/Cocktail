import {genkit, Plugin} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {firebase} from '@genkit-ai/firebase';
import {dotprompt, prompt} from '@genkit-ai/dotprompt';

export const ai = genkit({
  plugins: [
    googleAI(),
    firebase(),
    dotprompt({
      // By default, Dotprompt uses the local file system to store prompts.
      // Set a folder in your project to store them.
      promptStore: prompt,
    }),
  ] as Plugin<any>[],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
