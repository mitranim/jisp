import * as jnet from './node_exact_text.mjs'
import * as jndnl from './node_delim_node_list.mjs'

export class BracketPre extends jnet.ExactText {static src() {return `[`}}
export class BracketSuf extends jnet.ExactText {static src() {return `]`}}

export class Brackets extends jndnl.DelimNodeList {
  static prefix() {return BracketPre.src()}
  static suffix() {return BracketSuf.src()}
  static {this.setReprModuleUrl(import.meta.url)}
}
