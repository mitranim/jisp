import * as a from '/Users/m/code/m/js/all.mjs'
import * as jnlm from './jisp_node_list_macro.mjs'

/*
Similar to `Block` but much more limited. Compiles to semicolon-separated
statements without wrapping them into `{}` and thus without its own lexical
namespace. Intended for returning multiple nodes from macros.

The mere existence of this class requires other node classes to ensure that in
any statement position, it's valid to include multiple statements rather than
just one. For example, the branches of `If` must always use blocks, because
otherwise, there would be a danger of accidentally generating the following:

  if (condition)
    statement;
    statement;
    statement;

...When the intent is the following:

  if (condition) {
    statement;
    statement;
    statement;
  }
*/
export class Statements extends jnlm.ListMacro {
  macro() {return this.macroFrom(0)}

  compile() {
    this.reqStatement()
    return this.reqPrn().compileStatements(this.optChildArr())
  }

  isChildStatement() {return this.isStatement()}

  static {this.setReprModuleUrl(import.meta.url)}

  static {this.setReprModuleUrl(import.meta.url)}
}
