'use strict'

/**
* Utilities shared between modules
*/

/******************************* Dependencies ********************************/

// Third party
var _       = require('lodash'),
    inspect = require('util').inspect

/******************************* Special Words *******************************/

var statementKeywords = [
  'return', 'break', 'continue', 'throw', 'yield', 'var'
]
exports.statementKeywords = statementKeywords

var regStKw = RegExp(statementKeywords.map(function (kw) {
  return '^' + kw + ' |^' + kw + '$'
}).join('|'))
exports.regStKw = regStKw

var specialValues = [
  'undefined', 'null', 'Infinity', 'NaN', 'true', 'false'
]
var regSpecialValue = RegExp(specialValues.map(function (word) {
  return '^' + word + '$'
}).join('|'))

function isSpecialValue (str) {
  return regSpecialValue.test(str)
}
exports.isSpecialValue = isSpecialValue

/**************************** Operator Precedence ****************************/

var precedence = {
  unary: {
    'new'      : 1,
    '+++'      : 3,
    '---'      : 3,
    '!'        : 4,
    '~'        : 4,
    '+'        : 4,
    '-'        : 4,
    '++'       : 4,
    '--'       : 4,
    'typeof'   : 4,
    'void'     : 4,
    'delete'   : 4,
    'yield'    : 16
  },
  '*'          : 5,
  '/'          : 5,
  '%'          : 5,
  '+'          : 6,
  '-'          : 6,
  '<<'         : 7,
  '>>'         : 7,
  '>>>'        : 7,
  '<'          : 8,
  '<='         : 8,
  '>'          : 8,
  '>='         : 8,
  'in'         : 8,
  'instanceof' : 8,
  '==='        : 9,
  '!=='        : 9,
  '&'          : 10,
  '^'          : 11,
  '|'          : 12,
  '&&'         : 13,
  '||'         : 14,
  'ternary'    : 15,
  '='          : 17,
  '+='         : 17,
  '-='         : 17,
  '*='         : 17,
  '/='         : 17,
  '%='         : 17,
  '<<='        : 17,
  '>>='        : 17,
  '>>>='       : 17,
  '&='         : 17,
  '^='         : 17,
  '|='         : 17,
  '...'        : 18,
  '…'          : 18,
  ','          : 19
}
exports.precedence = precedence

/*********************************** Types ***********************************/

function isAtom (form) {
  return _.isString(form)
}
exports.isAtom = isAtom

function isList (form) {
  return _.isArray(form)
}
exports.isList = isList

function isHash (form) {
  return _.isPlainObject(form)
}
exports.isHash = isHash

/****************************** Abstract Types *******************************/

// Util for identifier testing
var reservedWords = [
  'break', 'case', 'class', 'catch', 'const', 'continue',
  'debugger', 'default', 'delete', 'do', 'else', 'export',
  'extends', 'finally', 'for', 'function', 'if', 'import',
  'in', 'instanceof', 'let', 'new', 'return', 'super',
  'switch', 'this', 'throw', 'try', 'typeof', 'var',
  'void', 'while', 'with', 'yield', 'enum', 'await',
  'implements', 'package', 'protected', 'static', 'interface',
  'private', 'public',
  // jisp-specific words
  'elif'
]
var regReservedWord = RegExp(_.map(reservedWords, function (word) {
  return '^' + word + '$'
}).join('|'))

/**
* Passes valid JavaScript identifiers, as of ES5-6
* Also passes uniq names (starting with #)
*/
function isIdentifier (form) {
  return isAtom(form) &&
         !regReservedWord.test(form) &&
         !isSpecialValue(form) &&
         /^[#$_A-Za-z]{1}[$\w]*$/.test(form)
}
exports.isIdentifier = isIdentifier

/**
* Same as isIdentifier but also passes reserved words
*/
function isName (form) {
  return isAtom(form) &&
         !isSpecialValue(form) &&
         /^[#$_A-Za-z]{1}[$\w]*$/.test(form)
}
exports.isName = isName

function isUniq (form) {
  return isAtom(form) && /^#/.test(form) && isIdentifier(form.slice(1))
}
exports.isUniq = isUniq

function getUniqPart (form) {
  return form.match(/^#[^.[]+/)[0]
}
exports.getUniqPart = getUniqPart

/**
* Passes stringified strings (like '"blah"')
* Doesn't account for backslashes, todo fix
*/
function isString (form) {
  return isAtom(form) && /^'[^']*'$|^"[^"]*"$/.test(form)
}
exports.isString = isString

/**
* Passes regexes and trailing word symbols (regex options)
*/
function isRegex (form) {
  return isAtom(form) && /^\/.+\/\w*$/.test(form)
}
exports.isRegex = isRegex

/**
* Passes stringified numbers
*/
function isNum (form) {
  return isAtom(form) && !isNaN(Number(form))
}
exports.isNum = isNum

var primitives = [
  'undefined', 'null',
]
var regPrimitive = RegExp(primitives.join('|'))

/**
* Passes all kinds of primitive values
*/
function isPrimitive (form) {
  return isString(form) || isRegex(form) || isNum(form) || isSpecialValue(form)
}
exports.isPrimitive = isPrimitive

/**
* Passes argument shorthands like #0
*/
function isArgHash (form) {
  return /^#\d+$/.test(form)
}
exports.isArgHash = isArgHash

/****************************** Property Syntax ******************************/

function isDotName (form) {
  return /^\./.test(form) && isIdentifier(form.slice(1))
}
exports.isDotName = isDotName

function isBracketName (form) {
  return /^\[.+\]$/.test(form) &&
         (isBracketName(form.slice(1, -1)) || isString(form.slice(1, -1)))
}
exports.isBracketName = isBracketName

function isPropSyntax (form) {
  return isDotName(form) || isBracketName(form)
}
exports.isPropSyntax = isPropSyntax

/******************************** Prototyping ********************************/

function flatArgs (args) {
  return _.reduce(args, function (result, arg) {
    if (_.isArguments(arg)) return result.concat(flatArgs(arg))
    else return result.concat(arg)
  }, [])
}
exports.flatArgs = flatArgs

function inherit (childClass, superClass) {
  childClass.prototype = Object.create(superClass.prototype)
  childClass.prototype.constructor = childClass
}
exports.inherit = inherit

/**
* Usage in constructors:
* construct.apply(this, arguments)
*/
function construct() {
  var args = flatArgs(arguments)
  _.each(args, function (arg) {
    _.assign(this, arg)
  }.bind(this))
  return this
}
exports.construct = construct

/*********************************** Other ***********************************/

function assertForm (form, min, max, first) {
  if (max == null) max = Infinity
  if (min == null) min = 0
  if (!isList(form)) throw new Error('expecting list, got ' + inspect(form))
  else if (!(form.length >= min && form.length <= max)) {
    throw new Error('expecting between ' + min + ' and ' + max +
                ' arguments, got ' + form.length + ': ' + inspect(form))
  } else if (first && form[0] !== first) {
    throw new Error('expecting ' + inspect(first) +
                ' as first element, got ' + inspect(form[0]))
  }
  return form
}
exports.assertForm = assertForm

function assertExp (exp, test, expect) {
  if (test(exp)) return true
  else throw new Error((expect ?
                       'expecting ' + expect + ', got: '
                       : 'unexpected ') + inspect(exp))
}
exports.assertExp = assertExp

var splitReg = /\.[$\w]+$|\[[^\[\]]+\]$|\[.+\]$/,
    splitRegs = [
      /\.[$\w]+$/,     // .dot notation at the end
      /\[[^\[\]]+\]$/,  // [bracket] notation at the end
      /\[.+\]$/         // [bracket[stuff]] notation at the end
    ]

/**
* Splits an identifier into a list of substrings,
* splitting off all property notations
*/
function splitName (name) {
  var res = []
  while (splitReg.test(name)) {
    var reg = _.find(splitRegs, function (reg) {return reg.test(name)})
    res.unshift(name.match(reg)[0])
    name = name.replace(reg, '')
  }
  if (name) res.unshift(name)
  return res
}
exports.splitName = splitName

/**
* Adds or increments a number at the end of a string
*/
function plusname (name) {
  var lastNum = Number(name[name.length-1])
  if (isNaN(lastNum)) return name + '0'
  else return name.slice(0, -1) + (lastNum + 1)
}
exports.plusname = plusname

/**
* Generates a random GUID
*/
function rndId () {
  return Math.floor(Math.random() * Math.pow(10, 16)).toString(16)
}
exports.rndId = rndId

/**
* Hardcoded truth
*/
function True() {return true}
exports.True = True

/**
* Hardcoded lie
*/
function False() {return false}
exports.False = False

/**
* Repeats a string N times.
* Using a clever logarithmic algorithm for low memory usage
* when repeating a crazy high number of times
*/
function repeat (string, times) {
  var result = ''
  while (times > 0) {
    if (times & 1) result += string
    times >>= 1
    string += string
  }
  return result
}
exports.repeat = repeat

/********************************** For CLI **********************************/

// Mostly copied from CoffeeScript source

// Return filename without extension
function baseFileName (file, stripExt, useWinPathSep) {
  if (useWinPathSep == null) useWinPathSep = false
  if (stripExt == null) stripExt = false
  var pathSep = useWinPathSep ? /\\|\// : /\//,
      parts   = file.split(pathSep),
      file    = _.last(parts)
  if (!stripExt || !~file.indexOf('.')) return file
  else {
    var parts = file.split('.')
    parts.pop()
    if (_.last(parts) === 'jisp' && parts.length) parts.pop()
    return parts.join('.')
  }
}
exports.baseFileName = baseFileName

function isJisp (file) {
  return /\.jisp$/.test(file)
}
exports.isJisp = isJisp
