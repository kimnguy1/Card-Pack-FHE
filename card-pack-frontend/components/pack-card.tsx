"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { PACK_COVER_IMAGES } from "@/lib/contracts/config"

interface PackCardProps {
  title: string
  description: string
  price: string
  theme: "pokemon" | "onepiece" | "naruto" // Added naruto theme
  onOpen: () => void
  disabled?: boolean
  isLoading?: boolean
}

export function PackCard({ title, description, price, theme, onOpen, disabled, isLoading }: PackCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all hover:scale-105 hover:shadow-xl",
        theme === "pokemon" &&
          "border-yellow-400/50 bg-gradient-to-br from-yellow-50 to-blue-50 dark:from-yellow-950/20 dark:to-blue-950/20",
        theme === "onepiece" &&
          "border-orange-400/50 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20",
        theme === "naruto" &&
          "border-orange-500/50 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20",
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5" />

      <CardHeader className="relative">
        <CardTitle className="text-2xl font-bold text-balance">{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>

      <CardContent className="relative">
        <div className="flex items-center justify-center py-8">
          <div className="relative h-40 w-32 rounded-lg shadow-2xl transition-transform overflow-hidden">
            <Image
              src={PACK_COVER_IMAGES[theme] || "/placeholder.svg"}
              alt={`${title} cover`}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Sparkles className="h-16 w-16 text-white animate-pulse drop-shadow-lg" />
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-3xl font-bold text-primary">{price} ETH</p>
          <p className="text-sm text-muted-foreground mt-1">3 Random Cards</p>
        </div>
      </CardContent>

      <CardFooter className="relative">
        <Button onClick={onOpen} disabled={disabled || isLoading} className="w-full text-lg font-semibold" size="lg">
          {isLoading ? "Opening..." : "Open Pack"}
        </Button>
      </CardFooter>
    </Card>
  )
}
