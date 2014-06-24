(function() {
  function concat(lists) {
    var res, lst, _i, _i0, _res, _ref;
    lists = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = _i, []);
    (res = []);
    _res = [];
    _ref = lists;
    for (_i0 = 0; _i0 < _ref.length; ++_i0) {
      lst = _ref[_i0];
      _res.push((res = res.concat(lst)))
    }
    _res;
    return res;
  }
  var fs, path, mkdirp, spawn, exec, EventEmitter, jisp, util, optparse, useWinPathSep, banner, switches, opts, sources, sourceCode, notSources, optionParser, joinTimeout, compileJoin;
  (fs = require("fs"));
  (path = require("path"));
  (mkdirp = require("mkdirp"));
  (spawn = require("child_process").spawn);
  (exec = require("child_process").exec);
  (EventEmitter = require("events").EventEmitter);
  (jisp = require("./jisp"));
  (util = require("./util"));
  (optparse = require("./optparse"));
  (useWinPathSep = ((path.set === "\\ ".slice(0, 1))));
  util.extend(jisp, new EventEmitter());

  function printLine(line) {
    return process.stdout.write((line + "\n"))
  }
  printLine;

  function printWarn(line) {
    return process.stderr.write((line + "\n"))
  }
  printWarn;

  function hidden(file) {
    return /^\.|~$/.test(file)
  }
  hidden;
  (banner = "\nUsage: jisp [options] path/to/script.jisp -- [args]\n\nWhen called without options, compiles your script and prints the output to stdout.");
  (switches = [
    ["-c", "--compile", "compile to JavaScript and save as .js files"],
    ["-o", "--output [dir]", "set the output directory for compiled JavaScript"],
    ["-i", "--interactive", "run an interactive jisp REPL (this is the default with no options and arguments)"],
    ["-v", "--version", "display the version number"]
  ]);
  (opts = {});
  (sources = []);
  (sourceCode = []);
  (notSources = {});
  (optionParser = null);

  function run() {
    var replCliOpts, literals, source, _ref, _ref0, _ref1, _ref2, _i, _res, _ref3;
    parseOptions();
    (replCliOpts = {
      useGlobal: true
    });
    if (opts.version) {
      return _ref = version()
    } else {
      _ref = undefined
    }
    _ref;
    if ((opts.interactive || (!opts.arguments.length))) {
      return _ref0 = require("./repl").start(replCliOpts)
    } else {
      _ref0 = undefined
    }
    _ref0;
    if (opts.run) {
      _ref1 = opts.arguments.splice(1)
    } else {
      _ref1 = []
    }(literals = _ref1);
    (process.argv = process.argv.slice(0, 1).concat(literals));
    (process.argv[0] = 'jisp'); if (opts.output) {
      _ref2 = (opts.output = path.resolve(opts.output))
    } else {
      _ref2 = undefined
    }
    _ref2;
    _res = [];
    _ref3 = opts.arguments;
    for (_i = 0; _i < _ref3.length; ++_i) {
      source = _ref3[_i];
      (source = path.resolve(source));
      _res.push(compilePath(source, true, source));
    }
    return _res;
  }(exports.run = run);

  function compilePath(source, topLevel, base) {
    var stats, err, files, file, code, _ref, _ref0, _ref1, _ref2, _ref3, _ref4, _ref5, _i, _res, _ref6, _ref7, _ref8;
    if ((([].indexOf.call(sources, source) >= 0) || ((!topLevel) && (notSources[source] || hidden(source))))) {} else {
      _ref = undefined
    }
    _ref;
    try {
      _ref0 = (stats = fs.statSync(source))
    } catch (err) {
      if (((err.code === "ENOENT"))) {
        console.error(("File not found:" + source));
        _ref1 = process.exit(1);
      } else {
        _ref1 = undefined
      }
      _ref1;
      throw err;
      _ref0 = undefined;
    }
    _ref0;
    if (stats.isDirectory()) {
      if (((path.basename(source) === "node_modules"))) {
        _ref3 = (notSources[source] = true)
      } else if (opts.run) {
        _ref3 = compilePath(findDirectoryIndex(source), topLevel, base)
      } else {
        try {
          _ref4 = (files = fs.readdirSync(source))
        } catch (err) {
          if (((err.code === "ENOENT"))) {} else {
            throw err;
            _ref5 = undefined;
          }
          _ref4 = _ref5;
        }
        _ref4;
        _res = [];
        _ref6 = files;
        for (_i = 0; _i < _ref6.length; ++_i) {
          file = _ref6[_i];
          _res.push(compilePath(path.join(source, file), false, base))
        }
        _ref3 = _res;
      }
      _ref2 = _ref3;
    } else if ((topLevel || util.isJisp(source))) {
      sources.push(source);
      sourceCode.push(null);
      (delete notSources[source]);
      try {
        _ref7 = (code = fs.readFileSync(source))
      } catch (err) {
        if (((err.code === "ENOENT"))) {
          _ref8 = undefined;
          return
        } else {
          throw err;
          _ref8 = undefined;
        }
        _ref7 = _ref8;
      }
      _ref7;
      _ref2 = compileScript(source, code.toString(), base);
    } else {
      _ref2 = (notSources[source] = true)
    }
    return _ref2;
  }
  compilePath;

  function findDirectoryIndex(source) {
    var ext, index, err, _i, _res, _ref, _ref0, _ref1, _ref2;
    _res = [];
    _ref = jisp.fileExtensions;
    for (_i = 0; _i < _ref.length; ++_i) {
      ext = _ref[_i];
      (index = path.join(source, ("index" + ext)));
      try {
        if (fs.statSync(index).isFile()) {
          _ref1 = undefined
        } else {
          _ref1 = undefined
        }
        _ref0 = _ref1;
      } catch (err) {
        if ((!((err.code === "ENOENT")))) {
          throw err;
          _ref2 = undefined;
        } else {
          _ref2 = undefined
        }
        _ref0 = _ref2;
      }
      _res.push(_ref0);
    }
    _res;
    console.error(("Missing index.jisp in " + source));
    return process.exit(1);
  }
  findDirectoryIndex;

  function compileScript(file, input, base) {
    var o, options, task, t, compiled, err, message, _ref, _ref0, _ref1, _ref2, _ref3;
    if ((!(typeof base !== 'undefined' && base !== null))) {
      _ref = (base = null)
    } else {
      _ref = undefined
    }
    _ref;
    (o = opts);
    (options = compileOptions(file, base));
    try {
      (t = (task = {
        file: file,
        input: input,
        options: options
      }));
      jisp.emit("compile", task);
      if (o.run) {
        jisp.register();
        _ref1 = jisp.run(t.input, t.options);
      } else {
        (compiled = jisp.compile(t.input));
        (t.output = compiled);
        jisp.emit("success", task);
        if (o.compile) {
          _ref2 = writeJs(base, t.file, t.output, options.jsPath)
        } else {
          _ref2 = printLine(t.output.trim())
        }
        _ref1 = _ref2;
      }
      _ref0 = _ref1;
    } catch (err) {
      jisp.emit("failure", err, task);
      if (jisp.listeners("failure").length) {} else {
        _ref3 = undefined
      }
      _ref3;
      (message = (err.stack || err.toString()));
      printWarn(message);
      _ref0 = process.exit(1);
    }
    return _ref0;
  }
  compileScript;

  function compileStdin() {
    var code, stdin;
    (code = "");
    (stdin = process.openStdin());
    stdin.on("data", (function(buffer) {
      var _ref;
      if (buffer) {
        _ref = (code += buffer.toString())
      } else {
        _ref = undefined
      }
      return _ref;
    }));
    return stdin.on("end", (function() {
      return compileScript(null, code)
    }));
  }
  compileStdin;
  (joinTimeout = null);
  (compileJoin = (function() {
    var _ref;
    if ((!sourceCode.some((function(code) {
      return ((code === null))
    })))) {
      clearTimeout(joinTimeout);
      _ref = (joinTimeout = wait(100, (function() {
        return compileScript(opts.join, sourceCode.join("\n"), opts.join)
      })));
    } else {
      _ref = undefined
    }
    return _ref;
  }));

  function outputPath(source, base, extension) {
    var basename, srcDir, dir, _ref, _ref0;
    if ((!(typeof extension !== 'undefined' && extension !== null))) {
      _ref = (extension = ".js")
    } else {
      _ref = undefined
    }
    _ref;
    (basename = util.baseFileName(source, true, useWinPathSep));
    (srcDir = path.dirname(source));
    if ((!opts.output)) {
      _ref0 = srcDir
    } else if (((source === base))) {
      _ref0 = opts.output
    } else {
      _ref0 = path.join(opts.output, path.relative(base, srcDir))
    }(dir = _ref0);
    return path.join(dir, (basename + extension));
  }
  outputPath;

  function writeJs(base, sourcePath, js, jsPath) {
    var jsDir;
    (jsDir = path.dirname(jsPath));
    (js = js);

    function compile() {
      var _ref, _ref0;
      if (opts.compile) {
        if ((js.length <= 0)) {
          _ref0 = (js = " ")
        } else {
          _ref0 = undefined
        }
        _ref0;
        _ref = fs.writeFile(jsPath, js, (function(err) {
          var _ref1;
          if (err) {
            _ref1 = printLine(err.message)
          } else {
            _ref1 = undefined
          }
          return _ref1;
        }));
      } else {
        _ref = undefined
      }
      return _ref;
    }
    compile;
    return fs.exists(jsDir, (function(itExists) {
      var _ref;
      if (itExists) {
        _ref = compile()
      } else {
        _ref = mkdirp(jsDir, compile)
      }
      return _ref;
    }));
  }
  writeJs;

  function wait(milliseconds, func) {
    return setTimeout(func, milliseconds)
  }
  wait;

  function parseOptions() {
    var o;
    (optionParser = new optparse.OptionParser(switches, banner));
    (opts = optionParser.parse(process.argv.slice(2)));
    (o = opts);
    (o.compile = (o.compile || !!o.output));
    return (o.run = (!o.compile));
  }
  parseOptions;

  function compileOptions(filename, base) {
    var answer, cwd, jsPath, jsDir, _ref, _ref0;
    (answer = {
      filename: filename
    });
    if ((!filename)) {
      _ref = answer
    } else {
      if (base) {
        (cwd = process.cwd());
        (jsPath = outputPath(filename, base));
        (jsDir = path.dirname(jsPath));
        _ref0 = (answer = util.merge(answer, {
          jsPath: jsPath,
          sourceRoot: path.relative(jsDir, cwd),
          sourceFiles: [path.relative(cwd, filename)],
          generatedFile: util.baseFileName(jsPath, false, useWinPathSep)
        }));
      } else {
        _ref0 = (answer = util.merge(answer, {
          sourceRoot: "",
          sourceFiles: [util.baseFileName(filename, false, useWinPathSep)],
          generatedFile: (util.baseFileName(filename, true, useWinPathSep) + ".js")
        }))
      }
      _ref = _ref0;
    }
    return _ref;
  }
  compileOptions;

  function version() {
    return printLine(("jisp version " + jisp.version))
  }
  return version;
}).call(this)