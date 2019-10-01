'use strict'

const event = 'unhandledRejection'

process.on(event, function (err) {
  module.exports.logError(err)
  if (module.exports.abort) {
    process.abort()
  }
  process.exit(1)
})

module.exports.abort = false

module.exports.logError = console.error
