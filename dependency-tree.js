/**
 * Dependency tree for a list of solidity files.
 * Instead of keeping references for the root nodes, we
 * keep the leaf references. This helps when extracting 
 * independent dependency paths.
 */
class DependencyTree {

    constructor() {
        this._files = {}

        // Files not imported from any other file
        this._leafs = []

        // Files with missing dependencies
        this._missingDependenciesFiles = []
    }

    /**
     * Adds a file to the dependency tree
     * @param {Object} file 
     * @param {string} file.path File path, including file name
     * @param {string[]} file.imports File imports
     * @param {string} file.content File source code
     */
    addFile(file) {
        if (this._files[file.path])
            console.error(`File ${filePath} already exists in dependency tree`)
        
        this._files[file.path] = file
        this._fillInDependencies(file)
        this._updateMissingDependenciesFiles(file)
        this._updateLeafs(file.dependencies)
    }

    /**
     * Returns all files not imported from any other file
     */
    getLeafs() {
        return this._leafs
    }

    _fillInDependencies(file) {
        file.dependencies = file.imports
            .filter(path => this._files[path] !== undefined)
            .map(path => this._files[path])        
    }

    _updateMissingDependenciesFiles(newFile) {
        let fileIsADependency = false

        for (const file of this._missingDependenciesFiles) {
            if (file.imports.includes(newFile.path)) {
                file.dependencies.push(newFile)
                fileIsADependency = true
            }
        }

        this._missingDependenciesFiles = [...this._missingDependenciesFiles, newFile]
            .filter(file => file.dependencies.length !== file.imports.length)

        if (!fileIsADependency)
            this._leafs.push(newFile)
    }

    _updateLeafs(dependencies) {
        this._leafs = this._leafs
            .filter(leaf => !dependencies.includes(leaf))
    }
}



module.exports = { DependencyTree }