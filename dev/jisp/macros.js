'use strict'

/******************************* Dependencies ********************************/

// Third party
var _ = require('lodash')

// Shortcuts
var assertExp = require('./utils').assertExp

/********************************** Globals **********************************/

var macros = {}

/****************************** Built-in Macros ******************************/

macros['?'] = function() {
  return ['and'].concat(_.map(arguments, function (arg) {
    return ['isnt', ['typeof', arg], '"undefined"']
  }))
}

macros['?!'] = function() {
  return ['or'].concat(_.map(arguments, function (arg) {
    return ['is', ['typeof', arg], '"undefined"']
  }))
}

macros['any'] = function() {
  return ['or'].concat(_.map(arguments, function (arg) {
    return ['and', ['?', arg], arg]
  }))
}

macros['let'] = function() {
  assertExp(arguments, function(x){return x.length % 2}, 'uneven number of arguments to `let`')
  var args    = [].slice.call(arguments, 0),
      body    = args.pop(),
      base    = ['fn'],
      wrapper = []
  while (args.length) {
    base.push(args.shift())
    wrapper.push(args.shift())
  }
  base.push(body)
  wrapper.unshift(base)
  return wrapper
}

macros['isa'] = function (value) {
  var types = [].slice.call(arguments, 1)
  return ['or'].concat(types.map(function (type) {
    return ['is', ['typeof', value], type]
  }))
}

macros['isnta'] = function (value) {
  var types = [].slice.call(arguments, 1)
  return ['and'].concat(types.map(function (type) {
    return ['isnt', ['typeof', value], type]
  }))
}

/********************************** Export ***********************************/

module.exports = macros
