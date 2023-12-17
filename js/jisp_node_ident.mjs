import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as jnnd from './jisp_named.mjs'
import * as jlns from './jisp_lex_nsed.mjs'
import * as jnt from './jisp_node_text.mjs'
import * as jnnu from './jisp_node_num.mjs'

/*
Base class for identifiers.

Most of the code in this class assumes that it represents an unqualified
identifier. Subclasses that represent a qualified identifier, such as access
via dot operator, may need to override some methods. Our tokenizer must
represent unqualified identifiers with `IdentUnqual`, and dot-access with
`IdentAccess`.
*/
export class Ident extends jnnd.MixNamed.goc(jnt.Text) {
  static regexpIdentUnqual() {return /^[A-Za-z$_][\w$]*/}
  static regexpIdentAccess() {return /^[.][A-Za-z$_][\w$]*/}
  static separator() {return `.`}
  separator() {return this.constructor.separator()}

  // Interface used by `a.Coll` and some of our collections that subclass it.
  pk() {return this.reqName()}

  // Override for `MixNamed`.
  ownName() {return this.optName()}

  // Override for `MixNamed`.
  optName() {return this.decompile()}

  // TODO: consider caching. Profile first.
  optDecl() {throw jm.errMeth(`optDecl`, this)}

  /*
  FIXME: lookup may produce a declaration, or a live value. Probably need to
  update this interface to accommodate both.

  TODO: consider caching. Profile first.
  */
  optDecl() {
    const name = a.pk(this)
    return this.optAncProcure(function resolveDecl(val) {
      return jlns.ownLexNsCall(val)?.resolve(name)
    })
  }

  reqDecl() {
    return (
      this.optDecl() ??
      this.throw(`missing declaration of ${a.show(this.decompile())} at ${a.show(this)}`)
    )
  }

  // macroImpl() {
  //   this.reqDecl()
  //   return super.macroImpl()
  // }

  macroImpl() {
    // FIXME there isn't always a decl. Sometimes we find this name in a
    // namespace mixin, and what we found may be a live value.
    const decl = this.reqDecl()
    decl.addUse(this)
    return this.macroWithDecl(decl)
  }

  // Technical note: type assertion is missing due to module initialization
  // issues caused by cyclic dependencies.
  macroWithDecl(decl /* : Decl */) {
    if (a.isNil(decl)) return this
    if (!decl.isMacro()) return this
    if (decl.isMacroBare()) return decl.macroNode(this)
    // FIXME unfuck. (We're removing call opts, but we need a similar assertion for compile-only idents.)
    // if (!this.isCalled()) throw this.err(`unexpected mention of identifier ${a.show(this.decompile())} which has the following call opts: ${a.show(decl.callOptStr())}`)
    return this
  }

  /*
  FIXME support renaming reserved JS names. May require knowledge of all
  unqualified names used in the same scope (which scope? all of them?).
  May require storing some data in the nearest lexical scope.

  Note: some subclasses such as `IdentAccess` must override this and avoid
  calling `.reqNotReserved`. In ES5+, reserved names can be used as property
  names.
  */
  compile() {return this.reqNotReserved().decompile()}

  reqNotReserved() {
    const name = this.optName()
    if (this.isJsReservedName(name)) {
      throw this.err(`${a.show(name)} is a reserved name in JS; this would generate invalid JS that doesn't run; please rename`)
    }
    return this
  }

  isJsReservedName(val) {return jm.jsReservedNames.has(val)}

  static toValidDictKey(val) {
    a.reqStr(val)
    if (this.isValidDictKey(val)) return val
    return JSON.stringify(val)
  }

  static isValidDictKey(val) {
    return (
      true
      && a.isStr(val)
      && val !== ``
      && (
        false
        || jm.isFullMatch(val, this.regexpIdentUnqual())
        || (jnnu.Num.isValid(val) && val[0] !== `-`)
      )
    )
  }

  // FIXME rename, rewrite, and use.
  // FIXME drop because `CallOpts` are out.
  reqUsable() {
    const decl = this.reqDecl()
    const syn = decl.ownCallStyle()
    if (syn === CallStyle.bare) return this
    throw this.err(`unexpected mention of ${a.show(this.decompile())} with the following call opts: ${a.show(decl.callOptStr())}`)
  }
}
