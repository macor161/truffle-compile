const debug = require("debug")('compiler')
const CompilerSupplier = require("./compilerSupplier")

//const cluster = require('cluster')

const DEFAULT_OPTIONS = { 
  settings: { 
    optimizer: { enabled: true, runs: 200 },
    evmVersion: undefined 
  } 
}

module.exports = async function(input) {
    debug(`loading supplier`)
    const supplier = new CompilerSupplier(DEFAULT_OPTIONS)
    solc = await supplier.load()
    debug(`start`)

    const result = solc.compile(JSON.stringify(input))
    const parsedResult = JSON.parse(result)
    debug(`done`)
    return parsedResult     
}