(function() {
  var vm, nodeREPL, jisp, replDefaults, start;
  (vm = require("vm"));
  (nodeREPL = require("repl"));
  (jisp = require("./jisp"));
  (replDefaults = ({
    useGlobal: true,
    prompt: "jisp> ",
    eval: (function(input, context, filename, cb) {
      var js, result, err, _ref;
      (input = input.replace(/\uFF00/g, "\n"));
      (input = input.replace(/^\(([^]*)\n\)$/g, "$1"));
      try {
        (js = jisp.compile(input, ({
          wrap: false
        })));
        console.log("-- compiled:\n", js);
        console.log("-- executing:");
        (result = vm.runInThisContext(js, filename));
        _ref = cb(null, result);
      } catch (err) {
        _ref = cb(err);
      }
      return _ref;
    })
  }));

  function enableMultiline(repl) {
    var rli, inputStream, outputStream, origPrompt, multiline, lineListener, _ref;
    (rli = repl.rli);
    (inputStream = repl.inputStream);
    (outputStream = repl.outputStream);
    if ((typeof repl._prompt !== 'undefined' && repl._prompt !== null)) {
      _ref = repl._prompt;
    } else {
      _ref = repl.prompt;
    }(origPrompt = _ref);
    (multiline = ({
      enabled: false,
      prompt: origPrompt.replace(/^[^>\s]*>?/, (function(x) {
        return x.replace(/./g, ".");
      })),
      buffer: ""
    }));
    (lineListener = rli.listeners("line")[0]);
    rli.removeListener("line", lineListener);
    return rli.on("line", (function(cmd) {
      var m, opened, closed, _ref0, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6;
      if (multiline.enabled) {
        (multiline.buffer += (cmd + "\n"));
        if ((typeof(m = multiline.buffer.match(/\(/g)) !== 'undefined' && (m = multiline.buffer.match(/\(/g)) !== null)) {
          _ref1 = m.length;
        } else {
          _ref1 = 0;
        }(opened = _ref1); if ((typeof(m = multiline.buffer.match(/\)/g)) !== 'undefined' && (m = multiline.buffer.match(/\)/g)) !== null)) {
          _ref2 = m.length;
        } else {
          _ref2 = 0;
        }(closed = _ref2); if ((opened > closed)) {
          rli.setPrompt(multiline.prompt);
          _ref3 = rli.prompt(true);
        } else {
          (multiline.enabled = false);
          (multiline.buffer = multiline.buffer.replace(/\n/g, "\uFF00"));
          rli.emit("line", multiline.buffer);
          (multiline.buffer = "");
          rli.setPrompt(origPrompt);
          _ref3 = rli.prompt(true);
        }
        _ref0 = _ref3;
      } else {
        if ((typeof(m = cmd.match(/\(/g)) !== 'undefined' && (m = cmd.match(/\(/g)) !== null)) {
          _ref4 = m.length;
        } else {
          _ref4 = 0;
        }(opened = _ref4); if ((typeof(m = cmd.match(/\)/g)) !== 'undefined' && (m = cmd.match(/\)/g)) !== null)) {
          _ref5 = m.length;
        } else {
          _ref5 = 0;
        }(closed = _ref5); if ((opened > closed)) {
          (multiline.enabled = true);
          (multiline.buffer += (cmd + "\n"));
          rli.setPrompt(multiline.prompt);
          _ref6 = rli.prompt(true);
        } else {
          _ref6 = lineListener(cmd);
        }
        _ref0 = _ref6;
      }
      return _ref0;
    }));
  }
  enableMultiline;
  return (exports.start = (start = (function() {
    var repl;
    (repl = nodeREPL.start(replDefaults));
    repl.on("exit", (function() {
      return repl.outputStream.write("\n");
    }));
    enableMultiline(repl);
    return repl;
  })));
}).call(this);