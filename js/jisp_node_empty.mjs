import * as jn from './jisp_node.mjs'

// Probably don't need. FIXME remove.
export class Empty extends jn.Node {
  macro() {return this}
  compile() {return ``}
}
