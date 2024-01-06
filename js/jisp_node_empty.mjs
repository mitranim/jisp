import * as jn from './jisp_node.mjs'

export class Empty extends jn.Node {
  macro() {return this}

  compile() {
    this.reqStatement()
    return ``
  }
}
