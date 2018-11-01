'use strict'

const test = require('tap').test
const path = require('path')
const spawn = require('child_process').spawn
const semver = require('semver')

const hasMultipleResolves = semver.satisfies(process.version, '>= 10.12.0')

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

test('crashes the process on double resolve', { skip: !hasMultipleResolves }, (t) => {
  t.plan(2)

  const child = spawn(process.execPath, [
    '-r', main, '-e', 'new Promise((r) => { r(); r(\'a\') })'])

  child.stderr.on('data', function (chunk) {
    const expected = 'resolve Promise { undefined } a'
    t.ok(chunk.toString().trim().indexOf(expected.trim()) === 0)
  })

  child.on('close', (code) => {
    t.is(code, 1)
  })
})

test('crashes the process on reject after resolve', { skip: !hasMultipleResolves }, (t) => {
  t.plan(2)

  const child = spawn(process.execPath, [
    '-r', main, '-e', 'new Promise((resolve, reject) => { resolve(); reject(new Error(\'kaboom\')) })'])

  child.stderr.on('data', function (chunk) {
    const expected = `reject Promise { undefined } Error: kaboom
    at Promise ([eval]:1:54)`
    t.ok(chunk.toString().trim().indexOf(expected.trim()) === 0)
  })

  child.on('close', (code) => {
    t.is(code, 1)
  })
})
