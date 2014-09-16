'use strict'

/**
* Class for pretty print
*
* Text -> Tokens -> Data Structures -> Form -> Plan -> **Code** -> Output
*/

/******************************* Dependencies ********************************/

// Third party
var _         = require('lodash'),
    inspect   = require('util').inspect

// Shortcuts
var True      = require('./utils').True,
    False     = require('./utils').False,
    regStKw   = require('./utils').regStKw

/********************************* Prototype *********************************/

/**
* The Code object always holds a string as its value. More complex Code
* objects are created with extension classes
*/

function Code (string) {
  /**
  * Self-correcting into `new` inside the constructor has proven to be
  * unsafe, leading to weird Node bugs. Keeping it on other prototypes
  * for now, but had to drop from this one
  */
  // if (!this) return new Code(string)
  this.value = string || ''
  this.assert(function(){return typeof this.value === 'string'}, 'string as value')
}

/********************************** Methods **********************************/

Code.prototype.assert = function (condition, expect) {
  if (!condition.call(this, this.value)) {
    throw new Error((expect ? 'expected ' + expect + '; ' : '') +
                    'failed condition check on form: ' + inspect(this))
  } else return this
}

Code.prototype.each = function() {
  throw new Error("internal compiler error: not supposed to call .each on plain Code instance")
}

Code.prototype.print = function() {
  return this.value
}

Code.prototype.returnify = function() {
  if (this.value && !this.beginsWithStatementKeyword()) {
    this.value = 'return' + (this.value ? ' ' + this.value : '')
  }
  return this
}

Code.prototype.enveil = function (constructor) {
  if (this.constructor === constructor) return this
  else return constructor(this)
}

Code.prototype.optionalBlock = function() {
  return this
}

Code.prototype.enfunc = function() {
  this.returnify()
  this.value = 'function() {' + this.value + '}()'
  return this
}

/*----------------------------- Boolean Methods -----------------------------*/

Code.prototype.becomesBlock = False

Code.prototype.becomesMultilineBlock = False

Code.prototype.endsWithBlock = False

Code.prototype.endsWithMultilineBlock = False

Code.prototype.beginsWithStatementKeyword = function() {
  return regStKw.test(this.value)
}

/********************************** Export ***********************************/

module.exports = Code

/********************************** Extend ***********************************/

require('./code-extensions')

/*********************************** Mock ************************************/

/*
var code = Code('my string', {'myprop': 'something'})

console.log(code)

console.log(code.print())
*/
