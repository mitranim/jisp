'use strict'

/**
* Text -> Tokens -> Data Structures -> **Form** -> Plan -> Code -> Output
*/

/******************************* Dependencies ********************************/

// Third party
var _       = require('lodash')

// Custom components
var True    = require('./utils').True,
    Form    = require('./form'),
    Plan    = require('./plan'),
    Context = require('./context')

// Shortcuts
var inherit  = require('./utils').inherit,
    CodeHash = require('./code').CodeHash,
    Inline   = require('./code').Inline

/********************************* Prototype *********************************/

function Hash (hash) {
  this.value = hash || {}
  this.instanceof = 'Hash'
}
inherit(Hash, Form)

/********************************** Methods **********************************/

/**
* Iterates over children (values) and returns a new hash with the same keys,
* where values are return values from the callback
*/
Hash.prototype.each = function (callback) {
  return _.mapValues(this.value, callback.bind(this))
}

Hash.prototype.rawValue = function() {
  return this.each(function (child) {return child.rawValue()})
}

Hash.prototype.uniq = function() {
  this.each(function (child) {child.uniq()})
  return this
}

Hash.prototype.plan = function (context) {
  this.context = context || new Context()

  return new Plan(this, {
    test: True,
    code: function() {
      var value = this.each(function (child) {
        return child.plan(this.context.child({expression: true})).code()
      })
      return this.context.statement ?
             Inline('(', CodeHash(value), ')')
             : CodeHash(value)
    }
  })
}

/********************************** Export ***********************************/

module.exports = Hash

/*********************************** Mock ************************************/

/*
// Careful not to get into a circular dependency
var Atom = require('./atom')

var hash = new Hash({
  firstKey: new Atom('firstValue'),
  secondKey: new Atom('secondValue')
})

console.log(hash)

console.log(hash.plan())

console.log(hash.plan().code())

console.log(hash.plan().code().print())
*/
