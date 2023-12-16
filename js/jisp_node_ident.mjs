import * as a from '/Users/m/code/m/js/all.mjs'
import * as jnt from './jisp_node_text.mjs'

/*
TODO: consider caching of declaration lookup. Profile first.

FIXME: move most methods to `Name`, make this superclass of `Name` and
`Access`.

Current:

  Text
  |
  Ident
  |
  Name
  |
  Key | UnqualName | ???

FIXME restructure:

  Text
  |
  IdentBase                  ; no special macro methods
  |
  IdentUnqual | IdentAccess  ; special macro methods
*/
export class Ident extends jnt.Text {
  static regexpUnqualName() {return /^[A-Za-z$_][\w$]*/}
  static regexpQualName() {return /^[.][A-Za-z$_][\w$]*/}
  static separator() {return `.`}
  separator() {return this.constructor.separator()}

  // TODO: consider caching. Profile first.
  optDecl() {throw jm.errMeth(`optDecl`, this)}

  reqDecl() {
    return (
      this.optDecl() ??
      this.throw(`missing declaration of ${a.show(this.decompile())} at ${a.show(this)}`)
    )
  }

  macroImpl() {
    this.reqDecl()
    return super.macroImpl()
  }

  // Technical note: type assertion is missing due to module initialization
  // issues caused by cyclic dependencies.
  macroWithDecl(decl /* : Decl */) {
    if (a.isNil(decl)) return this
    if (!decl.isMacro()) return this
    if (decl.isMacroBare()) return decl.macroNode(this)
    // FIXME implement.
    // if (!this.isCalled()) throw this.err(`unexpected mention of identifier ${a.show(this.decompile())} which has the following call opts: ${a.show(decl.callOptStr())}`)
    return this
  }

  // FIXME rename, rewrite, and use.
  reqUsable() {
    const decl = this.reqDecl()
    const syn = decl.ownCallStyle()
    if (syn === CallStyle.bare) return this
    throw this.err(`unexpected mention of ${a.show(this.decompile())} with the following call opts: ${a.show(decl.callOptStr())}`)
  }
}
