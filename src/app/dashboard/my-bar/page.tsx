'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2, Search, Camera, Bot, Martini, Loader2, Sparkles, CheckCircle, ShoppingCart } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { suggestCocktailsAction } from './actions';
import type { CocktailSuggestion } from '@/ai/flows/suggest-cocktails';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, doc } from 'firebase/firestore';
import type { UserInventoryItem } from '@/types/inventory';
import { Skeleton } from '@/components/ui/skeleton';


export default function MyBarPage() {
  const [newIngredientName, setNewIngredientName] = useState('');
  const [newIngredientSize, setNewIngredientSize] = useState('750ml');
  const [suggestions, setSuggestions] = useState<CocktailSuggestion[]>([]);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const inventoryCollectionRef = useMemoFirebase(() => {
    if (user && firestore) {
      return collection(firestore, 'users', user.uid, 'inventory');
    }
    return null;
  }, [user, firestore]);

  const { data: ingredients, isLoading: isLoadingInventory } = useCollection<UserInventoryItem>(inventoryCollectionRef);

  const addIngredient = () => {
    if (newIngredientName.trim() !== '' && inventoryCollectionRef) {
      const newIngredient = {
        name: newIngredientName.trim(),
        level: 100,
        size: newIngredientSize,
      };
      addDocumentNonBlocking(inventoryCollectionRef, newIngredient);
      setNewIngredientName('');
    }
  };

  const removeIngredient = (id: string) => {
    if (user && firestore) {
      const docRef = doc(firestore, 'users', user.uid, 'inventory', id);
      deleteDocumentNonBlocking(docRef);
    }
  };
  
  const updateIngredientLevel = (id: string, level: number) => {
     if (user && firestore) {
      const docRef = doc(firestore, 'users', user.uid, 'inventory', id);
      setDocumentNonBlocking(docRef, { level }, { merge: true });
     }
  }

  const handleSuggestCocktails = () => {
    startTransition(async () => {
      setSuggestions([]); // Clear previous suggestions
      const ingredientNames = ingredients?.map(i => i.name) || [];
      const result = await suggestCocktailsAction({ ingredients: ingredientNames });

      if (result.error || !result.suggestions) {
        toast({
          title: 'Error',
          description: result.error || 'Could not get suggestions from AI.',
          variant: 'destructive',
        });
      } else {
        setSuggestions(result.suggestions);
      }
    });
  };


  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle>My Bar</CardTitle>
          <CardDescription>Manage the ingredients you have at home to get cocktail suggestions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add a New Bottle</CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                 <div className="flex flex-col gap-2">
                    <label htmlFor="add-ingredient" className="text-sm font-medium">Ingredient Name</label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="add-ingredient"
                        placeholder="e.g., Angostura Bitters"
                        value={newIngredientName}
                        onChange={(e) => setNewIngredientName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addIngredient()}
                        disabled={!user}
                      />
                       <Button variant="outline" size="icon" className="shrink-0">
                          <Bot className="h-5 w-5"/>
                          <span className="sr-only">Identify with AI</span>
                      </Button>
                      <Button variant="outline" size="icon" className="shrink-0">
                          <Camera className="h-5 w-5"/>
                          <span className="sr-only">Scan with Camera</span>
                      </Button>
                    </div>
                 </div>
                 <div className="flex flex-col gap-2">
                    <label htmlFor="bottle-size" className="text-sm font-medium">Bottle Size</label>
                    <div className="flex items-end gap-2">
                      <Select value={newIngredientSize} onValueChange={setNewIngredientSize} disabled={!user}>
                        <SelectTrigger id="bottle-size">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="750ml">750ml</SelectItem>
                          <SelectItem value="1L">1L</SelectItem>
                          <SelectItem value="1.75L">1.75L</SelectItem>
                          <SelectItem value="N/A">N/A</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={addIngredient} className="shrink-0" disabled={!user}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add
                      </Button>
                    </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              <h3 className="text-xl font-semibold">Your Inventory</h3>
              {isLoadingInventory ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-8 w-8" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-3 w-16 mb-4" />
                        <Skeleton className="h-5 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : ingredients && ingredients.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ingredients.map((ingredient) => (
                    <Card key={ingredient.id}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-base font-medium">{ingredient.name}</CardTitle>
                             <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 -mt-2 -mr-2"
                                onClick={() => removeIngredient(ingredient.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs text-muted-foreground mb-4">Size: {ingredient.size}</div>
                            <div className="grid gap-2">
                                <Slider
                                    defaultValue={[ingredient.level]}
                                    max={100}
                                    step={1}
                                    onValueChange={(value) => updateIngredientLevel(ingredient.id, value[0])}
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Empty</span>
                                    <span>Full</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground py-12 text-center border-2 border-dashed rounded-lg">
                  {user ? "You haven't added any ingredients yet." : "Please sign in to manage your bar."}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-col gap-6">
        <Button size="lg" onClick={handleSuggestCocktails} disabled={isPending || !ingredients || ingredients.length === 0} className="self-start">
            {isPending ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Search className="mr-2 h-5 w-5" />
            )}
          What can I make?
        </Button>

        {isPending && (
           <Card>
                <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px] text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <CardTitle className="mt-4">Checking your bar...</CardTitle>
                    <CardDescription>Our AI mixologist is looking for the perfect cocktail for you.</CardDescription>
                </CardContent>
            </Card>
        )}

        {suggestions.length > 0 && (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/>AI Cocktail Suggestions</CardTitle>
                    <CardDescription>Based on your inventory, here are a few things you can make.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    {suggestions.map(suggestion => (
                      <Card key={suggestion.name} className="p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                                <Martini className="h-6 w-6 text-muted-foreground mt-1" />
                                <div>
                                    <p className="font-semibold">{suggestion.name}</p>
                                    <p className="text-sm text-muted-foreground">{suggestion.rationale}</p>
                                </div>
                            </div>
                            <Link href="/dashboard/content">
                              <Button variant="outline" size="sm">View Recipe</Button>
                            </Link>
                        </div>
                        {suggestion.missingIngredients.length > 0 && (
                          <Alert className="mt-4">
                            <ShoppingCart className="h-4 w-4" />
                            <AlertTitle>You're almost there!</AlertTitle>
                            <AlertDescription>
                              You're only missing: {suggestion.missingIngredients.join(', ')}.
                            </AlertDescription>
                          </Alert>
                        )}
                        {suggestion.matchType === 'perfect' && (
                           <Alert variant="default" className="mt-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertTitle className="text-green-800 dark:text-green-300">Perfect Match!</AlertTitle>
                            <AlertDescription className="text-green-700 dark:text-green-400">
                              You have all the ingredients to make this.
                            </AlertDescription>
                          </Alert>
                        )}
                      </Card>
                    ))}
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
