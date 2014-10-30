'use strict'

/**
* Logic for unary and infix things
*/

/******************************* Dependencies ********************************/

// Third party
var _       = require('lodash')

// Custom components
var True    = require('./utils').True,
    Plan    = require('./plan'),
    Code    = require('./code'),
    Context = require('./context')

// Shortcuts
var Inline  = Code.Inline,
    Infix   = Code.Infix

/********************************** Globals **********************************/

var operators = {}

/********************************* Utilities *********************************/

function plan (/* ... variants */) {
  var variants = _.compact(arguments)
  return function() {
    this.value.shift()
    return new Plan(this, variants)
  }
}

function unary (symbol) {
  return function() {
    var value = this.value[0].plan(this.context.child({expression: true})).code()
    return Inline(symbol, value)
  }
}

function postfix (symbol) {
  return function() {
    var value = this.value[0].plan(this.context.child({expression: true})).code()
    return Inline(value, symbol)
  }
}

function infix (symbol) {
  return function() {
    var values = this.each(function (child) {
          return child.plan(this.context.child({expression: true})).code()
        })
    return Infix(symbol, values)
  }
}

function operator (config) {
  return plan(
    config.unary ? {
      test: function() {return this.value.length === 1},
      code: unary(config.unary)
    } : null,
    config.postfix ? {
      test: function() {return this.value.length === 1},
      code: postfix(config.postfix)
    } : null,
    config.infix ? {
      test: function() {return this.value.length},
      code: infix(config.infix)
    } : null
  )
}

function register() {
  var planned
  _.each(arguments, function (config) {
    planned = operator(config)
    if (_.isArray(config.name)) {
      _.each(config.name, function (name) {operators[name] = planned})
    } else operators[config.name] = planned
  })
}

/********************************* Operators *********************************/

/*------------------------------- Arithmetic --------------------------------*/

register(
  {name: '+', infix: '+', unary: '+'},
  {name: '-', infix: '-', unary: '-'},
  {name: '*', infix: '*'},
  {name: '/', infix: '/'},
  {name: '%', infix: '%'}
)

/*------------------------- Increment and Decrement -------------------------*/

register(
  {name: '++',  unary: '++'},
  {name: '--',  unary: '--'},
  {name: '+++', postfix: '++'},
  {name: '---', postfix: '--'}
)

/*------------------------------- Comparison --------------------------------*/

register(
  {name: '<',  infix: '<'},
  {name: '>',  infix: '>'},
  {name: '<=', infix: '<='},
  {name: '>=', infix: '>='}
)

/*-------------------------------- Equality ---------------------------------*/

register(
  {name: ['is',   '==='], infix: '===', unary: '!!'},
  {name: ['isnt', '!=='], infix: '!==', unary: '!'},
  {name: '==', infix: '==', unary: '!!'},
  {name: '!=', infix: '!=', unary: '!'}
)

/*--------------------------------- Bitwise ---------------------------------*/

register(
  {name: '~',   unary: '~'},
  {name: '&',   infix: '&'},
  {name: '^',   infix: '^'},
  {name: '|',   infix: '|'},
  {name: '<<',  infix: '<<'},
  {name: '>>',  infix: '>>'},
  {name: '>>>', infix: '>>>'}
)

/*--------------------------------- Logical ---------------------------------*/

register(
  {name: ['not', '!'],  unary: '!'},
  {name: ['and', '&&'], infix: '&&'},
  {name: ['or',  '||'], infix: '||'}
)

/*------------------------------- Assignment --------------------------------*/

register(
  {name: '+=',   infix: '+='},
  {name: '-=',   infix: '-='},
  {name: '*=',   infix: '*='},
  {name: '/=',   infix: '/='},
  {name: '%=',   infix: '%='},
  {name: '&=',   infix: '&='},
  {name: '^=',   infix: '^='},
  {name: '|=',   infix: '|='},
  {name: '<<=',  infix: '<<='},
  {name: '>>=',  infix: '>>='},
  {name: '>>>=', infix: '>>>='}
)

/*---------------------------------- Words ----------------------------------*/

register(
  {name: 'typeof', unary: 'typeof '},
  {name: 'void',   unary: 'void '},
  {name: 'delete', unary: 'delete '},
  {name: 'return', unary: 'return '},
  {name: 'yield',  unary: 'yield '},
  {name: 'new',    unary: 'new '},
  {name: 'in',     infix: 'in'},
  {name: 'instanceof', infix: 'instanceof'}
)

/********************************** Export ***********************************/

module.exports = operators
