'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload } from 'lucide-react';
import { User as UserIcon } from 'lucide-react';


export default function ProfilePage() {
  return (
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
  );
}
