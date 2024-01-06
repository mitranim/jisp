import * as jn from './jisp_node.mjs'
import * as jnlm from './jisp_node_list_macro.mjs'

/*
This is not named `Comment` because that name is already taken by an AST node
class.
*/
export class CommentMacro extends jnlm.ListMacro {
  macro() {return this}

  compile() {
    this.reqStatement()
    return ``
  }

  isCosmetic() {return true}
}
