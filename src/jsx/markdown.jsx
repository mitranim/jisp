/** @jsx React.DOM */
'use strict';

/******************************* Dependencies ********************************/

// Third party
var React  = require('react/addons'),
    marked = require('marked');

/********************************* Configure *********************************/

marked.setOptions({
  gfm:         true,
  tables:      true,
  breaks:      true,
  sanitize:    false,
  smartypants: true
});

/******************************** Components *********************************/

var md = React.createClass({
  render: function() {
    var text = this.props.children.toString();
    return (

<div dangerouslySetInnerHTML={{__html: marked(text)}}
     className={this.props.className}
     style={this.props.style} />

    );
  }
});

/********************************** Export ***********************************/

module.exports = {markdown : marked,
                  md       : md};
