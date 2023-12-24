import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as ji from './jisp_insp.mjs'
import * as jnnd from './jisp_named.mjs'
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

  optResolveNs() {
    const key = this.reqName()
    return this.optAncProcure(function optResolveNs(val) {
      return jm.ownNsLexCall(val)?.optResolve(key)
    })
  }

  /*
  TODO: consider including all locally available names in the error message.
  It might be useful to exactly represent the hierarchical structure of the
  available lexical namespaces and their mixins, instead of simply listing all
  names.
  */
  reqResolveNs() {
    return (
      this.optResolveNs() ??
      this.throw(`missing declaration of ${a.show(this.optName())} at ${a.show(this)}`)
    )
  }

  optResolveNsLive() {
    const val = this.optResolveNs()
    return val?.isLive() ? val : undefined
  }

  reqResolveNsLive() {
    const val = this.reqResolveNs()
    if (val.isLive()) return val
    throw this.err(`expected ${a.show(this.optName())} to be declared in live namespace, but declaration was found in non-live namespace ${a.show(val)}`)
  }

  optResolveLiveValSrc() {return this.optResolveNsLive()?.ownVal()}

  reqResolveLiveValSrc() {
    const src = this.reqResolveNsLive()
    const val = src.ownVal()
    if (a.isSome(val)) return val
    throw this.err(`expected the namespace declaring ${a.show(this.optName())} to have to a non-nil live val, found nil in namespace ${a.show(src)}`)
  }

  optResolveLiveVal() {
    const key = this.optName()
    if (!key) return undefined

    const src = this.optResolveNs()
    if (!src) return undefined

    if (src.isLive()) return this.optDerefLiveVal(src.ownVal())

    /*
    Example where this is relevant:

      [use `jisp:prelude.mjs` jp]
      jp.nil

    In this example, the local lexical namespace has an entry for `jp`, where
    the value is an instance of `Use` created after macroing the list that
    describes the `use` call. This instance of `Use` implements
    `optResolveLiveVal` which returns the module that it imported. As a result,
    the identifier `jp` resolves to the live value of the imported module,
    which is our prelude, and the expression `jp.nil`, which is an instance of
    `IdentAccess`, is able to find `Nil`.

    Since our system is open-ended, it's possible to create other macro classes
    using this functionality.
    */
    return jm.optResolveLiveValCall(src.optGet(key))
  }

  reqResolveLiveVal() {
    const src = this.reqResolveNs()
    if (src.isLive()) return this.reqDerefLiveVal(src.ownVal())

    const key = this.reqName()
    const val = src.reqGet(key)

    // See the comment in `.optResolveLiveVal`.
    const tar = jm.optResolveLiveValCall(val)
    if (a.isSome(tar)) return tar

    throw this.err(`expected the declaration of ${a.show(key)} to resolve to a live value, but found no live value in declaration ${a.show(val)}`)
  }

  optDerefLiveVal(src) {
    if (!a.isObj(src)) return undefined

    const key = this.optName()
    if (!key || !(key in src)) return undefined

    return src[key]
  }

  /*
  Somewhat redundant with `NsLive..reqGet`, but usable directly on live vals,
  without requiring a wrapping namespace, and generates more useful error
  messages.
  */
  reqDerefLiveVal(src) {
    const key = this.reqName()

    if (!a.isObj(src)) {
      throw this.err(`unable to dereference ${a.show(key)} in invalid live val ${a.show(src)}`)
    }

    if (!(key in src)) {
      throw this.err(`missing property ${a.show(key)} in live val ${a.show(src)}`)
    }

    const val = src[key]
    if (a.isNil(val)) {
      throw this.err(`unexpected nil property ${a.show(key)} in live val ${a.show(src)}`)
    }

    return val
  }

  // FIXME unfuck inefficiency: involves searching for the declaring namespace twice.
  macroImpl() {
    this.reqResolveNs().addRef(this)
    const val = this.optResolveLiveVal()
    if (a.isSome(val)) return this.macroWithLiveVal(val)
    return this
  }

  /*
  FIXME support renaming reserved JS names. May require knowledge of all
  unqualified names used in the same scope (which scope? all of them?).
  May require storing some data in the nearest lexical namespace.

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

  [ji.symInsp](tar) {return super[ji.symInsp](tar.funs(this.optName))}
}

export class IdentSet extends a.TypedSet {
  reqVal(val) {return a.reqInst(val, Ident)}
}

export class IdentColl extends a.Coll {
  reqVal(val) {return a.reqInst(val, Ident)}
}
