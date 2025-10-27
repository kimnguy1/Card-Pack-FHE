import { http, createConfig } from "wagmi"
import { sepolia } from "wagmi/chains"
import { injected } from "wagmi/connectors"

// Sepolia chain configuration
export const sepoliaChain = sepolia

// Use RPC from env if provided (NEXT_PUBLIC_SEPOLIA_RPC_URL) otherwise fall back
const rpcUrl = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://rpc.sepolia.org"

// Wagmi configuration
export const config = createConfig({
  chains: [sepolia],
  connectors: [injected({ target: "metaMask" }), injected({ target: "okxWallet" }), injected()],
  transports: {
    [sepolia.id]: http(rpcUrl),
  },
  ssr: true,
})
