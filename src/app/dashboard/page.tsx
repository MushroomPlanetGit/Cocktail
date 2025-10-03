
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpenCheck, BrainCircuit, FlaskConical, Home, Users } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Home,
    title: "My Bar",
    description: "Manage your home inventory and get AI-powered suggestions for cocktails you can make right now.",
    href: "/dashboard/my-bar",
    cta: "Go to My Bar"
  },
  {
    icon: BookOpenCheck,
    title: "Master Recipes",
    description: "Browse and search a comprehensive list of classic and modern cocktail recipes.",
    href: "/dashboard/content",
    cta: "Browse Recipes"
  },
  {
    icon: FlaskConical,
    title: "Mixology Lab",
    description: "Test your knowledge with AI-generated quizzes, crossword puzzles, and flashcards.",
    href: "/dashboard/mixology-lab",
    cta: "Enter the Lab"
  },
    {
    icon: BrainCircuit,
    title: "AI Cocktail Generator",
    description: "Invent a brand new cocktail from scratch just by describing the flavors you want.",
    href: "/dashboard/ai-cocktail-generator",
    cta: "Create a Cocktail"
  },
  {
    icon: Users,
    title: "Bar Guests",
    description: "Connect with friends and share your favorite recipes and personal notes.",
    href: "/dashboard/bar-guests",
    cta: "Manage Guests"
  }
]

export default function DashboardHomePage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to The Cocktail Companion</h1>
        <p className="text-muted-foreground">
          Your personal AI-powered guide to the world of mixology.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="bg-muted p-3 rounded-md">
                    <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
            <CardContent>
               <Button asChild className="w-full">
                  <Link href={feature.href}>{feature.cta}</Link>
                </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
