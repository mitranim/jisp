import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as jnn from './jisp_node_name.mjs'
import * as jnnu from './jisp_node_num.mjs'

export class UnqualNameSet extends a.TypedSet {
  reqVal(val) {return a.reqInst(val, UnqualName)}
}

/*
Short for "unqualified name". Represents a standalone name which is not part of
an access path in source code.

FIXME: verify detection of collisions with JS reserved names, and corresponding
handling, either as compile-time exceptions or as automatic renaming.
*/
export class UnqualName extends jnn.Name {
  static regexp() {return this.regexpUnqualName()}

  pk() {return this.ownName()}
  ownName() {return this.decompile()}

  /*
  Override. Note: this common interface doesn't have "lex" or "lexical" in the
  name, because it may involve non-lexical namespaces. See `Key` and `Access`.
  */
  optDecl() {
    const name = a.pk(this)
    const resolve = val => jm.ownScope(val)?.ownLexNs()?.resolve(name)
    return this.optAncProcure(resolve)
  }

  macroImpl() {
    const decl = this.reqDecl()
    decl.addUse(this)
    return this.macroWithDecl(decl)
  }

  // FIXME: exception if macro
  compile() {
    const decl = this.optDecl()
    if (decl?.isMacroBare()) return this.compileCall(decl)
    return this.compileName()
  }

  compileCall(decl) {
    const style = decl.ownCallSyntax()
    if (style === CallSyntax.call) return this.compileCallCall()
    if (style === CallSyntax.new) return `new ` + a.reqStr(this.compileCallCall())
    throw CallSyntax.errUnrec(this, style)
  }

  // Only for `CallSyntax.call`.
  compileCallCall() {
    return a.reqStr(this.compileQualifier()) + a.reqStr(this.compileName()) + `()`
  }

  // FIXME: if the name is coming from a mixin, generate a qualifier.
  compileQualifier() {throw jm.errMeth(`compileQualifier`, this)}

  /*
  Supports automatic renaming of identifiers. See `Decl..compileName`.

  FIXME: detect unqualified names coming from mixins, qualify if necessary.
  */
  compileName() {return this.optDecl()?.compileName(this) ?? this.decompile()}

  static toValidDictKey(val) {
    a.reqStr(val)
    if (this.isValidDictKey(val)) return val
    return JSON.stringify(val)
  }

  static isValidDictKey(val) {
    return a.isStr(val) && !!val && (
      this.isValid(val) ||
      (jnnu.Num.isValid(val) && val[0] !== `-`)
    )
  }

  static isJsReservedWord(val) {return jm.jsReservedWords.has(val)}
}
