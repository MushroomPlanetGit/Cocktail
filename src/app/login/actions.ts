'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import {
  AuthErrorCodes
} from 'firebase/auth';
import { getAuthenticatedAppForUser } from '@/firebase/get-authenticated-app-for-user';
import { doc, setDoc } from 'firebase/firestore';

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
      case "auth/weak-password": // Firebase REST API uses different codes
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

  try {
     const { app } = await getAuthenticatedAppForUser();
     if (!app) throw new Error("Firebase admin app not initialized");

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
       throw { code: `auth/${authRes.error.message.toLowerCase().replace(/_/g, '-')}` };
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
    const { firestore } = await getAuthenticatedAppForUser();
    
    // This server action now ONLY handles creating a new user from scratch.
    // Linking an anonymous user is now handled on the client.
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
       throw { code: `auth/${authRes.error.message.toLowerCase().replace(/_/g, '-')}` };
    }
    const newUserId = authRes.localId;

    // Create user profile document
    if (newUserId && firestore) {
      const userRef = doc(firestore, 'users', newUserId);
      await setDoc(userRef, {
        id: newUserId,
        email: email,
        registrationDate: new Date().toISOString(),
      }, { merge: true });
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
    redirect('/');
}