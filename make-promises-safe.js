'use strict'

const event = 'unhandledRejection'

process.on(event, function (err) {
  console.error(err)
  if (module.exports.abort) {
    process.abort()
  }
  process.exit(1)
})

module.exports.abort = false
