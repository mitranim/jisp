import * as a from '/Users/m/code/m/js/all.mjs'
import * as jnet from './jisp_node_exact_text.mjs'
import * as jndnl from './jisp_node_delim_node_list.mjs'

export class ParenPre extends jnet.ExactText {static src() {return `(`}}
export class ParenSuf extends jnet.ExactText {static src() {return `)`}}

export class Parens extends jndnl.DelimNodeList {
  static prefix() {return ParenPre.src()}
  static suffix() {return ParenSuf.src()}
  static moduleUrl = import.meta.url
}
