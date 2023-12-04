import * as a from '/Users/m/code/m/js/all.mjs'

/*
Internal tool, used for some macro-related features. Helps emulate something
similar to enums, which tend to be a built-in feature in sensible languages.

Usage:

  * Subclass must define static own enumerable fields.

  * Each field must be a string, which must EXACTLY match the field name.

    * Mismatching name and value = undefined behavior.

  * Uses only own fields, ignores inherited fields.
*/
export class Enum extends a.Emp {
  constructor() {
    throw TypeError(`enum ${new.target.name} does not support instantiation`)
  }

  // TODO consider taking a node for error context.
  static reqValid(key) {
    if (!a.isStr(key)) {
      throw TypeError(`keys for enum ${this.name} must be strings, found ${a.show(key)}`)
    }
    if (!a.hasOwn(this, key)) {
      throw TypeError(`unknown key ${a.show(key)} for enum ${this.name}; known keys: ${a.show(Object.keys(this))}`)
    }
    const val = this[key]
    if (val !== key) {
      throw TypeError(`key-value mismatch in enum ${this.name}: key ${a.show(key)}, val ${a.show(val)}`)
    }
    return val
  }

  static validate() {
    const keys = Object.keys(this)

    // Empty enums may result from incorrect usage of the class, like
    // accidentally declaring instance fields instead of static fields.
    if (!keys.length) throw TypeError(`invalid empty enum ${a.show(this)}`)

    for (const key of keys) this.reqValid(key)
  }

  static has(val) {return a.isStr(val) && a.hasOwn(this, val) && this[val] === val}

  static msgUnrec(val) {
    if (this.has(val)) {
      return `unsupported value ${a.show(val)} of enum ${this.name}`
    }
    return `unrecognized value ${a.show(val)} for enum ${this.name}`
  }
}
