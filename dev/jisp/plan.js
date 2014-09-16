'use strict'

/**
* Text -> Tokens -> Data Structures -> Form -> **Plan** -> Code -> Output
*/

/******************************* Dependencies ********************************/

// Third party
var _       = require('lodash'),
    inspect = require('util').inspect

/********************************* Prototype *********************************/

function Plan (form, /*...*/ variants) {
  this.form     = form
  this.variants = _.flatten([].slice.call(arguments, 1))
}

/********************************** Methods **********************************/

Plan.prototype.code = function() {

  var variant = _.find(this.variants, function (variant) {
    return variant.test.call(this.form)
  }.bind(this))

  if (variant) return variant.code.call(this.form)
  else {
    // console.log("-- this.form:", this.form)
    // console.log("-- this.variants:", this.variants)
    throw Error('no suitable variant was found for form: ' + inspect(this.form, {depth: null}))
  }

}

/********************************** Export ***********************************/

module.exports = Plan
