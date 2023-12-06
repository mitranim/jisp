import * as a from '/Users/m/code/m/js/all.mjs'
import * as jnt from './jisp_node_text.mjs'

/*
TODO: consider caching of definition lookup. Profile first.

FIXME: move most methods to `Name`, make this superclass of `Name` and
`Access`.
*/
export class Ident extends jnt.Text {
  static regexpUnqualName() {return /^[A-Za-z$_][\w$]*/}
  static regexpQualName() {return /^[.][A-Za-z$_][\w$]*/}
  static separator() {return `.`}
  separator() {return this.constructor.separator()}

  // TODO: consider caching. Profile first.
  optDef() {throw errMeth(`optDef`, this)}

  reqDef() {
    return (
      this.optDef() ??
      this.throw(`missing definition for ${a.show(this.decompile())} at ${a.show(this)}`)
    )
  }

  macroImpl() {
    this.reqDef()
    return super.macroImpl()
  }

  macroWithDef(def /* : Def */) {
    if (a.isNil(def)) return this
    if (!def.isMacro()) return this
    if (def.isMacroBare()) return def.macroNode(this)
    // FIXME implement.
    // if (!this.isCalled()) throw this.err(`unexpected mention of identifier ${a.show(this.decompile())} which has the following call opts: ${a.show(def.callOptStr())}`)
    return this
  }

  // FIXME rename, rewrite, and use.
  reqUsable() {
    const def = this.reqDef()
    const syn = def.ownCallStyle()
    if (syn === CallStyle.bare) return this
    throw this.err(`unexpected mention of ${a.show(this.decompile())} with the following call opts: ${a.show(def.callOptStr())}`)
  }
}
