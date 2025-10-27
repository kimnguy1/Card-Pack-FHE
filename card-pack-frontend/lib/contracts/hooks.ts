"use client"

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { CARD_PACK_ABI } from "./card-pack-abi"
import { CARD_PACK_CONTRACT_ADDRESS } from "./config"
import { parseEther } from "viem"

export function useCardPackContract() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const buyAndOpen = async (packType: number, price: string) => {
    return writeContract({
      address: CARD_PACK_CONTRACT_ADDRESS,
      abi: CARD_PACK_ABI,
      functionName: "buyAndOpen",
      args: [packType],
      value: parseEther(price),
    })
  }

  const sellLastOpened = async () => {
    return writeContract({
      address: CARD_PACK_CONTRACT_ADDRESS,
      abi: CARD_PACK_ABI,
      functionName: "sellLastOpened",
    })
  }

  const withdraw = async () => {
    return writeContract({
      address: CARD_PACK_CONTRACT_ADDRESS,
      abi: CARD_PACK_ABI,
      functionName: "withdraw",
    })
  }

  return {
    buyAndOpen,
    sellLastOpened,
    withdraw,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  }
}

export function useUserBalance(address?: `0x${string}`) {
  const { data: balance, refetch } = useReadContract({
    address: CARD_PACK_CONTRACT_ADDRESS,
    abi: CARD_PACK_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  return { balance: balance as bigint | undefined, refetch }
}

export function useLastOpened(address?: `0x${string}`) {
  const { data } = useReadContract({
    address: CARD_PACK_CONTRACT_ADDRESS,
    abi: CARD_PACK_ABI,
    functionName: "lastOpened",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  // `lastOpened` returns a struct: (uint256 value, bool opened)
  const parsed =
    data && Array.isArray(data)
    ? { value: data[0] as unknown as bigint, opened: Boolean(data[1]) }
      : undefined

  return { lastOpened: parsed as { value: bigint; opened: boolean } | undefined }
}
