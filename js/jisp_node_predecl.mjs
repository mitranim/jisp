import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as jn from './jisp_node.mjs'

/*
FIXME consider removing. This became less useful after the removal of "bare"
macro calling, and we've uncovered issues in the implementation. The comment is
useful, move it elsewhere.

Note that the comment fails to mention, and the implementation fails to address,
a notable problem with predeclarations that rename one identifier to another.
The problem is the possibility of collisions. For example, if you have a
subclass of `Predecl` referenced as `nil` that generates `undefined`, it would
produce incorrect behavior if `undefined` is already redeclared in the current
scope.

---

Shortcut for node classes that compile to a fixed, predeclared JS name. Used for
JS language constants such as `undefined` or `false`, and for other names
predeclared in JS, whether globally or contextually.

JS uses a mixture of reserved keywords and predeclared identifiers for its
built-ins. Many traditional Lisps do similar things. In contrast, Jisp has no
keywords, no predeclared names, and requires explicit imports or declarations
for all names. We implement many Jisp built-ins as macros whose only function
is to compile to a specific name of a JS built-in such as `false`. This
superclass makes them easier to implement.

Many JS built-ins could be obtained without macros. We could provide a JS module
with various JS built-ins, and user code would use a regular runtime import to
get them. However, this is impossible for some JS names which are contextual,
such as `arguments` or `this`. The correct solution is to implement names of
built-ins as macros, and this also ensures optimal output that doesn't rely on
runtime imports.

Names of built-ins in JS tend to have long names such as `globalThis` and
`undefined`. Jisp prefers shorter names such as `global` and `nil`.

Why this involves specialized node classes: to make it possible to rename from a
Jisp name to a JS name during compilation (JS generation), and avoid renaming
identifiers in the AST during macroing. In general, we rename names only in the
generated code, and never rename in the AST. Renaming in the AST would make it
difficult to distinguish "source" names from "target" names and to avoid
conflicts with user-defined names in the same scope.

Note: subclasses may define `.ownVal` which for any given predeclared identifier
should return its eventual "runtime" value. For example, `.ownVal` of the Jisp
node class `Ok` should be JS `true`. Our code currently does not use this, but
this may be useful to user-defined code.

TODO: automatically avoid conflicts with user-defined names that match our
`.getCompiledName`. We don't really need this for JS keywords (see below), but
we do need this for JS predeclared identifiers such as `globalThis` and
`undefined`. We may ban masking of `globalThis`, and use `globalThis.X` for
some other built-ins.

Because Jisp has only identifiers and no keywords, user code may accidentally
mask the names of built-in constants such as `null`. This should not affect our
correctness in any way, because we track identifiers to their declaration
sites, and can tell the difference between a predeclared name and a masking
name. However, masking predeclared constants is generally bad practice, because
editor syntax highlighting tends to assume that they are never redeclared, and
always highlights built-in constants with special colors, which is incorrect
after redeclaration. Additionally, code where JS constants are masked may
compile to invalid JS that fails to parse. We may resolve this in any of the
following ways:

  * Don't do anything special. Generate invalid JS and allow it to fail.
  * Generate macro-time or compile-time exceptions, warning the user.
  * Automatically rename keyword identifiers to non-keywords.
*/
export class Predecl extends jn.Node {
  getCompiledName() {throw this.errMeth(`getCompiledName`)}
  macro() {return this}
  compile() {return this.req(this.getCompiledName(), a.isValidStr)}
}
