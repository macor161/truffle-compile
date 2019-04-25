require('v8-compile-cache')
const CompilerSupplier = require("./compilerSupplier")
const debug = require('debug')('compile-process')
//const cluster = require('cluster')

async function compile(input) {
    const supplier = new CompilerSupplier()

    debug(`getSupplier: `)

    return supplier
    .load()
    .then(solc => {
      debug('compiling')
      const result = solc.compile(JSON.stringify(input))
      return JSON.parse(result)
    })
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