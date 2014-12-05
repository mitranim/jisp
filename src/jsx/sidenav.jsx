'use strict'

/******************************* Dependencies ********************************/

// Third party
var React = require('react')

// Custom components

/******************************** Components *********************************/

var Sidenav = React.createClass({
  render: function() {return (

<div className={this.props.className}>
  <div className='affix bs-sidebar hidden-print'>
    <ul className='nav bs-sidenav'>
      <li><a href='#installation'>Installation and Usage</a></li>
      <li><a href='#code-structure'>Code Structure</a></li>
      <li><a href='#everything-exp'>Everything an Expression</a></li>
      <li><a href='#quoting'>Quoting</a></li>
      <li><a href='#blocks'>Blocks and Chaining</a></li>
      <li><a href='#object-props'>Object Properties</a></li>
      <li>
        <a href='#functions'>Functions</a>
        <ul className='nav'>
          <li><a href='#definition'>Definition</a></li>
          <li><a href='#call-return'>Calling and Returning</a></li>
          <li><a href='#lambda'>Lambda Syntax</a></li>
          <li><a href='#let'>Let</a></li>
        </ul>
      </li>
      <li><a href='#assignment'>Assignment</a></li>
      <li><a href='#destructuring'>Destructuring Assignment</a></li>
      <li>
        <a href='#spreading-rest'>Spreading and Rest Parameter</a>
        <ul className='nav'>
          <li><a href='#spread-into-list'>Spread Into List</a></li>
          <li><a href='#argument-spread'>Argument Spread</a></li>
          <li><a href='#rest-parameter'>Rest Parameter</a></li>
        </ul>
      </li>
      <li>
        <a href='#conditionals'>Conditionals</a>
        <ul className='nav'>
          <li><a href='#logic'>Logic</a></li>
          <li><a href='#existence'>Existence</a></li>
          <li><a href='#if'>If</a></li>
          <li><a href='#switch'>Switch</a></li>
          <li><a href='#try-catch'>Try / Catch</a></li>
        </ul>
      </li>
      <li>
        <a href='#loops'>Loops</a>
        <ul className='nav'>
          <li><a href='#over'>Over</a></li>
          <li><a href='#for'>For</a></li>
          <li><a href='#while'>While</a></li>
        </ul>
      </li>
      <li><a href='#comprehensions'>Comprehensions</a></li>
      <li>
        <a href='#macros'>Macros</a>
        <ul className='nav'>
          <li><a href='#templating'>Templating</a></li>
          <li><a href='#code-construction'>Code Construction</a></li>
          <li><a href='#macro-import-export'>Macro Import and Export</a></li>
          <li><a href='#macro-notes'>Notes</a></li>
        </ul>
      </li>
      <li>
        <a href='#built-ins'>Built-ins and Embedding</a>
        <ul className='nav'>
          <li><a href='#built-in-macros'>Macros</a></li>
          <li><a href='#built-in-functions'>Functions</a></li>
          <li><a href='#function-import-export'>Function Import and Export</a></li>
        </ul>
      </li>
      <li><a href='#style'>Style</a></li>
      <li>
        <a href='#why'>Why Use Jisp</a>
        <ul className='nav'>
          <li><a href='#why-over'>Why Jisp Over [insert dialect X]</a></li>
        </ul>
      </li>
      <li><a href='#acknowledgements'>Acknowledgements and Notes</a></li>
    </ul>
  </div>
</div>

  )}
})

/********************************** Export ***********************************/

module.exports = Sidenav
