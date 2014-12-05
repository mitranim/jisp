'use strict'

/******************************* Dependencies ********************************/

// Third party
var React   = require('react')

// Custom components
var Docs    = require('./docs')
var Sidenav = require('./sidenav')

/******************************** Components *********************************/

var Index = React.createClass({displayName: 'Index',
  render: function() {return (

React.createElement("div", {className: "container"}, 
  React.createElement("div", {className: "row"}, 
    React.createElement(Docs, {className: "col-xs-12 col-md-9"}), 
    React.createElement(Sidenav, {className: "col-xs-12 col-md-3"})
  )
)

  )}
})

/********************************** Export ***********************************/

module.exports = Index
