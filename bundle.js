'use strict'

/*********************************** Usage ***********************************/

/**
* Default (no args): bundle the dev compiler
*/

/******************************* Dependencies ********************************/

// Third party
var fs   = require('fs'),
    path = require('path'),
    args = require('yargs').argv,
    brw  = require('browserify')()

/********************************** Bundle ***********************************/

var sourceFile = path.join(__dirname, './dev/jisp/compile.js'),
    outputFile = path.join(__dirname, './browser/jisp.js')

brw.add(sourceFile)
brw.bundle().pipe(fs.createWriteStream(outputFile))

console.log('-- writing bundle to', outputFile)
