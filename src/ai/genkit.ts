import {genkit, Plugin, dotprompt} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {firebase} from '@genkit-ai/firebase';

export const ai = genkit({
  plugins: [
    googleAI(),
    firebase(),
    dotprompt(),
  ] as Plugin<any>[],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
