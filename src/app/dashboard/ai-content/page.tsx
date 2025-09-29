'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { refineContentAction } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const initialState = {
  message: null,
  refinedText: null,
  errors: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
      Refine Content
    </Button>
  );
}

export default function AiContentPage() {
  const [state, formAction] = useFormState(refineContentAction, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message && (state.errors || state.message.includes('error'))) {
      toast({
        title: 'Error',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast]);


  return (
    <form action={formAction}>
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Content Suggestions</CardTitle>
          <CardDescription>Refine your written content to match a specific style.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="text-input">Your Content</Label>
            <Textarea
              id="text-input"
              name="text"
              placeholder="Enter the text you want to refine..."
              rows={6}
              required
            />
            {state?.errors?.text && <p className="text-sm text-destructive">{state.errors.text}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="style-select">Choose a Style</Label>
            <Select name="style" defaultValue="professional">
              <SelectTrigger id="style-select" className='w-full sm:w-[240px]'>
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                <SelectItem value="witty">Witty</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {state.refinedText && (
            <div className="grid gap-2 rounded-md border bg-muted/50 p-4">
              <Label>Refined Content</Label>
              <p className="text-sm prose dark:prose-invert">{state.refinedText}</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </Card>
    </form>
  );
}
