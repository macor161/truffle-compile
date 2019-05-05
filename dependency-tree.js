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
        this._filesWithMissingDependencies = []
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
            console.error(`File ${file.path} already exists in dependency tree`)
        
        const fileNode = new DependencyTreeNode(file)
        this._files[fileNode.path] = fileNode
        this._fillInDependencies(fileNode)
        this._updateMissingDependenciesFiles(fileNode)
        this._updateLeafs(fileNode.dependencies)
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

        for (const file of this._filesWithMissingDependencies) {
            if (file.imports.includes(newFile.path)) {
                file.dependencies.push(newFile)
                fileIsADependency = true
            }
        }

        this._filesWithMissingDependencies = this._filesWithMissingDependencies
            .concat([newFile])
            .filter(file => file.dependencies.length !== file.imports.length)

        if (!fileIsADependency)
            this._leafs.push(newFile)
    }

    _updateLeafs(dependencies) {
        this._leafs = this._leafs
            .filter(leaf => !dependencies.includes(leaf))
    }
}


class DependencyTreeNode {
    constructor(file) {
        this.dependencies = file.dependencies || []
        this.path = file.path
        this.imports = file.imports
        this.content = file.content
    }

    getDirectDependencies() {
        return this.dependencies
    }

    getAllDependencies() {
        return Array.from(
            new Set(this.dependencies
                .concat(this.dependencies
                    .map(node => node.getAllDependencies())
                    .reduce((acc, dep) => acc.concat(dep), [])
                )
            )
        )
    }
}



module.exports = { DependencyTree, DependencyTreeNode }