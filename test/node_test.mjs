import {a} from '../js/dep.mjs'
import {t} from './test_dep.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jpn from '../js/parent_node.mjs'
import * as jmo from '../js/module.mjs'
import * as jn from '../js/node.mjs'

/*
This file should test lower-level behaviors of `Node` that don't depend on
parsing, macroing, or compilation, but participate in those features. This
should be executed before tests for the higher-level features.
*/

class NodeOne extends jn.Node {macro() {return new NodeTwo()}}
class NodeTwo extends jn.Node {macro() {return new NodeThree()}}
class NodeThree extends jn.Node {}

const src = `one
two
three`

function makeNodes() {
  return [
    new NodeOne().initSpanWith(src, 0, 3),
    new NodeTwo().initSpanWith(src, 4, 3),
    new NodeThree().initSpanWith(src, 8, 5),
  ]
}

t.test(function test_Node_error_with_source_context() {
  const node = new jn.Node()

  tu.testErrWithoutCode(t.throws(() => node.macro(), Error, `method "macro" not fully implemented on [object Node]`))

  node.initSpan().init(`some_source_code`)

  tu.testErrWithCode(t.throws(() => node.macro(), Error, `method "macro" not fully implemented on [object Node]

:1:1

some_source_code`))

  tu.testErrWithCode(t.throws(() => node.compile(), Error, `method "compile" not fully implemented on [object Node]

:1:1

some_source_code`))

  node.initSpan().init(`
one
two
three
four
`).setPos(6)

  tu.testErrWithCode(t.throws(() => node.compile(), Error, `method "compile" not fully implemented on [object Node]

:3:2

wo
three
four`))

  node.initSpan().setPath(`some_dir_0/some_file_0.jisp`)

  tu.testErrWithCode(t.throws(() => node.compile(), Error, `method "compile" not fully implemented on [object Node]

some_dir_0/some_file_0.jisp:3:2

wo
three
four`))

  node.initSpan().setPath(`file:///some_dir_1/some_file_1.jisp`)

  tu.testErrWithCode(t.throws(() => node.compile(), Error, `method "compile" not fully implemented on [object Node]

file:///some_dir_1/some_file_1.jisp:3:2

wo
three
four`))

  node.initSpan().setPath(`https:///some_dir_2/some_file_2.jisp`)

  tu.testErrWithCode(t.throws(() => node.compile(), Error, `method "compile" not fully implemented on [object Node]

https:///some_dir_2/some_file_2.jisp:3:2

wo
three
four`))
})

/*
Both the test and the functionality are incomplete. Ideally, when recursive
macroing involves several nodes with different source contexts, we want to
include ALL source contexts into the error message.
*/
t.test(function test_Node_error_with_source_context_when_macroing() {
  class NodeThree extends jn.Node {}
  const three = new NodeThree().initSpanWith(src, 8, 5)
  three.initSpan().setPath(`https:///some_dir_2/some_file_2.jisp`)

  class NodeTwo extends jn.Node {macro() {return new NodeThree()}}
  const two = new NodeTwo().initSpanWith(src, 4, 3)
  two.initSpan().setPath(`file:///some_dir_1/some_file_1.jisp`)

  class NodeOne extends jn.Node {macro() {return new NodeTwo()}}
  const one = new NodeOne().initSpanWith(src, 0, 3)
  one.initSpan().setPath(`some_dir_0/some_file_0.jisp`)

  class NodeOuter extends jpn.MixParentNodeOneToOne.goc(jn.Node) {}
  const outer = new NodeOuter().setChild(one)

  t.throws(() => outer.macroFirstChild(), Error, `method "macro" not fully implemented on [object NodeThree]

some_dir_0/some_file_0.jisp:1:1

one
two
three`)

  // TODO: test for the following message.
  const preferredErrorMessage = `method "compile" not fully implemented on [object NodeThree]

https:///some_dir_2/some_file_2.jisp:3:1

three

context of source node:

file:///some_dir_1/some_file_1.jisp:2:1

two
three

context of source node:

some_dir_0/some_file_0.jisp:1:1

one
two
three`
})

if (import.meta.main) ti.flush()
