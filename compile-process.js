require('v8-compile-cache')
// TODO: Fix v8-compile-cache used with child_process.fork
require('./setup-debug')
const debug = require('debug')('compile-process')
const CompilerSupplier = require("./compilerSupplier")

preLoadDependencies()

const DEFAULT_OPTIONS = {
  settings: {
    optimizer: { enabled: true, runs: 200 },
    evmVersion: undefined
  }
}


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


async function compile(input) {
  debug('Loading solc')
  const supplier = new CompilerSupplier(DEFAULT_OPTIONS)
  const solc = await supplier.load()
  debug('solc loaded')

  debug('compiling')
  //console.log('input: ', input)
  const result = solc.compile(JSON.stringify(input))
  const parsedResult = JSON.parse(result)
  debug('done')
  //console.log('output: ', JSON.parse(result))
  return parsedResult

}

// receive message from master process
process.on('message', async (message) => {
  try {
    debug(`starting compilation ${message.p}`)

    const result = await compile(message.input)

    // send response to master process
    process.send({ result })
  } catch (err) {
    debug('Error: %o', err)
  }
})

