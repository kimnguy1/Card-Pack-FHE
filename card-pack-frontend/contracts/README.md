# Card Pack FHE Smart Contract

## Deployment Instructions

1. Install Hardhat or Foundry for contract deployment
2. Deploy the `CardPackFHE.sol` contract to Sepolia testnet
3. Update the contract address in `lib/contracts/config.ts`

## Contract Features

- Three pack types with different prices (0.001, 0.01, 0.1 ETH)
- Random card generation with specified probabilities
- User balance system for selling cards
- Withdrawal functionality

## Deployment Command (Hardhat)

\`\`\`bash
npx hardhat run scripts/deploy.ts --network sepolia
\`\`\`

## Deployment Command (Foundry)

\`\`\`bash
forge create --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY contracts/CardPackFHE.sol:CardPackFHE
\`\`\`

After deployment, update `CARD_PACK_CONTRACT_ADDRESS` in `lib/contracts/config.ts` with the deployed contract address.
