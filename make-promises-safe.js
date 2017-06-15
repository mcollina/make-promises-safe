'use strict'

const event = 'unhandledRejection'

if (process.listenerCount(event) === 0) {
  setup()
}

function setup () {
  process.on(event, function (err) {
    console.error(err)
    process.exit(1)
  })
}
