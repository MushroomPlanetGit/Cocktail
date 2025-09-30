'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Camera, PlusCircle, Trash2, Upload, Users, Wine, BookHeart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

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
          
          {/* Personalization Section */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="grid gap-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Wine className="w-5 h-5" />
                My Notes
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
                    My Cocktail Photo
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
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
            <Button variant="destructive">
                <Trash2 className="mr-2"/>
                Delete from My Book
            </Button>
            <Button>Save Notes</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
