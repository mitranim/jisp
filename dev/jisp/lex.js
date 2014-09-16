'use strict'

/**
* Takes an array of tokens and converts it into native data structures,
* expanding things like quotes, unquotes, properties, and so on
*
* Text -> Tokens ** -> Data Structures ** -> Form -> Plan -> Code -> Output
*/

/******************************* Dependencies ********************************/

// Third party
var _       = require('lodash'),
    inspect = require('util').inspect

// Custom components
var utils   = require('./utils')

// Shortcuts
var spr          = utils.spr,
    isNum        = utils.isNum,
    isList       = utils.isList,
    isHash       = utils.isHash,
    isAtom       = utils.isAtom,
    isName       = utils.isName,
    isString     = utils.isString,
    isIdentifier = utils.isIdentifier

/********************************* Utilities *********************************/

function printConditions (conditions) {
  return _.map(conditions, function (condition) {
    return isList(condition) ?
           '< ' + printConditions(condition) + ' >'
           : (typeof condition === 'function' && condition.name) ?
           condition.name
           : condition
  }).join(' ')
}

function testBy (tokens, condition) {
  return typeof condition === 'function' ?
         condition(tokens[0])
         : _.isRegExp(condition) ?
         condition.test(tokens[0])
         : isAtom(condition) || condition == null ?
         condition === tokens[0]
         : isList(condition) ?
         _.every(condition, function (cond, i) {
           return testBy(i ? tokens.slice(i) : tokens, cond)
         })
         : undefined
}

/**
* Takes an array of tokens and pairs of conditions and modes.
* If any of the conditions is met, returns the result of the (destructive)
* lexing of this tokens array in the corresponding mode,
* otherwise throws an error
*/
function demand (tokens, lexed /*, ...args */) {
  var args       = [].slice.call(arguments, 2),
      conditions = [], modes = []
  while (args.length) {
    conditions.push(args.shift())
    modes.push(args.shift())
  }
  var index = -1
  while (++index < conditions.length) {
    if (testBy(tokens, conditions[index])) return lex(tokens, lexed, modes[index])
  }
  var err = tokens[0] == null ?
            new Error('unexpected end of input, probably missing one of ) ] }')
            : new Error('unexpected ' + inspect(tokens[0]) +
              ' in possible modes: ' + modes.join(' | ') + '\n\n' +
              'Tokens: ' + spr(tokens.slice(0, 10)) +
              (tokens.length > 10 ? '   <...>' : '') + '\n\n' +
              'Tested against conditions: ' + printConditions(conditions))
  throw err
}

/**
* Same as demand, but doesn't throw an error if no conditions are met
*/
function expect (tokens, lexed /*, ...args */) {
  var args       = [].slice.call(arguments, 2),
      conditions = [], modes = []
  while (args.length) {
    conditions.push(args.shift())
    modes.push(args.shift())
  }
  var index = -1
  while (++index < conditions.length) {
    if (testBy(tokens, conditions[index])) return lex(tokens, lexed, modes[index])
  }
}

/**
* Opposite of expect: throws an error if any of the conditions is met
*/
function forbid (tokens, conditions) {
  _.each(conditions, function (condition) {
    if (testBy(tokens, condition)) {
      throw new Error ('unexpected ' + inspect(tokens[0]))
    }
  })
}

/*********************************** Lexer ***********************************/

function lex (tokens, outerLexed, mode) {
  if (mode == null) mode = 'default'
  switch (mode) {
    case 'default':
      var lexed = []
      while (tokens.length) {
        lexed.push(demand(tokens, lexed,
          ['(', ':', ')'],      'emptyhash',
          ['(', isString, ':'], 'hash',
          ['(', isName, ':'],   'hash',
          '(',                  'list',
          '.',                  'property',
          '[',                  'property',
          '`',                  'quote',
          ',',                  'unquote',
          '...',                'spread',
          '…',                  'spread',
          isAtom,               'atom',
          undefined,            'drop'))
      }
      return lexed
    case 'list':
      var lexed = []
      demand(tokens, lexed, '(', 'drop')
      while (tokens[0] !== ')') {
        lexed.push(demand(tokens, lexed,
          ['(', ':', ')'],      'emptyhash',
          ['(', isString, ':'], 'hash',
          ['(', isName, ':'],   'hash',
          '(',                  'list',
          '.',                  'property',
          '[',                  'property',
          '`',                  'quote',
          ',',                  'unquote',
          '...',                'spread',
          '…',                  'spread',
          isAtom,               'atom'))
      }
      demand(tokens, lexed, ')', 'drop')
      return lexed
    case 'emptyhash':
      demand(tokens, null, '(', 'drop')
      demand(tokens, null, ':', 'drop')
      demand(tokens, null, ')', 'drop')
      return {}
    case 'hash':
      var lexed = {}
      demand(tokens, null, '(', 'drop')
      while (tokens[0] !== ')') {
        var key = demand(tokens, null,
          isString,             'drop',
          isName,               'drop')
        demand(tokens, null, ':', 'drop')
        var prop = demand(tokens, null,
          ['(', ':', ')'],      'emptyhash',
          ['(', isString, ':'], 'hash',
          ['(', isName, ':'],   'hash',
          '(',                  'list',
          '.',                  'property',
          '[',                  'property',
          '`',                  'quote',
          ',',                  'unquote',
          isAtom,               'atom')
        lexed[key] = prop
      }
      demand(tokens, null, ')', 'drop')
      return lexed
    case 'property':
      var bracket = tokens[0] === '['
      demand(tokens, null,
        '.',                    'drop',
        '[',                    'drop')
      var lexed = demand(tokens, null,
        '(',                    'list',
        isAtom,                 'atom')
      if (!bracket && isName(lexed)) lexed = "'" + lexed + "'"
      if (bracket) demand(tokens, null, ']', 'drop')
      return (outerLexed && outerLexed.length) ?
             ['get', outerLexed.pop(), lexed]
             : ['get', lexed]
    case 'quote':
      demand(tokens, null, '`', 'drop')
      return ['quote', demand(tokens, null,
        ['(', ':', ')'],        'emptyhash',
        ['(', isString, ':'],   'hash',
        ['(', isName, ':'],     'hash',
        '(',                    'list',
        '`',                    'quote',
        ',',                    'unquote',
        '...',                  'spread',
        '…',                    'spread',
        isAtom,                 'atom')]
    case 'unquote':
      demand(tokens, null, ',', 'drop')
      return ['unquote', demand(tokens, null,
        ['(', ':', ')'],        'emptyhash',
        ['(', isString, ':'],   'hash',
        ['(', isName, ':'],     'hash',
        '(',                    'list',
        '`',                    'quote',
        ',',                    'unquote',
        '...',                  'spread',
        '…',                    'spread',
        isAtom,                 'atom')]
    case 'spread':
      demand(tokens, null, '...', 'drop', '…', 'drop')
      return ['spread', demand(tokens, null,
        '(',                    'list',
        '`',                    'quote',
        ',',                    'unquote',
        isAtom,                 'atom')]
    case 'atom':
      return demand(tokens, null, isAtom, 'drop')
    case 'drop':
      return tokens.shift()
    default:
      throw new Error('unspecified lex mode: ' + mode)
  }
}

/********************************** Export ***********************************/

module.exports = lex
