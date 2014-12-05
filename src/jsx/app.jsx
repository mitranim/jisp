'use strict'

/******************************* Dependencies ********************************/

// Third party
var React  = require('react')

// Enable Bootstrap JS
var rb     = require('react-bootstrap')

// Custom components
var Index  = require('./index')
var Navbar = require('./navbar')
var Footer = require('./footer')

/******************************** Components *********************************/

var App = React.createClass({
  render: function() {return (

<div role='layout' className='layout'>

  <Navbar />

  <div className='site-wrap'>
    <Index />
  </div>

  <Footer />

</div>

  )}
})

/********************************** Render ***********************************/

React.render(<App />, document.body)
