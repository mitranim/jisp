import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jmo from '../js/jisp_module.mjs'
import * as jn from '../js/jisp_node.mjs'

/*
This file should test lower-level behaviors of `Node` that don't depend on
parsing, macroing, or compilation, but participate in those features. This
should be executed before tests for the higher-level features.
*/

class NodeOne extends jn.Node {}
class NodeTwo extends jn.Node {}
class NodeThree extends jn.Node {}

function makeNodes() {
  const src = `one
two
three`

  return [
    new NodeOne().initSpanWith(src, 0, 3),
    new NodeTwo().initSpanWith(src, 4, 3),
    new NodeThree().initSpanWith(src, 8, 5),
  ]
}

t.test(function test_Node_error_with_source_context() {
  const node = new NodeOne()

  tu.testErrWithoutCode(t.throws(() => node.macro(), Error, `method "macro" not fully implemented on [object NodeOne]`))

  node.initSpan().init(`some_source_code`)

  tu.testErrWithCode(t.throws(() => node.macro(), Error, `method "macro" not fully implemented on [object NodeOne]

:1:1

some_source_code`))

  tu.testErrWithCode(t.throws(() => node.compile(), Error, `method "compile" not fully implemented on [object NodeOne]

:1:1

some_source_code`))

  node.initSpan().init(`
one
two
three
four
`).setPos(6)

  tu.testErrWithCode(t.throws(() => node.compile(), Error, `method "compile" not fully implemented on [object NodeOne]

:3:2

wo
three
four`))
})

t.test(function test_Node_source_node_cycle_prevention() {
  const [one, two, three] = makeNodes()

  tu.testErrWithCode(t.throws(() => one.setSrcNode(one), Error, `[object NodeOne] is not allowed to be its own source node

:1:1

one
two
three`))

  tu.testErrWithCode(t.throws(() => two.setSrcNode(two), Error, `[object NodeTwo] is not allowed to be its own source node

:2:1

two
three`))

  tu.testErrWithCode(t.throws(() => three.setSrcNode(three), Error, `[object NodeThree] is not allowed to be its own source node

:3:1

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

:1:1

one
two
three

source node: [object NodeTwo]

source node context:

:2:1

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

:1:1

one
two
three

source node: [object NodeThree]

source node context:

:3:1

three`))

  t.is(one.optSrcNode(), undefined)
})

t.test(function test_Node_source_node_tracing_in_errors() {
  const [one, two, three] = makeNodes()

  tu.testErrWithCode(t.throws(() => one.compile(), Error, `method "compile" not fully implemented on [object NodeOne]

:1:1

one
two
three`))

  tu.testErrWithCode(t.throws(() => two.compile(), Error, `method "compile" not fully implemented on [object NodeTwo]

:2:1

two
three`))

  tu.testErrWithCode(t.throws(() => three.compile(), Error, `method "compile" not fully implemented on [object NodeThree]

:3:1

three`))

  one.setSrcNode(two)

  tu.testErrWithCode(t.throws(() => one.compile(), Error, `method "compile" not fully implemented on [object NodeOne]

:1:1

one
two
three

context of source node:

:2:1

two
three`))

  two.setSrcNode(three)

  tu.testErrWithCode(t.throws(() => one.compile(), Error, `method "compile" not fully implemented on [object NodeOne]

:1:1

one
two
three

context of source node:

:2:1

two
three

context of source node:

:3:1

three`))

  one.setParent(new jmo.Module().setSrcPathAbs(`some_dir_0/some_file_0.jisp`))

  tu.testErrWithCode(t.throws(() => one.compile(), Error, `method "compile" not fully implemented on [object NodeOne]

some_dir_0/some_file_0.jisp:1:1

one
two
three

context of source node:

:2:1

two
three

context of source node:

:3:1

three`))

  two.setParent(new jmo.Module().setSrcPathAbs(`file:///some_dir_1/some_file_1.jisp`))

  tu.testErrWithCode(t.throws(() => one.compile(), Error, `method "compile" not fully implemented on [object NodeOne]

some_dir_0/some_file_0.jisp:1:1

one
two
three

context of source node:

file:///some_dir_1/some_file_1.jisp:2:1

two
three

context of source node:

:3:1

three`))

  three.setParent(new jmo.Module().setSrcPathAbs(`https:///some_dir_2/some_file_2.jisp`))

  tu.testErrWithCode(t.throws(() => one.compile(), Error, `method "compile" not fully implemented on [object NodeOne]

some_dir_0/some_file_0.jisp:1:1

one
two
three

context of source node:

file:///some_dir_1/some_file_1.jisp:2:1

two
three

context of source node:

https:///some_dir_2/some_file_2.jisp:3:1

three`))
})

if (import.meta.main) ti.flush()
