'use strict'

/**
* Extensions of the Code class
*
* Probably stupid to have so many classes with so little difference, todo revise
*/

/******************************* Dependencies ********************************/

// Third party
var _          = require('lodash'),
    inspect    = require('util').inspect

// Custom dependencies
var Code       = require('./code')

// Shortcuts
var inherit    = require('./utils').inherit,
    construct  = require('./utils').construct,
    repeat     = require('./utils').repeat,
    precedence = require('./utils').precedence,
    flatArgs   = require('./utils').flatArgs,
    regStKw    = require('./utils').regStKw,
    True       = require('./utils').True

/********************************** Globals **********************************/

/*
* ToDo: these options should come from the compiler call
*/

var opts = {
  indent: repeat(' ', 2),
  width: 80
  // indent: false
}

/**
* Linebreak. If pretty output is enabled, it's \n, otherwise ' '
*/
var eol = opts.indent ? '\n' : ' '

/********************************* Utilities *********************************/

/**
* Indent function. Takes a number and returns that many indents if pretty
* output is enabled, otherwise ''
*/
function ind (num) {
  if (!opts.indent || !num) return ''
  else return repeat(opts.indent, num)
}

/**
* Prepends a standard indent to each line in the given string
*/
function indent (string) {
  return string.match(/^/gm).length > 1 ? string.replace(/^/gm, ind(1)) : string
}

/**
* Joins an array with the given joiner character and an extra space,
* folding lines when they become too long
*/
function joinFold (array, joiner) {
  var breaker = joiner.replace(/\s+$/, '') + eol + ind(1),
      width   = 0
  return array.reduce(function (result, value) {
    width += value.match(/$/m).index
    return result
           + (result ? (width >= opts.width ? (width = 0, breaker) : joiner) : '')
           + value
  }, '')
}

/**************************** Code Hash Prototype ****************************/

function CodeHash() {
  if (!this) return new CodeHash(arguments)
  this.value = construct.apply({}, arguments)
  _.each(this.value, function (val, key) {
    if (!(val instanceof Code)) this.value[key] = new Code(val)
  }.bind(this))
  this.constructor = CodeHash
  this.assert(_.isPlainObject, 'hash table as value')
}
inherit(CodeHash, Code)

Code.CodeHash = CodeHash

CodeHash.prototype.each = function() {
  throw new Error("not supposed to call .each on CodeHash instance")
}

CodeHash.prototype.print = function() {
  var results = _(this.value).map(function (child, key) {
    var val = child.print()
    if (val) return key + ': ' + val
  }).compact().value()
  return results.length > 1 ?
         '{' + eol + indent(results.join(',' + eol)) + eol + '}'
         : results.length ?
         '{' + results[0] + '}'
         : '{}'
}

CodeHash.prototype.returnify = function() {
  throw new Error("internal compiler error: hash can't returnify itself")
}

/**************************** Multipart Prototype ****************************/

/**
* Basis for all non-string, non-hash Code instances
*/

function Multipart() {
  if (!this) return new Multipart(arguments)
  this.value = flatArgs(arguments).map(function (value) {
    if (value instanceof Code) return value
    else return new Code(value)
  })
  this.constructor = Multipart
}
inherit(Multipart, Code)

Multipart.prototype.each = function (callback) {
  if (typeof callback !== 'function') callback = _.identity
  return _.map(this.value, callback.bind(this))
}

Multipart.prototype.print = function() {
  throw new Error("internal compiler error: not supposed to print raw Multipart instance")
}

Multipart.prototype.printChildren = function() {
  return this.each(function (child, index) {
    if (// Operators and keywords
        (precedence[this.infix] < precedence[child.infix]) ||
        // Ternary: second element into parens if inside another ternary
        (this.infix === 'ternary' && child.infix === 'ternary' && index === 1)) {
      return  '(' + child.print() + ')'
    } else return child.print()
  })
}

Multipart.prototype.first = function() {
  return this.value[0]
}

Multipart.prototype.last = function() {
  return _.last(this.value)
}

Multipart.prototype.returnify = function() {
  throw new Error("internal compiler error: can't returnify " + inspect(this, {depth: null}))
}

Multipart.prototype.endsWithBlock = function() {
  if (this.value.length) {
    return this.last().becomesBlock()
  }
}

Multipart.prototype.endsWithMultilineBlock = function() {
  if (this.value.length) {
    return this.last().becomesMultilineBlock()
  }
}

/**
* Mutates the value into a Block and wraps it into a self-executing anonymous
* function. Doesn't returnify the body
*/
Multipart.prototype.enfunc = function() {
  return this.enveil(Block).enfunc()
}

/**************************** Code List Prototype ****************************/

function CodeList() {
  if (!this) return new CodeList(arguments)
  Multipart.apply(this, arguments)
  this.constructor = CodeList
}
inherit(CodeList, Multipart)

Code.CodeList = CodeList

CodeList.prototype.print = function() {
  var list = this.each(function (child) {return child.print()})
  return list.length > 1 ?
         '[' + eol + indent(list.join(',' + eol)) + eol + ']'
         : list.length ?
         '[' + list[0] + ']'
         : '[]'
}

/*************************** Singleline Prototype ****************************/

function Singleline() {
  if (!this) return new Singleline(arguments)
  Multipart.apply(this, arguments)
  this.constructor = Singleline
}
inherit(Singleline, Multipart)

Code.Singleline = Singleline

Singleline.prototype.beginsWithStatementKeyword = function() {
  var first = this.value[0]
  if (first) return first.beginsWithStatementKeyword()
}

Singleline.prototype.returnify = function() {
  var first = this.value[0]
  if (first) return first.returnify()
}

/***************************** Inline Prototype ******************************/

function Inline() {
  if (!this) return new Inline(arguments)
  Singleline.apply(this, arguments)
  this.constructor = Inline
}
inherit(Inline, Singleline)

Code.Inline = Inline

Inline.prototype.print = function() {
  return this.printChildren().join('')
}

/****************************** Chain Prototype ******************************/

function Chain() {
  if (!this) return new Chain(arguments)
  Singleline.apply(this, arguments)
  this.constructor = Chain
}
inherit(Chain, Singleline)

Code.Chain = Chain

Chain.prototype.print = function() {
  return joinFold(this.printChildren(), '')
}

/****************************** Infix Prototype ******************************/

function Infix() {
  if (!this) return new Infix(arguments)
  var args = flatArgs(arguments)
  this.infix = args.shift()
  Singleline.apply(this, args)
  this.constructor = Infix
}
inherit(Infix, Singleline)

Code.Infix = Infix

Infix.prototype.print = function() {
  return joinFold(this.printChildren(), ' ' + this.infix + ' ')
}

/*************************** Expression Prototype ****************************/

function Expression() {
  if (!this) return new Expression(arguments)
  Singleline.apply(this, arguments)
  this.constructor = Expression
}
inherit(Expression, Singleline)

Code.Expression = Expression

Expression.prototype.print = function() {
  return joinFold(this.printChildren(), ', ')
}

/**************************** Statement Prototype ****************************/

function Statement() {
  if (!this) return new Statement(arguments)
  Singleline.apply(this, arguments)
  this.constructor = Statement
}
inherit(Statement, Singleline)

Code.Statement = Statement

Statement.prototype.print = function() {
  return joinFold(this.printChildren(), ' ')
}

/************************* Case Statement Prototype **************************/

// Identical to Statement but is treated differently by sequence printing

function CaseStatement() {
  if (!this) return new CaseStatement(arguments)
  Singleline.apply(this, arguments)
  this.constructor = CaseStatement
}
inherit(CaseStatement, Statement)

Code.CaseStatement = CaseStatement

/***************************** Ternary Prototype *****************************/

function Ternary() {
  if (!this) return new Ternary(arguments)
  Singleline.apply(this, arguments)
  this.infix = 'ternary'
  this.constructor = Ternary
  this.assert(function(){return this.value.length === 3}, 'three components in ternary')
}
inherit(Ternary, Singleline)

Code.Ternary = Ternary

Ternary.prototype.print = function() {
  var results = this.printChildren(),
      first   = '' + results[0] || 'false',
      second  = '' + results[1] || 'undefined',
      third   = '' + results[2] || 'undefined',
      firstBreak  = first.length  >= opts.width && eol || second.length >= opts.width && eol || ' ',
      secondBreak = second.length >= opts.width && eol || third.length  >= opts.width && eol || ' '
  return first + ' ?' + firstBreak + second + secondBreak + ': ' + third
}

/**************************** Multiline Prototype ****************************/

function Multiline() {
  if (!this) return new Multiline(arguments)
  Multipart.apply(this, arguments)
  this.constructor = Multiline
}
inherit(Multiline, Multipart)

Code.Multiline = Multiline

Multiline.prototype.printAsSequence = function (joinBlocks) {
  var block, multilineBlock, caseStatement
  return this.value.reduce(function (result, child) {
    var printed = child.print()
    if (!printed) return result
    var joiner = result ? (multilineBlock ? (joinBlocks ? ' ' : eol)
                           : (caseStatement ? '' : (block ? '' : ';')) + eol) : ''
    result += joiner + printed
    block = child.endsWithBlock()
    multilineBlock = child.endsWithMultilineBlock()
    caseStatement = child.constructor === CaseStatement
    return result
  }, '')
}

Multiline.prototype.returnify = function() {
  var last = this.last()
  if (last instanceof Multiline) last.returnify()
  else if (!last.beginsWithStatementKeyword()) {
    last.returnify()
  }
  return this
}

/**
* Mutates the body into a Block and wraps it into a self-executing anonymous
* function. Doesn't returnify the body
*/
Multiline.prototype.enfunc = function() {
  return Inline('function() ', this.enveil(Block), '()')
}

/**
* Multilines are closely related, so unlike the default enveil function,
* this one doesn't wrap the whole object, only its value
*/
Multiline.prototype.enveil = function (constructor) {
  if (this.constructor === constructor) return this
  else if (constructor.prototype instanceof Multiline) return constructor(this.value)
  else {
    throw new Error("internal compiler error: not supposed to enveil multilines into non-multilines")
  }
}

Multiline.prototype.optionalBlock = function() {
  return this.value.length > 1 ? this.enveil(Block) : this
}

/****************************** Block Prototype ******************************/

function Block() {
  if (!this) return new Block(arguments)
  Multiline.apply(this, arguments)
  this.constructor = Block
}
inherit(Block, Multiline)

Code.Block = Block

Block.prototype.print = function() {
  var printed = this.printAsSequence()
  return printed.match(/$/gm).length > 1 ?
         '{' + eol + indent(this.printAsSequence()) + eol + '}'
         : '{' + this.printAsSequence() + '}'
}

Block.prototype.becomesBlock = True

Block.prototype.becomesMultilineBlock = function() {
  return this.value.length > 1
}

Block.prototype.endsWithMultilineBlock = function() {
  if (this.becomesMultilineBlock()) return true
  else if (this.value.length) {
    return this.last().becomesMultilineBlock()
  }
}

/**************************** Sequence Prototype *****************************/

function Sequence() {
  if (!this) return new Sequence(arguments)
  Multiline.apply(this, arguments)
  this.constructor = Sequence
}
inherit(Sequence, Multiline)

Code.Sequence = Sequence

Sequence.prototype.print = function() {
  return this.printAsSequence()
}

/************************* Block Sequence Prototype **************************/

function BlockSequence() {
  if (!this) return new BlockSequence(arguments)
  Multiline.apply(this, arguments)
  this.constructor = BlockSequence
}
inherit(BlockSequence, Multiline)

Code.BlockSequence = BlockSequence

BlockSequence.prototype.print = function() {
  return this.printAsSequence(true)
}

/************************** Case Sequence Prototype **************************/

function CaseSequence() {
  if (!this) return new CaseSequence(arguments)
  Multiline.apply(this, arguments)
  this.constructor = CaseSequence
}
inherit(CaseSequence, Multiline)

Code.CaseSequence = CaseSequence

CaseSequence.prototype.print = function() {
  var printed = this.printAsSequence()
  return printed.match(/$/gm).length > 1 ?
         eol + indent(this.printAsSequence())
         : this.printAsSequence()
}

/*********************************** Mock ************************************/

/*
var code = Inline('function() ',
  Block('stuff', 'and more stuff').returnify())

console.log("-- code:", code);

code.value.push(code.value.pop().enveil(Block).returnify())

console.log(code.print())
*/
