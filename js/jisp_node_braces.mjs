import * as a from '/Users/m/code/m/js/all.mjs'
import * as jnet from './jisp_node_exact_text.mjs'
import * as jndnl from './jisp_node_delim_node_list.mjs'

export class BracePre extends jnet.ExactText {static src() {return `{`}}
export class BraceSuf extends jnet.ExactText {static src() {return `}`}}

export class Braces extends jndnl.DelimNodeList {
  static pre() {return BracePre.src}
  static suf() {return BraceSuf.src}
}
