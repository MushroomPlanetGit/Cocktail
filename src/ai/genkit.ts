import {genkit, Plugin, dotprompt} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {firebasePlugin} from '@genkit-ai/firebase/server';

export const ai = genkit({
  plugins: [
    googleAI(),
    firebasePlugin(),
    dotprompt(),
  ] as Plugin<any>[],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
