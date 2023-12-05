import * as a from '/Users/m/code/m/js/all.mjs'
import * as jnn from './jisp_node_name.mjs'

// FIXME implement.
export class Key extends jnn.Name {
  static reg() {return this.regQualName()}

  ownName() {return this.decompile().slice(this.sep().length)}

  // FIXME support renaming.
  compile() {return this.decompile()}
}
