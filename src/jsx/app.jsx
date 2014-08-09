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

var App = React.createClass({
  render: function() {
    return (

<div role='layout' className='layout'>

  <Navbar />

  <div className='site-wrap'>
    <this.props.activeRouteHandler />
  </div>

  <Footer />

</div>

    );
  }
});

var Footer = React.createClass({
  render: function() {
    return (

<footer className='site-footer'>
  <hr />
  <div className='container'>
    <p className='pull-right'>
      <a href='#' className='text-muted'>
        <span className='fa fa-arrow-up' />
      </a>
    </p>
    <p className='text-muted'>
      {'© ' +
       ((new Date().getFullYear() === 2014) ? 2014 : '2014—' + new Date().getFullYear())
       + ' Mitranim'}
    </p>
  </div>
</footer>

    );
  }
});

/********************************** Export ***********************************/

module.exports = App;
