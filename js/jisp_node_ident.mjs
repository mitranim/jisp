import * as a from '/Users/m/code/m/js/all.mjs'
import * as jnt from './jisp_node_text.mjs'

/*
TODO: consider caching of definition lookup. Profile first.

FIXME: move most methods to `Name`, make this superclass of `Name` and
`Access`.
*/
export class Ident extends jnt.Text {
  static regUnqualName() {return /^[A-Za-z$_][\w$]*/}
  static regQualName() {return /^[.][A-Za-z$_][\w$]*/}
  static sep() {return `.`}
  sep() {return this.constructor.sep()}

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

  macroWithDef(def) {
    a.optInst(def, Def)
    if (def?.isMacro()) {
      if (def?.isMacroBare()) return def.macroNode(this)
      // FIXME implement.
      // if (!this.isCalled()) throw this.err(`unexpected mention of identifier ${a.show(this.decompile())} which has the following call opts: ${a.show(def.callOptStr())}`)
    }
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