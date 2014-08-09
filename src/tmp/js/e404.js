/** @jsx React.DOM */
'use strict';

/******************************* Dependencies ********************************/

// Third party
var React = require('react/addons'),
    rb    = require('react-bootstrap'),
    Link  = require('react-router').Link;

// Custom components

/******************************** Components *********************************/

var e404 = React.createClass({displayName: 'e404',
  render: function() {
    return (

React.DOM.div(null, 
  React.DOM.h1(null, "Sorry, page not found."), 
  Link({to: "/", className: "btn btn-lg btn-default"}, "Back to Home Page")
)

    );
  }
});

/********************************** Export ***********************************/

module.exports = e404;
