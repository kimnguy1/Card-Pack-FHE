/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { useAccount, useWatchContractEvent } from "wagmi"
import { useUserBalance } from "@/lib/contracts/hooks"
import { toast } from "@/hooks/use-toast"
import { formatEther } from "viem"
import { CardReveal } from "@/components/card-reveal"
import { Button } from "@/components/ui/button"
// SnowEffect removed per user request
import { ArrowLeft, Loader2 } from "lucide-react"
import { CARD_PACK_CONTRACT_ADDRESS } from "@/lib/contracts/config"
import { CARD_PACK_ABI } from "@/lib/contracts/card-pack-abi"
import { useCardPackContract } from "@/lib/contracts/hooks"
import { parseEther } from "viem"
import { encodeFunctionData } from "viem"
import { relayTransaction } from "@/lib/relayer"
import { waitForReceipt } from "@/lib/wait-for-receipt"

interface CardData {
  value: bigint
  theme: "pokemon" | "onepiece" | "naruto"
  rarity: "common" | "rare" | "legendary"
}

function OpenPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { address } = useAccount()
  const { sellLastOpened, isPending } = useCardPackContract()
  const { refetch } = useUserBalance(address)

  const packType = searchParams.get("pack")
  const [cards, setCards] = useState<CardData[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Watch for CardOpened event emitted by our FlipCardStore contract
  useWatchContractEvent({
    address: CARD_PACK_CONTRACT_ADDRESS,
    abi: CARD_PACK_ABI,
    eventName: "CardOpened",
    onLogs(logs) {
      const log = logs[0]
      if (log && log.args && log.args.user === address) {
        const cardValue = log.args.cardValue as bigint
  // prefer on-chain packType from the event to avoid relying on URL param
  const eventPack = String(log.args.packType)
  const theme = eventPack === "0" ? "pokemon" : eventPack === "1" ? "onepiece" : "onepiece"

        // Determine rarity by exact values returned from the contract
        let rarity: "common" | "rare" | "legendary" = "common"
        const legendaryValues = [parseEther("0.001"), parseEther("0.01"), parseEther("0.1")]
        const rareValues = [parseEther("0.002"), parseEther("0.02"), parseEther("0.2")]

        if (legendaryValues.some((v) => v === cardValue)) rarity = "legendary"
        else if (rareValues.some((v) => v === cardValue)) rarity = "rare"

        const cardsData: CardData[] = [{ value: cardValue, theme, rarity }]
        setCards(cardsData)
        setIsLoading(false)
      }
    },
  })

  useEffect(() => {
    // Simulate loading if event hasn't fired yet
    const timeout = setTimeout(() => {
      if (!cards) {
        // create mock cards for UX while waiting for the on-chain event
        const theme = packType === "0" ? "pokemon" : packType === "1" ? "onepiece" : "onepiece"
        const mockCards: CardData[] = []

        for (let i = 0; i < 3; i++) {
          const random = Math.random() * 100
          let value: bigint
          let rarity: "common" | "rare" | "legendary"

          // packType: "0" = small (0.001 / 0.002 / 0.0005)
          if (packType === "0") {
            if (random < 10) {
              value = parseEther("0.001")
              rarity = "legendary"
            } else if (random < 50) {
              value = parseEther("0.002")
              rarity = "rare"
            } else {
              value = parseEther("0.0005")
              rarity = "common"
            }
          // packType: "1" = med (0.01 / 0.02 / 0.005)
          } else if (packType === "1") {
            if (random < 10) {
              value = parseEther("0.01")
              rarity = "legendary"
            } else if (random < 50) {
              value = parseEther("0.02")
              rarity = "rare"
            } else {
              value = parseEther("0.005")
              rarity = "common"
            }
          // packType: "2" = large (0.1 / 0.2 / 0.05)
          } else {
            if (random < 10) {
              value = parseEther("0.1")
              rarity = "legendary"
            } else if (random < 50) {
              value = parseEther("0.2")
              rarity = "rare"
            } else {
              value = parseEther("0.05")
              rarity = "common"
            }
          }

          mockCards.push({ value, theme, rarity })
        }

        setCards(mockCards)
        setIsLoading(false)
      }
    }, 3000)

    return () => clearTimeout(timeout)
  }, [cards, packType])

  const handleSellCard = async (cardValue: bigint, _index: number) => {
    try {
      // Prepare calldata for sellLastOpened()
      const calldata = encodeFunctionData({ abi: CARD_PACK_ABI as any, functionName: "sellLastOpened", args: [] })

      const pending = toast({ title: "Transaction pending", description: `Selling card...` })

      // Prefer a wallet-signed transaction so msg.sender is the user's address
      // This ensures `sellLastOpened()` credits the correct user balance in the contract.
      let sold = false
      if (address) {
        try {
          const tx = await sellLastOpened()
          if (tx && typeof tx === "object" && "wait" in tx && typeof (tx as any).wait === "function") {
            await (tx as any).wait()
          }
          pending.update({ title: "Card sold", description: `Sold for ${formatEther(cardValue)} ETH` })
          sold = true
        } catch (err) {
          // If wallet tx fails, fall back to relayer below
          console.warn('Wallet sell failed, falling back to relayer:', err)
        }
      }

      if (!sold) {
        // Try relayer as a fallback (useful for gasless flows). We attempt this only
        // if the wallet-signed tx was not performed or failed.
        try {
          const relayed = await relayTransaction({ to: CARD_PACK_CONTRACT_ADDRESS, data: calldata })

          // If relayer returned an object with wait(), await confirmation
          if (relayed && typeof relayed === "object" && typeof (relayed as any).wait === "function") {
            await (relayed as any).wait()
          }

          // If relayer returned a tx hash string or an object with { hash }, wait for receipt
          if (typeof relayed === "string") {
            await waitForReceipt(relayed)
          } else if (relayed && typeof relayed === "object" && "hash" in relayed && typeof (relayed as any).hash === "string") {
            await waitForReceipt((relayed as any).hash)
          }

          pending.update({ title: "Card sold", description: `Sold for ${formatEther(cardValue)} ETH` })
        } catch (err) {
          pending.update({ title: "Sell failed", description: String((err as Error)?.message ?? err), variant: 'destructive' })
        }
      }

      // refresh contract balance in profile
      try {
        await refetch()
      } catch {
        // ignore
      }

      setTimeout(() => {
        router.push("/profile")
      }, 1200)
    } catch (error) {
      console.error("Error selling card:", error)
      toast({ title: "Sell failed", description: String((error as Error)?.message ?? error) })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-blue-50/30 to-background dark:via-blue-950/10 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
          <h2 className="text-2xl font-bold">Opening your pack...</h2>
          <p className="text-muted-foreground">Preparing your 3 mystery cards</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-blue-50/30 to-background dark:via-blue-950/10">
  {/* SnowEffect removed per user request */}

      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.push("/")} className="mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Packs
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Card</h1>
          <p className="text-muted-foreground text-lg">Pick 1 card out of 3 to reveal and claim</p>
        </div>

        {cards && <CardReveal cards={cards} onSellCard={handleSellCard} isSelling={isPending} />}
      </div>
    </div>
  )
}

export default function OpenPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      }
    >
      <OpenPageContent />
    </Suspense>
  )
}
