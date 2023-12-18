import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as ji from './jisp_insp.mjs'
import * as jnnd from './jisp_named.mjs'
import * as jnsl from './jisp_ns_lexed.mjs'
import * as jn from './jisp_node.mjs'
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

  resolveNsOpt() {
    const key = this.reqName()
    return this.optAncProcure(function resolveNsOpt(val) {
      return jnsl.ownNsLexCall(val)?.resolveOpt(key)
    })
  }

  resolveNsReq() {
    return (
      this.resolveNsOpt() ??
      this.throw(`missing declaration of ${a.show(this.optName())} at ${a.show(this)}`)
    )
  }

  macroImpl() {
    const nsp = this.resolveNsReq()
    nsp.addRef(this)
    return this.macroWithNs(nsp)
  }

  macroWithNs(nsp /* : NsBase */) {
    if (a.isNil(nsp)) return this
    if (!nsp.isLive()) return this

    const key = this.reqName()

    // Redundant with `nsp.getReq`, but superior because it generates a
    // `CodeErr` pointing to the erring code.
    if (!nsp.has(key)) {
      throw this.err(`missing declaration of ${a.show(key)} (node ${a.show(this)}) in namespace ${a.show(nsp)}`)
    }

    return this.macroWithLiveValue(nsp.getReq(key))
  }

  macroWithLiveValue(src) {
    if (!a.isCls(src)) {
      throw this.err(`expected live value to be a class, found ${a.show(src)}`)
    }

    if (!a.isSubCls(src, jn.Node)) {
      throw this.err(`expected live value to be a subclass of ${a.show(jn.Node)}, found ${a.show(src)}`)
    }

    const val = new src()
    val.setParent(this.ownParent())
    val.setSrcNode(this)

    return jn.Node.macroNode(val)
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

  [ji.symInsp](tar) {return super[ji.symInsp](tar.funs(this.optName))}
}

export class IdentSet extends a.TypedSet {
  reqVal(val) {return a.reqInst(val, Ident)}
}

export class IdentColl extends a.Coll {
  reqVal(val) {return a.reqInst(val, Ident)}
}
