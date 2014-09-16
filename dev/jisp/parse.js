'use strict'

/**
* Text -> Tokens -> Data Structures ** -> ** Form -> Plan -> Code -> Output
*/

/******************************* Dependencies ********************************/

// Third party
var _         = require('lodash'),
    inspect   = require('util').inspect

// Custom components
var utils     = require('./utils')

// Shortcuts
var isList    = utils.isList,
    isHash    = utils.isHash,
    isAtom    = utils.isAtom,
    assertExp = utils.assertExp

// Prototypes
var Scope     = require('./scope'),
    List      = require('./list'),
    Hash      = require('./hash'),
    Atom      = require('./atom')

/********************************* Utilities *********************************/

/**
* Determines if the list creates a new scope
*/
function makesNewScope (list) {
  switch (list.value[0] && list.value[0].value) {
    case 'def':
    case 'fn' :
    case 'mac': return true
  }
}

/****************************** Form Functions *******************************/

/**
* Wraps the source into a `do` form
*/
function endo (lexed) {
  assertExp(lexed, isList, 'list')
  lexed.unshift('do')
  return lexed
}

/**
* Recursively wraps raw forms into instances of Form
*/
function enform (lexed) {
  return isList(lexed) ?
         new List(_.map(lexed, function(x){return enform(x)}))
         : isHash(lexed) ?
         new Hash(_.mapValues(lexed, function(x){return enform(x)}))
         : new Atom(lexed)
}

/**
* Recursively enscopes instances of Form and marks the forms
* that own new scopes
*/
function enscope (form, outerScope) {
  if (!outerScope) {
    outerScope = new Scope()
    form.beginsScope = true
  }
  if (form instanceof List) {
    if (makesNewScope(form)) {
      form.scope = outerScope.child()
      form.beginsScope = true
    } else form.scope = outerScope
    _.each(form.value, function (child) {enscope(child, form.scope)})
    return form
  } else if (form instanceof Hash) {
    form.scope = outerScope
    _.each(form.value, function (child) {enscope(child, form.scope)})
    return form
  } else {
    form.scope = outerScope
    return form
  }
}

function parse (lexed, opts) {
  opts = _.assign({do: true}, opts)
  return enscope(enform(opts.do ? endo(lexed) : lexed), opts.scope)
}

/********************************** Export ***********************************/

module.exports = parse
