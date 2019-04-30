const debug = require("debug")("multiprocess-compiler")
const { fork } = require('child_process')
const path = require('path')
const myProcess1 = fork(path.join(__dirname, 'compile-process.js'))
//const myProcess2 = fork('/home/mathew/workspace/eblocks/truffle-compile/compile-process.js')
const workers = []

module.exports = function(solcStandardInput) {

    //if (cluster.isMaster)
    return new Promise((res, rej) => {
        debug('start')
        const numCores = require('os').cpus().length
        debug(`nb of core: ${numCores}`)
        let result = null
                
        const p1 = ['openzeppelin-solidity/contracts/math/SafeMath.sol',
        'openzeppelin-solidity/contracts/token/ERC20/IERC20.sol',
        '/home/mathew/workspace/eblocks/eblocks/contracts/ERC20.sol',
        '/home/mathew/workspace/eblocks/eblocks/contracts/Test.sol']
        const p2 = ['/home/mathew/workspace/eblocks/eblocks/contracts/Migrations.sol',
        '/home/mathew/workspace/eblocks/eblocks/contracts/Test2.sol',
        '/home/mathew/workspace/eblocks/eblocks/contracts/Test3.sol',
        '/home/mathew/workspace/eblocks/eblocks/contracts/Test4.sol',]
        
    
        const input1 = { 
            input: {
                language: solcStandardInput.language,
                settings: solcStandardInput.settings,
                sources: p1.reduce((acc, v) => ({ ...acc, [v]: solcStandardInput.sources[v] }), {}),
            },
            p: 1
        }
        const input2 = { 
            input: {
                language: solcStandardInput.language,
                settings: solcStandardInput.settings,
                sources: p2.reduce((acc, v) => ({ ...acc, [v]: solcStandardInput.sources[v] }), {}),
            },
            p: 2
        }
    
    
    
        //myProcess1.send(input1)
        //myProcess2.send(input2)
    
        
        debug(`sending input ${new Date().toISOString()}`)
        myProcess1.send({ input: solcStandardInput })
    
        myProcess1.on('message', (message) => {
            
            myProcess1.kill()
            debug('done')
            res(message.result)
        
        })  
    
        // listen for messages from forked process
        /*
        myProcess1.on('message', (message) => {
            debug('process1 result')
            myProcess1.kill()
            if (!result) 
                result = message.result
            else {
                result.sources = { ...result.sources, ...message.result.sources }
                result.errors = result.errors.concat(message.result.errors)
                result.contracts = { ...result.contracts, ...message.result.contracts }
                res(result)
            }
        })
    
        myProcess2.on('message', (message) => {
            debug('process2 result')
            myProcess2.kill()
            if (!result) 
                result = message.result
            else {
                result.sources = { ...result.sources, ...message.result.sources }
                result.errors = result.errors.concat(message.result.errors)
                result.contracts = { ...result.contracts, ...message.result.contracts }
                res(result)
            }
        })  */
    
    })

}