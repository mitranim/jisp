/** @jsx React.DOM */
'use strict';

/******************************* Dependencies ********************************/

// Third party
var React = require('react/addons'),
    Link  = require('react-router').Link;

// Custom components

/******************************** Components *********************************/

var Navbar = React.createClass({
  render: function() {
    return (

<div className='navbar navbar-default'>
  <div className='container'>
    <div className='navbar-header'>
      <a href='/' className='navbar-brand fa fa-code'> jisp</a>
      <a href='https://github.com/Mitranim/jisp'
         className='fa fa-github navbar-brand'> source at github</a>
    </div>
  </div>
</div>

    );
  }
});

/********************************** Export ***********************************/

module.exports = Navbar;
