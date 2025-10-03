
export interface Cocktail {
  id: number;
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

export const cocktails: Cocktail[] = [
  {
    id: 1,
    slug: "espresso-martini",
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
    slug: "classic-margarita",
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
    slug: "mojito",
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
  {
    id: 4,
    slug: "old-fashioned",
    name: "Old Fashioned",
    description: "The quintessential whiskey cocktail, timeless and strong.",
    baseSpirit: 'whiskey',
    style: 'classic',
    ingredients: [
        "2 oz Bourbon or Rye Whiskey",
        "1 Sugar Cube (or 1 tsp sugar)",
        "2-3 dashes Angostura Bitters",
        "Splash of water",
        "Orange peel for garnish"
    ],
    directions: "Place sugar cube in a rocks glass and saturate with bitters, add a splash of water, and muddle until dissolved. Fill the glass with one large ice cube, add whiskey, and gently stir. Express the oil of an orange peel over the glass, then drop it in.",
    tools: ["Muddler", "Bar spoon"],
    history: "The name originates from the 1880s at the Pendennis Club in Louisville, Kentucky. It's said to have been invented by a bartender in honor of Colonel James E. Pepper, a prominent bourbon distiller, who then brought it to the Waldorf-Astoria Hotel bar in New York City.",
    glassware: "Rocks Glass",
    fact: "The Old Fashioned is one of the six basic drinks listed in David A. Embury's classic 'The Fine Art of Mixing Drinks'."
  },
  {
    id: 5,
    slug: "daiquiri",
    name: "Daiquiri",
    description: "A simple and sublime blend of rum, lime, and sugar.",
    baseSpirit: 'rum',
    style: 'sour',
    ingredients: [
        "2 oz White Rum",
        "1 oz Fresh Lime Juice",
        "0.75 oz Simple Syrup"
    ],
    directions: "Pour all ingredients into a shaker with ice cubes. Shake well. Strain into a chilled coupe glass.",
    tools: ["Cocktail shaker", "Strainer", "Jigger"],
    history: "Invented around 1900 in the town of Daiquirí, Cuba, by an American mining engineer named Jennings Cox. It was a favorite of both Ernest Hemingway and President John F. Kennedy.",
    glassware: "Coupe Glass",
    fact: "The original Daiquiri wasn't strained but served over cracked ice, the same ice used to shake it."
  },
  {
    id: 6,
    slug: "gin-and-tonic",
    name: "Gin and Tonic",
    description: "A crisp and refreshing highball, perfect for any occasion.",
    baseSpirit: 'gin',
    style: 'classic',
    ingredients: [
        "2 oz Gin",
        "4-5 oz Tonic Water",
        "Lime wedge for garnish"
    ],
    directions: "Fill a highball glass with ice. Pour in the gin. Top with tonic water and stir gently. Garnish with a lime wedge.",
    tools: ["Bar spoon"],
    history: "The drink was introduced by the army of the British East India Company in India. The tonic water, containing quinine, was a prophylactic against malaria. The gin was added to make the bitter tonic more palatable.",
    glassware: "Highball Glass or Copa Glass",
    fact: "There are now more 'new Western' style gins on the market, with less juniper-forward flavors, than classic London Dry gins."
  },
  {
    id: 7,
    slug: "jungle-bird",
    name: "Jungle Bird",
    description: "A tropical rum cocktail with a bitter twist.",
    baseSpirit: 'rum',
    style: 'tropical',
    ingredients: [
        "1.5 oz Dark Rum",
        "0.75 oz Campari",
        "1.5 oz Pineapple Juice",
        "0.5 oz Lime Juice",
        "0.5 oz Simple Syrup"
    ],
    directions: "Shake all ingredients with ice. Strain into a rocks glass filled with fresh ice. Garnish with a pineapple wedge or fronds.",
    tools: ["Cocktail shaker", "Strainer", "Jigger"],
    history: "Created in the 1970s at the Aviary Bar in the Kuala Lumpur Hilton. It's unique among tropical drinks for its inclusion of the bitter Italian liqueur, Campari.",
    glassware: "Rocks Glass",
    fact: "The Jungle Bird is one of the few classic Tiki cocktails that does not use falernum or orgeat."
  }
];
