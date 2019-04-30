require('v8-compile-cache')
// TODO: Fix v8-compile-cache used with child_process.fork
require('./setup-debug')
const debug = require('debug')('compile-process')
debug('loading process')
const compile = require('./compile')

preLoadDependencies()


function preLoadDependencies() {
  // TODO: Remove unused dependencies
  debug('preloading dependencies')
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
    debug('compile result sent')
  } catch (err) {
    debug('Error: %o', err)
  }
})

