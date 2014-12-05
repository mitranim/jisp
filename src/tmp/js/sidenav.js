'use strict'

/******************************* Dependencies ********************************/

// Third party
var React = require('react')

// Custom components

/******************************** Components *********************************/

var Sidenav = React.createClass({displayName: 'Sidenav',
  render: function() {return (

React.createElement("div", {className: this.props.className}, 
  React.createElement("div", {className: "affix bs-sidebar hidden-print"}, 
    React.createElement("ul", {className: "nav bs-sidenav"}, 
      React.createElement("li", null, React.createElement("a", {href: "#installation"}, "Installation and Usage")), 
      React.createElement("li", null, React.createElement("a", {href: "#code-structure"}, "Code Structure")), 
      React.createElement("li", null, React.createElement("a", {href: "#everything-exp"}, "Everything an Expression")), 
      React.createElement("li", null, React.createElement("a", {href: "#quoting"}, "Quoting")), 
      React.createElement("li", null, React.createElement("a", {href: "#blocks"}, "Blocks and Chaining")), 
      React.createElement("li", null, React.createElement("a", {href: "#object-props"}, "Object Properties")), 
      React.createElement("li", null, 
        React.createElement("a", {href: "#functions"}, "Functions"), 
        React.createElement("ul", {className: "nav"}, 
          React.createElement("li", null, React.createElement("a", {href: "#definition"}, "Definition")), 
          React.createElement("li", null, React.createElement("a", {href: "#call-return"}, "Calling and Returning")), 
          React.createElement("li", null, React.createElement("a", {href: "#lambda"}, "Lambda Syntax")), 
          React.createElement("li", null, React.createElement("a", {href: "#let"}, "Let"))
        )
      ), 
      React.createElement("li", null, React.createElement("a", {href: "#assignment"}, "Assignment")), 
      React.createElement("li", null, React.createElement("a", {href: "#destructuring"}, "Destructuring Assignment")), 
      React.createElement("li", null, 
        React.createElement("a", {href: "#spreading-rest"}, "Spreading and Rest Parameter"), 
        React.createElement("ul", {className: "nav"}, 
          React.createElement("li", null, React.createElement("a", {href: "#spread-into-list"}, "Spread Into List")), 
          React.createElement("li", null, React.createElement("a", {href: "#argument-spread"}, "Argument Spread")), 
          React.createElement("li", null, React.createElement("a", {href: "#rest-parameter"}, "Rest Parameter"))
        )
      ), 
      React.createElement("li", null, 
        React.createElement("a", {href: "#conditionals"}, "Conditionals"), 
        React.createElement("ul", {className: "nav"}, 
          React.createElement("li", null, React.createElement("a", {href: "#logic"}, "Logic")), 
          React.createElement("li", null, React.createElement("a", {href: "#existence"}, "Existence")), 
          React.createElement("li", null, React.createElement("a", {href: "#if"}, "If")), 
          React.createElement("li", null, React.createElement("a", {href: "#switch"}, "Switch")), 
          React.createElement("li", null, React.createElement("a", {href: "#try-catch"}, "Try / Catch"))
        )
      ), 
      React.createElement("li", null, 
        React.createElement("a", {href: "#loops"}, "Loops"), 
        React.createElement("ul", {className: "nav"}, 
          React.createElement("li", null, React.createElement("a", {href: "#over"}, "Over")), 
          React.createElement("li", null, React.createElement("a", {href: "#for"}, "For")), 
          React.createElement("li", null, React.createElement("a", {href: "#while"}, "While"))
        )
      ), 
      React.createElement("li", null, React.createElement("a", {href: "#comprehensions"}, "Comprehensions")), 
      React.createElement("li", null, 
        React.createElement("a", {href: "#macros"}, "Macros"), 
        React.createElement("ul", {className: "nav"}, 
          React.createElement("li", null, React.createElement("a", {href: "#templating"}, "Templating")), 
          React.createElement("li", null, React.createElement("a", {href: "#code-construction"}, "Code Construction")), 
          React.createElement("li", null, React.createElement("a", {href: "#macro-import-export"}, "Macro Import and Export")), 
          React.createElement("li", null, React.createElement("a", {href: "#macro-notes"}, "Notes"))
        )
      ), 
      React.createElement("li", null, 
        React.createElement("a", {href: "#built-ins"}, "Built-ins and Embedding"), 
        React.createElement("ul", {className: "nav"}, 
          React.createElement("li", null, React.createElement("a", {href: "#built-in-macros"}, "Macros")), 
          React.createElement("li", null, React.createElement("a", {href: "#built-in-functions"}, "Functions")), 
          React.createElement("li", null, React.createElement("a", {href: "#function-import-export"}, "Function Import and Export"))
        )
      ), 
      React.createElement("li", null, React.createElement("a", {href: "#style"}, "Style")), 
      React.createElement("li", null, 
        React.createElement("a", {href: "#why"}, "Why Use Jisp"), 
        React.createElement("ul", {className: "nav"}, 
          React.createElement("li", null, React.createElement("a", {href: "#why-over"}, "Why Jisp Over [insert dialect X]"))
        )
      ), 
      React.createElement("li", null, React.createElement("a", {href: "#acknowledgements"}, "Acknowledgements and Notes"))
    )
  )
)

  )}
})

/********************************** Export ***********************************/

module.exports = Sidenav
