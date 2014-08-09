/** @jsx React.DOM */
'use strict';

/******************************* Dependencies ********************************/

// Third party
var React = require('react/addons'),
    Link  = require('react-router').Link;

// Custom components

/******************************** Components *********************************/

var Navbar = React.createClass({displayName: 'Navbar',
  render: function() {
    return (

React.DOM.div({className: "navbar navbar-default"}, 
  React.DOM.div({className: "container"}, 
    React.DOM.div({className: "navbar-header"}, 
      React.DOM.a({href: "/", className: "navbar-brand fa fa-code"}, " jisp"), 
      React.DOM.a({href: "https://github.com/Mitranim/jisp", 
         className: "fa fa-github navbar-brand"}, " source at github")
    )
  )
)

    );
  }
});

/********************************** Export ***********************************/

module.exports = Navbar;
