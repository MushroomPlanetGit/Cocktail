"use client"

import * as React from "react"
import { Check, Moon, Paintbrush, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"

const themes = [
  { name: "zinc", color: "hsl(222, 47%, 11%)" },
  { name: "slate", color: "hsl(215, 28%, 18%)" },
  { name: "stone", color: "hsl(25, 10%, 15%)" },
  { name: "gray", color: "hsl(220, 9%, 17%)" },
  { name: "neutral", color: "hsl(0, 0%, 15%)" },
  { name: "red", color: "hsl(0, 72%, 51%)" },
  { name: "rose", color: "hsl(347, 80%, 60%)" },
  { name: "orange", color: "hsl(25, 95%, 53%)" },
  { name: "green", color: "hsl(142, 71%, 45%)" },
  { name: "blue", color: "hsl(217, 91%, 60%)" },
  { name: "yellow", color: "hsl(48, 96%, 53%)" },
  { name: "violet", color: "hsl(262, 83%, 58%)" },
]

export function ThemeCustomizer() {
  const [mounted, setMounted] = React.useState(false)
  const { setTheme: setMode, resolvedTheme: mode } = useTheme()
  const [activeTheme, setActiveTheme] = React.useState(themes[0].name)
  const [radius, setRadius] = React.useState(0.5)

  React.useEffect(() => {
    setMounted(true)
    const storedTheme = localStorage.getItem("ui-theme")
    const storedRadius = localStorage.getItem("ui-radius")

    if (storedTheme) {
      setActiveTheme(storedTheme)
      applyTheme(storedTheme)
    }
    if (storedRadius) {
      const parsedRadius = parseFloat(storedRadius)
      setRadius(parsedRadius)
      applyRadius(parsedRadius)
    }
  }, [])
  
  const applyTheme = (themeName: string) => {
    const root = document.documentElement
    root.classList.forEach(className => {
      if (className.startsWith("theme-")) {
        root.classList.remove(className)
      }
    })
    root.classList.add(`theme-${themeName}`)
  }

  const handleThemeChange = (themeName: string) => {
    setActiveTheme(themeName)
    localStorage.setItem("ui-theme", themeName)
    applyTheme(themeName)
  }
  
  const applyRadius = (radiusValue: number) => {
    document.documentElement.style.setProperty("--radius", `${radiusValue}rem`)
  }

  const handleRadiusChange = (radiusValue: number) => {
    setRadius(radiusValue)
    localStorage.setItem("ui-radius", radiusValue.toString())
    applyRadius(radiusValue)
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="flex flex-col space-y-4 md:space-y-6">
      <div className="flex items-start">
        <div className="space-y-1 pr-2">
          <div className="font-semibold leading-none tracking-tight">
            Customize
          </div>
          <div className="text-xs text-muted-foreground">
            Pick a style and color for your components.
          </div>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Color</Label>
        <div className="grid grid-cols-3 gap-2">
          {themes.map((theme) => {
            const isActive = activeTheme === theme.name
            return (
              <Button
                variant={"outline"}
                size="sm"
                key={theme.name}
                onClick={() => handleThemeChange(theme.name)}
                className={cn(
                  "justify-start",
                  isActive && "border-2 border-primary"
                )}
              >
                <span
                  className={cn(
                    "mr-2 flex h-5 w-5 shrink-0 -translate-x-1 items-center justify-center rounded-full"
                  )}
                  style={{ backgroundColor: theme.color }}
                >
                  {isActive && <Check className="h-4 w-4 text-white" />}
                </span>
                {theme.name.charAt(0).toUpperCase() + theme.name.slice(1)}
              </Button>
            )
          })}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Radius</Label>
        <div className="grid grid-cols-5 gap-2">
          {["0", "0.3", "0.5", "0.75", "1.0"].map((value) => {
            const parsedValue = parseFloat(value)
            return (
              <Button
                variant={"outline"}
                size="sm"
                key={value}
                onClick={() => handleRadiusChange(parsedValue)}
                className={cn(
                  radius === parsedValue && "border-2 border-primary"
                )}
              >
                {value}
              </Button>
            )
          })}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Mode</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={"outline"}
            size="sm"
            onClick={() => setMode("light")}
            className={cn(mode === "light" && "border-2 border-primary")}
          >
            <Sun className="mr-2" />
            Light
          </Button>
          <Button
            variant={"outline"}
            size="sm"
            onClick={() => setMode("dark")}
            className={cn(mode === "dark" && "border-2 border-primary")}
          >
            <Moon className="mr-2" />
            Dark
          </Button>
        </div>
      </div>
    </div>
  )
}
