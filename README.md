# make-promises-safe

A node.js module to make the use of promises safe.

## The Problem

Node.js crashes if there is an uncaught exception, while it does not
crash if there is an `'unhandledRejection'`, i.e. a Promise without a
`.catch()` handler.

**If you are using promises, you should attach a `.catch()` handler
synchronously**.

As an example, the following server will leak a file descriptor because
of a missing `.catch()`  handler:

```js
const http = require('http')
const server = http.createServer(handle)

server.listen(3000)

function handle (req, res) {
  doStuff()
    .then((body) => {
      res.end(body)
    })
}

function doStuff () {
  if (Math.random() < 0.5) {
    return Promise.reject(new Error('kaboom'))
  }

  return Promise.resolve('hello world')
}
```

## The Solution

`make-promises-safe` installs an `process.on('unhandledRejection')`
handler that prints the stacktrace and exits the process with an exit
code of 1, just like any uncaught exception.

## Install

```
npm install make-promises-safe
```

## Usage

```js
'use strict'

require('make-promises-safe') // installs an 'unhandledRejection' handler
const http = require('http')
const server = http.createServer(handle)

server.listen(3000)

function handle (req, res) {
  doStuff()
    .then((body) => {
      res.end(body)
    })
}

function doStuff () {
  if (Math.random() < 0.5) {
    return Promise.reject(new Error('kaboom'))
  }

  return Promise.resolve('hello world')
}
```

### as a preloader

You can add this behavior to any Node.js application by using it as a
preloader:

```
node -r make-promises-safe server.js
```

## License

MIT
