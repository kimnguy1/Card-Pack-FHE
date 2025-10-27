"use client"

import { useAccount, useConnect, useDisconnect, useBalance, useSwitchChain, useSignMessage } from "wagmi"
import { sepolia } from "wagmi/chains"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Wallet, ChevronDown, LogOut, RefreshCw, User } from "lucide-react"
import { useEffect, useState } from "react"
import { formatEther } from "viem"
import { useRouter } from "next/navigation"

export function WalletConnectButton() {
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const { data: balance } = useBalance({ address })
  const { signMessage } = useSignMessage()
  const [showWalletSelect, setShowWalletSelect] = useState(false)
  const router = useRouter()

  const needsChainSwitch = isConnected && chain?.id !== sepolia.id

  useEffect(() => {
    if (isConnected && address) {
      const signatureKey = `wallet_signed_${address.toLowerCase()}`
      const hasSigned = localStorage.getItem(signatureKey)

      if (!hasSigned) {
        signMessage(
          {
            message: `Welcome to Card Pack FHE!\n\nPlease sign this message to verify your wallet ownership.\n\nWallet: ${address}\nTimestamp: ${new Date().toISOString()}`,
          },
          {
            onSuccess: () => {
              localStorage.setItem(signatureKey, "true")
            },
          },
        )
      }
    }
  }, [isConnected, address, signMessage])

  // allow connector to be any connector type from wagmi
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleConnect = async (connector: any) => {
    try {
      // log for debugging in browser console
      // eslint-disable-next-line no-console
      console.debug("attempting connect", connector?.id, connector?.name)

      // connectors can be unavailable (not installed) - guard
      if (connector && connector.ready === false) {
        // eslint-disable-next-line no-alert
        alert(`${connector.name} is not available in this browser. Please install the extension or use a different wallet.`)
        setShowWalletSelect(false)
        return
      }

      // Wagmi's connect may return a promise; await to catch errors
  await connect({ connector })
      setShowWalletSelect(false)
    } catch (err) {
      // show a visible message and log full error for debugging
      // eslint-disable-next-line no-console
      console.error("wallet connect error", err)
      // eslint-disable-next-line no-alert
      alert(`Failed to connect wallet: ${(err as Error)?.message ?? String(err)}`)
      setShowWalletSelect(false)
    }
  }

  const handleSwitchToSepolia = () => {
    switchChain({ chainId: sepolia.id })
  }

  const handleDisconnect = () => {
    if (address) {
      const signatureKey = `wallet_signed_${address.toLowerCase()}`
      localStorage.removeItem(signatureKey)
    }
    disconnect()
  }

  if (!isConnected) {
    return (
      <DropdownMenu open={showWalletSelect} onOpenChange={setShowWalletSelect}>
        <DropdownMenuTrigger asChild>
          <Button className="gap-2">
            <Wallet className="h-4 w-4" />
            Connect Wallet
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Select Wallet</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {connectors.map((connector) => (
            <DropdownMenuItem
              key={connector.id}
              onClick={() => handleConnect(connector)}
              className="cursor-pointer"
              disabled={connector.ready === false}
              title={connector.ready === false ? `${connector.name} not available` : undefined}
            >
              {connector.name}
              {connector.ready === false ? " (not available)" : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (needsChainSwitch) {
    return (
      <Button onClick={handleSwitchToSepolia} variant="destructive" className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Switch to Sepolia
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Wallet className="h-4 w-4" />
          <div className="flex flex-col items-start mr-2">
            <span className="text-xs font-mono">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
            {balance && (
              <span className="text-xs text-muted-foreground">
                {Number.parseFloat(formatEther(balance.value)).toFixed(4)} ETH
              </span>
            )}
          </div>

          {/* Chain badge (always visible) */}
          <div className="flex items-center px-2 py-1 rounded-md bg-muted/30 text-xs font-medium mr-2">
            <span>{chain?.name ?? 'Unknown'}</span>
          </div>

          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Wallet Connected</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => switchChain?.({ chainId: sepolia.id })} className="cursor-pointer">
          <RefreshCw className="mr-2 h-4 w-4" />
          Switch to Sepolia
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void router.push("/profile")} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          View Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDisconnect} className="cursor-pointer text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
