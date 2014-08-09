/** @jsx React.DOM */
'use strict';

/**************************** Utilities / Export *****************************/

function rndId() {
  return ("id" + Math.floor(Math.random() * Math.pow(10, 16)).toString(16));
}
exports.rndId = rndId;
