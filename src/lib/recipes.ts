
export interface Cocktail {
  id: number;
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

export const cocktails: Cocktail[] = [
  {
    id: 1,
    name: "Espresso Martini",
    description: "A bold and energizing coffee-flavored cocktail.",
    baseSpirit: 'vodka',
    style: 'modern',
    ingredients: [
      "2 oz Vodka",
      "1 oz Coffee Liqueur",
      "1 oz Freshly Brewed Espresso",
      "Coffee beans for garnish",
    ],
    directions:
      "Pour all ingredients into a shaker with ice. Shake well until chilled. Strain into a chilled cocktail glass. Garnish with three coffee beans.",
    tools: ["Cocktail shaker", "Strainer", "Jigger"],
    history:
      "Created in the 1980s by British bartender Dick Bradsell at Fred's Club in London. A now-famous model allegedly asked for a drink that would 'wake me up, and then f*ck me up.'",
    glassware: "Cocktail Glass (Martini Glass)",
    fact:
      "The three coffee beans on top are said to represent health, wealth, and happiness.",
  },
  {
    id: 2,
    name: "Classic Margarita",
    description: "A refreshing tequila-based cocktail with a citrus kick.",
    baseSpirit: 'tequila',
    style: 'sour',
    ingredients: [
      "2 oz Blanco Tequila",
      "1 oz Lime Juice",
      "1 oz Triple Sec (or Cointreau)",
      "Salt for the rim",
      "Lime wedge for garnish",
    ],
    directions:
      "Rim a chilled glass with salt. Add tequila, lime juice, and triple sec to a shaker with ice. Shake well. Strain into the prepared glass filled with fresh ice. Garnish with a lime wedge.",
    tools: ["Cocktail shaker", "Strainer", "Jigger"],
    history:
      "The Margarita's origins are debated, with several claims from the 1930s and 1940s. One popular story attributes it to Carlos 'Danny' Herrera, who supposedly created it for a customer allergic to most spirits but not tequila.",
    glassware: "Margarita Glass or Rocks Glass",
    fact: "February 22nd is National Margarita Day in the United States.",
  },
  {
    id: 3,
    name: "Mojito",
    description: "A classic Cuban highball with mint and lime.",
    baseSpirit: 'rum',
    style: 'classic',
    ingredients: [
      "2 oz White Rum",
      "1 oz Fresh Lime Juice",
      "2 tsp Sugar",
      "6-8 Mint Leaves",
      "Soda Water",
    ],
    directions:
      "Muddle mint leaves and sugar in a glass. Add lime juice and rum. Fill the glass with crushed ice. Top with soda water. Garnish with a mint sprig.",
    tools: ["Muddler", "Jigger", "Bar spoon"],
    history:
      "The Mojito's origins trace back to 16th-century Cuba and a drink called 'El Draque'. It was famously a favorite of author Ernest Hemingway.",
    glassware: "Highball Glass",
    fact:
      "The name 'Mojito' comes from the African word 'mojo,' which means 'to cast a little spell.'",
  },
];
