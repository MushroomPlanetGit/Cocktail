export interface Cocktail {
    id: string;
    userId: string;
    slug: string;
    name: string;
    description: string;
    baseSpirit: 'vodka' | 'gin' | 'rum' | 'tequila' | 'whiskey';
    style: 'classic' | 'modern' | 'tropical' | 'sour';
    ingredients: string[];
    directions: string;
    tools: string[];
    history: string;
    glassware: string;
    fact: string;
}

export interface RecipeNote {
  id: string;
  userId: string;
  recipeId: string;
  brands: string;
  notes: string;
  sharedWith: string[];
  photoUrl?: string;
  updatedAt: any;
}
