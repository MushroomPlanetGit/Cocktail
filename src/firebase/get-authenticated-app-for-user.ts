
'use server';

import { getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { headers } from 'next/headers';
import { firebaseConfig } from './config';

// This is a server-side utility to get an admin app instance
// authenticated as the currently logged-in user.

export async function getAuthenticatedAppForUser() {
  const anApp =
    getApps().find((app) => app.name === 'auth-dance-app-server-side') ??
    initializeApp(
      {
        projectId: firebaseConfig.projectId,
        storageBucket: `${firebaseConfig.projectId}.appspot.com`,
      },
      'auth-dance-app-server-side'
    );

  const idToken = headers().get('X-Firebase-AppCheck-Token');
  if (!idToken) {
    return { app: null, currentUser: null, firestore: null };
  }

  try {
    const decodedIdToken = await getAuth(anApp).verifyIdToken(idToken);
    const firestore = getFirestore(anApp);
    return {
      app: anApp,
      currentUser: { ...decodedIdToken },
      firestore,
    };
  } catch (e) {
    console.error(e);
    return { app: null, currentUser: null, firestore: null };
  }
}
