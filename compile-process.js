//require('v8-compile-cache')
const debug = require('debug')('compile-process')
debug('loading process')
const CompilerSupplier = require("./compilerSupplier")

//const cluster = require('cluster')

const DEFAULT_OPTIONS = { 
  settings: { 
    optimizer: { enabled: true, runs: 200 },
    evmVersion: undefined 
  } 
}


let solc

async function getSolc() {
  if (!solc) {
    debug('Loading solc')
    const supplier = new CompilerSupplier(DEFAULT_OPTIONS)
    solc = await supplier.load()
    debug('solc loaded')
  }
  return solc
}

async function compile(input) {    
    const solc = await getSolc()

    debug('compiling')
    //console.log('input: ', input)
    const result = solc.compile(JSON.stringify(input))
    //console.log('output: ', JSON.parse(result))
    return JSON.parse(result)

 }
 
 // receive message from master process
 process.on('message', async (message) => {
   try {
    debug(`starting compilation ${message.p}`)

    const result = await compile(message.input);
    
    // send response to master process
    process.send({ result });
   } catch(err) {
     debug('Error: %o', err)
   }
 })

 getSolc()