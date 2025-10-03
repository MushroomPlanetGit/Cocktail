
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2, Search, Camera, Bot, Martini } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { cocktails } from '@/lib/recipes';

interface Ingredient {
  id: number;
  name: string;
  level: number;
  size: string;
}

interface Suggestion {
    name: string;
    match: number;
    link: string;
}

const initialIngredients: Ingredient[] = [
  { id: 1, name: 'Vodka', level: 80, size: '750ml' },
  { id: 2, name: 'Gin', level: 50, size: '1L' },
  { id: 3, name: 'Triple Sec', level: 100, size: '750ml' },
  { id: 4, name: 'Lime Juice', level: 25, size: 'N/A' },
  { id: 5, name: 'Coffee Liqueur', level: 90, size: '750ml' },
];

export default function MyBarPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialIngredients);
  const [newIngredientName, setNewIngredientName] = useState('');
  const [newIngredientSize, setNewIngredientSize] = useState('750ml');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const addIngredient = () => {
    if (newIngredientName.trim() !== '') {
      const newIngredient: Ingredient = {
        id: Date.now(),
        name: newIngredientName.trim(),
        level: 100,
        size: newIngredientSize,
      };
      setIngredients([...ingredients, newIngredient]);
      setNewIngredientName('');
    }
  };

  const removeIngredient = (id: number) => {
    setIngredients(ingredients.filter(ingredient => ingredient.id !== id));
  };
  
  const updateIngredientLevel = (id: number, level: number[]) => {
     setIngredients(ingredients.map(ing => ing.id === id ? { ...ing, level: level[0] } : ing));
  }

  const findWhatICanMake = () => {
    const ownedIngredients = new Set(ingredients.map(i => i.name));
    const results: Suggestion[] = [];

    cocktails.forEach(recipe => {
        const owned = recipe.ingredients.filter(ing => ownedIngredients.has(ing.split(' ').slice(1).join(' ')));
        if(owned.length > 0) {
            results.push({
                name: recipe.name,
                match: Math.round((owned.length / recipe.ingredients.length) * 100),
                link: '/dashboard/content'
            });
        }
    });

    setSuggestions(results.sort((a,b) => b.match - a.match));
  }


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
                      <Select value={newIngredientSize} onValueChange={setNewIngredientSize}>
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
                      <Button onClick={addIngredient} className="shrink-0">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add
                      </Button>
                    </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              <h3 className="text-xl font-semibold">Your Inventory</h3>
              {ingredients.length > 0 ? (
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
                                    onValueChange={(value) => updateIngredientLevel(ingredient.id, value)}
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
                <div className="text-sm text-muted-foreground py-12 text-center border-2 border-dashed rounded-lg">You haven't added any ingredients yet.</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-col gap-6">
        <Button size="lg" onClick={findWhatICanMake} className="self-start">
          <Search className="mr-2 h-5 w-5" />
          What can I make with what I have?
        </Button>

        {suggestions.length > 0 && (
            <Card>
                <CardHeader>
                    <CardTitle>Cocktail Suggestions</CardTitle>
                    <CardDescription>Based on your inventory, here are a few things you can make.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    {suggestions.map(suggestion => (
                        <Link href={suggestion.link} key={suggestion.name}>
                            <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors">
                                <div className="flex items-center gap-4">
                                    <Martini className="h-6 w-6 text-muted-foreground" />
                                    <div>
                                        <p className="font-semibold">{suggestion.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            You have {suggestion.match}% of the ingredients.
                                        </p>
                                    </div>
                                </div>
                                <div className="text-sm font-semibold">{suggestion.match}%</div>
                            </div>
                        </Link>
                    ))}
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
