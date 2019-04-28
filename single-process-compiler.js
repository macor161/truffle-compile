const debug = require("debug")("compile")
const CompilerSupplier = require("./compilerSupplier")

//const cluster = require('cluster')

const DEFAULT_OPTIONS = { 
  settings: { 
    optimizer: { enabled: true, runs: 200 },
    evmVersion: undefined 
  } 
}

module.exports = async function(input) {
    const supplier = new CompilerSupplier(DEFAULT_OPTIONS)
    solc = await supplier.load()

    debug(`compiling`)
    //console.log('input: ', input)
    const result = solc.compile(JSON.stringify(input))
    //console.log('output: ', JSON.parse(result))
    debug(`compile successful`)
    const parsedResult = JSON.parse(result)
    return parsedResult     
}