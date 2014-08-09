/** @jsx React.DOM */
'use strict';

/******************************* Dependencies ********************************/

// Third party
var React  = require('react/addons'),
    rb     = require('react-bootstrap'),
    Link   = require('react-router').Link;

// Custom components
var id     = require('./utils').rndId,
    Navbar = require('./navbar');

/******************************** Components *********************************/

var App = React.createClass({displayName: 'App',
  render: function() {
    return (

React.DOM.div({role: "layout", className: "layout"}, 

  Navbar(null), 

  React.DOM.div({className: "site-wrap"}, 
    this.props.activeRouteHandler(null)
  ), 

  Footer(null)

)

    );
  }
});

var Footer = React.createClass({displayName: 'Footer',
  render: function() {
    return (

React.DOM.footer({className: "site-footer"}, 
  React.DOM.hr(null), 
  React.DOM.div({className: "container"}, 
    React.DOM.p({className: "pull-right"}, 
      React.DOM.a({href: "#", className: "text-muted"}, 
        React.DOM.span({className: "fa fa-arrow-up"})
      )
    ), 
    React.DOM.p({className: "text-muted"}, 
      '© ' +
       ((new Date().getFullYear() === 2014) ? 2014 : '2014—' + new Date().getFullYear())
       + ' Mitranim'
    )
  )
)

    );
  }
});

/********************************** Export ***********************************/

module.exports = App;
