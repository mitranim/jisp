'use strict'

/******************************* Dependencies ********************************/

// Third party
var _       = require('lodash'),
    inspect = require('util').inspect

// Custom components
var tokenise   = require('./tokenise'),
    lex        = require('./lex'),
    parse      = require('./parse'),
    List       = require('./list'),
    Plan       = require('./plan'),
    Code       = require('./code'),
    Context    = require('./context'),
    macros     = require('./macros'),
    special    = require('./special'),
    operators  = require('./operators')

// Shortcuts
var True       = require('./utils').True,
    precedence = require('./utils').precedence,
    Expression = Code.Expression

/********************************* Utilities *********************************/

/**
* Takes macro output and adapts it to look like what comes out of the lexer.
* Adaptations:
* * Change all property notations into `get` forms
* * ...
*/
function adapt (output) {
  //
}

/*************************** List Prototype: Plan ****************************/

List.prototype.plan = function (context) {
  this.context = context || new Context()

  // Quoted: as array
  if (this.context.quote) return this.planAsArray()

  // As special form
  else if (special[this.word]) return special[this.word].call(this)

  // As operator form
  else if (operators[this.word]) return operators[this.word].call(this)

  // As macro
  else if (macros[this.word]) {
    var raw = this.rawValue()
    raw.shift()
    return parse(macros[this.word].apply(this.context.clone(), raw),
                 {scope: this.scope, do: false}).uniq().plan(this.context)
  }

  // As function call
  else if (this.value.length) return this.planAsFunctionCall()

  // As empty
  else return new Plan(this, {
    test: function() {return !this.value.length},
    code: function() {return new Code()}
  })

}

/********************************** Compile **********************************/

function compile (text) {
  return parse(lex(tokenise(text))).uniq().plan().code().print()
}

/********************************** Export ***********************************/

module.exports = compile
