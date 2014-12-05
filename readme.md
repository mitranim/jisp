> Note: I apologise for the lack of updates. I've been preparing [0.4.0](https://github.com/Mitranim/jisp/tree/0.4.0), which is a complete rewrite of the compiler with a bunch of breaking changes. It revises some parts of the language, dropping dead end ideas and focusing on the core features. Unfortunately I'm busy with some other projects right now.

## Description

Jisp is [the modern JavaScript for the modern developer](http://jisp.io). Its macro system lets you treat code as data and write functions that write code for you. Reuse code without runtime limitations, make your code more abstract and shorter, reprogram the language itself.

Jisp's extremely simple syntax protects against common JS pitfalls, and it builds some common coding patterns right into the language, helping keep your code short.

See the [interactive online documentation](http://jisp.io). You can contribute to the documentation by sending pull requests to the [gh-pages](https://github.com/Mitranim/jisp/tree/gh-pages) branch of this repo.

## Installation and Usage

Get [Node.js](http://nodejs.org). This will give you the local `node` runtime and the `npm` package manager. Install jisp with `npm`:

    $ npm install -g jisp

Alternatively, download the source, run `npm install` to get the dependencies, and use `./bin/jisp` and `./jisp/jisp.js` as entry points.

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
* `sudo npm install -g jisp`
* `Tools > Build System > New Build System`
* put lines:

        {
          "cmd": ["jisp", "$file"],
          "path": "/usr/local/bin/"
        }

* save to: `~/Library/Application Support/Sublime Text 3/Packages/User`
