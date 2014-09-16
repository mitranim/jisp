'use strict'

/**
* Auxiliary object attached to instances of Form for the duration of their
* lifecycle. Handles variable name scoping and hoisting
*/

/******************************* Dependencies ********************************/

// Third party
var _ = require('lodash')

// Custom components
var rndId        = require('./utils').rndId,
    isIdentifier = require('./utils').isIdentifier

/********************************* Prototype *********************************/

function Scope (parent) {
  this.id = rndId()
  this.parent = parent || null
  this.hoist = []
  this.shadow = []
  this.uniq = {}
}

/********************************** Methods **********************************/

/**
* Forms a flat array of itself and all parents in the order of nesting
*/
Scope.prototype.flatten = function() {
  var scope  = this,
      scopes = [this]
  while (scope.parent && (scope = scope.parent)) scopes.push(scope)
  return scopes
}

/**
* Searches itself and parents for given names. If a name is provided,
* returns `true` if it's found in hoist or shadow. If a hash is provided,
* searches for given values in given properties and returns `true` if any match
*/
Scope.prototype.has = function (term) {
  if (typeof term === 'string') {
    return _.some(this.flatten(), function (scope) {
      return _.contains(scope.hoist, term) || _.contains(scope.shadow, term)
    })
  } else if (_.isObject(term)) {
    return _.some(this.flatten(), function (scope) {
      return _.some(term, function (val, key) {
        return _.contains(scope[key], val)
      })
    })
  }
}

/**
* Searches itself and parents for a uniq value and returns
* the scope that has a key with that value
*/
Scope.prototype.getScopeByUniqName = function (name) {
  return _.find(this.flatten(), function (scope) {
    if (_.contains(scope.uniq, name)) return scope
  })
}

/**
* Finds a scope that owns the given uniq name and returns the replacement,
* or declares it and creates the replacement
*/
Scope.prototype.declareUniq = function (name) {
  var scope = this.getScopeByUniqName(name) || this
  return scope.uniq[name] || (scope.uniq[name] = 'uniq' + rndId())
}

/**
* Declares a variable almost guaranteed not to clash with any user-defined name
*/
Scope.prototype.declareShadow = function (name) {
  this.shadow.push(name += rndId())
  return name
}

Scope.prototype.makeShadowName = function (name) {
  return name + rndId()
}

/**
* Returns all names in current scope, presumably for var declaration
*/
Scope.prototype.list = function() {
  return [].concat(this.hoist, this.shadow)
}

Scope.prototype.number = function() {
  return this.hoist.length + this.shadow.length
}

/**
* Declare names if not already in scope
*/
Scope.prototype.declare = function (/* ...names */) {
  _.each(arguments, function (name) {
    if (isIdentifier(name) && !this.has(name)) this.hoist.push(name)
  }.bind(this))
}

Scope.prototype.child = function() {
  return new Scope(this)
}

/********************************** Export ***********************************/

module.exports = Scope
