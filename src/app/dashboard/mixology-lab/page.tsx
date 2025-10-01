
'use client';

import { useState, useMemo, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FlaskConical, ChevronRight, CheckCircle, XCircle, Lightbulb, Puzzle, HelpCircle, Layers, Check, Repeat, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { generateQuizQuestionAction } from './actions';
import type { GenerateQuizQuestionOutput } from '@/ai/flows/generate-quiz-question';
import { useToast } from '@/hooks/use-toast';


const flashcard = {
  id: 'fc1',
  term: 'Old Fashioned',
  definition: '2 oz Bourbon or Rye Whiskey, 1 Sugar Cube, 2 dashes Angostura Bitters, Orange Peel for garnish.'
};

// Helper function to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}


export default function MixologyLabPage() {
  const [category, setCategory] = useState('random');
  const [difficulty, setDifficulty] = useState('medium');
  const [quizStarted, setQuizStarted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [question, setQuestion] = useState<GenerateQuizQuestionOutput | null>(null);
  const { toast } = useToast();


  // Memoize the shuffled answers so they don't re-shuffle on every render
  const shuffledAnswers = useMemo(() => {
    if (question) {
      return shuffleArray(question.answers);
    }
    return [];
  }, [question]);


  const startQuiz = () => {
    startTransition(async () => {
      const result = await generateQuizQuestionAction({ category, difficulty });
      if (result.error) {
        toast({
          title: 'Error Generating Question',
          description: result.error,
          variant: 'destructive',
        });
        setQuizStarted(false);
      } else {
        setQuestion(result.question);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setShowFeedback(false);
        setQuizStarted(true);
      }
    });
  };

  const handleAnswerSelect = (answerText: string) => {
    if (showFeedback) return; // Don't allow changing answer after submission
    setSelectedAnswer(answerText);
    const answer = shuffledAnswers.find(a => a.text === answerText);
    setIsCorrect(answer?.correct ?? false);
  };

  const checkAnswer = () => {
    if (selectedAnswer !== null) {
      setShowFeedback(true);
      if(!isCorrect) {
          // Here is where we would add logic to track the incorrectly answered question
          console.log(`Question "${question?.question}" answered incorrectly. Add to review queue.`);
      }
    }
  }

  const nextQuestion = () => {
    // For now, this just gets another question with the same settings
    startQuiz();
  }

  if (quizStarted) {
    if (!question) {
      return (
        <Card className="max-w-2xl mx-auto flex flex-col items-center justify-center p-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <CardTitle className="mt-4">Generating Question</CardTitle>
            <CardDescription>Our AI is crafting the perfect challenge for you...</CardDescription>
        </Card>
      )
    }
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>The Mixology Lab</CardTitle>
          <CardDescription>Question 1 of 10</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <p className="text-lg font-semibold">{question.question}</p>
          <div className="grid gap-3">
            {shuffledAnswers.map((answer) => {
              const isSelected = selectedAnswer === answer.text;
              let buttonVariant: "outline" | "default" | "secondary" | "destructive" = "outline";
              if (showFeedback) {
                  if (answer.correct) buttonVariant = "default";
                  else if (isSelected) buttonVariant = "destructive";
              } else if (isSelected) {
                  buttonVariant = "secondary";
              }

              return (
                <Button
                  key={answer.text}
                  variant={buttonVariant}
                  className={cn("justify-start h-auto py-3 text-wrap", {
                      "border-primary": isSelected && !showFeedback,
                      "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-500 hover:bg-green-100": showFeedback && answer.correct,
                      "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-500 hover:bg-red-100": showFeedback && !answer.correct && isSelected,
                  })}
                  onClick={() => handleAnswerSelect(answer.text)}
                  disabled={showFeedback}
                >
                  {showFeedback && (
                      answer.correct ? <CheckCircle className="mr-2 text-green-600" /> :
                      isSelected ? <XCircle className="mr-2 text-red-600" /> : 
                      <span className='mr-2 w-4 h-4'></span>
                  )}
                  {answer.text}
                </Button>
              );
            })}
          </div>
            {showFeedback && (
            <>
              <Separator />
              <div className="p-4 rounded-md bg-muted/50">
                <h4 className="font-semibold flex items-center mb-2">
                  <Lightbulb className="mr-2 h-5 w-5 text-primary" />
                  Did you know?
                </h4>
                <p className="text-sm text-muted-foreground">{question.explanation}</p>
              </div>
            </>
          )}

        </CardContent>
        <CardFooter className="flex justify-end">
            {showFeedback ? (
                 <Button onClick={nextQuestion} disabled={isPending}>
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Next Question"}
                    {!isPending && <ChevronRight className="ml-2 h-4 w-4" />}
                </Button>
            ) : (
                <Button onClick={checkAnswer} disabled={!selectedAnswer}>
                    Submit Answer
                </Button>
            )}
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-md">
            <FlaskConical className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>The Mixology Lab</CardTitle>
            <CardDescription>Test your cocktail knowledge with quizzes and puzzles.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="quizzes">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="quizzes">
              <Lightbulb className="mr-2 h-4 w-4" />
              Quizzes
            </TabsTrigger>
            <TabsTrigger value="crosswords">
              <Puzzle className="mr-2 h-4 w-4" />
              Crossword Puzzles
            </TabsTrigger>
             <TabsTrigger value="what-am-i">
              <HelpCircle className="mr-2 h-4 w-4" />
              What Am I?
            </TabsTrigger>
            <TabsTrigger value="flashcards">
              <Layers className="mr-2 h-4 w-4" />
              Flashcards
            </TabsTrigger>
          </TabsList>
          <TabsContent value="quizzes" className="pt-6">
             <div className="grid md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="category-select">Choose a Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category-select">
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
                    <SelectItem value="glassware">Proper Glassware</SelectItem>
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
            <div className="flex justify-end mt-6">
              <Button onClick={startQuiz} disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Start Quiz"}
                {!isPending && <ChevronRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="crosswords" className="pt-6">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-4">Cocktail Crossword #1</h3>
                <div className="grid grid-cols-10 grid-rows-10 gap-px bg-foreground max-w-sm aspect-square border">
                  {/* Placeholder for crossword grid cells */}
                  {Array.from({ length: 100 }).map((_, i) => (
                    <div key={i} className="bg-background flex items-center justify-center">
                      <span className="text-xs"></span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full lg:w-80">
                <div className="mb-6">
                  <h4 className="font-semibold text-primary mb-2">Across</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>1. A classic Cuban highball</li>
                    <li>5. Spirit made from agave</li>
                    <li>7. Zesty citrus fruit in a Margarita</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-primary mb-2">Down</h4>
                   <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>2. Bitter Italian liqueur in a Negroni</li>
                    <li>3. The "wake me up" ingredient in an Espresso Martini</li>
                    <li>4. A popular whiskey-based cocktail</li>
                  </ul>
                </div>
                <Button className="w-full mt-6">Check Puzzle</Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="what-am-i" className="pt-6">
             <div className="max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-center mb-4">I am a cocktail...</h3>
                <Card>
                  <CardContent className="p-6">
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                      <li>My main ingredients are rum, mint, and lime.</li>
                      <li>I am a classic Cuban highball.</li>
                      <li>I was a favorite of author Ernest Hemingway.</li>
                    </ul>
                  </CardContent>
                </Card>
                <div className="mt-6 flex gap-2">
                  <Input placeholder="Type your guess here..." />
                  <Button>Submit Guess</Button>
                </div>
             </div>
          </TabsContent>
           <TabsContent value="flashcards" className="pt-6">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-center mb-4">Flashcards</h3>
                <Card className="aspect-video flex items-center justify-center p-6 text-center relative cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                  <div className={cn("transition-transform duration-500", {"[transform:rotateY(180deg)]": isFlipped})}>
                    {!isFlipped ? (
                      <CardTitle>{flashcard.term}</CardTitle>
                    ) : (
                      <p className="text-muted-foreground [transform:rotateY(180deg)]">{flashcard.definition}</p>
                    )}
                  </div>
                </Card>
                <div className="mt-4 flex justify-center">
                  <Button variant="ghost" onClick={() => setIsFlipped(!isFlipped)}>
                    <Repeat className="mr-2 h-4 w-4" />
                    Flip Card
                  </Button>
                </div>
                 <Separator className="my-6" />
                 <div className="flex justify-between">
                    <Button variant="outline">
                        Mark as Learned
                        <Check className="ml-2 h-4 w-4" />
                    </Button>
                    <Button>
                        Next Card
                        <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
