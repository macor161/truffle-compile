//require('v8-compile-cache')
const debug = require('debug')('compile-process')
const CompilerSupplier = require("./compilerSupplier")

//const cluster = require('cluster')

const DEFAULT_OPTIONS = { 
  settings: { 
    optimizer: { enabled: true, runs: 200 },
    evmVersion: undefined 
  } 
}




async function compile(path) {    
    const supplier = new CompilerSupplier(DEFAULT_OPTIONS)
    solc = await supplier.load()

    const input = require(path)
    debug(`compiling`)
    //console.log('input: ', input)
    const result = solc.compile(JSON.stringify(input.input))
    //console.log('output: ', JSON.parse(result))
    debug(`compile successful`)
    const parsedResult = JSON.parse(result)
    return parsedResult
}
 
 // receive message from master process




 //compile('./inputs/input.json')

 console.log(require('os').cpus())