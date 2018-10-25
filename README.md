# make-promises-safe &nbsp;&nbsp;[![Build Status](https://travis-ci.org/mcollina/make-promises-safe.svg?branch=master)](https://travis-ci.org/mcollina/make-promises-safe)

A node.js module to make the use of promises safe.
It implements:

1.  the deprecation [DEP0018][unhandled] of Node.js in versions >= 6, as
    using Promises without this module might cause file descriptor and memory
    leak; follow [this](#unhandledRejection) for more details.
2.  exiting on multiple resolve or reject, as those could hide bugs that
    will be completely silent; follow [this](#multipleResolves) for more
    details.

## Install

```
npm install make-promises-safe --save
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

### with core dumps

You can also create a core dump when an unhandled rejection occurs:

```
require('make-promises-safe').abort = true
```

<a name="unhandledRejection"></a>
## The 'unhandledRejection' problem

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

### The Solution

`make-promises-safe` installs an [`process.on('unhandledRejection')`][unhandled-event]
handler that prints the stacktrace and exits the process with an exit
code of 1, just like any uncaught exception.

<a name="multipleResolves"></a>
## Promises that resolves or rejects multiple times

Promises whose `resolve` or `reject` functions are called multiple times
might cause memory or file descriptor leaks, as resource might not be
consumed correctly.

As an example, the following code will error with a EMFILE:

```js
const http = require('http')
const fs = require('fs')
const stream = require('stream')
const { promisify } = require('util')
const pipeline = promisify(stream.pipeline)
const server = http.createServer(handle)

server.listen(3000)

function handle (req, res) {
  openFile()
    .then((body) => {
      return pipeline(body, res)
    })
    .catch((err) => {
      res.statusCode = 500
      res.end(err.toString())
    })
}

function openFile () {
  return new Promise(function (resolve, reject) {
    // this simulates some other parts of the codebase that
    // could throw an error
    if (Math.random() < 0.5) {
      // note that a deveveloper forgot to return
      reject(new Error('kaboom'))
    }

    // we are creating a file even if the promise errored,
    // and it is never consumed or closed
    resolve(fs.createReadStream(__filename))
  })
}
```

Under load, the above script will exits with an EMFILE error that would
be extremely hard to debug.

### The Solution

`make-promises-safe` installs an [`process.on('multipleResolves')`][multiple-event]
handler that prints the type of event, the promise and the reason
(the value that `resolve` or `reject` were called with)
and exits the process with an exit code of 1.

This feature is available only on Node >= 10.12.0.

## License

MIT

[unhandled]: https://nodejs.org/dist/latest-v8.x/docs/api/deprecations.html#deprecations_dep0018_unhandled_promise_rejections
[unhandled-event]: https://nodejs.org/dist/latest-v10.x/docs/api/process.html#process_event_unhandledrejection
[multiple-event]: https://nodejs.org/dist/latest-v10.x/docs/api/process.html#process_event_multipleresolves
