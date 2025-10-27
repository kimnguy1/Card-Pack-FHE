# Deploying Card Pack FHE (frontend) to Vercel

This file documents the minimal steps to deploy the `card-pack-frontend` app to Vercel.

Prerequisites
- A GitHub repository that contains this frontend folder (this repo).
- A Vercel account with access to import GitHub repositories.

Required environment variables
- NEXT_PUBLIC_SEPOLIA_RPC_URL — RPC endpoint for Sepolia (example: https://rpc.sepolia.org or an Alchemy/Infura HTTP URL)
- NEXT_PUBLIC_ZAMA_RELAYER_API_KEY — (optional) relayer API key if you want to enable the Zama relayer path

Steps
1. Push your changes to GitHub (this repo should have been pushed to `main`).
2. Open https://vercel.com, sign in, click "New Project" → "Import Git Repository" and choose this repository.
3. Vercel will auto-detect Next.js. In the Project Settings → Environment Variables, add the variables listed above.
   - For Preview and Production, set `NEXT_PUBLIC_SEPOLIA_RPC_URL` to your RPC provider.
   - Optionally add `NEXT_PUBLIC_ZAMA_RELAYER_API_KEY` if needed.
4. Click Deploy. The default build command `next build` and output directory will be used.

Notes
- If you prefer to use a custom branch, choose it during project import.
- If deployments fail, check Vercel build logs for TypeScript/ESLint errors and ensure env vars are set.

Local testing
- Run `npm run build` and `npm run dev` locally to verify before deploying.

Troubleshooting wallet/connect issues
- Make sure the browser environment used to test supports injected wallets (MetaMask/OKX extension installed).
- For mobile or wallets without injections, consider enabling a WalletConnect connector (not added by default in this project).

That's it — after you connect the repo and set the environment variables, Vercel should build and host the app.
