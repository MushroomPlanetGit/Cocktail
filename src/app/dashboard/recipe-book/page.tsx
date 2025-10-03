'use client';

import { useState, useRef, useEffect } from 'react';
import { doc } from 'firebase/firestore';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Camera, PlusCircle, Trash2, Upload, Users, Wine, BookHeart, Loader2, RefreshCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';

const RECIPE_ID = 'espresso-martini'; // Hardcoded for this example page

export default function RecipeBookPage() {
  const { toast } = useToast();
  const [hasCameraPermission, setHasCameraPermission] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { user } = useUser();
  const firestore = useFirestore();

  // Form state
  const [brands, setBrands] = useState('');
  const [notes, setNotes] = useState('');
  const [sharedWith, setSharedWith] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);


  // Create a memoized reference to the user's recipe note document
  const recipeNoteRef = useMemoFirebase(() => {
    if (user && firestore) {
      return doc(firestore, 'users', user.uid, 'recipeNotes', RECIPE_ID);
    }
    return null;
  }, [user, firestore]);

  // Use the useDoc hook to fetch data in real-time
  const { data: recipeNote, isLoading } = useDoc<{ brands: string, notes: string, sharedWith: string, photoUrl?: string }>(recipeNoteRef);
  
  // Populate form fields when data is loaded from Firestore
  useEffect(() => {
    if (recipeNote) {
      setBrands(recipeNote.brands || '');
      setNotes(recipeNote.notes || '');
      setSharedWith(recipeNote.sharedWith || '');
      setPhotoDataUrl(recipeNote.photoUrl || null);
    } else {
      // If the document is deleted or doesn't exist, clear the form
      setBrands('');
      setNotes('');
      setSharedWith('');
      setPhotoDataUrl(null);
    }
  }, [recipeNote]);

  const handleSave = () => {
    if (!recipeNoteRef) {
      toast({
        title: 'Error',
        description: 'You must be logged in to save notes.',
        variant: 'destructive',
      });
      return;
    }
    
    const noteData = {
      brands,
      notes,
      sharedWith,
      recipeId: RECIPE_ID, // Store the recipe ID for context
      photoUrl: photoDataUrl,
    };

    setDocumentNonBlocking(recipeNoteRef, noteData, { merge: true });

    toast({
      title: 'Notes Saved!',
      description: 'Your notes for Espresso Martini have been saved.',
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
      <Card>
        <CardHeader>
          <CardTitle>Espresso Martini</CardTitle>
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
                        <li>2 oz Vodka</li>
                        <li>1 oz Coffee Liqueur</li>
                        <li>1 oz Espresso</li>
                        <li>Coffee beans for garnish</li>
                    </ul>
                </div>
                <div>
                    <p className="font-medium">Instructions:</p>
                    <p className="text-muted-foreground">
                        Shake all ingredients with ice, strain into a chilled cocktail glass. Garnish with coffee beans.
                    </p>
                </div>
            </div>
          </div>
          
          <Separator />
          
          {isLoading && (
            <div className="flex items-center justify-center min-h-[300px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-4 text-muted-foreground">Loading your notes...</p>
            </div>
          )}

          {!isLoading && (
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

                  <div className="grid gap-2">
                    <Label htmlFor="shared-with">Shared With</Label>
                    <div className="flex items-center gap-2">
                      <Input id="shared-with" placeholder="e.g., Jane Doe, John Smith" value={sharedWith} onChange={(e) => setSharedWith(e.target.value)} />
                       <Button variant="outline" size="icon">
                        <Users className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Camera className="w-5 h-5" />
                        My Cocktail Photo
                    </h3>
                    <div className="w-full aspect-video rounded-md bg-muted overflow-hidden relative border">
                        {photoDataUrl ? (
                            <Image src={photoDataUrl} alt="My Cocktail" fill objectFit="cover" />
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
                        <Button variant="outline" className="w-full">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload
                        </Button>
                    </div>
                </div>

              </div>

              <Separator />

              <div >
                 <h3 className="text-lg font-semibold mb-4">Cocktail Party Photos</h3>
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {/* Placeholder for party photos */}
                    <div className="aspect-square rounded-md bg-muted flex items-center justify-center border-2 border-dashed">
                        <Button variant="ghost" size="icon">
                            <PlusCircle className="w-8 h-8 text-muted-foreground" />
                        </Button>
                    </div>
                 </div>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isLoading || !user || !recipeNote}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete from My Book
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your notes and photos for the Espresso Martini.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={handleSave} disabled={isLoading || !user}>Save Notes</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
