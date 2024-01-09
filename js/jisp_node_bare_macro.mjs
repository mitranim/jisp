import * as a from '/Users/m/code/m/js/all.mjs'
import * as jn from './jisp_node.mjs'

/*
Base class for macro-style `Node` classes intended for bare-style calling.
The typical input (source node) for such macros is `Ident`.
Compare the base class `ListMacro` intended for list-style calling.
*/
export class BareMacro extends jn.Node {
  /*
  This optional method is used by `Ident` to detect macro classes with support
  for bare-style calling.
  */
  static macroBare() {return new this()}

  macro() {return this}

  static moduleUrl = import.meta.url
}
