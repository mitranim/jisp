'use strict'

/******************************* Dependencies ********************************/

// Third party
var React  = require('react')

// Custom components

/******************************** Components *********************************/

var Footer = React.createClass({
  render: function() {return (

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

  )}
})

/********************************** Export ***********************************/

module.exports = Footer
