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
    Code    = require('./code'),
    Context = require('./context')

// Shortcuts
var inherit = require('./utils').inherit,
    isUniq  = require('./utils').isUniq,
    rndId   = require('./utils').rndId

/********************************* Prototype *********************************/

function Atom (atom) {
  this.value = atom || ''
}
inherit(Atom, Form)

/********************************** Methods **********************************/

/**
* Not sure if relevant, putting here just in case
*/
Atom.prototype.each = function (callback) {
  return callback.bind(this)(this.value)
}

Atom.prototype.rawValue = function() {return this.value}

/**
* If this is a #uniq name, replaces it with the appropriate replacement
* and registers it in the relevant scope.
* This relies on all property notations being decomposed into (get prop)
* forms by tokeniser & lexer
*/
Atom.prototype.uniq = function() {
  if (isUniq(this.value)) this.value = this.scope.declareUniq(this.value)
  return this
}

Atom.prototype.plan = function (context) {
  this.context = context || new Context()

  return new Plan(this, {
    test: function() {return this.context.quote},
    code: function() {
      return new Code(JSON.stringify(this.value))
    }
  },
  {
    test: True,
    code: function() {
      return new Code(this.value)
    }
  })
}

/********************************** Export ***********************************/

module.exports = Atom
