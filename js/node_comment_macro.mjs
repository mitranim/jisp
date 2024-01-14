import * as jn from './node.mjs'

/*
This deviates from our naming conventions in order to avoid confusion with node
classes that represent regular, non-macro comments supported by the tokenizer.
Most macro classes don't have "macro" in the name.
*/
export class CommentMacro extends jn.Node {
  // Enables bare-style calling. Supported by `Ident`.
  static macroBare() {}

  // Enables list-style calling. Supported by `DelimNodeList`.
  static macroList() {}

  macro() {return this}

  compile() {
    this.reqStatement()
    return ``
  }

  isCosmetic() {return true}

  static {this.setReprModuleUrl(import.meta.url)}
}
