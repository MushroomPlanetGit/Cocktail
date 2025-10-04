'use client';

import { useActionState, useFormStatus } from 'react-dom';
import { generateCocktailAction } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BrainCircuit, Loader2, ListOrdered, ShoppingCart, GlassWater } from 'lucide-react';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { GenerateCocktailOutput } from '@/ai/flows/generate-cocktail';
import { useUser } from '@/firebase';
import Link from 'next/link';

const initialState: {
    message: string | null,
    recipe: GenerateCocktailOutput | null,
    errors: { description?: string[] } | null
} = {
  message: null,
  recipe: null,
  errors: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
      Generate Recipe
    </Button>
  );
}

export default function AiCocktailGeneratorPage() {
  const [state, formAction] = useActionState(generateCocktailAction, initialState);
  const { toast } = useToast();
  const { user } = useUser();

  useEffect(() => {
    if (state.message && (state.errors || state.message.includes('error'))) {
      toast({
        title: 'Error',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast]);

  if (!user) {
    return (
        <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
                <CardTitle>Access Denied</CardTitle>
                <CardDescription>You must be signed in to use the AI Cocktail Generator.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/login">Sign In</Link>
                </Button>
            </CardContent>
        </Card>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
        <form action={formAction}>
            <Card>
                <CardHeader>
                <CardTitle>AI Cocktail Generator</CardTitle>
                <CardDescription>Describe the cocktail you're imagining, and our AI mixologist will invent a recipe for you.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="description-input">Describe your ideal cocktail</Label>
                    <Textarea
                    id="description-input"
                    name="description"
                    placeholder="e.g., 'A refreshing and floral gin drink for a summer afternoon' or 'A smoky and spicy mezcal cocktail to sip by the fire.'"
                    rows={4}
                    required
                    />
                    {state?.errors?.description && <p className="text-sm text-destructive">{state.errors.description}</p>}
                </div>
                </CardContent>
                <CardFooter>
                <SubmitButton />
                </CardFooter>
            </Card>
        </form>

        {state.recipe && (
             <Card className="mt-8">
                <CardHeader>
                    <CardTitle>{state.recipe.name}</CardTitle>
                    <CardDescription>Your AI-generated creation. Enjoy responsibly!</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <div className="grid gap-2">
                        <h4 className="font-semibold flex items-center"><ShoppingCart className="mr-2 h-4 w-4 text-primary"/>Ingredients</h4>
                        <ul className="list-disc pl-6 text-muted-foreground">
                            {state.recipe.ingredients.map(ing => <li key={ing}>{ing}</li>)}
                        </ul>
                    </div>
                     <div className="grid gap-2">
                        <h4 className="font-semibold flex items-center"><GlassWater className="mr-2 h-4 w-4 text-primary"/>Glassware</h4>
                        <p className="text-muted-foreground">{state.recipe.glassware}</p>
                    </div>
                    <div className="grid gap-2">
                        <h4 className="font-semibold flex items-center"><ListOrdered className="mr-2 h-4 w-4 text-primary"/>Directions</h4>
                        <p className="text-muted-foreground whitespace-pre-wrap">{state.recipe.directions}</p>
                    </div>
                </CardContent>
            </Card>
        )}
    </div>
  );
}
