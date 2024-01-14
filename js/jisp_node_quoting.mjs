import * as a from '/Users/m/code/m/js/all.mjs'
import * as jn from './jisp_node.mjs'
import * as jnnl from './jisp_node_node_list.mjs'
import * as jnlm from './jisp_node_list_macro.mjs'
import * as jniu from './jisp_node_ident_unqual.mjs'

export class Quote extends jnlm.ListMacro {
  macro() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCount(1)
    return this.macroRepr()
  }

  /*
  This avoids calling `Node..macroRepr` for the current node, to avoid
  pointlessly importing `Quote`'s module into the compiled code.
  */
  macroRepr() {return this.macroReprChildren()}

  compile() {return this.compileRepr()}

  compileRepr() {return jn.reqCompileReprNode(this.reqFirstChild())}

  static {this.setReprModuleUrl(import.meta.url)}
}

export class Unquote extends jnlm.ListMacro {
  /*
  Special interface supported by `DelimNodeList`.
  Allows this macro to be invoked inside `Quote`.
  */
  static macroReprList(src) {return this.macroList(src)}

  macro() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCount(1)
    return this.macroFrom(0)
  }

  /*
  Override for `Node..macroRepr`. This should be indirectly invoked by `Quote`
  when macroing (interpolating).
  */
  macroRepr() {return this.macro()}

  /*
  Override for `Node..compileRepr`. This should be indirectly invoked by `Quote`
  when macroing (interpolating).
  */
  compileRepr() {return jn.reqCompileNode(this.reqFirstChild())}

  /*
  Implementing this method in addition to `.compileRepr` allows nested unquotes
  to work.
  */
  compile() {return this.compileRepr()}

  static {this.setReprModuleUrl(import.meta.url)}
}
