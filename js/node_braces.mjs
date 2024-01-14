import * as jnet from './node_exact_text.mjs'
import * as jndnl from './node_delim_node_list.mjs'

export class BracePre extends jnet.ExactText {static src() {return `{`}}
export class BraceSuf extends jnet.ExactText {static src() {return `}`}}

export class Braces extends jndnl.DelimNodeList {
  static prefix() {return BracePre.src()}
  static suffix() {return BraceSuf.src()}
  static {this.setReprModuleUrl(import.meta.url)}
}
