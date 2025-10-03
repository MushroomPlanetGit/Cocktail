'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { loginAction, signupAction } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

const initialState = {
  message: null,
  errors: null,
  success: false,
};

function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {text}
    </Button>
  );
}

function AuthForm({ type }: { type: 'login' | 'signup' }) {
  const action = type === 'login' ? loginAction : signupAction;
  const [state, formAction] = useFormState(action, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? 'Success!' : 'Authentication Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
    }
  }, [state, toast]);

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor={`${type}-email`}>Email</Label>
        <Input id={`${type}-email`} type="email" name="email" placeholder="m@example.com" required />
        {state?.errors?.email && <p className="text-sm text-destructive">{state.errors.email}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${type}-password`}>Password</Label>
        <Input id={`${type}-password`} type="password" name="password" required />
        {state?.errors?.password && <p className="text-sm text-destructive">{state.errors.password}</p>}
      </div>
      <SubmitButton text={type === 'login' ? 'Sign In' : 'Sign Up'} />
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Tabs defaultValue="login" className="w-full max-w-sm">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>Enter your credentials to access your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <AuthForm type="login" />
            </CardContent>
            <CardFooter className='text-sm text-muted-foreground justify-center'>
              <Link href="/dashboard" className='hover:underline'>
                Continue as guest
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Sign Up</CardTitle>
              <CardDescription>Create a new account to save your progress.</CardDescription>
            </CardHeader>
            <CardContent>
              <AuthForm type="signup" />
            </CardContent>
             <CardFooter className='text-sm text-muted-foreground justify-center'>
               <Link href="/dashboard" className='hover:underline'>
                Continue as guest
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
    