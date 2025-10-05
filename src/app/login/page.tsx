
'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { loginAction, signupAction } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/firebase';
import {
  linkWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

const initialState = {
  message: null,
  errors: null,
  success: false,
};


function SubmitButton({ text, ...props }: { text: string } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'formAction'> & { formAction?: (formData: FormData) => void }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full" {...props}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {text}
    </Button>
  );
}

const authSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);
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
        <Label htmlFor="login-email">Email</Label>
        <Input id="login-email" type="email" name="email" placeholder="m@example.com" required />
        {state?.errors?.email && <p className="text-sm text-destructive">{state.errors.email}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="login-password">Password</Label>
        <Input id="login-password" type="password" name="password" required />
        {state?.errors?.password && <p className="text-sm text-destructive">{state.errors.password}</p>}
      </div>
      <SubmitButton text="Sign In" />
    </form>
  )
}

function SignupForm() {
  const [state, formAction] = useActionState(signupAction, initialState);
  const { toast } = useToast();
  const auth = useAuth();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? 'Success!' : 'Authentication Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
    }
  }, [state, toast]);
  
  const handleClientSignUp = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // Prevent default form submission
    const form = formRef.current;
    if (!form) return;

    const formData = new FormData(form);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const validated = authSchema.safeParse({ email, password });
    if (!validated.success) {
        toast({ title: 'Invalid input', description: 'Please check your email and password.', variant: 'destructive'});
        return;
    }

    try {
        if (auth.currentUser && auth.currentUser.isAnonymous) {
            // Case 1: Upgrade anonymous user
            const credential = EmailAuthProvider.credential(email, password);
            await linkWithCredential(auth.currentUser, credential);
            toast({ title: 'Account Created!', description: 'Your guest account has been upgraded.' });
            router.push('/dashboard');
        } else {
            // Case 2: Create a new account from scratch using the server action
            formAction(formData);
        }
    } catch (error: any) {
        let message = "An error occurred during sign-up.";
        if(error.code === 'auth/credential-already-in-use' || error.code === 'auth/email-already-in-use') {
            message = 'This email is already in use. Please sign in instead.';
        }
        toast({ title: 'Sign-up failed', description: message, variant: 'destructive'});
    }
  };

  return (
    <form ref={formRef} action={formAction} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input id="signup-email" type="email" name="email" placeholder="m@example.com" required />
        {state?.errors?.email && <p className="text-sm text-destructive">{state.errors.email}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input id="signup-password" type="password" name="password" required />
        {state?.errors?.password && <p className="text-sm text-destructive">{state.errors.password}</p>}
      </div>
       <SubmitButton text="Sign Up" onClick={handleClientSignUp} />
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
              <CardDescription>Enter your email and password to sign in.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <LoginForm />
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
              <CardDescription>Enter your details to create an account.</CardDescription>
            </CardHeader>
            <CardContent className='grid gap-4'>
              <SignupForm />
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
