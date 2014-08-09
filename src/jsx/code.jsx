/** @jsx React.DOM */
'use strict';

/******************************* Dependencies ********************************/

// Third party
var React    = require('react/addons'),
    beautify = require('js-beautify');

// Custom components
var jisp     = window.jisp;  // global

jisp.eval("(prn 'If we’re seeing this, jisp.eval works.\n"+
"Check out the global jisp object — window.jisp — and its methods.\n" +
"You can compile or eval code in the browser or in the documentation snippets." +
"')");

/********************************* Utilities *********************************/

function compile (src) {
  var compiled = jisp.compile(src, {wrap: false});
  return beautify(compiled, {indent_size: 2});
}

/******************************** Components *********************************/

var Code = React.createClass({
  getInitialState: function() {
    var src = this.props.children.toString();
    try {
      var compiled = compile(src),
          lines    = compiled.match(/\n/g) ? compiled.match(/\n/g).length : 0,
          style    = {height: (lines + 5) * 1.5 + 'em'};
      return {compiled: compiled, style: style}
    } catch (err) {
      return {error: err.message}
    }
  },
  reCompile: function() {
    var src = this.refs.src.getDOMNode().value;
    try {
      var compiled = compile(src),
          lines    = compiled.match(/\n/g) ? compiled.match(/\n/g).length : 0,
          style    = {height: (lines + 5) * 1.5 + 'em'};
      this.setState({compiled : compiled,
                     error    : undefined,
                     evaled   : undefined,
                     style    : style})
    } catch (err) {
      this.setState({compiled : undefined,
                     error    : err.message,
                     evaled   : undefined})
    }
  },
  handleClick: function() {
    if (this.state.evaled) {
      this.reCompile()
    } else {
      var src = '(prn (do' + this.refs.src.getDOMNode().value + '))';
      try {
        var compiled = compile(src),
            buffer   = '',
            log      = console.log;
        console.log = function() {
          if (arguments.length) buffer += [].slice.call(arguments, 0).join(' ') + '\n';
        };
        try {
          eval(compiled)
        } catch (err) {
          console.log(err.message)
        } finally {
          console.log = log;
          this.setState({
            compiled : undefined,
            error    : undefined,
            evaled   : buffer});
        }
      } catch (err) {
        this.setState({
          compiled : undefined,
          error    : err.message,
          evaled   : undefined
        })
      }
    }
    return false;
  },
  render: function() {
    return (

<div className='row-code' style={this.state.style}>

    <textarea className='form-control form-code'
              defaultValue={this.props.children.toString()}
              onChange={this.reCompile}
              style={this.state.style}
              ref='src' />

    <pre className={'form-code' + (this.state.error  ? ' error'  :
                                  (this.state.evaled ? ' evaled' : ''))}
         style={this.state.style}
         ref='compiled'>
      {this.state.error || this.state.evaled || this.state.compiled}
    </pre>

    <button className={'btn btn-sm btn-default btn-eval' +
                       (this.state.error  ? ' error'  :
                       (this.state.evaled ? ' evaled' : ''))}
            onClick={this.handleClick}>
      {this.state.evaled ? 'close' : 'eval'}
    </button>

</div>

    );
  }
});

/********************************** Export ***********************************/

module.exports = Code;
