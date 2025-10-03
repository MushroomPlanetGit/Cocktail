
'use client';

import { useState, useMemo, useTransition, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FlaskConical, ChevronRight, CheckCircle, XCircle, Lightbulb, Puzzle, HelpCircle, Layers, Check, Repeat, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { generateQuizQuestionAction, generateWhatAmIPuzzleAction } from './actions';
import type { GenerateQuizQuestionOutput } from '@/ai/flows/generate-quiz-question';
import type { GenerateWhatAmIPuzzleOutput } from '@/ai/flows/generate-what-am-i-puzzle';
import { useToast } from '@/hooks/use-toast';
import { cocktails, type Cocktail } from '@/lib/recipes';


// Helper function to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const crosswordLayout = [
  [1, 0, 0, 0, 0, 0, 'X', 0, 0, 2],
  ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 0],
  [3, 0, 0, 'X', 4, 0, 0, 0, 'X', 0],
  ['X', 'X', 'X', 'X', 0, 'X', 'X', 'X', 'X', 'X'],
  [5, 0, 0, 0, 0, 'X', 6, 0, 0, 0],
  ['X', 'X', 'X', 'X', 'X', 'X', 0, 'X', 'X', 'X'],
  [7, 0, 0, 0, 0, 0, 0, 'X', 'X', 'X'],
  ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
  [8, 0, 0, 0, 0, 'X', 9, 0, 0, 0, 0, 0, 0],
  ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
];

const crosswordClues = {
    across: [
        { num: 1, clue: "Classic Cuban highball with mint and lime", row: 0, col: 0, length: 6 },
        { num: 4, clue: "Zesty citrus fruit in a Margarita", row: 2, col: 4, length: 4 },
        { num: 5, clue: "Spirit often distilled from grain or potatoes", row: 4, col: 0, length: 5 },
        { num: 6, clue: "Used to rim a Margarita glass", row: 4, col: 6, length: 4 },
        { num: 7, clue: "Spirit made from the blue agave plant", row: 6, col: 0, length: 7 },
        { num: 8, clue: "Sweetener used in many cocktails", row: 8, col: 0, length: 5 },
        { num: 9, clue: "Aromatic ingredient, essential for an Old Fashioned", row: 8, col: 6, length: 7 },
    ],
    down: [
        { num: 1, clue: "Base spirit of a classic Martini", row: 0, col: 0, length: 3},
        { num: 2, clue: "Base spirit of a Daiquiri", row: 0, col: 9, length: 3 },
        { num: 3, clue: "Botanical spirit from London", row: 2, col: 0, length: 3 },
    ]
};


export default function MixologyLabPage() {
  const [category, setCategory] = useState('random');
  const [difficulty, setDifficulty] = useState('medium');
  const [quizStarted, setQuizStarted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [question, setQuestion] = useState<GenerateQuizQuestionOutput | null>(null);
  const { toast } = useToast();

  // "What Am I?" state
  const [puzzle, setPuzzle] = useState<GenerateWhatAmIPuzzleOutput | null>(null);
  const [isPuzzleLoading, setIsPuzzleLoading] = useState(true);
  const [guess, setGuess] = useState('');
  const [showPuzzleResult, setShowPuzzleResult] = useState(false);
  const [isGuessCorrect, setIsGuessCorrect] = useState(false);
  
  // Flashcard state
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const currentFlashcard: Cocktail = useMemo(() => cocktails[flashcardIndex], [flashcardIndex]);
  
  const [grid, setGrid] = useState<string[][]>(Array(10).fill(null).map(() => Array(13).fill('')));

  const handleInputChange = (row: number, col: number, value: string) => {
    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = value.toUpperCase();
    setGrid(newGrid);

    if (value && col < 12) {
      const nextInput = document.querySelector(`input[data-row="${row}"][data-col="${col + 1}"]`) as HTMLInputElement;
      if (nextInput && crosswordLayout[row][col+1] !== 'X') {
        nextInput.focus();
      }
    }
  };


  // Memoize the shuffled answers so they don't re-shuffle on every render
  const shuffledAnswers = useMemo(() => {
    if (question) {
      return shuffleArray(question.answers);
    }
    return [];
  }, [question]);

  const fetchPuzzle = () => {
    setIsPuzzleLoading(true);
    setGuess('');
    setShowPuzzleResult(false);
    startTransition(() => {
      generateWhatAmIPuzzleAction().then(result => {
        if (result.error || !result.puzzle) {
          toast({
            title: 'Error Generating Puzzle',
            description: result.error || 'Could not fetch a new puzzle.',
            variant: 'destructive',
          });
        } else {
          setPuzzle(result.puzzle);
        }
        setIsPuzzleLoading(false);
      });
    })
  };

  useEffect(() => {
    fetchPuzzle();
  }, []);

  const handleGuessSubmit = () => {
    if (!puzzle || !guess) return;
    const isCorrect = guess.trim().toLowerCase() === puzzle.answer.toLowerCase();
    setIsGuessCorrect(isCorrect);
    setShowPuzzleResult(true);
  };


  const startQuiz = () => {
    setQuizStarted(true);
    setQuestion(null);
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
  
  const nextFlashcard = () => {
    setIsFlipped(false);
    setFlashcardIndex((prevIndex) => (prevIndex + 1) % cocktails.length);
  }


  if (quizStarted) {
    if (isPending || !question) {
      return (
        <Card className="max-w-2xl mx-auto flex flex-col items-center justify-center p-8 min-h-[400px]">
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
                <div className="grid grid-cols-13 gap-px bg-foreground max-w-md aspect-square border">
                  {crosswordLayout.map((row, rowIndex) => (
                    row.map((cell, colIndex) => {
                      if (cell === 'X') {
                        return <div key={`${rowIndex}-${colIndex}`} className="bg-foreground" />;
                      }
                      
                      const clueNumber = [...crosswordClues.across, ...crosswordClues.down].find(c => c.row === rowIndex && c.col === colIndex)?.num;

                      return (
                        <div key={`${rowIndex}-${colIndex}`} className="bg-background relative">
                          {clueNumber && <span className="absolute top-0 left-0.5 text-[10px] text-muted-foreground">{clueNumber}</span>}
                           <Input
                            type="text"
                            maxLength={1}
                            data-row={rowIndex}
                            data-col={colIndex}
                            value={grid[rowIndex]?.[colIndex] || ''}
                            onChange={(e) => handleInputChange(rowIndex, colIndex, e.target.value)}
                            className="w-full h-full text-center text-lg p-0 border-0 focus-visible:ring-1 ring-primary uppercase"
                          />
                        </div>
                      );
                    })
                  )).flat()}
                </div>
              </div>
              <div className="w-full lg:w-80">
                <div className="mb-6">
                  <h4 className="font-semibold text-primary mb-2">Across</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                     {crosswordClues.across.map(c => <li key={`across-${c.num}`}><span className="font-semibold">{c.num}.</span> {c.clue}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-primary mb-2">Down</h4>
                   <ul className="space-y-2 text-sm text-muted-foreground">
                    {crosswordClues.down.map(c => <li key={`down-${c.num}`}><span className="font-semibold">{c.num}.</span> {c.clue}</li>)}
                  </ul>
                </div>
                <Button className="w-full mt-6">Check Puzzle</Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="what-am-i" className="pt-6">
             <div className="max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-center mb-4">I am a cocktail...</h3>
                {isPuzzleLoading || isPending ? (
                  <div className="flex items-center justify-center min-h-[200px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : puzzle && (
                  <Card>
                    <CardContent className="p-6">
                      <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                        {puzzle.clues.map((clue, index) => <li key={index}>{clue}</li>)}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                <div className="mt-6 flex gap-2">
                  <Input 
                    placeholder="Type your guess here..." 
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGuessSubmit()}
                    disabled={showPuzzleResult}
                  />
                  <Button onClick={handleGuessSubmit} disabled={showPuzzleResult || !guess}>Submit Guess</Button>
                </div>

                {showPuzzleResult && (
                  <div className={cn(
                    "mt-4 p-4 rounded-md text-center",
                    isGuessCorrect ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                  )}>
                    {isGuessCorrect ? (
                      <p className="font-semibold flex items-center justify-center"><CheckCircle className="mr-2" /> Correct! It's a {puzzle?.answer}.</p>
                    ) : (
                      <p className="font-semibold flex items-center justify-center"><XCircle className="mr-2" /> Not quite. The correct answer was {puzzle?.answer}.</p>
                    )}
                    <Button variant="link" onClick={fetchPuzzle} className="mt-2">Play Again</Button>
                  </div>
                )}
             </div>
          </TabsContent>
           <TabsContent value="flashcards" className="pt-6">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-center mb-4">Flashcards</h3>
                <Card className="aspect-video flex items-center justify-center p-6 text-center relative cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                  <div className={cn("transition-transform duration-500 w-full", {"[transform:rotateY(180deg)]": isFlipped})}>
                    {!isFlipped ? (
                      <CardTitle>{currentFlashcard.name}</CardTitle>
                    ) : (
                      <div className="text-muted-foreground [transform:rotateY(180deg)]">
                        <p className='font-semibold'>Ingredients:</p>
                        <ul className='list-disc pl-5 mb-2 text-sm text-left'>
                            {currentFlashcard.ingredients.map(ing => <li key={ing}>{ing}</li>)}
                        </ul>
                         <p className='font-semibold'>Directions:</p>
                         <p className='text-sm text-left'>{currentFlashcard.directions}</p>
                      </div>
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
                    <Button onClick={nextFlashcard}>
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
