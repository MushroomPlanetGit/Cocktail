'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, User as UserIcon, Users, Globe, Lock, EyeOff, Image as ImageIcon } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';


export default function ProfilePage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
          <CardDescription>Update your personal details and preferences.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="https://picsum.photos/seed/user-profile/200" data-ai-hint="profile picture" />
              <AvatarFallback>
                <UserIcon className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Upload Picture
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                For best results, use a square image.
              </p>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="favorite-cocktail">Favorite Cocktail</Label>
            <Select name="favorite-cocktail" defaultValue="espresso-martini">
              <SelectTrigger id="favorite-cocktail" className='w-full sm:w-[280px]'>
                <SelectValue placeholder="Select your favorite" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="espresso-martini">Espresso Martini</SelectItem>
                <SelectItem value="classic-margarita">Classic Margarita</SelectItem>
                <SelectItem value="mojito">Mojito</SelectItem>
                <SelectItem value="old-fashioned">Old Fashioned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button>Save Profile</Button>
        </CardFooter>
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
