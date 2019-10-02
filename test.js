'use strict'

const test = require('tap').test
const path = require('path')
const spawn = require('child_process').spawn

const main = path.join(__dirname, require('./package').main)

test('crashes the process on unhandled rejection', (t) => {
  t.plan(2)

  const child = spawn(process.execPath, [
    '-r', main, '-e', 'Promise.reject(new Error(\'kaboom\'))'])

  child.stderr.on('data', function (chunk) {
    const expected = `Error: kaboom
    at [eval]:1:16`

    t.ok(chunk.toString().trim().indexOf(expected.trim()) === 0)
  })

  child.on('close', (code) => {
    t.is(code, 1)
  })
})

test('logs error', (t) => {
  t.plan(1)

  const child = spawn(process.execPath, ['-r', main, '-e', 'require("./make-promises-safe").logError = (err) => console.log("custom", err.message); Promise.reject(new Error(\'kaboom\'))'])

  child.stdout.on('data', function (chunk) {
    const expected = `custom kaboom`

    t.ok(chunk.toString().trim().indexOf(expected.trim()) === 0)
  })
})
