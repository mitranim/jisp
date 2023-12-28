import * as a from '/Users/m/code/m/js/all.mjs'
import * as jnib from './jisp_node_import_base.mjs'

/*
This class implements compile-time imports of live modules, which are used for
compile-time replacement of AST nodes, also known as macroing. Compare class
`Import` which is used for runtime imports.

This should be the ONLY member of the root scope / namespace. All other name
declarations that come with the language should be part of the "prelude" module
which should be imported via `Use`.
*/
export class Use extends jnib.ImportBase {
  async macroModeUnnamed() {
    await this.reqImport()
    return this
  }

  /*
  Technical note. When reading this code, it may be unclear how this allows
  identifiers referencing our declaration to gain access to the live value of
  the imported module. This works because this code indirectly invokes
  `Node..reqDeclareLex`, which adds the current node to the nearest lexical
  namespace, and because this class inherits the method `.optResolveLiveVal`,
  which is a common interface used by various other classes, particularly by
  `Ident`. When an identifier finds this node `Use` in a lexical namespace, it
  will call `Use..optResolveLiveVal` to obtain the live value. Also see
  `Ident..optResolveLiveVal`.
  */
  async macroModeNamed() {
    await this.reqImport()
    return super.macroModeNamed()
  }

  // TODO maybe dedup with equivalent code in `Import`.
  async macroModeMixin() {
    await this.reqImport()
    this.reqNsLex().addMixin(this.reqNsLive())
    return this
  }

  /*
  This node is for compile-time imports only. When used as a statement, we can
  simply exclude it from the compiled code. Also, this may be used as an
  expression, if the parent node avoids calling this node's compilation method,
  and excludes it from the compiled code in some other way. Otherwise, an
  exception is the only sensible option left.
  */
  compile() {
    if (this.isStatement()) return ``
    throw this.err(`unexpected attempt to compile macro node ${a.show(this)} in an expression position`)
  }
}
