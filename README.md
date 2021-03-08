# make-promises-safe &nbsp;&nbsp;[![Build Status](https://travis-ci.org/mcollina/make-promises-safe.svg?branch=master)](https://travis-ci.org/mcollina/make-promises-safe)

### A Happy Note

If you are using Node.s version 15+, the correct promise behaviour is already implemented and Node.js will safely behave on unhandled rejections similarly to its uncaught exception behaviour. If you are only using Node.js v15+ there is no need to use this module.

If you need to support older versions of Node.js - it is a good idea to use this module to ensure future compatibility with modern Node.js versions where the safe behaviour is the default one.

## What this is

A node.js module to make the use of promises safe.
It implements the deprecation [DEP0018][unhandled] of Node.js in versions 6+.
Using Promises without this module might cause file descriptor and memory
leaks.

**It is important that this module is only used in top-level program code, not
in reusable modules!**

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

### With custom logging

You can add a custom logger to log errors in your own format. To do this override the `logError` property with a function that takes a single `Error` parameter. This defaults to `console.error`.

```
const makePromisesSafe = require('make-promises-safe');
makePromisesSafe.logError = function(err) {
  // log the err object
}
```

## License

MIT

[unhandled]: https://nodejs.org/dist/latest-v8.x/docs/api/deprecations.html#deprecations_dep0018_unhandled_promise_rejections
