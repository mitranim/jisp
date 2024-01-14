import * as jnet from './node_exact_text.mjs'
import * as jndnl from './node_delim_node_list.mjs'

export class ParenPre extends jnet.ExactText {static src() {return `(`}}
export class ParenSuf extends jnet.ExactText {static src() {return `)`}}

export class Parens extends jndnl.DelimNodeList {
  static prefix() {return ParenPre.src()}
  static suffix() {return ParenSuf.src()}
  static {this.setReprModuleUrl(import.meta.url)}
}
