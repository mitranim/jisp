'use strict'

/******************************* Dependencies ********************************/

// Third party
var React  = require('react')
var marked = require('marked')

/********************************* Configure *********************************/

marked.setOptions({
  gfm:         true,
  tables:      true,
  breaks:      true,
  sanitize:    false,
  smartypants: true
})

/******************************** Components *********************************/

var Md = React.createClass({displayName: 'Md',
  render: function() {return (

React.createElement("div", {dangerouslySetInnerHTML: {__html: marked(this.props.children.toString())}, 
     className: this.props.className, 
     style: this.props.style})

  )}
})

/********************************** Export ***********************************/

module.exports = Md
