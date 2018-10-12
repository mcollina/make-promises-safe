'use strict'

const http = require('http')
const fs = require('fs')
const server = http.createServer(handle)

server.listen(3000)

function handle (req, res) {
  openFile()
    .then((body) => {
      body.pipe(res)
    })
    .catch((err) => {
      res.statusCode = 500
      res.end(err.toString())
    })
}

function openFile () {
  return new Promise(function (resolve, reject) {
    if (Math.random() < 0.5) {
      // note that a deveveloper forgot to return
      reject(new Error('kaboom'))
    }

    // we are creating a file even if the promise errored,
    // and it is never consumed or closed
    resolve(fs.createReadStream(__filename))
  })
}
