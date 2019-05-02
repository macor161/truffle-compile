const debug = require("debug")("multiprocess-compiler")
const { cpus } = require('os')

const Worker = require('./worker')
const workers = initWorkers()

module.exports = function(solcStandardInput) {

    return new Promise((res, rej) => {
        debug('start')
                
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
    
        
        debug(`sending input ${new Date().toISOString()}`)

        workers[0].addInput(input1.input)
        workers[1].addInput(input2.input)



        Promise.all(workers
                .filter(worker => worker.hasInput())
                .map(worker => worker.compile())
            )
            .then(results => {
                const result = results[0]
                result.sources = { ...result.sources, ...results[1].sources }
                result.errors = result.errors.concat(results[1].errors)
                result.contracts = { ...result.contracts, ...results[1].contracts }
                res(result) 
                workers.forEach(worker => worker.close())
            })
   
    })

}

/**
 * Returns as many workers as cpu available.
 * First worker is not creating a child process.
 */
function initWorkers() {
    return cpus()
        .map((cpu, index) => {
            return index === 0 
                ? new Worker({ childProcess: false })
                : new Worker({ childProcess: true })
        })
}