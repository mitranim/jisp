'use strict'

/******************************* Dependencies ********************************/

// Third party
var React  = require('react')

// Custom components

/******************************** Components *********************************/

var Footer = React.createClass({displayName: 'Footer',
  render: function() {return (

React.createElement("footer", {className: "site-footer"}, 
  React.createElement("hr", null), 
  React.createElement("div", {className: "container"}, 
    React.createElement("p", {className: "pull-right"}, 
      React.createElement("a", {href: "#", className: "text-muted"}, 
        React.createElement("span", {className: "fa fa-arrow-up"})
      )
    ), 
    React.createElement("p", {className: "text-muted"}, 
      '© ' +
       ((new Date().getFullYear() === 2014) ? 2014 : '2014—' + new Date().getFullYear())
       + ' Mitranim'
    )
  )
)

  )}
})

/********************************** Export ***********************************/

module.exports = Footer
