'use client';

import React, { useMemo, useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { useUser } from './provider';
import { initiateAnonymousSignIn } from './non-blocking-login';
import { Auth, signOut, onAuthStateChanged } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { usePathname, useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

function AuthHandler({ auth, firestore }: { auth: Auth, firestore: any }) {
  const { isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (newUser) => {
      if (newUser) {
        // Create a user document for both anonymous and non-anonymous users
        const userRef = doc(firestore, "users", newUser.uid);
        const userData = {
            id: newUser.uid,
            email: newUser.email,
            photoURL: newUser.photoURL,
            registrationDate: newUser.metadata.creationTime || new Date().toISOString(),
            isAnonymous: newUser.isAnonymous,
        };
        setDoc(userRef, userData, { merge: true });

        // If a non-anonymous user is on the login page, redirect them
        if (!newUser.isAnonymous && pathname === '/login') {
            router.push('/dashboard');
        }
      } else if (!isUserLoading) {
        // If there's no user and we are not in the initial loading state,
        // create an anonymous user for session continuity.
        initiateAnonymousSignIn(auth);
      }
    });

    return () => unsubscribe();
  }, [auth, isUserLoading, pathname, router, firestore]);

  return null;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    return initializeFirebase();
  }, []);
  const pathname = usePathname();

  // Initialize storage
  if(firebaseServices.firebaseApp) {
    getStorage(firebaseServices.firebaseApp);
  }

  useEffect(() => {
    const handleSignOut = async () => {
        // When the user is on the homepage, and they have an active session
        // (that isn't anonymous), sign them out from the client SDK.
        if (pathname === '/' && firebaseServices.auth.currentUser && !firebaseServices.auth.currentUser.isAnonymous) {
            await signOut(firebaseServices.auth);
        }
    };
    handleSignOut();
  }, [pathname, firebaseServices.auth]);

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      <AuthHandler auth={firebaseServices.auth} firestore={firebaseServices.firestore}/>
      {children}
    </FirebaseProvider>
  );
}
