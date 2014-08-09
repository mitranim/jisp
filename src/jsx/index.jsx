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

var Index = React.createClass({
  render: function() {
    return (

<div className='container'>
  <div className='row'>
    <Docs className='col-xs-12 col-md-9'>
    </Docs>
    <Sidenav className='col-xs-12 col-md-3'>
    </Sidenav>
  </div>
</div>

    );
  }
});

/********************************** Export ***********************************/

module.exports = Index;
