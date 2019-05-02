const debug = require('debug')('worker')
const compile = require('./compile')

const DEFAULT_OPTIONS = {
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: undefined
    }
}

module.exports = class Worker {

    constructor({ childProcess = true, compilerOptions } = {}) {
        this.isChildProcess = childProcess
        this.compilerOptions = compilerOptions
        this.input = {}

        if (childProcess) {
            const { fork } = require('child_process')
            const path = require('path')
            this._process = fork(path.join(__dirname, 'compile-process.js'))
            this._compilePromise = new Promise((res, rej) => { 
                this._process.on('message', message => {            
                    this._process.kill()
                    debug('done')
                    res(message.result)            
                })
            })
        }
    }

    addInput(input) {
        this.input = { ...this.input, ...input }
    }

    async compile(compilerOptions = DEFAULT_OPTIONS) {
        return this.isChildProcess
            ? this._sendInputToProcess()
            : compile(this.input, compilerOptions)
    }

    _sendInputToProcess() {
        this._process.send({ input: this.input })
        return this._compilePromise
    }
}