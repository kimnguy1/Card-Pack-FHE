/* eslint-disable @typescript-eslint/no-explicit-any */
// Server-side relayer wrapper — uses a server-only env var ZAMA_RELAYER_API_KEY
// This should only be imported/used on the server. Avoid exposing the API key to the client.

// Keep as unknown to avoid explicit `any` while conveying this is a runtime value
let serverInstance: unknown | null = null

export async function getServerRelayer() {
  if (serverInstance) return serverInstance

  const apiKey = process.env.ZAMA_RELAYER_API_KEY
  if (!apiKey) {
    throw new Error('Missing server ZAMA_RELAYER_API_KEY environment variable')
  }

  // The relayer SDK may export different entry paths depending on the package exports.
  // Import the server/node entrypoint explicitly to avoid bundler dynamic import warnings.
  // The package.json of @zama-fhe/relayer-sdk exposes a "./node" export which maps to the
  // server build (`lib/node.js`). Use that fixed specifier so webpack can statically analyze it.
  let sdk: unknown
    try {
      // Use a dynamic require via eval to avoid bundlers statically analyzing this import.
      // This keeps the server-only SDK out of the client bundle and avoids package-export
      // resolution issues during build.
      // eslint-disable-next-line no-eval
      const req: any = eval("typeof require !== 'undefined' ? require : undefined")
      if (!req) throw new Error('require is not available')
      try {
        sdk = req('@zama-fhe/relayer-sdk/node')
      } catch {
        // Try package root as a fallback
        sdk = req('@zama-fhe/relayer-sdk')
      }
    } catch (e) {
      throw new Error(`Failed to require @zama-fhe/relayer-sdk: ${String(e)}`)
    }

    const sdkAny: any = sdk
    const { createInstance, SepoliaConfig } = sdkAny
    const config = typeof SepoliaConfig === 'function' ? new SepoliaConfig() : SepoliaConfig
    serverInstance = createInstance({ config, apiKey })
  return serverInstance
}
