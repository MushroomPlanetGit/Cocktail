import { PlaceHolderImages } from '@/lib/placeholder-images';
import { TemplateCard } from '@/components/template-card';

export default function TemplateSelectionPage() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {PlaceHolderImages.map((template) => (
        <TemplateCard
          key={template.id}
          name={template.name}
          description={template.description}
          imageUrl={template.imageUrl}
          imageHint={template.imageHint}
        />
      ))}
    </div>
  );
}
