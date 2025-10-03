'use client';

import React, { useMemo, useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { useUser } from './provider';
import { initiateAnonymousSignIn } from './non-blocking-login';
import { Auth, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { usePathname, useRouter } from 'next/navigation';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

function AuthHandler({ auth }: { auth: Auth }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (newUser) => {
      // If the user is loaded, is not null, and is not anonymous,
      // and they are currently on the login page, redirect them to the dashboard.
      if (newUser && !newUser.isAnonymous && pathname === '/login') {
        router.push('/dashboard');
      }

      // If the user is not logged in (and not in the process of loading),
      // initiate an anonymous sign-in. This gives them a temporary identity.
      if (!isUserLoading && !newUser) {
        initiateAnonymousSignIn(auth);
      }
    });

    return () => unsubscribe();
  }, [auth, isUserLoading, pathname, router]);

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
            // We only want to sign out if the user is NOT anonymous.
            // This prevents the anonymous user from being signed out on every page refresh.
            if (!firebaseServices.auth.currentUser.isAnonymous) {
                await signOut(firebaseServices.auth);
            }
        }
    };

    // This is a bit of a workaround. When a server action causes a redirect,
    // the 'beforeunload' event is fired. We use this to sign the user out
    // from the client SDK, ensuring the client state is in sync with the server.
    const handleRedirect = (event: BeforeUnloadEvent) => {
      // Check if the navigation is to the login page, which implies a sign-out.
      // This is not perfect, but it's a reasonable heuristic.
      if (document.activeElement?.getAttribute('href') === '/login') {
        handleSignOut();
      }
    };

    window.addEventListener('beforeunload', handleRedirect);

    return () => {
        window.removeEventListener('beforeunload', handleRedirect);
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
