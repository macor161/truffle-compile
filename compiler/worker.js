const loadCompile = require('./compile')

const DEFAULT_OPTIONS = {
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: undefined,
      outputSelection: {
        "*": {
            "": [
                "legacyAST",
                "ast"
            ],
            "*": [
                "abi",
                "metadata",
                "evm.bytecode.object",
                "evm.bytecode.sourceMap",
                "evm.deployedBytecode.object",
                "evm.deployedBytecode.sourceMap",
                "userdoc",
                "devdoc"
            ]
        }
    }
  }
}

module.exports = class Worker {

    constructor({ childProcess = true, compilerOptions, id } = {}) {
        this.isChildProcess = childProcess
        this.compilerOptions = compilerOptions
        this.id = id
        this.branches = []
        this.input = {
            language: 'Solidity',
            settings: DEFAULT_OPTIONS.settings,
            sources: null
        }
        this._debug = require('debug')(`worker-${id}`)
        this._compile = loadCompile(this._debug)

        if (childProcess) {
            const { fork } = require('child_process')
            const path = require('path')
            this._process = fork(path.join(__dirname, 'compile-process.js'), [id])
        }
    }

    addSource(sourceNode) {
        //debug('adding sourceNode %o', sourceNode.path)
        this.branches.push(sourceNode)
        this.input.sources = sourceNode.getNodes()
            .reduce((acc, dep) => {
                acc[dep.path] = { content: dep.content }
                return acc
            }, this.input.sources || {})

        //debug('sources: %o', this.input.sources)
    }

    hasSources() { return this.input.sources != null }

    close() {
        if (this._process && !this._process.killed)
            this._process.kill()            
    }

    async compile(compilerOptions = DEFAULT_OPTIONS) {
        this._debug('compiling %o', Object.keys(this.input.sources))
        this._debug(`time ${new Date().toISOString()}`)
        require('fs').writeFileSync(`./newinput-${this.id}.json`, JSON.stringify(this.input))

        const result = this.isChildProcess
            ? await this._sendInputToProcess()
            : await this._compile(this.input, compilerOptions)

        this._debug('compile done')
        return result
    }

    _sendInputToProcess() {
        return new Promise((res, rej) => {             
            this._process.on('message', message => {    
                this._debug(`result received ${new Date().toISOString()}`)
                res(message.result)            
                this._process.kill()
            })
            this._process.send({ input: this.input })
        })
    }
}