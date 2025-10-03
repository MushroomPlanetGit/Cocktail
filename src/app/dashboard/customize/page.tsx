import { ThemeCustomizer } from "@/components/theme-customizer"

export default function CustomizePage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Customize
          </h1>
          <p className="text-muted-foreground">
            Pick a style and color for your components.
          </p>
        </div>
      </div>
      <div className="max-w-xl">
        <ThemeCustomizer />
      </div>
    </div>
  )
}
