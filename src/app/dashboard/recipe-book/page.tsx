'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Camera, PlusCircle, Trash2, Upload, Users, Wine } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function RecipeBookPage() {
  const { toast } = useToast();
  const [hasCameraPermission, setHasCameraPermission] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCameraPermission(false);
        console.error('Camera API not available in this browser.');
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
          description: 'Please enable camera permissions in your browser settings to use this feature.',
        });
      }
    };

    getCameraPermission();
  }, [toast]);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>My Personal Recipe Book</CardTitle>
          <CardDescription>Your collection of cocktails, notes, and memories.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-8">
          {/* Recipe Details Section */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="grid gap-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Wine className="w-5 h-5" />
                Espresso Martini
              </h3>

              <div className="grid gap-2">
                <Label htmlFor="brands">Spirit Brands</Label>
                <Textarea id="brands" placeholder="e.g., Tito's Vodka, Kahlúa" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="adjustments">Adjustments & Notes</Label>
                <Textarea id="adjustments" placeholder="e.g., Used a double shot of espresso, added a pinch of salt..." />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="shared-with">Shared With</Label>
                <div className="flex items-center gap-2">
                  <Input id="shared-with" placeholder="e.g., Jane Doe, John Smith" />
                   <Button variant="outline" size="icon">
                    <Users className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Cocktail Photo
                </h3>
                <div className="w-full aspect-video rounded-md bg-muted overflow-hidden relative border">
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                    {!hasCameraPermission && (
                        <div className="absolute inset-0 flex items-center justify-center p-4 bg-background/80">
                             <Alert variant="destructive" className="w-full">
                                <AlertTitle>Camera Access Required</AlertTitle>
                                <AlertDescription>
                                    Please allow camera access to use this feature.
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button className="w-full" disabled={!hasCameraPermission}>
                        <Camera className="mr-2" />
                        Take Picture
                    </Button>
                    <Button variant="outline" className="w-full">
                        <Upload className="mr-2" />
                        Upload
                    </Button>
                </div>
            </div>

          </div>

          <div className="border-t pt-8">
             <h3 className="text-lg font-semibold">Cocktail Party Photos</h3>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
                {/* Placeholder for party photos */}
                <div className="aspect-square rounded-md bg-muted flex items-center justify-center border-2 border-dashed">
                    <Button variant="ghost" size="icon">
                        <PlusCircle className="w-8 h-8 text-muted-foreground" />
                    </Button>
                </div>
             </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
            <Button variant="destructive">
                <Trash2 className="mr-2"/>
                Delete Recipe
            </Button>
            <Button>Save Recipe</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
