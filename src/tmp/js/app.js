'use strict'

/******************************* Dependencies ********************************/

// Third party
var React  = require('react')

// Enable Bootstrap JS
var rb     = require('react-bootstrap')

// Custom components
var Index  = require('./index')
var Navbar = require('./navbar')
var Footer = require('./footer')

/******************************** Components *********************************/

var App = React.createClass({displayName: 'App',
  render: function() {return (

React.createElement("div", {role: "layout", className: "layout"}, 

  React.createElement(Navbar, null), 

  React.createElement("div", {className: "site-wrap"}, 
    React.createElement(Index, null)
  ), 

  React.createElement(Footer, null)

)

  )}
})

/********************************** Render ***********************************/

React.render(React.createElement(App, null), document.body)
