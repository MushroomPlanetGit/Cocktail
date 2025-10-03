
'use client';

import { useState, useMemo, useTransition, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FlaskConical, ChevronRight, CheckCircle, XCircle, Lightbulb, Puzzle, HelpCircle, Layers, Check, Repeat, Loader2, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { generateQuizQuestionAction, generateWhatAmIPuzzleAction, generateCrosswordAction } from './actions';
import type { GenerateQuizQuestionOutput } from '@/ai/flows/generate-quiz-question';
import type { GenerateWhatAmIPuzzleOutput } from '@/ai/flows/generate-what-am-i-puzzle';
import type { CrosswordClues, GenerateCrosswordOutput } from '@/ai/flows/generate-crossword';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, doc, increment, writeBatch } from 'firebase/firestore';
import type { Cocktail } from '@/types/cocktail';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { UserLearning } from '@/types/learning';


// Helper function to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function MixologyLabPage() {
  const [category, setCategory] = useState('random');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
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

  // Crossword state
  const [crossword, setCrossword] = useState<GenerateCrosswordOutput | null>(null);
  const [crosswordGrid, setCrosswordGrid] = useState<string[][]>([]);
  const [incorrectCells, setIncorrectCells] = useState<[number, number][]>([]);
  const [isCrosswordLoading, setIsCrosswordLoading] = useState(true);
  const [crosswordCategory, setCrosswordCategory] = useState('random');
  const [crosswordDifficulty, setCrosswordDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const { user } = useUser();
  const firestore = useFirestore();

  const cocktailsCollectionRef = useMemoFirebase(() => {
    if (firestore) {
      return collection(firestore, 'cocktails');
    }
    return null;
  }, [firestore]);
  const { data: cocktails, isLoading: isLoadingCocktails } = useCollection<Cocktail>(cocktailsCollectionRef);

  const learningProgressRef = useMemoFirebase(() => {
    if (user && firestore) {
      return doc(firestore, 'users', user.uid, 'learning', 'progress');
    }
    return null;
  }, [user, firestore]);
  const { data: learningProgress } = useDoc<UserLearning>(learningProgressRef);

  const currentFlashcard: Cocktail | undefined = useMemo(() => cocktails?.[flashcardIndex], [cocktails, flashcardIndex]);

  const fetchCrossword = () => {
    setIsCrosswordLoading(true);
    setIncorrectCells([]);
    startTransition(() => {
        generateCrosswordAction({ category: crosswordCategory, difficulty: crosswordDifficulty }).then(result => {
            if (result.error || !result.crossword) {
                toast({
                    title: 'Error Generating Crossword',
                    description: result.error || 'Could not fetch a new puzzle.',
                    variant: 'destructive',
                });
            } else {
                setCrossword(result.crossword);
                setCrosswordGrid(Array(result.crossword.rows).fill(null).map(() => Array(result.crossword.cols).fill('')));
            }
            setIsCrosswordLoading(false);
        });
    });
  };
  
  useEffect(() => {
    fetchCrossword();
  }, []);

  const handleCrosswordInputChange = (row: number, col: number, value: string) => {
    const newGrid = crosswordGrid.map(r => [...r]);
    newGrid[row][col] = value.toUpperCase();
    setCrosswordGrid(newGrid);
    setIncorrectCells(cells => cells.filter(([r,c]) => r !== row || c !== col));

    if (value && col < (crossword?.cols ?? 10) - 1) {
      const nextInput = document.querySelector(`input[data-row="${row}"][data-col="${col + 1}"]`) as HTMLInputElement;
      if (nextInput && crossword?.layout[row][col+1] !== 'X') {
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
    if (!puzzle || !guess || !user || !learningProgressRef) return;
    const isCorrect = guess.trim().toLowerCase() === puzzle.answer.toLowerCase();
    setIsGuessCorrect(isCorrect);
    setShowPuzzleResult(true);

    if (isCorrect) {
      const currentPuzzlesSolved = learningProgress?.puzzlesSolved || 0;
      setDocumentNonBlocking(learningProgressRef, { 
        puzzlesSolved: currentPuzzlesSolved + 1,
        userId: user.uid,
       }, { merge: true });
    }
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
    if (selectedAnswer !== null && user && learningProgressRef) {
      setShowFeedback(true);
      const currentTotal = learningProgress?.totalQuizzesTaken || 0;
      const currentCorrect = learningProgress?.correctQuizAnswers || 0;

      const dataToUpdate: Partial<UserLearning> & { userId: string } = {
        totalQuizzesTaken: currentTotal + 1,
        userId: user.uid,
      };
      if(isCorrect) {
        dataToUpdate.correctQuizAnswers = currentCorrect + 1;
      }
      setDocumentNonBlocking(learningProgressRef, dataToUpdate, { merge: true });
    }
  }

  const nextQuestion = () => {
    // For now, this just gets another question with the same settings
    startQuiz();
  }
  
  const nextFlashcard = () => {
    setIsFlipped(false);
    if (cocktails) {
        setFlashcardIndex((prevIndex) => (prevIndex + 1) % cocktails.length);
    }
  }

  const checkCrossword = () => {
      if (!crossword) return;
      const incorrect: [number, number][] = [];
      let isPerfect = true;
      for (let i = 0; i < crossword.rows; i++) {
          for (let j = 0; j < crossword.cols; j++) {
              if (crossword.layout[i][j] !== 'X' && crosswordGrid[i][j] !== crossword.layout[i][j]) {
                  isPerfect = false;
                  incorrect.push([i,j]);
              }
          }
      }
      
      setIncorrectCells(incorrect);

      toast({
          title: isPerfect ? 'Congratulations!' : 'Not Quite!',
          description: isPerfect ? 'You solved the puzzle!' : 'Some answers are incorrect. Check the highlighted cells!',
          variant: isPerfect ? 'default' : 'destructive'
      });
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
                <Select value={difficulty} onValueChange={(value) => setDifficulty(value as 'easy' | 'medium' | 'hard')}>
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
              <Button onClick={startQuiz} disabled={isPending || !user}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Start Quiz"}
                {!isPending && <ChevronRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="crosswords" className="pt-6">
            {isCrosswordLoading ? (
                 <div className="flex flex-col items-center justify-center p-8 min-h-[400px]">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <CardTitle className="mt-4">Generating Crossword</CardTitle>
                    <CardDescription>Our AI is building a new puzzle for you...</CardDescription>
                </div>
            ) : crossword && (
                <div className="flex flex-col gap-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="crossword-category-select">Choose a Category</Label>
                      <Select value={crosswordCategory} onValueChange={setCrosswordCategory}>
                        <SelectTrigger id="crossword-category-select">
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
                      <Label htmlFor="crossword-difficulty-select">Choose a Difficulty</Label>
                      <Select value={crosswordDifficulty} onValueChange={(value) => setCrosswordDifficulty(value as 'easy' | 'medium' | 'hard')}>
                        <SelectTrigger id="crossword-difficulty-select">
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
                  <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">AI-Generated Crossword</h3>
                          <Button variant="outline" size="sm" onClick={fetchCrossword} disabled={isCrosswordLoading || isPending}>
                              <Repeat className="mr-2 h-4 w-4" />
                              New Puzzle
                          </Button>
                      </div>
                      <div 
                          className="grid gap-px bg-foreground max-w-md aspect-square border"
                          style={{ gridTemplateColumns: `repeat(${crossword.cols}, minmax(0, 1fr))` }}
                      >
                        {crossword.layout.map((row, rowIndex) => (
                          row.map((cell, colIndex) => {
                            if (cell === 'X') {
                              return <div key={`${rowIndex}-${colIndex}`} className="bg-foreground" />;
                            }
                            
                            const allClues: CrosswordClues[] = [...crossword.clues.across, ...crossword.clues.down];
                            const clueNumber = allClues.find(c => c.row === rowIndex && c.col === colIndex)?.num;
                            const isIncorrect = incorrectCells.some(([r,c]) => r === rowIndex && c === colIndex);

                            return (
                              <div key={`${rowIndex}-${colIndex}`} className="bg-background relative">
                                {clueNumber && <span className="absolute top-0 left-0.5 text-[10px] text-muted-foreground">{clueNumber}</span>}
                                <Input
                                  type="text"
                                  maxLength={1}
                                  data-row={rowIndex}
                                  data-col={colIndex}
                                  value={crosswordGrid[rowIndex]?.[colIndex] || ''}
                                  onChange={(e) => handleCrosswordInputChange(rowIndex, colIndex, e.target.value)}
                                  className={cn(
                                    "w-full h-full text-center text-lg p-0 border-0 focus-visible:ring-1 ring-primary uppercase transition-colors",
                                    isIncorrect && "bg-red-200 dark:bg-red-800/50"
                                  )}
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
                          {crossword.clues.across.map(c => <li key={`across-${c.num}`}><span className="font-semibold">{c.num}.</span> {c.clue}</li>)}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-primary mb-2">Down</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {crossword.clues.down.map(c => <li key={`down-${c.num}`}><span className="font-semibold">{c.num}.</span> {c.clue}</li>)}
                        </ul>
                      </div>
                      <Button className="w-full mt-6" onClick={checkCrossword}>Check Puzzle</Button>
                    </div>
                  </div>
                </div>
            )}
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
                    disabled={showPuzzleResult || !user}
                  />
                  <Button onClick={handleGuessSubmit} disabled={showPuzzleResult || !guess || !user}>Submit Guess</Button>
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
                {isLoadingCocktails ? (
                   <div className="flex items-center justify-center min-h-[250px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : !currentFlashcard ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-lg min-h-[250px]">
                    <h3 className="text-lg font-semibold">No Recipes Found</h3>
                    <p className="text-muted-foreground mt-2">
                      Add some cocktails to the Master Recipe list to create flashcards.
                    </p>
                  </div>
                ) : (
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
                )}
                <div className="mt-4 flex justify-center">
                  <Button variant="ghost" onClick={() => setIsFlipped(!isFlipped)} disabled={isLoadingCocktails || !cocktails}>
                    <Repeat className="mr-2 h-4 w-4" />
                    Flip Card
                  </Button>
                </div>
                 <Separator className="my-6" />
                 <div className="flex justify-between">
                    <Button variant="outline" disabled={isLoadingCocktails || !cocktails}>
                        Mark as Learned
                        <Check className="ml-2 h-4 w-4" />
                    </Button>
                    <Button onClick={nextFlashcard} disabled={isLoadingCocktails || !cocktails}>
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

    