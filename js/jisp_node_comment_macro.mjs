import * as jn from './jisp_node.mjs'
import * as jnlm from './jisp_node_list_macro.mjs'

/*
This deviates from our naming conventions in order to avoid confusion with node
classes that represent regular, non-macro comments supported by the tokenizer.
Most macro classes don't have "macro" in the name.
*/
export class CommentMacro extends jnlm.ListMacro {
  macro() {return this}

  compile() {
    this.reqStatement()
    return ``
  }

  isCosmetic() {return true}

  static reprModuleUrl = import.meta.url
}
