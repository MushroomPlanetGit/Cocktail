'use server';

import { z } from 'zod';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getAuthenticatedAppForUser } from '@/firebase/get-authenticated-app-for-user';
import { revalidatePath } from 'next/cache';

const searchUsersSchema = z.object({
  email: z.string().email('Please enter a valid email.').min(1, 'Email cannot be empty.'),
});

export async function searchUsersAction(prevState: any, formData: FormData) {
  const { currentUser, firestore } = await getAuthenticatedAppForUser();
  if (!currentUser || !firestore) {
    return { error: 'You must be logged in to search for users.' };
  }

  const validated = searchUsersSchema.safeParse({ email: formData.get('email') });
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors.email?.[0] };
  }

  try {
    const usersRef = collection(firestore, 'users');
    // Note: Firestore security rules should prevent users from seeing all data.
    // We are searching by exact email match.
    const q = query(usersRef, where('email', '==', validated.data.email));
    const querySnapshot = await getDocs(q);
    
    const users = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(user => user.id !== currentUser.uid); // Exclude self

    return { users };
  } catch (error) {
    console.error('Error searching users:', error);
    return { error: 'An error occurred while searching.' };
  }
}

export async function sendConnectionRequestAction(targetUserId: string) {
  const { currentUser, firestore } = await getAuthenticatedAppForUser();
  if (!currentUser || !firestore) {
    return { error: 'You must be logged in.' };
  }

  const connectionsRef = collection(firestore, 'connections');
  // Check if a connection already exists
  const q = query(connectionsRef, where('userIds', 'in', [[currentUser.uid, targetUserId], [targetUserId, currentUser.uid]]));
  const existing = await getDocs(q);

  if (!existing.empty) {
      return { error: 'A connection or request already exists.' };
  }

  try {
    await addDoc(connectionsRef, {
      userIds: [currentUser.uid, targetUserId],
      requesterId: currentUser.uid,
      status: 'pending',
      createdAt: serverTimestamp(),
    });
    revalidatePath('/dashboard/bar-guests');
    return { success: 'Request sent!' };
  } catch (error) {
    console.error('Error sending connection request:', error);
    return { error: 'Failed to send request.' };
  }
}

export async function acceptConnectionRequestAction(connectionId: string) {
    const { currentUser, firestore } = await getAuthenticatedAppForUser();
    if (!currentUser || !firestore) {
        return { error: 'You must be logged in.' };
    }

    const connectionRef = doc(firestore, 'connections', connectionId);
    try {
        await updateDoc(connectionRef, { status: 'accepted' });
        revalidatePath('/dashboard/bar-guests');
        return { success: 'Guest added!' };
    } catch (error) {
        console.error('Error accepting request:', error);
        return { error: 'Failed to accept request.' };
    }
}

export async function removeConnectionAction(connectionId: string) {
    const { currentUser, firestore } = await getAuthenticatedAppForUser();
    if (!currentUser || !firestore) {
        return { error: 'You must be logged in.' };
    }

    const connectionRef = doc(firestore, 'connections', connectionId);
    try {
        await deleteDoc(connectionRef);
        revalidatePath('/dashboard/bar-guests');
        return { success: 'Guest removed.' };
    } catch (error) {
        console.error('Error removing connection:', error);
        return { error: 'Failed to remove guest.' };
    }
}
