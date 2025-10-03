'use client';

import React, { useMemo, useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { useUser } from './provider';
import { initiateAnonymousSignIn } from './non-blocking-login';
import { Auth, signOut } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

function AuthHandler({ auth }: { auth: Auth }) {
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    // If the user is loaded and is null, it means they are not logged in.
    // In this case, we initiate an anonymous sign-in.
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  return null;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    return initializeFirebase();
  }, []);

  // Initialize storage here as well
  if(firebaseServices.firebaseApp) {
    getStorage(firebaseServices.firebaseApp);
  }

  // This effect will handle logging out the user from the client-side SDK
  // when the server-side action redirects.
  useEffect(() => {
    const handleSignOut = async () => {
        if (firebaseServices.auth.currentUser) {
            await signOut(firebaseServices.auth);
        }
    };

    window.addEventListener('beforeunload', handleSignOut);

    return () => {
        window.removeEventListener('beforeunload', handleSignOut);
    };
  }, [firebaseServices.auth]);

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      <AuthHandler auth={firebaseServices.auth} />
      {children}
    </FirebaseProvider>
  );
}
    