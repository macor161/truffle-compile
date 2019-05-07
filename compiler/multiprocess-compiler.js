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
                
        debug('Generating dependency tree')

        const dependencyTree = new DependencyTree()
        
        for (const key in solcStandardInput.sources) {
            //debug(`adding ${key} to dep tree`)
            dependencyTree.addFile(solcStandardInput.sources[key])
            //debug(`leafs: %o`, dependencyTree.getLeafs().map(f => f.path))    
            //debug(`miss dep: %o`, dependencyTree._filesWithMissingDependencies.map(f => f.path))    
        }
        


        debug('creating work batches')
        const batches = dispatchWork(dependencyTree, cpus.length)

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