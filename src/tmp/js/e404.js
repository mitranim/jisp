'use strict'

/******************************* Dependencies ********************************/

// Third party
var React = require('react')

// Custom components

/******************************** Components *********************************/

var e404 = React.createClass({displayName: 'e404',
  render: function() {return (

React.createElement("div", null, 
  React.createElement("h1", null, "Sorry, page not found."), 
  React.createElement(Link, {to: "/", className: "btn btn-lg btn-default"}, "Back to Home Page")
)

  )}
})

/********************************** Export ***********************************/

module.exports = e404
