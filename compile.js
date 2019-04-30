const debug = require('debug')('compile-process')
const CompilerSupplier = require("./compilerSupplier")

const DEFAULT_OPTIONS = {
  settings: {
    optimizer: { enabled: true, runs: 200 },
    evmVersion: undefined
  }
}



module.exports = async function compile(input, compilerOptions = DEFAULT_OPTIONS) {
    debug('Loading solc')
    const supplier = new CompilerSupplier(compilerOptions)
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