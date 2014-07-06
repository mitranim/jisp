(function() {
  function concat() {
    var _res, lst, _i, _i0, _ref;
    lists = 1 <= arguments.length ? [].slice.call(arguments, 0, _i = arguments.length - 0) : (_i = 0, []);
    _res = [];
    _ref = lists;
    for (_i0 = 0; _i0 < _ref.length; ++_i0) {
      lst = _ref[_i0];
      _res = _res.concat(lst);
    }
    return _res;
  }
  var fs, path, mkdirp, spawn, exec, EventEmitter, jisp, util, optparse, useWinPathSep, banner, switches, opts, sources, sourceCode, notSources, optionParser, joinTimeout, compileJoin;
  fs = require("fs");
  path = require("path");
  mkdirp = require("mkdirp");
  spawn = require("child_process").spawn;
  exec = require("child_process").exec;
  EventEmitter = require("events").EventEmitter;
  jisp = require("./jisp");
  util = require("./util");
  optparse = require("./optparse");
  useWinPathSep = path.set === "\\ ".slice(0, 1);
  util.extend(jisp, new EventEmitter());

  function printLine(line) {
    return process.stdout.write(line + "\n");
  }
  printLine;

  function printWarn(line) {
    return process.stderr.write(line + "\n");
  }
  printWarn;

  function hidden(file) {
    return /^\.|~$/.test(file);
  }
  hidden;
  banner = "\nUsage: jisp [options] path/to/script.jisp -- [args]\n\nWhen called without options, compiles your script and prints the output to stdout.";
  switches = [
    ["-c", "--compile", "compile to JavaScript and save as .js files"],
    ["-o", "--output [dir]", "set the output directory for compiled JavaScript"],
    ["-i", "--interactive", "run an interactive jisp REPL (this is the default with no options and arguments)"],
    ["-v", "--version", "display the version number"]
  ];
  opts = {}
  sources = [];
  sourceCode = [];
  notSources = {}
  optionParser = null;

  function run() {
    var replCliOpts, literals, source, _i, _res, _ref;
    parseOptions();
    replCliOpts = {
      useGlobal: true
    }
    if (opts.version) {
      return version();
    }
    if (opts.interactive || !opts.arguments.length) {
      return require("./repl").start(replCliOpts);
    }
    literals = opts.run ? opts.arguments.splice(1) : [];
    process.argv = process.argv.slice(0, 1).concat(literals);
    process.argv[0] = 'jisp';
    opts.output ? opts.output = path.resolve(opts.output) : undefined;
    _res = [];
    _ref = opts.arguments;
    for (_i = 0; _i < _ref.length; ++_i) {
      source = _ref[_i];
      source = path.resolve(source);
      _res.push(compilePath(source, true, source));
    }
    return _res;
  }
  exports.run = run;

  function compilePath(source, topLevel, base) {
    var stats, files, file, code, _i, _res, _ref, _ref0, _ref10;
    if (([].indexOf.call(sources, source, sources) >= 0) || (!topLevel && (notSources[source] || hidden(source)))) {}
    try {
      (stats = fs.statSync(source));
    } catch (err) {
      if (err.code === "ENOENT") {
        console.error("File not found:" + source);
        process.exit(1);
      }
      throw err;
    }
    if (stats.isDirectory()) {
      if (path.basename(source) === "node_modules") {
        _ref0 = (notSources[source] = true);
      } else if (opts.run) {
        _ref0 = compilePath(findDirectoryIndex(source), topLevel, base);
      } else {
        try {
          (files = fs.readdirSync(source));
        } catch (err) {
          if (err.code === "ENOENT") {} else {
            throw err;
          }
        }
        _res = [];
        _ref = files;
        for (_i = 0; _i < _ref.length; ++_i) {
          file = _ref[_i];
          _res.push(compilePath(path.join(source, file), false, base));
        }
        _ref0 = _res;
      }
      _ref10 = _ref0;
    } else if ((topLevel || util.isJisp(source))) {
      sources.push(source);
      sourceCode.push(null);
      delete notSources[source];
      try {
        (code = fs.readFileSync(source));
      } catch (err) {
        if (err.code === "ENOENT") {
          return;
        } else {
          throw err;
        }
      }
      _ref10 = compileScript(source, code.toString(), base);
    } else {
      _ref10 = (notSources[source] = true);
    }
    return _ref10;
  }
  compilePath;

  function findDirectoryIndex(source) {
    var ext, index, _i, _ref;
    _ref = jisp.fileExtensions;
    for (_i = 0; _i < _ref.length; ++_i) {
      ext = _ref[_i];
      index = path.join(source, "index" + ext);
      try {
        fs.statSync(index).isFile() ? undefined : undefined;
      } catch (err) {
        if (!(err.code === "ENOENT")) {
          throw err;
        }
      }
    }
    console.error("Missing index.jisp in " + source);
    return process.exit(1);
  }
  findDirectoryIndex;

  function compileScript(file, input, base) {
    var o, options, task, t, compiled, message, _ref, _ref0;
    !(typeof base !== 'undefined' && base !== null) ? base = null : undefined;
    o = opts;
    options = compileOptions(file, base);
    try {
      t = (task = {
        file: file,
        input: input,
        options: options
      });
      jisp.emit("compile", task);
      if (o.run) {
        jisp.register();
        _ref = jisp.run(t.input, t.options);
      } else {
        compiled = jisp.compile(t.input);
        t.output = compiled;
        jisp.emit("success", task);
        _ref = o.compile ? writeJs(base, t.file, t.output, options.jsPath) : printLine(t.output.trim());
      }
      _ref0 = _ref;
    } catch (err) {
      jisp.emit("failure", err, task);
      if (jisp.listeners("failure").length) {}
      message = err.stack || err.toString();
      printWarn(message);
      _ref0 = process.exit(1);
    }
    return _ref0;
  }
  compileScript;

  function compileStdin() {
    var code, stdin;
    code = "";
    stdin = process.openStdin();
    stdin.on("data", (function(buffer) {
      return buffer ? (code += buffer.toString()) : undefined;
    }));
    return stdin.on("end", (function() {
      return compileScript(null, code);
    }));
  }
  compileStdin;
  joinTimeout = null;
  compileJoin = (function() {
    var _ref;
    if (!sourceCode.some((function(code) {
      return code === null;
    }))) {
      clearTimeout(joinTimeout);
      _ref = (joinTimeout = wait(100, (function() {
        return compileScript(opts.join, sourceCode.join("\n"), opts.join);
      })));
    } else {
      _ref = undefined;
    }
    return _ref;
  });

  function outputPath(source, base, extension) {
    var basename, srcDir, dir, _ref;
    !(typeof extension !== 'undefined' && extension !== null) ? extension = ".js" : undefined;
    basename = util.baseFileName(source, true, useWinPathSep);
    srcDir = path.dirname(source);
    if (!opts.output) {
      _ref = srcDir;
    } else if ((source === base)) {
      _ref = opts.output;
    } else {
      _ref = path.join(opts.output, path.relative(base, srcDir));
    }
    dir = _ref;
    return path.join(dir, basename + extension);
  }
  outputPath;

  function writeJs(base, sourcePath, js, jsPath) {
    var jsDir;
    jsDir = path.dirname(jsPath);
    js = js;

    function compile() {
      var _ref;
      if (opts.compile) {
        js.length <= 0 ? js = " " : undefined;
        _ref = fs.writeFile(jsPath, js, (function(err) {
          return err ? printLine(err.message) : undefined;
        }));
      } else {
        _ref = undefined;
      }
      return _ref;
    }
    compile;
    return fs.exists(jsDir, (function(itExists) {
      return itExists ? compile() : mkdirp(jsDir, compile);
    }));
  }
  writeJs;

  function wait(milliseconds, func) {
    return setTimeout(func, milliseconds);
  }
  wait;

  function parseOptions() {
    var o;
    optionParser = new optparse.OptionParser(switches, banner);
    opts = optionParser.parse(process.argv.slice(2));
    o = opts;
    o.compile = o.compile || !!o.output;
    return (o.run = !o.compile);
  }
  parseOptions;

  function compileOptions(filename, base) {
    var answer, cwd, jsPath, jsDir, _ref, _ref0;
    answer = {
      filename: filename
    }
    if (!filename) {
      _ref0 = answer;
    } else {
      if (base) {
        cwd = process.cwd();
        jsPath = outputPath(filename, base);
        jsDir = path.dirname(jsPath);
        _ref = (answer = util.merge(answer, {
          jsPath: jsPath,
          sourceRoot: path.relative(jsDir, cwd),
          sourceFiles: [path.relative(cwd, filename)],
          generatedFile: util.baseFileName(jsPath, false, useWinPathSep)
        }));
      } else {
        _ref = (answer = util.merge(answer, {
          sourceRoot: "",
          sourceFiles: [util.baseFileName(filename, false, useWinPathSep)],
          generatedFile: util.baseFileName(filename, true, useWinPathSep) + ".js"
        }));
      }
      _ref0 = _ref;
    }
    return _ref0;
  }
  compileOptions;

  function version() {
    return printLine("jisp version " + jisp.version);
  }
  return version;
}).call(this);