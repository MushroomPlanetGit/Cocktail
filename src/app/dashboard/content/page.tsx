
'use client';

import { useState, useMemo, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, Martini, BookPlus, BookOpenCheck, History, GlassWater, Sparkles, ShoppingCart, ListOrdered, Search, Loader2, Brain } from "lucide-react";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import type { Cocktail } from "@/types/cocktail";
import { smartSearchAction } from "./actions";
import { useToast } from "@/hooks/use-toast";


export default function ContentPage() {
    const [spirit, setSpirit] = useState('all');
    const [style, setStyle] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<string[] | null>(null);
    const [isSearching, startSearchTransition] = useTransition();
    const { toast } = useToast();
    const firestore = useFirestore();

    const cocktailsCollectionRef = useMemoFirebase(() => {
      if (firestore) {
        return collection(firestore, 'cocktails');
      }
      return null;
    }, [firestore]);

    const { data: cocktails, isLoading: isLoadingCocktails } = useCollection<Cocktail>(cocktailsCollectionRef);

    const handleSearch = () => {
        if (!searchQuery.trim()) {
            setSearchResults(null); // Clear search if query is empty
            return;
        }
        startSearchTransition(async () => {
            const result = await smartSearchAction({ query: searchQuery, cocktails: cocktails || [] });
            if (result.error) {
                toast({
                    title: "Search Error",
                    description: result.error,
                    variant: "destructive",
                });
                setSearchResults([]);
            } else {
                setSearchResults(result.cocktailSlugs || []);
                 if (result.cocktailSlugs?.length === 0) {
                     toast({
                        title: "No Results",
                        description: "Our AI couldn't find any cocktails matching your search.",
                    });
                }
            }
        });
    }

    const filteredCocktails = useMemo(() => {
        if (!cocktails) return [];

        let results = cocktails;

        // Apply smart search results first
        if (searchResults !== null) {
            const searchSlugs = new Set(searchResults);
            results = results.filter(cocktail => searchSlugs.has(cocktail.slug));
        }

        // Then apply filters
        return results.filter(cocktail => {
            const spiritMatch = spirit === 'all' || cocktail.baseSpirit === spirit;
            const styleMatch = style === 'all' || cocktail.style === style;
            return spiritMatch && styleMatch;
        });
    }, [spirit, style, cocktails, searchResults]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BookOpenCheck className="w-8 h-8" />
            Master Recipes
          </h1>
          <p className="text-muted-foreground">
            An official list of classic and modern cocktails.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/content/add">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Cocktail
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cocktail Index</CardTitle>
          <CardDescription>Browse recipes, filter, or use our AI-powered Smart Search to find your next favorite drink.</CardDescription>
           <Separator className="my-4" />
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                    <label className="text-sm font-medium">Filter by Base Spirit</label>
                    <Select value={spirit} onValueChange={setSpirit}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a base spirit" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Spirits</SelectItem>
                            <SelectItem value="vodka">Vodka</SelectItem>
                            <SelectItem value="gin">Gin</SelectItem>
                            <SelectItem value="rum">Rum</SelectItem>
                            <SelectItem value="tequila">Tequila</SelectItem>
                            <SelectItem value="whiskey">Whiskey</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <label className="text-sm font-medium">Filter by Style</label>
                     <Select value={style} onValueChange={setStyle}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a style" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Styles</SelectItem>
                            <SelectItem value="classic">Classic</SelectItem>
                            <SelectItem value="modern">Modern</SelectItem>
                            <SelectItem value="tropical">Tropical</SelectItem>
                            <SelectItem value="sour">Sour</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="grid gap-2 sm:col-span-2 md:col-span-1">
                     <label className="text-sm font-medium">Have ingredients on hand?</label>
                    <Button asChild>
                        <Link href="/dashboard/my-bar">
                            <Search className="mr-2 h-4 w-4" />
                            What can I make?
                        </Link>
                    </Button>
                </div>
                <div className="grid gap-2 sm:col-span-2 md:col-span-3">
                    <label className="text-sm font-medium">AI Smart Search</label>
                    <div className="flex gap-2">
                        <Input 
                            placeholder="e.g., 'a refreshing summer drink with gin'" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <Button onClick={handleSearch} disabled={isSearching}>
                            {isSearching ? <Loader2 className="h-4 w-4 animate-spin"/> : <Brain className="h-4 w-4" />}
                            <span className="hidden sm:inline ml-2">Search</span>
                        </Button>
                         {searchResults !== null && (
                            <Button variant="ghost" onClick={() => { setSearchResults(null); setSearchQuery(''); }}>
                                Clear
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          {isLoadingCocktails || isSearching ? (
             <div className="flex flex-col items-center justify-center p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <h3 className="text-xl font-semibold mt-4">{isSearching ? 'AI is searching...' : 'Loading Recipes...'}</h3>
              <p className="text-muted-foreground mt-2">
                {isSearching ? 'Please wait while we find the perfect cocktails for you.' : 'Fetching the latest cocktail list from the database.'}
              </p>
            </div>
          ) : filteredCocktails.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {filteredCocktails.map((cocktail) => (
                <AccordionItem value={`item-${cocktail.id}`} key={cocktail.id}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-4">
                      <div className="bg-muted p-3 rounded-md">
                        <Martini className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-left">{cocktail.name}</h3>
                        <p className="text-sm text-muted-foreground text-left">{cocktail.description}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pl-4 border-l-2 ml-6">
                    <div className="grid gap-6 mt-4">
                      <div className="grid gap-2">
                          <h4 className="font-semibold flex items-center"><ShoppingCart className="mr-2 h-4 w-4 text-primary"/>Ingredients</h4>
                          <ul className="list-disc pl-6 text-muted-foreground">
                            {cocktail.ingredients.map(ing => <li key={ing}>{ing}</li>)}
                          </ul>
                      </div>
                      <div className="grid gap-2">
                          <h4 className="font-semibold flex items-center"><ListOrdered className="mr-2 h-4 w-4 text-primary"/>Directions</h4>
                          <p className="text-muted-foreground">{cocktail.directions}</p>
                      </div>
                       <div className="grid md:grid-cols-2 gap-6">
                         <div className="grid gap-2">
                            <h4 className="font-semibold flex items-center"><GlassWater className="mr-2 h-4 w-4 text-primary"/>Glassware & Tools</h4>
                            <p className="text-muted-foreground"><strong>Glass:</strong> {cocktail.glassware}</p>
                            <p className="text-muted-foreground"><strong>Tools:</strong> {cocktail.tools.join(', ')}</p>
                         </div>
                         <div className="grid gap-2">
                            <h4 className="font-semibold flex items-center"><History className="mr-2 h-4 w-4 text-primary"/>History</h4>
                            <p className="text-sm text-muted-foreground">{cocktail.history}</p>
                         </div>
                       </div>
                       <div className="grid gap-2">
                            <h4 className="font-semibold flex items-center"><Sparkles className="mr-2 h-4 w-4 text-primary"/>Did you know?</h4>
                            <p className="text-sm text-muted-foreground">{cocktail.fact}</p>
                       </div>
                    </div>
                     <div className="mt-6 flex justify-end">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/recipe-book/${cocktail.slug}`}>
                            <BookPlus className="mr-2 h-4 w-4" />
                            Add to My Recipe Book
                          </Link>
                        </Button>
                      </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg text-center">
              <h3 className="text-xl font-semibold">No Matching Cocktails Found</h3>
              <p className="text-muted-foreground mt-2 max-w-md">
                {searchResults !== null 
                  ? "Our AI couldn't find a match for your search. Try rephrasing it or clear the search to see all recipes."
                  : "Try adjusting your filters to find more recipes."
                }
              </p>
              {searchResults !== null && (
                 <Button variant="ghost" onClick={() => { setSearchResults(null); setSearchQuery(''); }} className="mt-4">
                    Clear Search
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
