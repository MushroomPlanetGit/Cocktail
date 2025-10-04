'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { addCocktailAction } from './actions';
import { useActionState } from 'react';
import { useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/firebase';

const cocktailFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  slug: z.string().min(2, { message: 'Slug must be at least 2 characters.' }).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'Slug must be in kebab-case.'}),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  baseSpirit: z.enum(['vodka', 'gin', 'rum', 'tequila', 'whiskey']),
  style: z.enum(['classic', 'modern', 'tropical', 'sour']),
  ingredients: z.string().min(10, { message: 'Please list at least one ingredient.' }),
  directions: z.string().min(20, { message: 'Directions must be at least 20 characters.' }),
  tools: z.string().min(3, { message: 'Please list at least one tool.' }),
  history: z.string().min(20, { message: 'History must be at least 20 characters.' }),
  glassware: z.string().min(3, { message: 'Please specify the glassware.' }),
  fact: z.string().min(10, { message: 'Fun fact must be at least 10 characters.' }),
});

type CocktailFormValues = z.infer<typeof cocktailFormSchema>;

const initialState = {
  message: null,
  errors: null,
  success: false,
};

export default function AddCocktailPage() {
  const [state, formAction] = useActionState(addCocktailAction, initialState);
  const { toast } = useToast();
  const { user } = useUser();

  const form = useForm<CocktailFormValues>({
    resolver: zodResolver(cocktailFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      ingredients: '',
      directions: '',
      tools: '',
      history: '',
      glassware: '',
      fact: '',
    },
    // Pass form state errors to the form provider
    errors: state?.errors ? state.errors : undefined,
  });

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? 'Success!' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if(state.success) {
        form.reset();
      }
    }
  }, [state, toast, form]);

  if (!user || user.isAnonymous) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Access Denied</CardTitle>
                <CardDescription>You must be signed in to add new recipes.</CardDescription>
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
    <Card>
      <CardHeader>
        <CardTitle>Add a New Cocktail</CardTitle>
        <CardDescription>Expand the master recipe list with your own creation.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form action={formAction}>
          <CardContent className="grid gap-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cocktail Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Spicy Margarita" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., spicy-margarita" {...field} />
                    </FormControl>
                     <FormDescription>A unique, URL-friendly identifier.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="A fiery twist on the classic sour." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="baseSpirit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Spirit</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a base spirit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="tequila">Tequila</SelectItem>
                        <SelectItem value="gin">Gin</SelectItem>
                        <SelectItem value="rum">Rum</SelectItem>
                        <SelectItem value="vodka">Vodka</SelectItem>
                        <SelectItem value="whiskey">Whiskey</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="style"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Style</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a cocktail style" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sour">Sour</SelectItem>
                        <SelectItem value="classic">Classic</SelectItem>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="tropical">Tropical</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
              control={form.control}
              name="ingredients"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ingredients</FormLabel>
                  <FormControl>
                    <Textarea placeholder="2 oz Blanco Tequila&#10;1 oz Lime Juice&#10;0.5 oz Agave Nectar&#10;2 slices Jalapeño" {...field} />
                  </FormControl>
                  <FormDescription>Enter each ingredient on a new line.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="directions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Directions</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Muddle jalapeño in a shaker. Add other ingredients with ice and shake well..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid md:grid-cols-2 gap-6">
               <FormField
                control={form.control}
                name="tools"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tools</FormLabel>
                    <FormControl>
                      <Input placeholder="Cocktail shaker, Strainer, Jigger" {...field} />
                    </FormControl>
                    <FormDescription>Comma-separated list of tools.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="glassware"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Glassware</FormLabel>
                    <FormControl>
                      <Input placeholder="Rocks Glass" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
              <FormField
              control={form.control}
              name="history"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>History</FormLabel>
                  <FormControl>
                    <Textarea placeholder="The history or origin story of the cocktail." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="fact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fun Fact</FormLabel>
                  <FormControl>
                    <Textarea placeholder="An interesting tidbit about the cocktail or its ingredients." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="ghost" asChild>
                <Link href="/dashboard/content">Cancel</Link>
            </Button>
            <Button type="submit">Add Cocktail</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
