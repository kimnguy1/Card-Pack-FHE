// Minimal shim for 'pino-pretty' used in some logger imports during bundling.
// This provides a no-op transform function to avoid bundling the real package in the client.

function pinoPretty() {
  return {
    write: function (s) {
      // no-op in browser
    },
  }
}

module.exports = pinoPretty
exports.default = pinoPretty
