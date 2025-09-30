'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Trash2, Search, X } from 'lucide-react';

const initialIngredients = [
  'Vodka',
  'Gin',
  'Triple Sec',
  'Lime Juice',
  'Simple Syrup',
  'Tonic Water',
  'Espresso',
  'Coffee Liqueur'
];

export default function MyBarPage() {
  const [ingredients, setIngredients] = useState<string[]>(initialIngredients);
  const [newIngredient, setNewIngredient] = useState('');

  const addIngredient = () => {
    if (newIngredient.trim() !== '' && !ingredients.includes(newIngredient.trim())) {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient('');
    }
  };

  const removeIngredient = (ingredientToRemove: string) => {
    setIngredients(ingredients.filter(ingredient => ingredient !== ingredientToRemove));
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
            <div className="grid gap-2">
              <label htmlFor="add-ingredient" className="text-sm font-medium">Add Ingredient</label>
              <div className="flex items-center gap-2">
                <Input
                  id="add-ingredient"
                  placeholder="e.g., Angostura Bitters"
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addIngredient()}
                />
                <Button onClick={addIngredient}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              <h3 className="text-base font-medium">Your Ingredients</h3>
              {ingredients.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {ingredients.map((ingredient) => (
                    <Badge key={ingredient} variant="secondary" className="text-sm pl-3 pr-1 py-1">
                      {ingredient}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 ml-1"
                        onClick={() => removeIngredient(ingredient)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">You haven't added any ingredients yet.</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-start">
        <Button size="lg">
          <Search className="mr-2 h-5 w-5" />
          What can I make with what I have?
        </Button>
      </div>
    </div>
  );
}
