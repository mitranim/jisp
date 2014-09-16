'use strict'

/**
* Auxiliary object attached to Plans and corresponding forms for the duration
* of their lifecycle. Helps communicate intent and requirements between
* forms, and choose between available compile variants
*/

/******************************* Dependencies ********************************/

// Third party
var _     = require('lodash')

// Custom components
var rndId = require('./utils').rndId

/********************************* Prototype *********************************/

function Context (parent, props) {
  this.parent = parent || null
  _.assign(this, !parent ? {statement: true} : {}, props)
  if (this.expression) delete this.statement
  this.id = rndId()
}

/********************************** Methods **********************************/

/**
* Recursively searches for `key` in `this` and parents and returns value
* Doesn't find falsey values, not sure if bad
*/
Context.prototype.find = function (key) {
  if (this[key] != null) return this[key]
  var context = _.find(this, key)
  return context && context[key] || undefined
}

/**
* Makes a copy of the context without parent references and functions.
* Intended for passing to macros. Should guarantee all-new object references
* to make it impossible to affect compiler's inner structures from a macro
*/
Context.prototype.clone = function() {
  return _.cloneDeep(_.omit(this, function (val, key) {
    return key === 'parent' || typeof val === 'function'
  }))
}

Context.prototype.child = function (props) {
  return new Context(this, props)
}

/********************************** Export ***********************************/

module.exports = Context
