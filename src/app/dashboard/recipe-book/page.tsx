'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { RecipeNote, Cocktail } from '@/types/cocktail';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, BookHeart, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function MyRecipeBookPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  // Query for the user's recipe notes
  const recipeNotesQuery = useMemoFirebase(() => {
    if (user && firestore) {
      return collection(firestore, 'users', user.uid, 'recipeNotes');
    }
    return null;
  }, [user, firestore]);
  const { data: recipeNotes, isLoading: isLoadingNotes } = useCollection<RecipeNote>(recipeNotesQuery);

  // Get the slugs of all recipes the user has notes for
  const recipeSlugs = useMemo(() => recipeNotes?.map(note => note.recipeId) ?? [], [recipeNotes]);
  
  // Query for the full cocktail details of those recipes
  const cocktailsQuery = useMemoFirebase(() => {
    if (firestore && recipeSlugs.length > 0) {
      return query(collection(firestore, 'cocktails'), where('slug', 'in', recipeSlugs));
    }
    return null;
  }, [firestore, recipeSlugs.join(',')]); // Depend on joined slugs to memoize correctly
  const { data: cocktails, isLoading: isLoadingCocktails } = useCollection<Cocktail>(cocktailsQuery);

  // Create a map for quick lookup
  const cocktailsMap = useMemo(() => new Map(cocktails?.map(c => [c.slug, c])), [cocktails]);

  const isLoading = isUserLoading || isLoadingNotes || isLoadingCocktails;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading your recipe book...</p>
      </div>
    );
  }
  
  if (!user || user.isAnonymous) {
     return (
        <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
                <CardTitle>Sign In to View Your Recipe Book</CardTitle>
                <CardDescription>Your personal recipe book is waiting for you. Sign in to access your saved notes and customizations.</CardDescription>
            </CardHeader>
            <CardContent>
                <Link href="/login">
                    <Button>Sign In</Button>
                </Link>
            </CardContent>
        </Card>
    );
  }


  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>My Recipe Book</CardTitle>
          <CardDescription>
            This is your personal collection of cocktails. Here you can find all the recipes for which you've added notes, photos, or customizations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recipeNotes && recipeNotes.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipeNotes.map(note => {
                const cocktail = cocktailsMap.get(note.recipeId);
                return (
                  <Link key={note.id} href={`/dashboard/recipe-book/${note.recipeId}`} className="block">
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardHeader>
                          {note.photoUrl ? (
                            <div className="aspect-video w-full relative mb-4 rounded-md overflow-hidden">
                                <Image src={note.photoUrl} alt={`My ${cocktail?.name}`} className="w-full h-full object-cover" width={300} height={169}/>
                            </div>
                          ) : (
                             <div className="aspect-video w-full bg-muted flex items-center justify-center rounded-md mb-4">
                               <BookHeart className="w-10 h-10 text-muted-foreground" />
                             </div>
                          )}
                        <CardTitle>{cocktail?.name || 'Loading...'}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {note.notes || `Your personal notes for the ${cocktail?.name || 'cocktail'} will appear here.`}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg text-center">
              <BookHeart className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">Your Recipe Book is Empty</h3>
              <p className="text-muted-foreground mt-2 max-w-md">
                Browse the Master Recipes and add notes to a cocktail to save it here.
              </p>
              <Link href="/dashboard/content" className="mt-4">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Browse Recipes
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
