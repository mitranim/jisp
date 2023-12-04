import * as a from '/Users/m/code/m/js/all.mjs'
import * as jna from './jisp_named.mjs'

// FIXME implement.
export class Key extends jna.Name {
  static reg() {return this.regQualName()}

  ownName() {return this.decompile().slice(this.sep().length)}

  // FIXME support renaming.
  compile() {return this.decompile()}
}
