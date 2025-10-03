'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  linkWithCredential,
  EmailAuthProvider,
  signOut
} from 'firebase/auth';
import { initializeFirebase } from '@/firebase';
import { AuthErrorCodes } from 'firebase/auth';
import { getAuthenticatedAppForUser } from '@/firebase/get-authenticated-app-for-user';
import { linkAnonymousUser } from './auth-helpers';

const authSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

function handleAuthError(error: any) {
  console.error(error);
  if (error.code) {
    switch (error.code) {
      case AuthErrorCodes.EMAIL_EXISTS:
        return 'This email is already in use. Please try logging in.';
      case AuthErrorCodes.USER_DELETED:
        return 'User not found. Please check your credentials or sign up.';
      case AuthErrorCodes.INVALID_LOGIN_CREDENTIALS:
         return 'Invalid email or password. Please try again.';
      case AuthErrorCodes.WEAK_PASSWORD:
        return 'The password is too weak. Please use a stronger password.';
      default:
        return 'An unexpected authentication error occurred. Please try again.';
    }
  }
  return 'An unexpected error occurred. Please try again.';
}

export async function loginAction(prevState: any, formData: FormData) {
  const validatedFields = authSchema.safeParse(Object.fromEntries(formData));

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  // NOTE: This server action uses the REST API for auth and does not
  // update the client-side session state. The redirect will force a
  // reload and the Firebase client-side SDK will pick up the new user.
  try {
     const { app } = await getAuthenticatedAppForUser();
     if (!app) throw new Error("Firebase admin app not initialized");

    // We can't use the client SDK here, so we call the REST API.
    // This is a common pattern for server-side auth with Firebase.
     const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...validatedFields.data, returnSecureToken: true }),
      }
    );
    const authRes = await res.json();
    if (!res.ok) {
       throw { code: `auth/${authRes.error.message.toLowerCase()}` };
    }

  } catch (error: any) {
    return {
      message: handleAuthError(error),
      errors: null,
      success: false,
    };
  }

  redirect('/dashboard');
}

export async function signupAction(prevState: any, formData: FormData) {
  const validatedFields = authSchema.safeParse(Object.fromEntries(formData));

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { email, password } = validatedFields.data;

  try {
    const { currentUser: currentAnonymousUser } = await getAuthenticatedAppForUser();
    
    if (!currentAnonymousUser || !currentAnonymousUser.isAnonymous) {
        // This case is for when a non-anonymous user tries to sign up again,
        // or if there is no user at all.
        // We will just create a new user without linking.
         const res = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', },
                body: JSON.stringify({ email, password, returnSecureToken: true }),
            }
        );
        const authRes = await res.json();
        if (!res.ok) {
           throw { code: `auth/${authRes.error.message.toLowerCase()}` };
        }

    } else {
       await linkAnonymousUser(email, password);
    }
  
  } catch (error: any) {
     return {
      message: handleAuthError(error),
      errors: null,
      success: false,
    };
  }
  
  redirect('/dashboard');
}

export async function signOutAction() {
    // This is a client-side action that will be called from a form
    // but the actual signout happens on the client via the SDK.
    // The server doesn't need to do anything here other than redirect.
    redirect('/');
}
    