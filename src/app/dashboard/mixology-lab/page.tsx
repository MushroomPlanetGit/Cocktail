'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FlaskConical, ChevronRight, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';


const sampleQuestion = {
  id: 'q1',
  question: 'Which of the following are the traditional ingredients in a Negroni?',
  answers: [
    { text: 'Gin, Sweet Vermouth, Campari', correct: true },
    { text: 'Vodka, Triple Sec, Lime Juice, Cranberry Juice', correct: false },
    { text: 'Rum, Lime Juice, Sugar', correct: false },
    { text: 'Whiskey, Sweet Vermouth, Angostura Bitters', correct: false },
  ],
  category: 'gin',
  difficulty: 'medium',
};

// Helper function to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}


export default function MixologyLabPage() {
  const [spirit, setSpirit] = useState('random');
  const [difficulty, setDifficulty] = useState('medium');
  const [quizStarted, setQuizStarted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Memoize the shuffled answers so they don't re-shuffle on every render
  const shuffledAnswers = useMemo(() => shuffleArray(sampleQuestion.answers), [quizStarted]);


  const startQuiz = () => {
    // Reset state for a new quiz
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowFeedback(false);
    setQuizStarted(true);
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
          console.log(`Question "${sampleQuestion.question}" answered incorrectly. Add to review queue.`);
      }
    }
  }

  const nextQuestion = () => {
    // For now, this just restarts the quiz. Later it would fetch the next question.
    startQuiz();
  }

  if (quizStarted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>The Mixology Lab</CardTitle>
          <CardDescription>Question 1 of 10</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <p className="text-lg font-semibold">{sampleQuestion.question}</p>
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
        </CardContent>
        <CardFooter className="flex justify-end">
            {showFeedback ? (
                 <Button onClick={nextQuestion}>
                    Next Question <ChevronRight className="ml-2 h-4 w-4" />
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
