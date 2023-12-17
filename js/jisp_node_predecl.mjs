import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as jnp from './jisp_node_predef.mjs'

/*
Used for identifiers predeclared by Jisp. Supports renaming from a Jisp name to
a JS name during compilation.

Motives:

  * Why this exists: Jisp requires all used identifiers to be previously
    defined, either as built-ins or in user code. Unknown identifiers cause a
    compile error. We have to predefine common built-ins.

  * Why renaming: predeclared identifiers and constants in JS have long names
    such as `globalThis` and `undefined`. Jisp prefers shorter names such as
    `global` and `nil`.

  * Why this involves specialized node classes: to make it possible to rename
    from a Jisp name to a JS name during compilation (JS generation), and avoid
    renaming identifiers in the AST during macroing. In general, we rename
    names only in the generated code, and never rename in the AST. Renaming in
    the AST would make it difficult to distinguish "source" names from "target"
    names and to avoid conflicts with user-defined names in the same scope.

  * Why this uses "macro" definitions: to replace `IdentUnqual` or `IdentAccess`
    nodes with instances of this class. See the point about specialized node
    classes.

    * FIXME WTF does this mean? ↑

Note: subclasses may define `.ownVal` which for any given predeclared identifier
should return its "runtime" value at compile time. For example, `.ownVal` of
Jisp `ok` should be JS `true`. Macros may use  predeclared constants as part of
macro API. This is just as powerful as specialized AST tokens, but without
syntactic special-cases.

TODO: automatically avoid conflicts with user-defined names that match our
`.getCompiledName`. We don't really need this for JS keywords (see below), but
do need this for JS predeclared identifiers such as `globalThis` and
`undefined`. We may ban masking of `globalThis`, and use `globalThis.X` for
other predeclareds.

Because Jisp has only identifiers and no keywords, user code may accidentally
mask the names of built-in constants such as `null`. This should not affect our
correctness in any way, because we track identifiers to their declaration
sites, and can tell the difference between a predeclared name and a masking
name. However, masking predeclared constants is generally bad practice, because
editor syntax highlighting tends to assume that they are never redefined, and
always highlights built-in constants with special colors, which is incorrect
after redefinition. Additionally, code where JS constants are masked may
compile to invalid JS that fails to parse. We may resolve this in any of the
following ways:

  * Don't do anything special. Generate invalid JS and allow it to fail.
  * Generate compile-time exceptions, warning the user.
  * Automatically rename keyword identifiers to non-keywords.
*/
export class Predecl extends jnp.Predef {
  static getCompiledName() {throw jm.errMeth(`getCompiledName`, this)}
  getCompiledName() {return this.constructor.getCompiledName()}
  macro() {return this}
  compile() {return this.getCompiledName()}
}
