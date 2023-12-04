import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as jnn from './jisp_node_name.mjs'

export class UnqualNameSet extends a.TypedSet {
  reqVal(val) {return a.reqInst(val, UnqualName)}
}

/*
Short for "unqualified name". Represents a standalone name which is not part of
an access path in source code.
*/
export class UnqualName extends jnn.Name {
  static reg() {return this.regUnqualName()}

  pk() {return this.ownName()}
  ownName() {return this.decompile()}

  /*
  Override. Note: this common interface doesn't have "lex" or "lexical" in the
  name, because it may involve non-lexical namespaces. See `Key` and `Access`.
  */
  optDef() {
    const name = a.pk(this)
    const resolve = val => ownScope(val)?.ownLexNs()?.resolve(name)
    return this.ancProcure(resolve)
  }

  macroImpl() {
    const def = this.reqDef()
    def.addUse(this)
    return this.macroWithDef(def)
  }

  compile() {
    const def = this.optDef()
    if (def?.isMacroBare()) return this.compileCall(def)
    return this.compileName()
  }

  compileCall(def) {
    const style = def.ownCallSyntax()
    if (style === CallSyntax.call) return this.compileCallCall()
    if (style === CallSyntax.new) return `new ` + a.reqStr(this.compileCallCall())
    throw CallSyntax.errUnrec(this, style)
  }

  // Only for `CallSyntax.call`.
  compileCallCall() {
    return a.reqStr(this.compileQualifier()) + a.reqStr(this.compileName()) + `()`
  }

  // FIXME: if the name is coming from a mixin, generate a qualifier.
  compileQualifier() {throw errMeth(`compileQualifier`, this)}

  /*
  Supports automatic renaming of identifiers. See `Def..compileName`.

  FIXME: detect unqualified names coming from mixins, qualify if necessary.
  */
  compileName() {return this.optDef()?.compileName(this) ?? this.decompile()}

  static toValidDictKey(val) {
    if (this.isValid(val) || Num.isValid(val)) return val
    return JSON.stringify(val)
  }

  static isJsReservedWord(val) {return jm.jsReservedWords.has(val)}
}
