'use strict'

function install (event, cb) {
  if (process.listenerCount(event) !== 0) {
    return
  }

  process.on(event, cb)
}

install('unhandledRejection', function (err) {
  console.error(err)
  abortOrExit()
})

install('multipleResolves', function (type, promise, reason) {
  console.error(type, promise, reason)
  abortOrExit()
})

function abortOrExit () {
  if (module.exports.abort) {
    process.abort()
  }
  process.exit(1)
}

module.exports.abort = false
