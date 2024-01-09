import * as a from '/Users/m/code/m/js/all.mjs'
import * as jnet from './jisp_node_exact_text.mjs'
import * as jndnl from './jisp_node_delim_node_list.mjs'

export class BracketPre extends jnet.ExactText {static src() {return `[`}}
export class BracketSuf extends jnet.ExactText {static src() {return `]`}}

export class Brackets extends jndnl.DelimNodeList {
  static prefix() {return BracketPre.src()}
  static suffix() {return BracketSuf.src()}
  static moduleUrl = import.meta.url
}
