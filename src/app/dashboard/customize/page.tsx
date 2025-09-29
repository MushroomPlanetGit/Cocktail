import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function CustomizePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customize Your App</CardTitle>
        <CardDescription>This is where you'll personalize your app's appearance.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg">
          <p className="text-center text-muted-foreground">UI customization controls for colors, fonts, and layouts will be available here.</p>
        </div>
      </CardContent>
    </Card>
  );
}
