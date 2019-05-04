#!/usr/bin/env node
// TODO: Fix v8-compile-cache used with child_process.fork
require('v8-compile-cache')
const processId = process.argv[2] || 0
require('../setup-debug')
const debug = require('debug')(`compile-process-${processId}`)
debug('loading process')
preLoadDependencies()

const compile = require('./compile')


function preLoadDependencies() {
  // TODO: Remove unused dependencies
  debug('preloading dependencies')
  require('./compile')
  require("os")
  require('solc')
  require("semver")
  require('path')
  require('process')
  debug('dependencies loaded')
}


// receive message from master process
process.on('message', async (message) => {
  try {
    debug(`starting compilation ${new Date().toISOString()}`)

    const result = await compile(message.input)

    // send response to master process
    process.send({ result })
    debug(`compile result sent ${new Date().toISOString()}`)
  } catch (err) {
    debug('Error: %o', err)
  }
})

debug('process ready')