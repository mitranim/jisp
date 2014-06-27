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
    var rli, inputStream, outputStream, origPrompt, multiline, lineListener;
    (rli = repl.rli);
    (inputStream = repl.inputStream);
    (outputStream = repl.outputStream);
    (origPrompt = (typeof repl._prompt !== 'undefined' && repl._prompt !== null) ? repl._prompt : repl.prompt);
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
      var m, opened, closed, _ref, _ref0, _ref1;
      if (multiline.enabled) {
        (multiline.buffer += (cmd + "\n"));
        (opened = (typeof(m = multiline.buffer.match(/\(/g)) !== 'undefined' && (m = multiline.buffer.match(/\(/g)) !== null) ? m.length : 0);
        (closed = (typeof(m = multiline.buffer.match(/\)/g)) !== 'undefined' && (m = multiline.buffer.match(/\)/g)) !== null) ? m.length : 0);
        if ((opened > closed)) {
          rli.setPrompt(multiline.prompt);
          _ref = rli.prompt(true);
        } else {
          (multiline.enabled = false);
          (multiline.buffer = multiline.buffer.replace(/\n/g, "\uFF00"));
          rli.emit("line", multiline.buffer);
          (multiline.buffer = "");
          rli.setPrompt(origPrompt);
          _ref = rli.prompt(true);
        }
        _ref1 = _ref;
      } else {
        (opened = (typeof(m = cmd.match(/\(/g)) !== 'undefined' && (m = cmd.match(/\(/g)) !== null) ? m.length : 0);
        (closed = (typeof(m = cmd.match(/\)/g)) !== 'undefined' && (m = cmd.match(/\)/g)) !== null) ? m.length : 0); if ((opened > closed)) {
          (multiline.enabled = true);
          (multiline.buffer += (cmd + "\n"));
          rli.setPrompt(multiline.prompt);
          _ref0 = rli.prompt(true);
        } else {
          _ref0 = lineListener(cmd);
        }
        _ref1 = _ref0;
      }
      return _ref1;
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