/** @jsx React.DOM */
'use strict';

/******************************* Dependencies ********************************/

// Third party
var React = require('react/addons'),
    rb    = require('react-bootstrap'),
    Link  = require('react-router').Link;

// Custom components

/******************************** Components *********************************/

var e404 = React.createClass({
  render: function() {
    return (

<div>
  <h1>Sorry, page not found.</h1>
  <Link to='/' className='btn btn-lg btn-default'>Back to Home Page</Link>
</div>

    );
  }
});

/********************************** Export ***********************************/

module.exports = e404;
