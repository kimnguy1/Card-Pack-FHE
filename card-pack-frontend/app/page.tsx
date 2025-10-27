/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { WalletConnectButton } from "@/components/wallet-connect-button"
import { PackCard } from "@/components/pack-card"
import { useAccount } from "wagmi"
import { useCardPackContract } from "@/lib/contracts/hooks"
import { PACK_TYPES, PACK_PRICES, PACK_NAMES, CARD_THEMES } from "@/lib/contracts/config"
import { CARD_PACK_ABI } from "@/lib/contracts/card-pack-abi"
import { CARD_PACK_CONTRACT_ADDRESS } from "@/lib/contracts/config"
import { encodeFunctionData, parseEther } from "viem"
import { relayTransaction } from "@/lib/relayer"
import { waitForReceipt } from "@/lib/wait-for-receipt"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { Snowflake } from "lucide-react"

export default function HomePage() {
  const { isConnected } = useAccount()
  const { buyAndOpen, isPending } = useCardPackContract()
  const [openingPack, setOpeningPack] = useState<number | null>(null)
  const router = useRouter()

  const handleOpenPack = async (packType: number) => {
    if (!isConnected) {
      alert("Please connect your wallet first")
      return
    }

    try {
      setOpeningPack(packType)
      const price = PACK_PRICES[packType as keyof typeof PACK_PRICES]

      // show pending toast prompting wallet/relayer
      const pending = toast({
        title: "Processing purchase",
        description: `Attempting to buy ${PACK_NAMES[packType as keyof typeof PACK_NAMES]}...`,
      })

      // Prepare calldata for buyAndOpen(packType)
      const calldata = encodeFunctionData({ abi: CARD_PACK_ABI as any, functionName: "buyAndOpen", args: [packType] })
      const value = parseEther(price)

      // Try to use relayer first (client-side). If it fails, fallback to direct wallet write.
      try {
        const relayed = await relayTransaction({ to: CARD_PACK_CONTRACT_ADDRESS, data: calldata, value })

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

        pending.update({ id: pending.id, title: "Pack relayed", description: `${PACK_NAMES[packType as keyof typeof PACK_NAMES]} purchase relayed.` })
      } catch {
        // Fallback to direct wallet call if relayer unavailable or failed
        try {
          const tx = await buyAndOpen(packType, price)
          if (tx && typeof tx === "object" && ("wait" in (tx as any)) && typeof (tx as any).wait === "function") {
            await (tx as any).wait()
          }
          pending.update({ id: pending.id, title: "Pack confirmed", description: `${PACK_NAMES[packType as keyof typeof PACK_NAMES]} purchase confirmed.` })
        } catch (err) {
          pending.update({ id: pending.id, title: "Purchase failed", description: String((err as Error)?.message ?? err), variant: "destructive" })
          throw err
        }
      }

      // Navigate to opening page
      router.push(`/open?pack=${packType}`)
    } catch (error) {
      console.error("Error opening pack:", error)
      toast({ title: "Purchase failed", description: String((error as Error)?.message ?? error) })
    } finally {
      setOpeningPack(null)
    }
  }

  const packs = [
    {
      type: PACK_TYPES.POKEMON_SMALL,
      title: PACK_NAMES[PACK_TYPES.POKEMON_SMALL],
      description: "Catch rare Pokemon cards with winter variants",
      price: PACK_PRICES[PACK_TYPES.POKEMON_SMALL],
      theme: CARD_THEMES[PACK_TYPES.POKEMON_SMALL],
    },
    {
      type: PACK_TYPES.ONE_PIECE_MED,
      title: PACK_NAMES[PACK_TYPES.ONE_PIECE_MED],
      description: "Discover legendary pirates in the winter seas",
      price: PACK_PRICES[PACK_TYPES.ONE_PIECE_MED],
      theme: CARD_THEMES[PACK_TYPES.ONE_PIECE_MED],
    },
    {
      type: PACK_TYPES.ONE_PIECE_LARGE,
      title: PACK_NAMES[PACK_TYPES.ONE_PIECE_LARGE],
      description: "Unlock powerful large One Piece cards",
      price: PACK_PRICES[PACK_TYPES.ONE_PIECE_LARGE],
      theme: CARD_THEMES[PACK_TYPES.ONE_PIECE_LARGE],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-blue-50/30 to-background dark:via-blue-950/10">
  {/* SnowEffect removed per user request */}

      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Snowflake className="h-8 w-8 text-primary animate-spin-slow" />
            <h1 className="text-2xl font-bold text-balance">Card Pack FHE</h1>
          </div>

          <WalletConnectButton />
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-5xl font-bold mb-4 text-balance bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Winter Card Pack Mystery
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
          Open mystery card packs and discover rare winter-themed cards. Sell them instantly for ETH or collect them
          all!
        </p>
      </section>

      {/* Packs Grid */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {packs.map((pack) => (
            <PackCard
              key={pack.type}
              title={pack.title}
              description={pack.description}
              price={pack.price}
              theme={pack.theme as "pokemon" | "onepiece" | "naruto"}
              onOpen={() => handleOpenPack(pack.type)}
              disabled={!isConnected || isPending}
              isLoading={openingPack === pack.type}
            />
          ))}
        </div>
      </section>

      {/* Info Section */}
      {!isConnected && (
        <section className="container mx-auto px-4 pb-16">
          <div className="max-w-2xl mx-auto text-center p-8 rounded-lg bg-card border">
            <h3 className="text-2xl font-bold mb-4">Get Started</h3>
            <p className="text-muted-foreground mb-6">
              Connect your wallet to start opening card packs and winning ETH prizes on Sepolia testnet
            </p>
            <WalletConnectButton />
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Card Pack FHE - Winter Edition • Powered by Sepolia Testnet</p>
        </div>
      </footer>
    </div>
  )
}
