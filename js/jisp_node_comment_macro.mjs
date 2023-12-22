import * as jn from './jisp_node.mjs'
import * as jnlm from './jisp_node_list_macro.mjs'

export class Comment extends jnlm.ListMacro {
  macro() {return this}
  compile() {return ``}
}
