import * as jnt from './node_text.mjs'

export class Space extends jnt.Text {
  static regexp() {return /^\s+/}
  isCosmetic() {return true}
  macro() {return this}
  static {this.setReprModuleUrl(import.meta.url)}
}
