import * as a from '/Users/m/code/m/js/all.mjs'
import * as jn from './jisp_node.mjs'
import * as jnnl from './jisp_node_node_list.mjs'
import * as jnlm from './jisp_node_list_macro.mjs'
import * as jniu from './jisp_node_ident_unqual.mjs'

export class Quote extends jnlm.ListMacro {
  reqVal() {return this.reqChildAt(1)}

  macro() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCount(2)
    return this.macroRepr()
  }

  compile() {return jn.reqCompileReprNode(this.reqVal())}

  static reprModuleUrl = import.meta.url
}

export class Unquote extends jnlm.ListMacro {
  /*
  Special interface supported by `DelimNodeList`.
  Allows this macro to be invoked inside `Quote`.
  */
  static macroReprList(src) {return new this()}

  reqVal() {return this.reqChildAt(1)}

  macro() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCount(2)
    return this.macroFrom(1)
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
  compileRepr() {return jn.reqCompileNode(this.reqVal())}

  /*
  Implementing this method in addition to `.compileRepr` allows nested unquotes
  to work.
  */
  compile() {return this.compileRepr()}

  static reprModuleUrl = import.meta.url
}
