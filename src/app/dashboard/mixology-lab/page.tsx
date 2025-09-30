'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FlaskConical, ChevronRight } from 'lucide-react';

export default function MixologyLabPage() {
  const [spirit, setSpirit] = useState('random');
  const [difficulty, setDifficulty] = useState('medium');

  const startQuiz = () => {
    // Logic to start the quiz will go here
    console.log(`Starting a ${difficulty} quiz on ${spirit}.`);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-md">
                <FlaskConical className="h-6 w-6 text-primary" />
            </div>
            <div>
                <CardTitle>The Mixology Lab</CardTitle>
                <CardDescription>Test your cocktail knowledge with our quizzes.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid md:grid-cols-2 gap-6">
            <div className="grid gap-2">
                <Label htmlFor="spirit-select">Choose a Category</Label>
                <Select value={spirit} onValueChange={setSpirit}>
                <SelectTrigger id="spirit-select">
                    <SelectValue placeholder="Select a base spirit" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="random">Random</SelectItem>
                    <SelectItem value="vodka">Vodka</SelectItem>
                    <SelectItem value="gin">Gin</SelectItem>
                    <SelectItem value="rum">Rum</SelectItem>
                    <SelectItem value="tequila">Tequila</SelectItem>
                    <SelectItem value="whiskey">Whiskey</SelectItem>
                     <SelectItem value="history">Cocktail History</SelectItem>
                </SelectContent>
                </Select>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="difficulty-select">Choose a Difficulty</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger id="difficulty-select">
                    <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
                </Select>
            </div>
        </div>
        <div className="flex justify-end">
            <Button onClick={startQuiz}>
                Start Quiz
                <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
