import * as a from '/Users/m/code/m/js/all.mjs'
import * as jnn from './jisp_node_name.mjs'

// FIXME implement.
export class Key extends jnn.Name {
  static regexp() {return this.regexpQualName()}

  ownName() {return this.decompile().slice(this.separator().length)}

  // FIXME support renaming.
  compile() {return this.decompile()}
}
