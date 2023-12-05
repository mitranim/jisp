import * as a from '/Users/m/code/m/js/all.mjs'
import * as jnt from './jisp_node_text.mjs'

export class Space extends jnt.Text {
  static reg() {return /^\s+/}
  isCosmetic() {return true}
  macro() {return this}
}
