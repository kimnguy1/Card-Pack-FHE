# Deploy to Sepolia — quick guide

This file explains how to deploy the contracts in this repository to the Sepolia testnet using Hardhat and the existing deploy scripts.

Prerequisites
- Node >= 20, npm installed
- An RPC provider for Sepolia (Infura, Alchemy, QuickNode, etc.) and a funded deployer account (mnemonic)

1) Prepare environment

 - Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
# Edit .env to add MNEMONIC, INFURA_API_KEY (or SEPOLIA_RPC_URL), ETHERSCAN_API_KEY
```

2) Install dependencies (once)

```bash
npm install
```

3) Compile locally

```bash
npm run compile
```

4) Deploy to Sepolia

This repo includes a deploy script `deploy/deploy.ts` which will deploy `FHECounter` and `FlipCardStore`.

```bash
# Uses the MNEMONIC and INFURA_API_KEY from .env
npm run deploy:sepolia
```

Note: `hardhat-deploy` will use `namedAccounts.deployer` from the mnemonic. If you prefer a specific private key, update `hardhat.config.ts` network `accounts` configuration or set `SEPOLIA_RPC_URL` to use a specific RPC + key.

5) Verify contracts (optional)

After deploy, copy the deployed address from the deploy logs and run:

```bash
# replace <ADDRESS> with the deployed contract address
npm run verify:sepolia -- <ADDRESS>
```

6) Running from GitHub Codespaces / CI

- If you're using GitHub Codespaces, add repository secrets (INFURA_API_KEY, MNEMONIC, ETHERSCAN_API_KEY) or create a `.devcontainer` that mounts the vars. Avoid adding the mnemonic to source control.
- In GitHub Actions, add the secrets to the repository and run the same deploy command in a job with Node setup.

Security & notes
- Do NOT paste your mnemonic into public chat or commit it. Use GitHub secrets or local `.env` only.
- The contract uses non-secure on-chain randomness (keccak256 with block data); do not use for real-money games.
- For production, consider VRF and stronger economics around payouts/reserves.
