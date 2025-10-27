export const CARD_PACK_ABI = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint8", name: "packType", type: "uint8" },
      { indexed: false, internalType: "uint8", name: "cardIndex", type: "uint8" },
      { indexed: false, internalType: "uint256", name: "cardValue", type: "uint256" },
    ],
    name: "CardOpened",
    type: "event",
  },
  { anonymous: false, inputs: [{ indexed: true, internalType: "address", name: "user", type: "address" }, { indexed: false, internalType: "uint256", name: "amount", type: "uint256" }], name: "CardSold", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, internalType: "address", name: "user", type: "address" }, { indexed: false, internalType: "uint256", name: "amount", type: "uint256" }], name: "Withdrawn", type: "event" },
  { inputs: [{ internalType: "uint8", name: "packType", type: "uint8" }], name: "getPackPrice", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "uint8", name: "packType", type: "uint8" }], name: "buyAndOpen", outputs: [], stateMutability: "payable", type: "function" },
  { inputs: [], name: "sellLastOpened", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "withdraw", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "address", name: "", type: "address" }], name: "balanceOf", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "address", name: "", type: "address" }], name: "lastOpened", outputs: [{ internalType: "bool", name: "exists", type: "bool" }, { internalType: "uint8", name: "packType", type: "uint8" }, { internalType: "uint8", name: "cardIndex", type: "uint8" }, { internalType: "uint256", name: "cardValue", type: "uint256" }], stateMutability: "view", type: "function" },
  { stateMutability: "payable", type: "receive" },
] as const
