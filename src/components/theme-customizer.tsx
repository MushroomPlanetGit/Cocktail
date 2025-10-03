"use client"

import * as React from "react"
import { Check, Copy, Paintbrush } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"

export function ThemeCustomizer() {
  const [config] = React.useState({
    theme: "zinc",
    radius: 0.5,
  })
  const { toast } = useToast()

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
        <div className="ml-auto flex items-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Paintbrush className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Themes</DialogTitle>
                  <DialogDescription>
                    Select a theme to customize your app.
                  </DialogDescription>
                </DialogHeader>
                {/* Add theme selection UI here */}
              </DialogContent>
            </Dialog>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Color</Label>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={"outline"}
            size="sm"
            className="justify-start"
          >
            <span
              className={cn(
                "mr-1 flex h-5 w-5 shrink-0 -translate-x-1 items-center justify-center rounded-full"
              )}
            >
              <Check className="h-4 w-4" />
            </span>
            Zinc
          </Button>
          {/* ... Other color buttons */}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Radius</Label>
        <div className="grid grid-cols-5 gap-2">
          <Button
            variant={"outline"}
            size="sm"
            className="justify-center"
          >
            0
          </Button>
          {/* ... Other radius buttons */}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Mode</Label>
        <div className="grid grid-cols-3 gap-2">
            <Button
                variant={"outline"}
                size="sm"
            >
                Light
            </Button>
            <Button
                variant={"outline"}
                size="sm"
            >
                Dark
            </Button>
        </div>
      </div>
    </div>
  )
}
