'use client';

import { useEffect, useMemo } from 'react';
import { useFormState } from 'react-dom';
import { searchUsersAction, sendConnectionRequestAction, acceptConnectionRequestAction, removeConnectionAction } from './actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, UserPlus, UserCheck, UserX, Send, BookHeart } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, or } from 'firebase/firestore';
import type { UserProfile } from '@/types/user';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import type { Cocktail } from '@/types/cocktail';

export type Connection = {
  id: string;
  userIds: string[];
  requesterId: string;
  status: 'pending' | 'accepted';
  createdAt: any;
};

const initialSearchState = {
  users: [],
  error: null,
};


export default function BarGuestsPage() {
  const { toast } = useToast();
  const [state, formAction] = useFormState(searchUsersAction, initialSearchState);
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const connectionsRef = useMemoFirebase(() => {
    if (user && firestore) {
      return collection(firestore, 'connections');
    }
    return null;
  }, [user, firestore]);

  const connectionsQuery = useMemoFirebase(() => {
    if (connectionsRef && user) {
        // Query for documents where the current user is one of the participants
        return query(connectionsRef, where('userIds', 'array-contains', user.uid));
    }
    return null;
  }, [connectionsRef, user]);

  const { data: connections, isLoading: isLoadingConnections } = useCollection<Connection>(connectionsQuery);

  const allUserIds = connections?.flatMap(c => c.userIds).filter(id => id !== user?.uid) ?? [];
  const uniqueUserIds = [...new Set(allUserIds)];

  const usersRef = useMemoFirebase(() => {
    if (firestore && uniqueUserIds.length > 0) {
        return query(collection(firestore, 'users'), where('id', 'in', uniqueUserIds));
    }
    return null;
  }, [firestore, uniqueUserIds.join(',')]); // Depend on joined string to memoize correctly

  const { data: connectedUsers, isLoading: isLoadingConnectedUsers } = useCollection<UserProfile>(usersRef);

  const cocktailsCollectionRef = useMemoFirebase(() => {
    if (firestore) {
      return collection(firestore, 'cocktails');
    }
    return null;
  }, [firestore]);
  const { data: cocktails, isLoading: isLoadingCocktails } = useCollection<Cocktail>(cocktailsCollectionRef);

  const cocktailsMap = useMemo(() => new Map(cocktails?.map(c => [c.slug, c])), [cocktails]);
  const connectedUsersMap = new Map(connectedUsers?.map(u => [u.id, u]));

  useEffect(() => {
    if (state.error) {
      toast({ title: 'Search Error', description: state.error, variant: 'destructive' });
    }
  }, [state.error, toast]);

  const handleSendRequest = async (targetUserId: string) => {
    const result = await sendConnectionRequestAction(targetUserId);
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: result.success });
    }
  };

  const handleAcceptRequest = async (connectionId: string) => {
    const result = await acceptConnectionRequestAction(connectionId);
    if (result.error) toast({ title: 'Error', description: result.error, variant: 'destructive' });
    else toast({ title: 'Success', description: result.success });
  };
  
  const handleRemoveConnection = async (connectionId: string) => {
    const result = await removeConnectionAction(connectionId);
     if (result.error) toast({ title: 'Error', description: result.error, variant: 'destructive' });
    else toast({ title: 'Success', description: result.success });
  }

  const myGuests = connections?.filter(c => c.status === 'accepted') || [];
  const pendingIncoming = connections?.filter(c => c.status === 'pending' && c.requesterId !== user?.uid) || [];
  const pendingOutgoing = connections?.filter(c => c.status === 'pending' && c.requesterId === user?.uid) || [];
  
  const isLoading = isLoadingConnections || isLoadingConnectedUsers || isLoadingCocktails;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="flex flex-col gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Find New Guests</CardTitle>
            <CardDescription>Search for other users by their email address to invite them to your bar.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="flex gap-2">
              <Input type="email" name="email" placeholder="friend@example.com" required disabled={isUserLoading} />
              <Button type="submit" disabled={isUserLoading}>
                <Search className="mr-2 h-4 w-4" /> Search
              </Button>
            </form>
          </CardContent>
          {state.users && state.users.length > 0 && (
            <CardContent>
              <h3 className="font-semibold mb-2">Search Results</h3>
              <ul className="space-y-2">
                {state.users.map((foundUser: UserProfile) => (
                  <li key={foundUser.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={foundUser.photoURL} />
                        <AvatarFallback>{foundUser.email?.[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span>{foundUser.email}</span>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleSendRequest(foundUser.id)}>
                      <UserPlus className="mr-2 h-4 w-4" /> Invite
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          )}
        </Card>
      </div>

      <div className="flex flex-col gap-8">
        <Card>
            <CardHeader>
                <CardTitle>My Bar Guests</CardTitle>
                <CardDescription>Manage your connections and invitations.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center h-24">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {pendingIncoming.length > 0 && (
                             <div>
                                <h3 className="font-semibold mb-2">Incoming Requests</h3>
                                <ul className="space-y-2">
                                    {pendingIncoming.map(c => {
                                        const guestUser = connectedUsersMap.get(c.requesterId);
                                        return (
                                            <li key={c.id} className="flex items-center justify-between p-2 rounded-md bg-amber-50 dark:bg-amber-900/20">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-8 w-8"><AvatarImage src={guestUser?.photoURL}/><AvatarFallback>{guestUser?.email?.[0].toUpperCase()}</AvatarFallback></Avatar>
                                                    <span className="text-sm">{guestUser?.email}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="default" onClick={() => handleAcceptRequest(c.id)}><UserCheck className="mr-2 h-4 w-4" />Accept</Button>
                                                    <Button size="sm" variant="ghost" onClick={() => handleRemoveConnection(c.id)}><UserX className="h-4 w-4" /></Button>
                                                </div>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                        )}

                        <div>
                            <h3 className="font-semibold mb-2">Current Guests ({myGuests.length})</h3>
                            {myGuests.length > 0 ? (
                                <ul className="space-y-2">
                                    {myGuests.map(c => {
                                        const guestId = c.userIds.find(id => id !== user?.uid)!;
                                        const guestUser = connectedUsersMap.get(guestId);
                                        const favoriteCocktailSlug = guestUser?.favoriteCocktail;
                                        const favoriteCocktail = favoriteCocktailSlug ? cocktailsMap.get(favoriteCocktailSlug) : null;

                                        return (
                                            <li key={c.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                                <div className="flex flex-col gap-1 items-start">
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-8 w-8"><AvatarImage src={guestUser?.photoURL}/><AvatarFallback>{guestUser?.email?.[0].toUpperCase()}</AvatarFallback></Avatar>
                                                        <span className="text-sm font-medium">{guestUser?.email}</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground flex items-center gap-2 pl-10">
                                                        <BookHeart className="h-3 w-3"/>
                                                        {favoriteCocktail ? favoriteCocktail.name : <em>No favorite selected</em>}
                                                    </div>
                                                </div>
                                                <Button size="sm" variant="ghost" onClick={() => handleRemoveConnection(c.id)}><UserX className="h-4 w-4" /></Button>
                                            </li>
                                        )
                                    })}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground">You haven't added any guests yet. Use the search to find friends!</p>
                            )}
                        </div>

                        {pendingOutgoing.length > 0 && (
                            <div>
                                <Separator className="my-4"/>
                                <h3 className="font-semibold mb-2">Sent Requests</h3>
                                <ul className="space-y-2">
                                    {pendingOutgoing.map(c => {
                                        const guestId = c.userIds.find(id => id !== user?.uid)!;
                                        const guestUser = connectedUsersMap.get(guestId);
                                        return (
                                            <li key={c.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                                 <div className="flex items-center gap-2">
                                                    <Avatar className="h-8 w-8"><AvatarImage src={guestUser?.photoURL}/><AvatarFallback>{guestUser?.email?.[0].toUpperCase()}</AvatarFallback></Avatar>
                                                    <span className="text-sm text-muted-foreground">{guestUser?.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Send className="h-4 w-4" />
                                                    Pending
                                                </div>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
