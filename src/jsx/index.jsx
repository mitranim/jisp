'use strict'

/******************************* Dependencies ********************************/

// Third party
var React   = require('react')

// Custom components
var Docs    = require('./docs')
var Sidenav = require('./sidenav')

/******************************** Components *********************************/

var Index = React.createClass({
  render: function() {return (

<div className='container'>
  <div className='row'>
    <Docs className='col-xs-12 col-md-9' />
    <Sidenav className='col-xs-12 col-md-3' />
  </div>
</div>

  )}
})

/********************************** Export ***********************************/

module.exports = Index
