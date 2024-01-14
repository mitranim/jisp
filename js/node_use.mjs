import {a} from './dep.mjs'
import * as jnib from './node_import_base.mjs'

/*
This class implements macro-time imports of live modules, which are used for
macro-time execution / replacement of AST nodes / macroing. Compare class
`Import` which is used for runtime imports.

If we predeclare any names in root or module scope, at all, then this macro
should be the ONLY predeclared name. All other macros and globals that ship
with the language should be importable via `Use` from language-provided modules
such as `prelude.mjs` and `global.mjs`.
*/
export class Use extends jnib.ImportBase {
  /*
  Compare `Import..reqResolve` which registers the imported module as a
  dependency of the source file, not a dependency of the target file.
  */
  async reqResolve() {
    await super.reqResolve()
    this.reqModule().addSrcDep(this.reqDepModule())
    return this
  }

  async macroModeUnnamed() {
    await this.reqImport()
    return this
  }

  /*
  Technical note. When reading this code, it may be unclear how this allows
  identifiers referencing our declaration to gain access to the live value of
  the imported module. This works because this code indirectly invokes
  `Node..reqDeclareLex`, which adds the current node to the nearest lexical
  namespace, and because this class inherits the method `.optLiveVal`, which is
  a common interface used by various other classes, particularly by `Ident`.
  When an identifier finds this node `Use` in a lexical namespace, it will call
  `Use..optLiveVal` to obtain the live value. Also see `Ident..optLiveVal`.
  */
  async macroModeNamed() {
    await this.reqImport()
    return super.macroModeNamed()
  }

  /*
  This node is for macro-time imports only. When used as a statement, we can
  simply exclude it from the compiled code. Also, this may be used as an
  expression, if the parent node avoids calling this node's compilation method,
  and excludes it from the compiled code in some other way. Otherwise, an
  exception is the only sensible option left.
  */
  compile() {
    if (this.isStatement()) return ``
    throw this.err(`unexpected attempt to compile macro node ${a.show(this)} in expression position`)
  }

  static {this.setReprModuleUrl(import.meta.url)}
}
