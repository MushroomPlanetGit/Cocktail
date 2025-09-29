import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ContentPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage App Content</CardTitle>
        <CardDescription>Input and format content for your app's pages.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg">
          <p className="text-center text-muted-foreground">Tools for adding and editing text, images, and videos will be available here.</p>
        </div>
      </CardContent>
    </Card>
  );
}
