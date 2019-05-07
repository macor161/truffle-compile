const debug = require("debug")("multiprocess-compiler")
const os = require('os')
const { DependencyTree } = require('../dependency-tree')
const cpus = os.cpus()
//const cpus = [1, 2]
const Worker = require('./worker')
const workers = initWorkers()
const { dispatchWork } = require('./dispatch-work')

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


        debug('Generating dependency tree')

        const dependencyTree = new DependencyTree()
        
        for (const key in solcStandardInput.sources) {
            //debug(`adding ${key} to dep tree`)
            dependencyTree.addFile(solcStandardInput.sources[key])
            //debug(`leafs: %o`, dependencyTree.getLeafs().map(f => f.path))    
            //debug(`miss dep: %o`, dependencyTree._filesWithMissingDependencies.map(f => f.path))    
        }
        
        /*
        for (const file of dependencyTree.getLeafs()) {
            //const file = dependencyTree._files[fileName]
            debug(`${file.path} deps: %o`, file.getAllDependencies().map(a => a.path))
        }*/
        /*
        for (const filename in dependencyTree._files) {
            const file = dependencyTree._files[filename]
            debug(`${file.path} deps: %o`, file.dependencies.map(a => a.path))
        }*/


        /*
        dependencyTree.getLeafs().forEach((node, index) => {
            workers[index % cpus.length].addSource(node)
        })*/

        debug('creating work batches')
        //const batches = dispatchWork(dependencyTree, cpus.length)
        const batches = dispatchWork(dependencyTree, 1)

        debug('dispatching batches to workers')
        for (const [i] of batches.entries()) {
            const batch = batches[i]
            const worker = workers[i]
            debug(`batch ${i} load: ${batch.workload()}`)

            for (const branch of batch.getBranches())
                worker.addSource(branch)
        }
    
        debug(`sending input ${new Date().toISOString()}`)



        Promise.all(workers
                .filter(worker => worker.hasSources())
                .map(worker => worker.compile())
            )
            .then(results => {
                debug('merging results')
                let result = results[0]
                //debug(`results ${0}: %o`, results[0])
                for(let i = 1; i < results.length; i++) {  
                    //debug(`results ${i}: %o`, results[i])                  
                    result.sources = { ...result.sources, ...(results[i].sources) }

                    if (results[i].errors)
                        result.errors = (result.errors || []).concat(results[i].errors)
                    
                    result.contracts = { ...result.contracts, ...(results[i].contracts) }
                }
                debug('results merged')
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
    return cpus
        .map((cpu, index) => {
            return index === 0 
                ? new Worker({ childProcess: false, id: index })
                : new Worker({ childProcess: true, id: index })
        })
}