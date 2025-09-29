import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Pencil } from 'lucide-react';

interface TemplateCardProps {
  name: string;
  description: string;
  imageUrl: string;
  imageHint: string;
}

export function TemplateCard({ name, description, imageUrl, imageHint }: TemplateCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="aspect-[3/4] relative">
          <Image
            src={imageUrl}
            alt={`Template preview for ${name}`}
            fill
            className="object-cover"
            data-ai-hint={imageHint}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg font-headline">{name}</CardTitle>
        <CardDescription className="mt-1 text-sm h-10">{description}</CardDescription>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button asChild className="w-full">
          <Link href="/dashboard/customize">
            <Pencil className="mr-2 h-4 w-4" />
            Customize
          </Link>
        </Button>
        <Button asChild variant="secondary" className="w-full">
          <Link href="/dashboard/preview">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
