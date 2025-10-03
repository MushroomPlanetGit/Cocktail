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
import { useAuth } from '@/firebase';
import {
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  linkWithCredential,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';

const initialState = {
  message: null,
  errors: null,
  success: false,
};

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 48 48" {...props}>
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A8 8 0 0 1 24 36c-5.222 0-9.612-3.87-11.188-8.864l-6.571 4.819A20 20 0 0 0 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C43.021 36.258 48 30.739 48 24c0-1.341-.138-2.65-.389-3.917z"></path>
        </svg>
    )
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
            <path fill="currentColor" d="M12 2.04c-5.5 0-10 4.49-10 10.02c0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.84c0-2.5 1.49-3.9 3.8-3.9c1.1 0 2.23.2 2.23.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z"></path>
        </svg>
    )
}

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
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { pending } = useFormStatus();

  const handleSocialSignIn = async (provider: 'google' | 'facebook') => {
    const authProvider = provider === 'google' ? new GoogleAuthProvider() : new FacebookAuthProvider();
    
    try {
      if (auth.currentUser && auth.currentUser.isAnonymous) {
        // If there's an anonymous user, link the new credential
        await linkWithCredential(auth.currentUser, authProvider);
      } else {
        // Otherwise, just sign in
        await signInWithPopup(auth, authProvider);
      }
      router.push('/dashboard');
    } catch (error: any) {
      console.error(error);
      let message = 'An unknown error occurred during social sign-in.';
      if (error.code === 'auth/credential-already-in-use') {
        message = 'This social account is already linked to another user.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        message = 'An account already exists with the same email address but different sign-in credentials. Try signing in with the original method.';
      }
       toast({
        title: 'Sign-in Failed',
        description: message,
        variant: 'destructive',
      });
    }
  };

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
              <CardDescription>Choose your sign-in method or enter your credentials.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
               <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={() => handleSocialSignIn('google')} disabled={pending}>
                    <GoogleIcon className="mr-2 h-4 w-4" />
                    Google
                </Button>
                 <Button variant="outline" onClick={() => handleSocialSignIn('facebook')} disabled={pending}>
                    <FacebookIcon className="mr-2 h-4 w-4" />
                    Facebook
                </Button>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
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
              <CardDescription>Choose a method to create your account.</CardDescription>
            </CardHeader>
            <CardContent className='grid gap-4'>
                <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" onClick={() => handleSocialSignIn('google')} disabled={pending}>
                        <GoogleIcon className="mr-2 h-4 w-4" />
                        Google
                    </Button>
                    <Button variant="outline" onClick={() => handleSocialSignIn('facebook')} disabled={pending}>
                        <FacebookIcon className="mr-2 h-4 w-4" />
                        Facebook
                    </Button>
                </div>
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or create an account</span>
                    </div>
                </div>
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
