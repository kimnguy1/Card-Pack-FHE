// Lightweight browser shim for @react-native-async-storage/async-storage
// Uses window.localStorage under the hood. Intended only for browser builds where the real
// react-native implementation is not available.

const AsyncStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return Promise.resolve(localStorage.getItem(key))
    } catch (e) {
      return Promise.resolve(null)
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value)
    } catch (e) {
      // noop
    }
    return Promise.resolve()
  },
  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key)
    } catch (e) {
      // noop
    }
    return Promise.resolve()
  },
  async clear(): Promise<void> {
    try {
      localStorage.clear()
    } catch (e) {
      // noop
    }
    return Promise.resolve()
  },
}

export default AsyncStorage
module.exports = AsyncStorage
