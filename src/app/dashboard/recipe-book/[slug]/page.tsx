
'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { doc, getDoc, collection, query, where } from 'firebase/firestore';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Camera, PlusCircle, Trash2, Upload, Users, Wine, BookHeart, Loader2, RefreshCcw, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Cocktail, RecipeNote } from '@/types/cocktail';
import type { UserProfile } from '@/types/user';
import type { Connection } from '@/app/dashboard/bar-guests/page';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export default function RecipeBookPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [recipe, setRecipe] = useState<Cocktail | null>(null);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(true);

  const { toast } = useToast();
  const [hasCameraPermission, setHasCameraPermission] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useUser();
  const firestore = useFirestore();

  // Form state
  const [brands, setBrands] = useState('');
  const [notes, setNotes] = useState('');
  const [sharedWith, setSharedWith] = useState<string[]>([]);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);

  // Fetch the main cocktail recipe from Firestore
  useEffect(() => {
    if (!firestore || !slug) return;
    const fetchRecipe = async () => {
      setIsLoadingRecipe(true);
      const recipeDocRef = doc(firestore, 'cocktails', slug);
      const recipeSnap = await getDoc(recipeDocRef);
      if (recipeSnap.exists()) {
        setRecipe({ id: recipeSnap.id, ...recipeSnap.data() } as Cocktail);
      } else {
        console.error("Recipe not found in Firestore");
      }
      setIsLoadingRecipe(false);
    }
    fetchRecipe();
  }, [firestore, slug]);


  // Create a memoized reference to the user's recipe note document
  const recipeNoteRef = useMemoFirebase(() => {
    if (user && firestore && slug) {
      return doc(firestore, 'users', user.uid, 'recipeNotes', slug);
    }
    return null;
  }, [user, firestore, slug]);

  // Use the useDoc hook to fetch data in real-time
  const { data: recipeNote, isLoading: isLoadingNote } = useDoc<RecipeNote>(recipeNoteRef);
  
    // --- Guest fetching logic ---
  const connectionsQuery = useMemoFirebase(() => {
    if (firestore && user) {
        return query(collection(firestore, 'connections'), where('userIds', 'array-contains', user.uid), where('status', '==', 'accepted'));
    }
    return null;
  }, [firestore, user]);
  const { data: connections, isLoading: isLoadingConnections } = useCollection<Connection>(connectionsQuery);
  const guestIds = useMemo(() => connections?.map(c => c.userIds.find(id => id !== user?.uid)).filter(Boolean) as string[] ?? [], [connections, user]);
  
  const guestsQuery = useMemoFirebase(() => {
    if (firestore && guestIds.length > 0) {
        return query(collection(firestore, 'users'), where('id', 'in', guestIds));
    }
    return null;
  }, [firestore, guestIds.join(',')]);
  const { data: guests, isLoading: isLoadingGuests } = useCollection<UserProfile>(guestsQuery);


  // Populate form fields when data is loaded from Firestore
  useEffect(() => {
    if (recipeNote) {
      setBrands(recipeNote.brands || '');
      setNotes(recipeNote.notes || '');
      setSharedWith(recipeNote.sharedWith || []);
      setPhotoDataUrl(recipeNote.photoUrl || null);
    } else {
      // If the document is deleted or doesn't exist, clear the form
      setBrands('');
      setNotes('');
      setSharedWith([]);
      setPhotoDataUrl(null);
    }
  }, [recipeNote]);

  if (isLoadingRecipe) {
     return (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-4 text-muted-foreground">Loading recipe...</p>
        </div>
      );
  }

  if (!recipe) {
    notFound();
  }

  const handleShareChange = (guestId: string, isChecked: boolean) => {
    setSharedWith(prev => 
      isChecked ? [...prev, guestId] : prev.filter(id => id !== guestId)
    );
  };

  const handleSave = () => {
    if (!recipeNoteRef) {
      toast({
        title: 'Error',
        description: 'You must be logged in to save notes.',
        variant: 'destructive',
      });
      return;
    }
    
    const noteData: Partial<RecipeNote> = {
      brands,
      notes,
      sharedWith,
      recipeId: slug, // Store the recipe ID for context
      photoUrl: photoDataUrl,
    };

    setDocumentNonBlocking(recipeNoteRef, noteData, { merge: true });

    toast({
      title: 'Notes Saved!',
      description: `Your notes for ${recipe.name} have been saved.`,
    });
  };
  
  const handleDelete = () => {
    if (!recipeNoteRef) {
      toast({
        title: 'Error',
        description: 'You must be logged in to delete notes.',
        variant: 'destructive',
      });
      return;
    }

    deleteDocumentNonBlocking(recipeNoteRef);
    
    toast({
      title: 'Notes Deleted',
      description: 'Your notes for this recipe have been removed from your book.',
    });
  };

  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPhotoDataUrl(dataUrl);
      }
    }
  };

  const retakePicture = () => {
    setPhotoDataUrl(null);
  };
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoDataUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('Camera not supported by this browser.');
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Not Supported',
          description: 'Your browser does not support camera access.',
        });
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this app.',
        });
      }
    };

    if (!photoDataUrl) {
      getCameraPermission();
    }
    
    // Clean up camera stream
    return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    };
  }, [photoDataUrl, toast]);

  return (
    <div className="grid gap-6">
      <canvas ref={canvasRef} className="hidden" />
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange}
        className="hidden" 
        accept="image/*"
      />
      <Card>
        <CardHeader>
          <CardTitle>{recipe.name}</CardTitle>
          <CardDescription>Your personal notes and photos for this cocktail.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-8">
          {/* Original Recipe Section */}
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <BookHeart className="w-5 h-5" />
              Original Recipe
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                    <p className="font-medium">Ingredients:</p>
                    <ul className="list-disc pl-5 text-muted-foreground">
                        {recipe.ingredients.map(ing => <li key={ing}>{ing}</li>)}
                    </ul>
                </div>
                <div>
                    <p className="font-medium">Instructions:</p>
                    <p className="text-muted-foreground">
                        {recipe.directions}
                    </p>
                </div>
            </div>
          </div>
          
          <Separator />
          
          {isLoadingNote && (
            <div className="flex items-center justify-center min-h-[300px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-4 text-muted-foreground">Loading your notes...</p>
            </div>
          )}

          {!isLoadingNote && (
            <>
              {/* Personalization Section */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="grid gap-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Wine className="w-5 h-5" />
                    My Notes
                  </h3>

                  <div className="grid gap-2">
                    <Label htmlFor="brands">Spirit Brands</Label>
                    <Textarea id="brands" placeholder="e.g., Tito's Vodka, Kahlúa" value={brands} onChange={(e) => setBrands(e.target.value)} />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="adjustments">Adjustments & Notes</Label>
                    <Textarea id="adjustments" placeholder="e.g., Used a double shot of espresso, added a pinch of salt..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                  </div>
                </div>
                
                <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Camera className="w-5 h-5" />
                        My Cocktail Photo
                    </h3>
                    <div className="w-full aspect-video rounded-md bg-muted overflow-hidden relative border">
                        {photoDataUrl ? (
                            <Image src={photoDataUrl} alt="My Cocktail" layout="fill" objectFit="cover" />
                        ) : (
                            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                        )}
                        {!hasCameraPermission && !photoDataUrl &&(
                            <div className="absolute inset-0 flex items-center justify-center p-4 bg-background/80">
                                 <Alert variant="destructive" className="w-full">
                                    <AlertTitle>Camera Access Denied</AlertTitle>
                                    <AlertDescription>
                                        Please allow camera access to use this feature.
                                    </AlertDescription>
                                </Alert>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {photoDataUrl ? (
                           <Button className="w-full" onClick={retakePicture}>
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                Retake
                            </Button>
                        ) : (
                             <Button className="w-full" disabled={!hasCameraPermission} onClick={takePicture}>
                                <Camera className="mr-2 h-4 w-4" />
                                Take Picture
                            </Button>
                        )}
                        <Button variant="outline" className="w-full" onClick={handleUploadClick}>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload
                        </Button>
                    </div>
                </div>

              </div>

              <Separator />

                <div>
                 <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5" />
                    Share with Guests
                 </h3>
                 {isLoadingGuests ? (
                     <p className="text-muted-foreground">Loading guests...</p>
                 ) : guests && guests.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {guests.map(guest => (
                            <div key={guest.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50">
                                <Checkbox 
                                    id={`share-${guest.id}`} 
                                    checked={sharedWith.includes(guest.id)}
                                    onCheckedChange={(checked) => handleShareChange(guest.id, !!checked)}
                                />
                                <Label htmlFor={`share-${guest.id}`} className="flex items-center gap-2 font-normal cursor-pointer">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={guest.photoURL} />
                                        <AvatarFallback>{guest.email?.[0].toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    {guest.email}
                                </Label>
                            </div>
                        ))}
                    </div>
                 ) : (
                    <p className="text-sm text-muted-foreground">You have no guests to share with yet. Add some from the 'Bar Guests' page.</p>
                 )}
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isLoadingNote || !user || !recipeNote}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete from My Book
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your notes and photos for the {recipe.name}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={handleSave} disabled={isLoadingNote || !user}>Save Notes</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
