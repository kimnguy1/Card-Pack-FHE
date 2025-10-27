# Card Pack FHE — Frontend

A small Next.js frontend for the Card Pack FHE dApp. This project is the user-facing application for buying mystery "card packs", opening them to reveal a single card, selling that card back to the smart contract, and withdrawing accumulated ETH.

This README documents how to run, test and understand the frontend and how it connects to the deployed smart contracts on Sepolia testnet.

## What this project contains

- A Next.js 15 frontend (React 18 + TypeScript) with Tailwind CSS and Radix UI components.
- Web3 integrations using wagmi + viem for wallet connectivity and on-chain writes.
- A client-side wrapper for the Zama FHE relayer SDK (optional) to demonstrate relayed (gasless) transactions.
- Pages:
  - `/` — pack listing and purchase UI
  - `/open` — pack opening and card selection (sell)
  - `/profile` — user balance and withdraw flow

## Key features

- Wallet connect/disconnect and chain switching to Sepolia.
- Three pack tiers with different prices and rarity probabilities:
  - Small: 0.001 ETH
  - Medium: 0.01 ETH
  - Large: 0.1 ETH
- Single-card-open-per-pack UX. After purchase an on-chain `CardOpened` event is emitted and the frontend reacts to it.
- Immediate sell flow: user can sell the revealed card back to the contract. The frontend will try to use the Zama relayer (client-side wrapper) first and fall back to a wallet-signed transaction.
- Withdraw flow to collect accumulated ETH from the contract (owner or allowed account per contract logic).

## Deployed Contracts (Sepolia)

> These addresses were used when wiring the frontend during development.

- FlipCardStore: `0x3E948fDFeFF5C435eaff8390bb221e25dA8A8b27`
- FHECounter: `0x6dc57A4A49369f307588865e6A943dEA0E1c3608`

If you deploy your own contracts, update `lib/contracts/config.ts` to point to your addresses.

## Prerequisites

- Node.js 20+ (the template was developed and tested on Node 20)
- npm (or yarn/pnpm)
- A browser wallet (MetaMask) configured for Sepolia (or a provider URL via `NEXT_PUBLIC_SEPOLIA_RPC_URL`).

## Important environment variables

Create a `.env.local` in `card-pack-frontend` (or set env vars in your environment):

- `NEXT_PUBLIC_SEPOLIA_RPC_URL` — (optional) Sepolia JSON-RPC endpoint used by the client provider when no wallet is present.
- `NEXT_PUBLIC_ZAMA_RELAYER_API_KEY` — (optional) Zama relayer API key if you want the frontend to attempt client-side relayed transactions. Note: exposing this key client-side is NOT secure for production; prefer a server-side relayer endpoint.

Example `.env.local` (DO NOT COMMIT):

```env
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/<INFURA_KEY>
This frontend README was consolidated into the repository root `README.md` to avoid duplication.
Please see `/README.md` for the canonical documentation and deployment instructions.
