/** @type {import('next').NextConfig} */
import path from "path"
import { fileURLToPath } from "url"
import { dirname } from "path"

const __dirname = dirname(fileURLToPath(import.meta.url))

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack(config) {
    // Provide shims for modules that are imported by some web3 SDKs but are
    // not available in the browser bundle environment.
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@react-native-async-storage/async-storage": path.resolve(__dirname, "shims/async-storage-shim.ts"),
      "pino-pretty": path.resolve(__dirname, "shims/pino-pretty-shim.js"),
    }

    return config
  },
}

export default nextConfig
