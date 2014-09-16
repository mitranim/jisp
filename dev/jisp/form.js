'use strict'

/******************************* Dependencies ********************************/

// Third party
var _       = require('lodash'),
    inspect = require('util').inspect

// Shortcuts
var False   = require('./utils').False

/********************************* Prototype *********************************/

function Form () {
  return this
}

/********************************** Methods **********************************/

/**
* This section is for functions that are shared between child classes, or
* that may not be defined on all child classes
*/

Form.prototype.assert = function (condition, expect) {
  if (!condition.call(this, this.value)) {
    throw new Error((expect ? 'expected ' + expect + '; ' : '') +
                    'failed condition check on form: ' + inspect(this))
  }
  else return this
}

Form.prototype.assertWord = function (word) {
  return this.assert(function() {
    return this.word === word
  }, 'form starting with ' + word)
}

Form.prototype.isOrphanProperty = False

/********************************** Export ***********************************/

module.exports = Form
