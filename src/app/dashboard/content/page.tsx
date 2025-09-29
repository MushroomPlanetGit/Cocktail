
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, Martini } from "lucide-react";

const cocktails = [
  { id: 1, name: "Espresso Martini", description: "A bold and energizing coffee-flavored cocktail." },
  { id: 2, name: "Classic Margarita", description: "A refreshing tequila-based cocktail with a citrus kick." },
  { id: 3, name: "Mojito", description: "A classic Cuban highball with mint and lime." },
];

export default function ContentPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Cocktail Recipes
          </h1>
          <p className="text-muted-foreground">
            Manage the delicious cocktails featured in your app.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Cocktail
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Cocktails</CardTitle>
          <CardDescription>A list of all the recipes you've added.</CardDescription>
        </CardHeader>
        <CardContent>
          {cocktails.length > 0 ? (
            <div className="divide-y divide-border">
              {cocktails.map((cocktail) => (
                <div key={cocktail.id} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-muted p-3 rounded-md">
                      <Martini className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{cocktail.name}</h3>
                      <p className="text-sm text-muted-foreground">{cocktail.description}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              ))}
            </div>
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
