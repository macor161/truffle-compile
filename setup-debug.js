/**
 * Always print time in ms. Will override all debug instances
 * TODO: Extract in its own package
 */
const debug = require('debug')
debug.humanize = t => `${t}ms`