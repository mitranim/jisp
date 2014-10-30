'use strict'

/**
* Text -> Tokens -> Data Structures -> **Form** -> Plan -> Code -> Output
*/

/******************************* Dependencies ********************************/

// Third party
var _          = require('lodash')

// Custom components
var Form       = require('./form'),
    Atom       = require('./atom'),
    Plan       = require('./plan'),
    Code       = require('./code'),
    Context    = require('./context')

// Shortcuts
var inherit    = require('./utils').inherit,
    True       = require('./utils').True,
    CodeList   = Code.CodeList,
    Inline     = Code.Inline,
    Expression = Code.Expression

/********************************* Prototype *********************************/

function List (list) {
  this.value = list || []
  this.word = this.value.length && this.value[0] instanceof Atom && this.value[0].value || undefined
}
inherit(List, Form)

/********************************** Methods **********************************/

/**
* Iterates over children with the provided callback
* and returns an array of results
*/
List.prototype.each = function (callback) {
  if (typeof callback !== 'function') callback = _.identity
  return _.map(this.value, callback.bind(this))
}

List.prototype.rawValue = function() {
  return this.each(function (child) {return child.rawValue()})
}

List.prototype.firstWord = function() {
  return this.word
}

List.prototype.first = function() {
  return this.value[0]
}

List.prototype.last = function() {
  return this.value[this.value.length - 1]
}

List.prototype.uniq = function() {
  this.each(function (child) {child.uniq()})
  return this
}

/**
* For orphan `get` forms in method chains
*/
List.prototype.isOrphanProperty = function() {
  if (this.word === 'get' && this.value.length === 2) return true
  else if (this.value.length) return this.first().isOrphanProperty()
}

List.prototype.end = function() {
  this.assert(function() {return !this.value.length},
              'end of ' + (this.word || '') + ' form')
  return this
}

List.prototype.planAsArray = function() {
  return new Plan(this, {
    test: True,
    code: function() {
      var context = this.context.child({expression: true})
      return CodeList(this.each(function (child) {
        return child.plan(context).code()
      }))
    }
  })
}

List.prototype.planAsFunctionCall = function() {
  return new Plan(this, {
    test: function() {return this.value.length},
    code: function() {
      var context = this.context.child({expression: true}),
          parts   = this.each(function (child) {
            return child.plan(context).code()
          })
      return Inline(parts.shift(), '(', Expression(parts), ')')
    }
  })
}

/**
* List.prototype.plan is assigned in the `compile.js` module
*/

/********************************** Export ***********************************/

module.exports = List

/*********************************** Mock ************************************/

/*
var Atom = require('./atom')

var list = new List([
  new Atom('firstValue'),
  new Atom('secondValue'),
  new List([
    new Atom('func'),
    new Atom('firstArg'),
    new Atom('secondArg')
  ])
])

var context = new Context(null, {array: true})

console.log(list)

console.log(list.plan(context))

console.log(list.plan(context).code())

console.log(list.plan(context).code().print())
*/
