
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, Martini, BookPlus, BookOpenCheck, History, GlassWater, Sparkles, ShoppingCart, ListOrdered, Search } from "lucide-react";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";


const cocktails = [
  { 
    id: 1, 
    name: "Espresso Martini", 
    description: "A bold and energizing coffee-flavored cocktail.",
    ingredients: ["2 oz Vodka", "1 oz Coffee Liqueur", "1 oz Freshly Brewed Espresso", "Coffee beans for garnish"],
    directions: "Pour all ingredients into a shaker with ice. Shake well until chilled. Strain into a chilled cocktail glass. Garnish with three coffee beans.",
    tools: ["Cocktail shaker", "Strainer", "Jigger"],
    history: "Created in the 1980s by British bartender Dick Bradsell at Fred's Club in London. A now-famous model allegedly asked for a drink that would 'wake me up, and then f*ck me up.'",
    glassware: "Cocktail Glass (Martini Glass)",
    fact: "The three coffee beans on top are said to represent health, wealth, and happiness."
  },
  { 
    id: 2, 
    name: "Classic Margarita", 
    description: "A refreshing tequila-based cocktail with a citrus kick.",
    ingredients: ["2 oz Blanco Tequila", "1 oz Lime Juice", "1 oz Triple Sec (or Cointreau)", "Salt for the rim", "Lime wedge for garnish"],
    directions: "Rim a chilled glass with salt. Add tequila, lime juice, and triple sec to a shaker with ice. Shake well. Strain into the prepared glass filled with fresh ice. Garnish with a lime wedge.",
    tools: ["Cocktail shaker", "Strainer", "Jigger"],
    history: "The Margarita's origins are debated, with several claims from the 1930s and 1940s. One popular story attributes it to Carlos 'Danny' Herrera, who supposedly created it for a customer allergic to most spirits but not tequila.",
    glassware: "Margarita Glass or Rocks Glass",
    fact: "December 13th is National Margarita Day in the United States."
  },
  { 
    id: 3, 
    name: "Mojito", 
    description: "A classic Cuban highball with mint and lime.",
    ingredients: ["2 oz White Rum", "1 oz Fresh Lime Juice", "2 tsp Sugar", "6-8 Mint Leaves", "Soda Water"],
    directions: "Muddle mint leaves and sugar in a glass. Add lime juice and rum. Fill the glass with crushed ice. Top with soda water. Garnish with a mint sprig.",
    tools: ["Muddler", "Jigger", "Bar spoon"],
    history: "The Mojito's origins trace back to 16th-century Cuba and a drink called 'El Draque'. It was famously a favorite of author Ernest Hemingway.",
    glassware: "Highball Glass",
    fact: "The name 'Mojito' comes from the African word 'mojo,' which means 'to cast a little spell.'"
  },
];

export default function ContentPage() {
    const [spirit, setSpirit] = useState('all');
    const [style, setStyle] = useState('all');

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
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Cocktail
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cocktail Index</CardTitle>
          <CardDescription>Browse recipes, or filter by spirit and style to find your next favorite drink.</CardDescription>
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
            </div>
        </CardHeader>
        <CardContent>
          {cocktails.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {cocktails.map((cocktail) => (
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
                          <Link href="/dashboard/recipe-book">
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
              <h3 className="text-xl font-semibold">No cocktails yet</h3>
              <p className="text-muted-foreground mt-2">
                Click "Add Cocktail" to create your first recipe.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    