/** @jsx React.DOM */
'use strict';

/******************************* Dependencies ********************************/

// Third party
var React   = require('react/addons');

// Custom components
var id      = require('./utils').rndId,
    Docs    = require('./docs'),
    Sidenav = require('./sidenav');

/******************************** Components *********************************/

var Index = React.createClass({displayName: 'Index',
  render: function() {
    return (

React.DOM.div({className: "container"}, 
  React.DOM.div({className: "row"}, 
    Docs({className: "col-xs-12 col-md-9"}
    ), 
    Sidenav({className: "col-xs-12 col-md-3"}
    )
  )
)

    );
  }
});

/********************************** Export ***********************************/

module.exports = Index;
