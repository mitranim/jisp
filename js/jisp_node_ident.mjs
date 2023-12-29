import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as ji from './jisp_insp.mjs'
import * as jnnd from './jisp_named.mjs'
import * as jn from './jisp_node.mjs'
import * as jnt from './jisp_node_text.mjs'
import * as jnnu from './jisp_node_num.mjs'

/*
Base class for identifiers.

The syntax / format of Jisp identifiers should match the syntax / format of JS
identifiers. The set of all possible Jisp identifiers should exactly match the
set of all possible identifiers which can be used in JS as property names
without quotes. Note that some of those names are also reserved keywords in JS.
In modern JS, reserved keywords can be used as property names (qualified
identifiers), but not as variable names (unqualified identifiers).

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
    return this.reqParent().optAncProcure(function optResolveNs(val) {
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
      this.throw(`unable to find declaration of ${a.show(this.optName())} at ${a.show(this)}`)
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
    The declared value may be used to indirectly obtain a live value. See
    below.

    The type of this value is unknown / arbitrary. If the namespace is an
    instance of `NsLex`, then the value must be an instance of `Node`. In the
    future, we may consider stricter rules.

    Values declared in namespaces, such as this value, may optionally implement
    the method `.optResolveLiveVal` which may return a live value. This may
    seem redundant with the clause above where we check if the declaring
    namespace is live. However, there are cases where a non-live declaration,
    in a non-live namespace, eventually resolves to a live declaration in a
    live namespace. One common use case is the following:

      [use `jisp:prelude.mjs` jp]
      jp.nil

    After "macroing" the first statement, the local lexical namespace, which is
    non-live, has an entry for `jp`. The value of that entry is an instance of
    `Node`. More specifically, it's the instance of `Use` created by macroing
    the first statement. `Use` implements the method `.optResolveLiveVal`,
    which returns the native JS module object obtained by importing the
    requested file. By following from the non-live declaration of `jp` to `Use`
    to its live value, we obtain the imported module. The expression `jp.nil`,
    which is an instance of `IdentAccess`, is able to obtain the class `Nil`
    by accessing the property `.nil` on that imported module, which is resolved
    from the `IdentUnqual` `jp`.
    */
    const val = src.optGet(key)

    // This occurs in function parameters, and possibly in other places.
    if (val === this) return undefined

    return jm.optResolveLiveValCall(val)
  }

  // See comments in `.optResolveLiveVal`.
  reqResolveLiveVal() {
    const src = this.reqResolveNs()
    if (src.isLive()) return this.reqDerefLiveVal(src.ownVal())

    const key = this.reqName()
    const val = src.reqGet(key)
    if (val === this) return undefined

    const tar = jm.optResolveLiveValCall(val)
    if (a.isSome(tar)) return tar

    throw this.err(`expected the declaration of ${a.show(key)} to resolve to a live value, but found no live value in declaration ${a.show(val)}`)
  }

  optDerefLiveVal(src) {
    if (a.isNil(src)) return undefined

    /*
    This questionable special case allows live namespaces to include non-live
    declarations. Any declaration whose value is nil is considered to be
    present, but is not required to be a live value. Instead it's treated as a
    name which is expected to be available in JS at runtime. This behavior is
    used for some contextual names such as `arguments` and `this`.

    May reconsider in the future.
    */
    const key = this.optName()
    if (key && key in src && a.isNil(src[key])) return undefined

    return this.reqDerefLiveVal(src)
  }

  /*
  Somewhat redundant with `NsLive..reqGet`, but usable directly on live vals,
  without requiring a wrapping namespace, and generates more useful error
  messages.
  */
  reqDerefLiveVal(src) {
    const key = this.reqName()

    if (!a.isComp(src)) {
      throw this.err(`unable to dereference ${a.show(key)} in invalid live value ${a.show(src)}`)
    }

    if (!(key in src)) {
      throw this.err(`missing property ${a.show(key)} in live value ${a.show(src)}`)
    }

    const val = src[key]
    if (a.isNil(val)) {
      throw this.err(`unexpected nil property ${a.show(key)} in live value ${a.show(src)}`)
    }

    return val
  }

  macroImpl() {
    const nsp = this.reqResolveNs()
    nsp.addRef(this)

    /*
    Caution. This could have been written differently, producing a different
    behavior:

      if (nsp.isLive()) {
        return this.macroWithLiveVal(this.reqDerefLiveVal(nsp.ownVal()))
      }

    In the implementation above, if the declaring namespace is live, we would
    require the declared value to be usable, which means the value must be a
    subclass of `Node`. A nil value would generate a compile-time error.

    Instead of that, we intentionally allow "live" namespaces to declare
    properties with nil values, and treat such properties as regular non-live
    declarations. This may seem roundabout, but this makes it easy to provide
    macros AND predeclared JS names in one namespace. `Fn` uses this behavior.
    */
    const val = nsp.isLive() ? this.optDerefLiveVal(nsp.ownVal()) : undefined
    if (a.isSome(val)) return this.macroWithLiveVal(val)

    return this
  }

  /*
  TODO consider supporting renaming reserved JS names. May require knowledge of
  all unqualified names used in the same scope (which scope? all of them?). May
  require storing some data in the nearest lexical namespace.

  The default implementation requires the identifier to not be a keyword, which
  is useful for unqualified identifiers. However, some subclasses such as
  `IdentAccess` must override this to permit keywords. In ES5+, keywords may be
  used as property names.
  */
  compile() {return this.reqNotKeyword().decompile()}

  reqDeclareLex() {
    this.reqCanDeclare()
    return super.reqDeclareLex()
  }

  reqCanDeclare() {
    this.reqNotKeyword()
    this.reqNotReserved()
    return this
  }

  reqNotKeyword() {
    if (!this.isKeyword()) return this
    throw this.err(`${a.show(this.optName())} is a keyword in JS; attempting to use it as a regular identifier would generate invalid JS with a syntax error; please rename`)
  }

  isKeyword() {return jm.jsKeywordNames.has(this.optName())}

  reqNotReserved() {
    if (!this.isReserved()) return this
    throw this.err(`${a.show(this.optName())} is a reserved name in JS; attempting to redeclare it would generate invalid JS with a syntax error; please rename`)
  }

  isReserved() {return jm.jsReservedNames.has(this.optName())}

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
