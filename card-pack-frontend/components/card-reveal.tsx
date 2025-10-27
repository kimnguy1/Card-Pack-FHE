"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatEther } from "viem"
import Image from "next/image"
import { CARD_IMAGES } from "@/lib/contracts/config"

interface CardData {
  value: bigint
  theme: "pokemon" | "onepiece" | "naruto"
  rarity: "common" | "rare" | "legendary"
}

interface CardRevealProps {
  cards: CardData[]
  onSellCard: (cardValue: bigint, index: number) => void
  isSelling?: boolean
}

export function CardReveal({ cards, onSellCard, isSelling }: CardRevealProps) {
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isSold, setIsSold] = useState(false)

  const handleCardSelect = (index: number) => {
    if (selectedCardIndex === null) {
      setSelectedCardIndex(index)
      // Flip after a short delay for better UX
      setTimeout(() => setIsFlipped(true), 100)
    }
  }

  const handleSell = () => {
    if (selectedCardIndex !== null) {
      setIsSold(true)
      onSellCard(cards[selectedCardIndex].value, selectedCardIndex)
    }
  }

  // selectedCard is intentionally not needed here; rely on selectedCardIndex to reference the chosen card

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <p className="text-lg font-semibold text-primary">
          {selectedCardIndex === null ? "Choose 1 card to reveal" : "Your revealed card"}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          {selectedCardIndex === null ? "Click on any card to see what you got!" : "You can sell this card for ETH"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <div key={index} className="perspective-1000">
            <div
              className={cn(
                "relative w-full aspect-[2/3] transition-all duration-700 transform-style-3d",
                selectedCardIndex === index && isFlipped && "rotate-y-180",
                selectedCardIndex !== null && selectedCardIndex !== index && "opacity-30 scale-90",
                selectedCardIndex === null && "cursor-pointer hover:scale-105",
                isSold && selectedCardIndex === index && "opacity-50 scale-95",
              )}
              onClick={() => handleCardSelect(index)}
            >
              {/* Card Back */}
              <div
                className={cn(
                  "absolute inset-0 backface-hidden rounded-xl shadow-2xl",
                  card.theme === "pokemon" && "bg-gradient-to-br from-yellow-400 via-blue-500 to-purple-600",
                  card.theme === "onepiece" && "bg-gradient-to-br from-orange-400 via-red-500 to-pink-600",
                  card.theme === "naruto" && "bg-gradient-to-br from-orange-500 via-yellow-500 to-red-600",
                )}
              >
                <div className="h-full flex items-center justify-center">
                  <Sparkles className="h-24 w-24 text-white animate-pulse" />
                </div>
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <p className="text-white font-bold text-lg">{selectedCardIndex === null ? "Click to Choose" : ""}</p>
                </div>
              </div>

              {/* Card Front - Only show if this card is selected */}
              {selectedCardIndex === index && (
                <div
                  className={cn(
                    "absolute inset-0 backface-hidden rotate-y-180 rounded-xl shadow-2xl overflow-hidden",
                    card.rarity === "legendary" && "border-4 border-yellow-400 shadow-yellow-400/50",
                    card.rarity === "rare" && "border-4 border-purple-400 shadow-purple-400/50",
                    card.rarity === "common" && "border-4 border-gray-400 shadow-gray-400/50",
                  )}
                >
                  <Card className="h-full border-0">
                    <CardContent className="h-full p-6 flex flex-col items-center justify-between bg-gradient-to-br from-card to-muted">
                      <div className="text-center">
                        <div
                          className={cn(
                            "inline-block px-3 py-1 rounded-full text-xs font-bold mb-4",
                            card.rarity === "legendary" && "bg-yellow-400 text-yellow-900",
                            card.rarity === "rare" && "bg-purple-400 text-purple-900",
                            card.rarity === "common" && "bg-gray-400 text-gray-900",
                          )}
                        >
                          {card.rarity.toUpperCase()}
                        </div>
                      </div>

                      <div className="flex-1 flex items-center justify-center w-full">
                        <div className="relative w-full h-48 rounded-lg overflow-hidden shadow-lg">
                          <Image
                            src={CARD_IMAGES[card.theme][card.rarity] || "/placeholder.svg"}
                            alt={`${card.theme} ${card.rarity} card`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>

                      <div className="text-center space-y-4 w-full">
                        <div>
                          <p className="text-3xl font-bold text-primary">{formatEther(card.value)} ETH</p>
                          <p className="text-sm text-muted-foreground">Card Value</p>
                        </div>

                        {!isSold && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSell()
                            }}
                            disabled={isSelling}
                            className="w-full"
                            size="lg"
                          >
                            <TrendingUp className="mr-2 h-4 w-4" />
                            {isSelling ? "Selling..." : "Sell Card"}
                          </Button>
                        )}

                        {isSold && <div className="text-green-600 dark:text-green-400 font-semibold">Sold!</div>}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedCardIndex !== null && !isSold && (
        <div className="text-center text-sm text-muted-foreground">
          The other 2 cards will be discarded after you sell or leave this page
        </div>
      )}
    </div>
  )
}
