'use strict'

/******************************* Dependencies ********************************/

// Third party
var React = require('react')

// Custom components

/******************************** Components *********************************/

var Navbar = React.createClass({displayName: 'Navbar',
  render: function() {return (

React.createElement("div", {className: "navbar navbar-default"}, 
  React.createElement("div", {className: "container"}, 
    React.createElement("div", {className: "navbar-header"}, 
      React.createElement("a", {href: "/", className: "navbar-brand fa fa-code"}, " jisp"), 
      React.createElement("a", {href: "https://github.com/Mitranim/jisp", 
         className: "fa fa-github navbar-brand"}, " source at github")
    )
  )
)

  )}
})

/********************************** Export ***********************************/

module.exports = Navbar
