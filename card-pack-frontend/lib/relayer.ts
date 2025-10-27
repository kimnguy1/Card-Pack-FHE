/* eslint-disable @typescript-eslint/no-explicit-any */
// Lightweight wrapper to create or get a Zama FHE Relayer instance.
// We dynamically import the SDK to avoid bundling it on the server when not needed.

export type RelayerInstance = any

let instance: RelayerInstance | null = null

export async function getRelayer() {
  if (instance) return instance

  // Read API key / config from environment. For client usage expose the key via NEXT_PUBLIC_
  const apiKey = process.env.NEXT_PUBLIC_ZAMA_RELAYER_API_KEY

  // Dynamically import the SDK at runtime from its web entry (per package exports)
  const sdk = await import('@zama-fhe/relayer-sdk/web')
  const { createInstance, SepoliaConfig } = (sdk as any)

  // SepoliaConfig may be a class or config object depending on SDK; try both patterns
  const config = typeof SepoliaConfig === 'function' ? new SepoliaConfig() : SepoliaConfig

  instance = createInstance({ config, apiKey })
  return instance
}

export async function relayTransaction({ to, data, value }: { to: string; data: string; value?: string | bigint }) {
  const relayer = await getRelayer()

  // SDKs vary in method name. Try common method names.
  const fn = (relayer as any).relayTransaction || (relayer as any).relay || (relayer as any).sendTransaction || (relayer as any).submitTransaction

  if (!fn || typeof fn !== "function") {
    throw new Error("Relayer instance does not expose a relay method")
  }

  // Call the relayer method. Many SDKs expect an object with to, data, value (value as string/hex)
  const payload: any = { to, data }
  if (typeof value !== "undefined") payload.value = typeof value === "bigint" ? value.toString() : value

  // Some relayers return an object with a wait() function, others return a tx hash.
  return await fn.call(relayer, payload)
}
