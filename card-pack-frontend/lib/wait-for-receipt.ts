// Small helper to wait for a transaction receipt given a tx hash or an object with a `hash` field.
// Uses `window.ethereum.request('eth_getTransactionReceipt')` polling as a minimal provider-agnostic approach.
export async function waitForReceipt(input: string | { hash?: string } | undefined, timeoutMs = 120_000, pollInterval = 1500) {
  if (!input) throw new Error('No transaction hash provided')

  const hash = typeof input === 'string' ? input : input.hash
  if (!hash) throw new Error('No transaction hash found on input')

  if (typeof window === 'undefined') {
    // Not running in a browser environment; cannot poll via window.ethereum
    throw new Error('waitForReceipt requires a browser provider (window.ethereum)')
  }

  interface EIP1193Provider {
    request(args: { method: string; params?: unknown[] }): Promise<unknown>
  }

  const provider = (window as unknown as { ethereum?: EIP1193Provider }).ethereum
  if (!provider || typeof provider.request !== 'function') {
    throw new Error('No window.ethereum provider available')
  }

  const start = Date.now()

  // Recursive poll
  const poll = async (): Promise<unknown> => {
    const receipt = await provider.request({ method: 'eth_getTransactionReceipt', params: [hash] })
    if (receipt) return receipt
    if (Date.now() - start > timeoutMs) throw new Error('Timeout waiting for transaction receipt')
    await new Promise((r) => setTimeout(r, pollInterval))
    return poll()
  }

  return poll()
}
