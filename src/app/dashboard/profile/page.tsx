'use client';

import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, User as UserIcon, Users, Globe, Lock, EyeOff, Image as ImageIcon, Target, CheckCircle, HelpCircle, Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/types/user';
import type { Cocktail } from '@/types/cocktail';
import type { UserLearning } from '@/types/learning';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [favoriteCocktail, setFavoriteCocktail] = useState('');
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userProfileRef = useMemoFirebase(() => {
    if (user && firestore) {
      return doc(firestore, 'users', user.uid);
    }
    return null;
  }, [user, firestore]);
  const { data: userProfile, isLoading: isLoadingProfile } = useDoc<UserProfile>(userProfileRef);
  
  const learningProgressRef = useMemoFirebase(() => {
    if (user && firestore) {
      return doc(firestore, 'users', user.uid, 'learning', 'progress');
    }
    return null;
  }, [user, firestore]);
  const { data: learningProgress, isLoading: isLoadingLearning } = useDoc<UserLearning>(learningProgressRef);

  const cocktailsCollectionRef = useMemoFirebase(() => {
      if (firestore) {
        return collection(firestore, 'cocktails');
      }
      return null;
    }, [firestore]);
  const { data: cocktails, isLoading: isLoadingCocktails } = useCollection<Cocktail>(cocktailsCollectionRef);

  // Effect for milestone toasts
  useEffect(() => {
    if (learningProgress) {
      if (learningProgress.correctQuizAnswers === 1 && learningProgress.totalQuizzesTaken === 1) {
        toast({ title: 'First Correct Answer!', description: 'Great start! Keep that momentum going.' });
      }
      if (learningProgress.puzzlesSolved === 1) {
        toast({ title: 'Puzzle Master!', description: 'You solved your first "What Am I?" puzzle!' });
      }
      if (learningProgress.totalQuizzesTaken === 10) {
        toast({ title: 'Knowledge Seeker', description: 'You\'ve answered 10 quiz questions! Your journey has begun.' });
      }
    }
  }, [learningProgress, toast]);


  useEffect(() => {
    if (userProfile) {
      setFavoriteCocktail(userProfile.favoriteCocktail || '');
      setPhotoURL(userProfile.photoURL || user?.photoURL || null);
    } else if (user) {
        setPhotoURL(user.photoURL || null);
    }
  }, [userProfile, user]);

  const handleSave = () => {
    if (!userProfileRef) {
      toast({
        title: 'Error',
        description: 'You must be logged in to save your profile.',
        variant: 'destructive',
      });
      return;
    }

    const profileData = {
      favoriteCocktail,
      photoURL,
    };

    setDocumentNonBlocking(userProfileRef, profileData, { merge: true });

    toast({
      title: 'Profile Saved!',
      description: 'Your profile details have been updated.',
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    
    try {
      const storage = getStorage();
      // Create a storage reference with a unique path for the user's profile picture
      const fileRef = storageRef(storage, `users/${user.uid}/profile.jpg`);
      
      const snapshot = await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      setPhotoURL(downloadURL); // Update local state
      
       if (userProfileRef) {
          setDocumentNonBlocking(userProfileRef, { photoURL: downloadURL }, { merge: true });
       }
      
      toast({
        title: 'Image Uploaded!',
        description: 'Your new profile picture has been saved.',
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: 'Upload Failed',
        description: 'There was a problem uploading your image.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const isLoading = isUserLoading || isLoadingProfile;
  const accuracy = learningProgress && learningProgress.totalQuizzesTaken > 0
    ? Math.round((learningProgress.correctQuizAnswers / learningProgress.totalQuizzesTaken) * 100)
    : 0;

  return (
    <div className="grid gap-6">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange}
        className="hidden" 
        accept="image/*"
      />
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
          <CardDescription>Update your personal details and preferences.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={photoURL ?? undefined} data-ai-hint="profile picture" />
              <AvatarFallback>
                {isLoading ? <Loader2 className="h-10 w-10 animate-spin" /> : <UserIcon className="h-10 w-10" />}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" onClick={handleUploadClick} disabled={isUploading || isLoading}>
                {isUploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Upload Picture
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                For best results, use a square image.
              </p>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="favorite-cocktail">Favorite Cocktail</Label>
            <Select 
              name="favorite-cocktail" 
              value={favoriteCocktail} 
              onValueChange={setFavoriteCocktail}
              disabled={isLoading || isLoadingCocktails}
            >
              <SelectTrigger id="favorite-cocktail" className='w-full sm:w-[280px]'>
                <SelectValue placeholder={isLoadingCocktails ? "Loading..." : "Select your favorite"} />
              </SelectTrigger>
              <SelectContent>
                {cocktails?.map((cocktail) => (
                    <SelectItem key={cocktail.slug} value={cocktail.slug}>{cocktail.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={isLoading}>Save Profile</Button>
        </CardFooter>
      </Card>
      
       <Card>
        <CardHeader>
          <CardTitle>Quiz Performance</CardTitle>
          <CardDescription>Track your mixology knowledge progress.</CardDescription>
        </CardHeader>
        {isLoadingLearning ? (
          <CardContent className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Loading your stats...</p>
          </CardContent>
        ) : (
          <>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-lg bg-muted/50">
                  <Target className="h-8 w-8 text-primary mx-auto" />
                  <p className="text-2xl font-bold mt-2">{accuracy}%</p>
                  <p className="text-sm text-muted-foreground">Overall Accuracy</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                  <p className="text-2xl font-bold mt-2">{learningProgress?.correctQuizAnswers || 0}</p>
                  <p className="text-sm text-muted-foreground">Correct Answers</p>
                </div>
                 <div className="p-4 rounded-lg bg-muted/50">
                  <HelpCircle className="h-8 w-8 text-yellow-500 mx-auto" />
                  <p className="text-2xl font-bold mt-2">{learningProgress?.totalQuizzesTaken || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Questions</p>
                </div>
              </div>
              <div>
                <Label>Overall Progress</Label>
                <Progress value={accuracy} className="mt-2" />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" disabled>Review Missed Questions</Button>
            </CardFooter>
          </>
        )}
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>My Cocktail Party</CardTitle>
          <CardDescription>Manage photos, guests, and privacy for your event.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div>
            <Label className="text-base font-medium">Party Photos</Label>
            <div className="mt-2 grid grid-cols-3 md:grid-cols-5 gap-4">
                {[1,2,3,4,5].map((i) => (
                    <div key={i} className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                       <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                ))}
            </div>
          </div>
           <div>
            <Label className="text-base font-medium">Guests</Label>
             <div className="mt-2 flex items-center gap-2">
                <div className="flex -space-x-2 overflow-hidden">
                    <Avatar className="inline-block border-2 border-background">
                        <AvatarImage src="https://picsum.photos/seed/guest1/100" />
                        <AvatarFallback>G1</AvatarFallback>
                    </Avatar>
                     <Avatar className="inline-block border-2 border-background">
                        <AvatarImage src="https://picsum.photos/seed/guest2/100" />
                        <AvatarFallback>G2</AvatarFallback>
                    </Avatar>
                     <Avatar className="inline-block border-2 border-background">
                        <AvatarImage src="https://picsum.photos/seed/guest3/100" />
                        <AvatarFallback>G3</AvatarFallback>
                    </Avatar>
                </div>
                 <p className="text-sm text-muted-foreground">You and 12 others</p>
            </div>
          </div>
          <div>
            <Label className="text-base font-medium">Privacy Settings</Label>
            <RadioGroup defaultValue="private" className="mt-2 grid gap-4">
              <Label className="flex items-center gap-4 p-4 rounded-lg border has-[:checked]:border-primary">
                <RadioGroupItem value="public" id="public" />
                <Globe className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Public</p>
                  <p className="text-sm text-muted-foreground">Anyone can see your party details.</p>
                </div>
              </Label>
              <Label className="flex items-center gap-4 p-4 rounded-lg border has-[:checked]:border-primary">
                <RadioGroupItem value="semi-private" id="semi-private" />
                <Users className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Semi-private</p>
                  <p className="text-sm text-muted-foreground">Only your friends can see this.</p>
                </div>
              </Label>
              <Label className="flex items-center gap-4 p-4 rounded-lg border has-[:checked]:border-primary">
                <RadioGroupItem value="private" id="private" />
                <Lock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Private</p>
                  <p className="text-sm text-muted-foreground">Only you can see this.</p>
                </div>
              </Label>
              <Label className="flex items-center gap-4 p-4 rounded-lg border has-[:checked]:border-primary">
                <RadioGroupItem value="none" id="none" />
                <EyeOff className="w-5 h-5 text-muted-foreground" />
                 <div>
                  <p className="font-semibold">None</p>
                  <p className="text-sm text-muted-foreground">Don't show this on my profile.</p>
                </div>
              </Label>
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter>
          <Button>Save Party Info</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

    