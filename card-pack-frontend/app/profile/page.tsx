"use client"

import { useAccount, useBalance } from "wagmi"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
// SnowEffect removed per user request
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { useUserBalance, useCardPackContract } from "@/lib/contracts/hooks"
import { toast } from "@/hooks/use-toast"
import { formatEther } from "viem"
import { ArrowLeft, Wallet, TrendingDown, Snowflake } from "lucide-react"
import { useWatchContractEvent } from "wagmi"
import { CARD_PACK_ABI } from "@/lib/contracts/card-pack-abi"
import { CARD_PACK_CONTRACT_ADDRESS } from "@/lib/contracts/config"
import { Separator } from "@/components/ui/separator"

export default function ProfilePage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const { data: walletBalance } = useBalance({ address })
  const { balance: contractBalance, refetch } = useUserBalance(address)
  const { withdraw, isPending, isSuccess } = useCardPackContract()

  useEffect(() => {
    if (!isConnected) {
      void router.push("/")
    }
  }, [isConnected, router])

  useEffect(() => {
    if (isSuccess) {
      void refetch()
    }
  }, [isSuccess, refetch])

  // Also watch for CardSold events and refresh user's balance when a sale is observed.
  useWatchContractEvent({
    address: CARD_PACK_CONTRACT_ADDRESS,
    abi: CARD_PACK_ABI,
    eventName: 'CardSold',
    onLogs(logs) {
      const log = logs[0]
      if (log && log.args && log.args.user === address) {
        void refetch()
      }
    },
  })

  const handleWithdraw = async () => {
    if (!contractBalance || contractBalance === 0n) {
      alert("No balance to withdraw")
      return
    }

    try {
      const pending = toast({ title: 'Transaction pending', description: 'Please confirm the transaction in your wallet...' })

      const tx = await withdraw()

        // If tx object supports wait(), wait for confirmation and update toast
        const hasWait = (o: unknown): o is { wait: () => Promise<unknown> } =>
          typeof o === 'object' && o !== null && 'wait' in o && typeof (o as Record<string, unknown>).wait === 'function'

        if (hasWait(tx)) {
          try {
            await tx.wait()
          // update pending toast to confirmed
          pending.update({
            title: 'Withdrawal confirmed',
            description: `You withdrew ${Number.parseFloat(formatEther(contractBalance)).toFixed(4)} ETH.`,
          })
        } catch (err) {
          // update pending toast to failed
          pending.update({
            title: 'Withdrawal failed',
            description: String((err as Error)?.message ?? err),
          })
        }
      } else {
        // if we cannot wait, mark as submitted
        pending.update({
          title: 'Withdrawal submitted',
          description: `You withdrew ${Number.parseFloat(formatEther(contractBalance)).toFixed(4)} ETH.`,
        })
      }
    } catch (error) {
      console.error("Error withdrawing:", error)
      // show error toast
      toast({ title: 'Withdrawal failed', description: String((error as Error)?.message ?? error) })
    }
  }

  if (!isConnected) {
    return null
  }

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

      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.push("/")} className="mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border-4 border-primary/20">
              <Wallet className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Your Profile</h1>
              <p className="text-muted-foreground font-mono text-sm">
                {address?.slice(0, 10)}...{address?.slice(-8)}
              </p>
            </div>
          </div>

          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Wallet Balance */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  Wallet Balance
                </CardTitle>
                <CardDescription>Your ETH balance in wallet</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-4xl font-bold text-primary">
                    {walletBalance ? Number.parseFloat(formatEther(walletBalance.value)).toFixed(4) : "0.0000"}
                  </p>
                  <p className="text-sm text-muted-foreground">ETH</p>
                </div>
              </CardContent>
            </Card>

            {/* Contract Balance */}
            <Card className="border-2 border-accent/50 bg-accent/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-accent" />
                  Available Balance
                </CardTitle>
                <CardDescription>Earnings from sold cards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-4xl font-bold text-accent">
                      {contractBalance ? Number.parseFloat(formatEther(contractBalance)).toFixed(4) : "0.0000"}
                    </p>
                    <p className="text-sm text-muted-foreground">ETH</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="space-y-2 w-full">
                  <Button
                    onClick={handleWithdraw}
                    disabled={!contractBalance || contractBalance === 0n || isPending}
                    className="w-full"
                    size="lg"
                  >
                    {isPending
                      ? "Withdrawing..."
                      : contractBalance && contractBalance > 0n
                      ? `Withdraw ${Number.parseFloat(formatEther(contractBalance)).toFixed(4)} ETH`
                      : "Withdraw to Wallet"}
                  </Button>

                  <div className="flex items-center justify-between">
                    <button onClick={() => void refetch()} className="text-sm text-muted-foreground underline">
                      Refresh balance
                    </button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>

          <Separator />

          {/* Info Section */}
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">1. Buy Card Packs</h3>
                <p className="text-muted-foreground">
                  Purchase mystery card packs using ETH on Sepolia testnet. Choose from three different pack types with
                  varying prices and rewards.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg">2. Reveal Your Cards</h3>
                <p className="text-muted-foreground">
                  Each pack contains 3 random cards with different values. Click to flip and reveal your cards. Rarity
                  determines the card value.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg">3. Sell Cards</h3>
                <p className="text-muted-foreground">
                  Sell your cards instantly for their ETH value. The earnings are added to your available balance in the
                  smart contract.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg">4. Withdraw Earnings</h3>
                <p className="text-muted-foreground">
                  Withdraw your available balance to your wallet anytime. The ETH will be transferred directly to your
                  connected wallet address.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => void router.push("/")} size="lg" className="px-8">
              Open More Packs
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
