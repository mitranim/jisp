import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jsp from '../js/jisp_span.mjs'
import * as jn from '../js/jisp_node.mjs'

/*
This file should test lower-level behaviors of `Node` that don't depend on
parsing, macroing, or compilation, but participate in those features. This
should be executed before tests for the higher-level features.
*/

function makeSpan(src) {return new jsp.StrSpan().init(src)}

class NodeOne extends jn.Node {}
class NodeTwo extends jn.Node {}
class NodeThree extends jn.Node {}

function makeNodes() {
  const span = makeSpan(`one
two
three`)

  return [
    new NodeOne().setSpan(span.withPos(0)),
    new NodeTwo().setSpan(span.withPos(4)),
    new NodeThree().setSpan(span.withPos(8)),
  ]
}

t.test(function test_Node_error_with_source_context() {
  const node = new NodeOne()

  tu.testErrWithoutCode(t.throws(() => node.macro(), Error, `method "macro" not fully implemented on [object NodeOne]`))

  const span = makeSpan(`some_source_code`)
  node.setSpan(span)

  tu.testErrWithCode(t.throws(() => node.macro(), Error, `method "macro" not fully implemented on [object NodeOne]

row:col: 1:1

source code preview:

some_source_code`))

  tu.testErrWithCode(t.throws(() => node.compile(), Error, `method "compile" not fully implemented on [object NodeOne]

row:col: 1:1

source code preview:

some_source_code`))

  span.init(`
one
two
three
four
`)
  span.setPos(6)

  tu.testErrWithCode(t.throws(() => node.compile(), Error, `method "compile" not fully implemented on [object NodeOne]

row:col: 3:2

source code preview:

wo
three
four`))
})

t.test(function test_Node_source_node_cycle_prevention() {
  const [one, two, three] = makeNodes()

  tu.testErrWithCode(t.throws(() => one.setSrcNode(one), Error, `[object NodeOne] is not allowed to be its own source node

row:col: 1:1

source code preview:

one
two
three`))

  tu.testErrWithCode(t.throws(() => two.setSrcNode(two), Error, `[object NodeTwo] is not allowed to be its own source node

row:col: 2:1

source code preview:

two
three`))

  tu.testErrWithCode(t.throws(() => three.setSrcNode(three), Error, `[object NodeThree] is not allowed to be its own source node

row:col: 3:1

source code preview:

three`))

  two.setSrcNode(one)

  /*
  This verifies prevention of direct cycles.

  Semi-placeholder. This error message is hard to understand due to lack of
  visual separation between sections. TODO improve.
  */
  tu.testErrWithCode(t.throws(() => one.setSrcNode(two), Error, `forbidden cycle between two nodes

target node: [object NodeOne]

target node context:

row:col: 1:1

source code preview:

one
two
three

source node: [object NodeTwo]

source node context:

row:col: 2:1

source code preview:

two
three`))

  t.is(one.optSrcNode(), undefined)

  three.setSrcNode(two)

  /*
  This verifies prevention of indirect cycles.

  Semi-placeholder. This error message is hard to understand due to lack of
  visual separation between sections. TODO improve.
  */
  tu.testErrWithCode(t.throws(() => one.setSrcNode(three), Error, `forbidden cycle between two nodes

target node: [object NodeOne]

target node context:

row:col: 1:1

source code preview:

one
two
three

source node: [object NodeThree]

source node context:

row:col: 3:1

source code preview:

three`))

  t.is(one.optSrcNode(), undefined)
})

t.test(function test_Node_source_node_tracing_in_errors() {
  const [one, two, three] = makeNodes()

  tu.testErrWithCode(t.throws(() => one.compile(), Error, `method "compile" not fully implemented on [object NodeOne]

row:col: 1:1

source code preview:

one
two
three`))

  tu.testErrWithCode(t.throws(() => two.compile(), Error, `method "compile" not fully implemented on [object NodeTwo]

row:col: 2:1

source code preview:

two
three`))

  tu.testErrWithCode(t.throws(() => three.compile(), Error, `method "compile" not fully implemented on [object NodeThree]

row:col: 3:1

source code preview:

three`))

  one.setSrcNode(two)

  tu.testErrWithCode(t.throws(() => one.compile(), Error, `method "compile" not fully implemented on [object NodeOne]

row:col: 1:1

source code preview:

one
two
three

context of source node:

row:col: 2:1

source code preview:

two
three`))

  two.setSrcNode(three)

  tu.testErrWithCode(t.throws(() => one.compile(), Error, `method "compile" not fully implemented on [object NodeOne]

row:col: 1:1

source code preview:

one
two
three

context of source node:

row:col: 2:1

source code preview:

two
three

context of source node:

row:col: 3:1

source code preview:

three`))
})

if (import.meta.main) ti.flush()
