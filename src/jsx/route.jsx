/** @jsx React.DOM */
'use strict';

/******************************* Dependencies ********************************/

// Third party
var React  = require('react/addons'),
    Routes = require('react-router').Routes,
    Route  = require('react-router').Route;

// Custom components
var App    = require('./app'),
    Index  = require('./index'),
    e404   = require('./e404');

/********************************* Rendering *********************************/

React.renderComponent((

<Routes location='history'>
  <Route handler={App}>
    <Route handler={Index} />
    <Route name='*' handler={e404} />
  </Route>
</Routes>

), document.body);
