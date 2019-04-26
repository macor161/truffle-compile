const CompilerSupplier = require("./compilerSupplier")
const debug = require('debug')('compile-process')

//const cluster = require('cluster')

let solc

async function getSolc() {
  if (!solc) {
    const supplier = new CompilerSupplier()
    solc = await supplier.load()
  }
  return solc
}

async function compile(input) {
    

    debug(`getSupplier: `)

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

    //for (const key in message.input.sources)
    //  debug(`k${message.p}: ${key}`)

    const result = await compile(message.input);


    
    // send response to master process
    process.send({ result });
   } catch(err) {
     debug('Error: %o', err)
   }
 })

 getSolc()