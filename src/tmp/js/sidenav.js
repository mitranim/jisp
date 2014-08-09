/** @jsx React.DOM */
'use strict';

/******************************* Dependencies ********************************/

// Third party
var React = require('react/addons'),
    rb    = require('react-bootstrap'),
    Link  = require('react-router').Link;

// Custom components
var id    = require('./utils').rndId;

/******************************** Components *********************************/

var Sidenav = React.createClass({displayName: 'Sidenav',
  render: function() {
    return (

React.DOM.div({className: this.props.className}, 
  React.DOM.div({className: "affix bs-sidebar hidden-print"}, 
    React.DOM.ul({className: "nav bs-sidenav"}, 
      React.DOM.li(null, React.DOM.a({href: "#installation"}, "Installation and Usage")), 
      React.DOM.li(null, React.DOM.a({href: "#code-structure"}, "Code Structure")), 
      React.DOM.li(null, React.DOM.a({href: "#everything-exp"}, "Everything an Expression")), 
      React.DOM.li(null, React.DOM.a({href: "#quoting"}, "Quoting")), 
      React.DOM.li(null, React.DOM.a({href: "#blocks"}, "Blocks and Chaining")), 
      React.DOM.li(null, React.DOM.a({href: "#object-props"}, "Object Properties")), 
      React.DOM.li(null, 
        React.DOM.a({href: "#functions"}, "Functions"), 
        React.DOM.ul({className: "nav"}, 
          React.DOM.li(null, React.DOM.a({href: "#definition"}, "Definition")), 
          React.DOM.li(null, React.DOM.a({href: "#call-return"}, "Calling and Returning")), 
          React.DOM.li(null, React.DOM.a({href: "#lambda"}, "Lambda Syntax")), 
          React.DOM.li(null, React.DOM.a({href: "#let"}, "Let"))
        )
      ), 
      React.DOM.li(null, React.DOM.a({href: "#assignment"}, "Assignment")), 
      React.DOM.li(null, React.DOM.a({href: "#destructuring"}, "Destructuring Assignment")), 
      React.DOM.li(null, 
        React.DOM.a({href: "#spreading-rest"}, "Spreading and Rest Parameter"), 
        React.DOM.ul({className: "nav"}, 
          React.DOM.li(null, React.DOM.a({href: "#spread-into-list"}, "Spread Into List")), 
          React.DOM.li(null, React.DOM.a({href: "#argument-spread"}, "Argument Spread")), 
          React.DOM.li(null, React.DOM.a({href: "#rest-parameter"}, "Rest Parameter"))
        )
      ), 
      React.DOM.li(null, 
        React.DOM.a({href: "#conditionals"}, "Conditionals"), 
        React.DOM.ul({className: "nav"}, 
          React.DOM.li(null, React.DOM.a({href: "#logic"}, "Logic")), 
          React.DOM.li(null, React.DOM.a({href: "#existence"}, "Existence")), 
          React.DOM.li(null, React.DOM.a({href: "#if"}, "If")), 
          React.DOM.li(null, React.DOM.a({href: "#switch"}, "Switch")), 
          React.DOM.li(null, React.DOM.a({href: "#try-catch"}, "Try / Catch"))
        )
      ), 
      React.DOM.li(null, 
        React.DOM.a({href: "#loops"}, "Loops"), 
        React.DOM.ul({className: "nav"}, 
          React.DOM.li(null, React.DOM.a({href: "#over"}, "Over")), 
          React.DOM.li(null, React.DOM.a({href: "#for"}, "For")), 
          React.DOM.li(null, React.DOM.a({href: "#while"}, "While"))
        )
      ), 
      React.DOM.li(null, React.DOM.a({href: "#comprehensions"}, "Comprehensions")), 
      React.DOM.li(null, 
        React.DOM.a({href: "#macros"}, "Macros"), 
        React.DOM.ul({className: "nav"}, 
          React.DOM.li(null, React.DOM.a({href: "#templating"}, "Templating")), 
          React.DOM.li(null, React.DOM.a({href: "#code-construction"}, "Code Construction")), 
          React.DOM.li(null, React.DOM.a({href: "#macro-import-export"}, "Macro Import and Export")), 
          React.DOM.li(null, React.DOM.a({href: "#macro-notes"}, "Notes"))
        )
      ), 
      React.DOM.li(null, 
        React.DOM.a({href: "#built-ins"}, "Built-ins and Embedding"), 
        React.DOM.ul({className: "nav"}, 
          React.DOM.li(null, React.DOM.a({href: "#built-in-macros"}, "Macros")), 
          React.DOM.li(null, React.DOM.a({href: "#built-in-functions"}, "Functions")), 
          React.DOM.li(null, React.DOM.a({href: "#function-import-export"}, "Function Import and Export"))
        )
      ), 
      React.DOM.li(null, React.DOM.a({href: "#style"}, "Style")), 
      React.DOM.li(null, 
        React.DOM.a({href: "#why"}, "Why Use Jisp"), 
        React.DOM.ul({className: "nav"}, 
          React.DOM.li(null, React.DOM.a({href: "#why-over"}, "Why Jisp Over [insert dialect X]"))
        )
      ), 
      React.DOM.li(null, React.DOM.a({href: "#acknowledgements"}, "Acknowledgements and Notes"))
    )
  )
)

    );
  }
});

/********************************** Export ***********************************/

module.exports = Sidenav;
