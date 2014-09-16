'use strict'

/******************************* Dependencies ********************************/

// Third party
var fs       = require('fs'),
    inspect  = require('util').inspect

var dir = require('path').join(__dirname, '../dev/jisp/')

// Custom components
var tokenise = require(dir + 'tokenise'),
    lex      = require(dir + 'lex'),
    parse    = require(dir + 'parse'),
    compile  = require(dir + 'compile')

/*********************************** Mock ************************************/

var src = fs.readFileSync('./code.jisp', 'utf8')

// console.log("-- tokenised:\n", inspect(tokenise(src), {depth: null}))
// console.log("-- lexed:\n",     inspect(lex(tokenise(src)), {depth: null}))
// console.log("-- parsed:\n", inspect(parse(lex(tokenise(src))), {depth: null}))
// console.log("-- coded:\n%s", inspect(parse(lex(tokenise(src))).uniq().plan().code(), {depth: null}))
// console.log("-- printed:\n%s", parse(lex(tokenise(src))).uniq().plan().code().print())
console.log("-- compiled:\n%s", compile(src))
