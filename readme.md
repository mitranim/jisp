## Description

Jisp is the modern JavaScript for the modern developer. Its macro system lets you treat code as data and write functions that write code for you. Reuse code without runtime limitations, make your code more abstract and shorter, reprogram the language itself.

Jisp's extremely simple syntax protects against common JS pitfalls, and it builds some common coding patterns right into the language, helping keep your code short.

See the [interactive online documentation](http://jisp.io). You can contribute to the documentation by sending pull requests to the [gh-pages](https://github.com/Mitranim/jisp/tree/gh-pages) branch of this repo.

## Installation and Usage

Install from npm:

    $ npm install -g jisp

Or download the source and use `./bin/jisp` and `./jisp/jisp.js` as entry points.

Require in Node, registering the file extension:

    require('jisp/register');

This allows you to `require` jisp scripts directly from your code, like so:

    require('./app.jisp');

Launch an interactive REPL:

    $ jisp
    jisp>

Compile a file or directory:

    $ jisp -c <file>

Stream-compile with [gulp-jisp](https://github.com/Mitranim/gulp-jisp).

While not recommended for production, jisp can be directly used in the browser. Include the `browser/jisp.js` file with your webpage. It registers the `text/jisp` script type to automatically compile and run jisp scripts loaded with `src` or included in script tags. It also exposes a global object with the `compile` and `eval` methods for jisp code. This is how the [documentation](http://jisp.io) is implemented.

When hacking at the compiler, use the following commands in the project dir:

    npm test                 -- recompiles dev from src twice, using the dev compiler
    npm run reset            -- disaster recovery: recompiles dev with lib (stable)
    npm run build            -- recompiles lib with dev (prepublish)

Super basic Sublime Text build system (OS X):
* _Tools_ > _Build System_ > _New Build System_
* put line: `"cmd": ["jisp", "$file"]`
* save to: `~/Library/Application Support/Sublime Text 3/Packages/User`
