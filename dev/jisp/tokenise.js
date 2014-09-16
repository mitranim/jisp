'use strict'

/**
* Takes a string of jisp and returns an array of tokens, split by
* delimiters and whitespace.
*
* Text ** -> Tokens ** -> Data Structures -> Form -> Plan -> Code -> Output
*/

/******************************* Dependencies ********************************/

// Third party
var _ = require('lodash')

/********************************** Regexes **********************************/

var tokens = [],
    // Matches until first comment, '-string, "-string, or regex
    reCode = /^[^]*?(?=;.*[\n\r]?|""|"[^]*?(?:[^\\]")|''|'[^]*?(?:[^\\]')|\/[^\s]+\/[\w]*)/,
    // Matches first comment
    reComment = /^;.*[\n\r]?/,
    // Matches first "-string and data until delimiter
    reDQString = /^""|^"[^]*?(?:[^\\]")[^\s):\[\]\{\}]*/,
    // Matches first '-string and data until delimiter
    reSQString = /^''|^'[^]*?(?:[^\\]')[^\s):\[\]\{\}]*/,
    // Matches first regex and a few letters or digits after
    reReg = /^\/[^\s]+\/[\w]*/

var regexes = [reCode, reComment, reDQString, reSQString, reReg]

/********************************* Utilities *********************************/

function split (str) {
  return str
  .replace(/;.*$/gm,         '')
  .replace(/\{/g,            '(fn (')
  .replace(/\}/g,            '))')
  .replace(/\(/g,            ' ( ')
  .replace(/\)/g,            ' ) ')
  // .replace(/\[$/g,           ' [ ')
  // .replace(/\['/g,           " [ '")
  // .replace(/\["/g,           ' [ "')
  // .replace(/\[(?=\d)/g,      ' [ ')
  // .replace(/'\]/g,           "' ] ")
  // .replace(/"\]/g,           '" ] ')
  // .replace(/(\d+)\]/g,       '$1 ] ')
  .replace(/\[/g,            ' [ ')
  .replace(/\]/g,            ' ] ')
  .replace(/\[[\s]*\(/g,     ' [ ( ')
  .replace(/\)[\s]*\]/g,     ' ) ] ')
  .replace(/([^:]):(?!\:)/g, '$1 : ')
  .replace(/`/g,             ' ` ')
  .replace(/,/g,             ' , ')
  .replace(/\.\.\./g,        ' ... ')
  .replace(/…/g,             ' … ')
  .replace(/\./g,            ' . ')
  .replace(/#(\d+)/g,        ' arguments[$1] ')
  .trim()
  .split(/\s+/)
}

function concatNewLines (str) {
  return str.replace(/\n|\n\r/g, '\\n')
}

function match (str, re) {
  return re.test(str) ? str.match[0] : undefined
}

/********************************* Tokeniser *********************************/

function tokenise (str) {
  var tokens = []
  while (str.length) {
    var reg = _.find(regexes, function (reg) {
      return reg.test(str) && str.match(reg)[0]
    })
    switch (reg) {
      case reCode:
        var splitted = split(str.match(reg)[0])
        if (splitted[0]) tokens.push.apply(tokens, splitted)
        str = str.replace(reg, '').trim()
        break
      case reComment:
        str = str.replace(reg, '')
        break
      case reDQString:
      case reSQString:
        tokens.push(concatNewLines(str.match(reg)[0]))
        str = str.replace(reg, '')
        break
      case reReg:
        tokens.push(str.match(reg)[0])
        str = str.replace(reg, '')
        break
      default:
        var splitted = split(str)
        if (splitted[0]) tokens.push.apply(tokens, splitted)
        str = ''
    }
  }
  return tokens
}

/********************************** Export ***********************************/

module.exports = tokenise
