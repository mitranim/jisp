import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as ji from './jisp_insp.mjs'
import * as jnnd from './jisp_named.mjs'
import * as jn from './jisp_node.mjs'
import * as jne from './jisp_node_empty.mjs'
import * as jnt from './jisp_node_text.mjs'
import * as jnnu from './jisp_node_num.mjs'

/*
Base class for identifiers.

## Syntax

The syntax of Jisp identifiers should match the syntax of JS identifiers.
The set of all possible Jisp identifiers should exactly match the set of all
possible identifiers which can be used in JS as property names without quotes.

Jisp identifiers can also be operator-like. Unlike JS, we don't have a closed
whitelist of "known" operators. Instead, we support arbitrary operator-like
identifiers. This potentially allows user code to define its own "operators".
See `IdentOper` and `ops.mjs`.

Unlike traditional Lisps, we don't have a unified concept of "symbols" which may
contain arbitrary non-delimiter characters. Our word-like identifiers and
operator-like identifiers contain entirely different sets of characters, with
no overlap. Most word-like identifiers can be compiled to the same names in JS.
Operator-like identifiers can't be compiled to the same names in JS, and must
be removed from the AST before compiling to JS. Their main use is to reference
macros.

## Keywords

JS has various keywords which can never be used on their own as expressions.
In other words, their usage involves special syntax. This includes keywords
which are actually unary operators (like `typeof`), binary operators (like
`instanceof`), declarations (like `const` or `function`), and so on.

Jisp does not have keywords. Names such as `typeof` or `const` are regular
identifiers. We can't directly compile such names into JS, because that would
generate invalid JS that fails to parse. However, we can use such names to
reference macros, which also removes those identifiers from the AST. We also
ensure that such names are never accidentally compiled into JS, by detecting
such attempts and throwing descriptive exceptions pointing to the offending
Jisp code. See the methods `Ident..reqNotKeyword` and `Ident..compile`.

## Reserved names

JS has several reserved names which can be used on their own as expressions,
but can never be redeclared. Some of those names are available globally, like
`this`, while some others are only available contextually, like `super`. Any
attempt to redeclare such names causes a syntax error in JS.

Jisp does not have reserved names. However, in order to ensure that we always
generate syntactically valid JS, we should detect attempts to redeclare such
names, and throw descriptive exceptions pointing to the offending Jisp code.
See the method `Ident..reqCanDeclare`.

## Property names

In modern JS, the notions of keywords and reserved names apply only to
unqualified identifiers. Keywords and reserved names can be used as property
names without issue.

## Misc

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

  // Used by `a.pk` and `a.Coll`.
  pk() {return this.reqName()}

  // Override for `MixNamed`.
  ownName() {return this.optName()}

  // Override for `MixNamed`.
  optName() {return this.optDecompileOwn()}

  /*
  Override for `Node..macroList`. Implements calling of list-style macros.
  Automatically invoked by `DelimNodeList`.

  Known issue: does not add the identifier to its resolved namespace as a
  reference (via `NsBase..addRef`). At the time of writing, it's not entirely
  clear whether we should do that for identifiers which are removed from the
  AST as a result of macroing.
  */
  macroList(list) {
    const fun = this.optLiveVal()
    if (a.isNil(fun)) return list

    if (!a.isFun(fun)) {
      throw this.err(`unexpected non-function live value ${a.show(fun)} in call position`)
    }

    /*
    Automatically instantiate subclasses of `Node` with `new`. This allows Jisp
    code to directly reference them in call positions. This is convenient for
    macros written as classes, which includes most macros that ship with the
    compiler. This also makes it possible to cleanly add static properties to
    macros and reference them in Jisp code, which is convenient for some
    syntactic edge cases such as `import.meta` and `new.target`.
    */
    if (a.isSubCls(fun, jn.Node)) return new fun()

    /*
    This clause implements support for regular macro functions which aren't
    subclasses of `Node`. We always invoke them as methods, which may be useful
    for "live values" where properties are actually methods that care about
    `this`. For regular functions exported by modules, the context `this` will
    be the JS module object, which is typically ignored.

    TODO add tests for this macro style, and for nil return values.
    */
    return (
      fun.apply(this.optLiveValSrc(), list.optChildArr()) ??
      new jne.Empty()
    )

    return fun.apply(this.optLiveValSrc(), list.optChildArr())
  }

  /*
  SYNC[ident_live_val].

  This code is suitable only for unqualified identifiers, and must be fully
  overridden by `IdentAccess` and any other qualified subclasses.
  */
  macro() {return this.macroWithNs(this.reqResolveNs())}

  macroWithNs(nsp) {
    nsp.addRef(this)
    const src = nsp.optLiveVal()
    if (a.isSome(src)) return this.macroWithLiveValSrc(src)
    return this.macroWithNsNonLive(nsp)
  }

  macroWithNsNonLive(nsp) {
    // const val = this.optLiveValFromNs(nsp)
    // if (a.isSome(val)) return this.macroWithLiveVal(val)

    const key = this.reqName()
    const dec = nsp.optGet(key)
    if (a.isNil(dec)) return this

    const val = this.optLiveValFromDec(dec)
    if (a.isNil(val)) return this

    /*
    TODO: make reporting of source declarations consistent between `.macro` and
    `.macroList`.
    */
    throw this.err(a.reqStr(this.msgUnexpectedLive(key, val)) + ` found in declaration ${a.show(dec)}`)
  }

  /*
  This always produces an exception because at the time of writing, we only
  support "list"-style macros. We would like to lift this limitation in the
  future.

  It's possible and desirable to also implement support for "bare"-style macros
  which are invoked simply by mention, rather than in a list call position.

  The difficult part is figuring out a clean, nice way of differentiating "list"
  macros from "bare" macros. We want to keep treating regular functions and
  `Node` subclasses as "list" macros. The particularly tricky part is avoiding
  false positives without overcomplicating the interface.

  For example, let's say this method would invoke live functions, replacing the
  current node with the output. In that case, some macros would be written on
  the assumption that they're always used in "bare" form. Then at some point,
  they would be accidentally used in a list call position, and because
  `DelimNodeList` also invokes live functions and replaces itself with the
  output, the given macro would accidentally replace an entire list instead of
  replacing only the identifier that referenced the macro. Worst of all, the
  failure would be silent, the invalid behavior would be treated as valid by
  the compiler, and would most likely generate runnable JS.
  */
  macroWithLiveValSrc(src) {
    return this.macroWithLiveVal(this.reqDerefLiveVal(src), src)
  }

  macroWithLiveVal(val, src) {
    throw this.err(this.msgUnexpectedLive(this.reqName(), val, src))
  }

  /*
  TODO consider supporting renaming reserved JS names. May require knowledge of
  all unqualified names available or referenced in the current scope (with all
  ancestral namespaces). May require storing some data in the nearest lexical
  namespace.

  The default implementation requires the identifier to not be a keyword, which
  is useful for unqualified identifiers. However, some subclasses such as
  `IdentAccess` must override this to permit keywords, because in ES5+, the
  notions of "keywords" or "reserved words" don't apply to qualified property
  names.
  */
  compile() {return this.reqNotKeyword().decompile()}

  msgUnexpectedLive(key, val, src) {
    const msg = `unexpected non-call reference ${a.show(key)} to live value ${a.show(val)}`
    if (a.isSome(src)) return msg + ` found in live object ${a.show(src)}`
    return msg
  }

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
    const src = this.optResolveNs()
    return src.hasLiveVal() ? src : undefined
  }

  /*
  TODO: the error should include context from the node where the found namespace
  was originally created, if any.
  */
  reqResolveNsLive() {
    const val = this.reqResolveNs()
    if (val.hasLiveVal()) return val
    throw this.err(`expected ${a.show(this.optName())} to be declared in a live namespace, but the nearest declaration was found in the non-live namespace ${a.show(val)}`)
  }

  optLiveValSrc() {return this.optResolveNsLive()?.optLiveVal()}

  reqLiveValSrc() {
    const src = this.reqResolveNsLive()
    const val = src.optLiveVal()
    if (a.isSome(val)) return val
    throw this.err(`expected the namespace declaring ${a.show(this.optName())} to have to a non-nil live val, found nil in namespace ${a.show(src)}`)
  }

  // SYNC[ident_live_val].
  optLiveVal() {
    const key = this.optName()
    if (!key) return undefined

    const src = this.optResolveNs()
    if (!src) return undefined

    if (src.hasLiveVal()) return this.optDerefLiveVal(src.reqLiveVal())
    return this.optLiveValFromNs(src)
  }

  // See comments in `.optLiveVal`.
  reqLiveVal() {
    const src = this.reqResolveNs()
    if (src.hasLiveVal()) return this.reqDerefLiveVal(src.reqLiveVal())

    const key = this.reqName()
    const val = src.reqGet(key)
    if (val === this) return undefined

    const tar = jm.optLiveValCall(val)
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

    TODO: retest and update the comment. The support for treating nil live
    values as non-live has been removed from some other code.
    */
    const key = this.optName()
    if (key && (key in src) && a.isNil(src[key])) return undefined

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

  /*
  For internal use only.
  Intended for declarations obtained from non-live namespaces.
  */
  optLiveValFromDec(val) {
    if (a.isNil(val)) return undefined
    if (val === this) return undefined
    return jm.optLiveValCall(val)
  }

  /*
  For internal use only. Intended for non-live namespaces.

  Even if this identifier is found in a non-live namespace, the declaration
  may be used to indirectly obtain a live value. See below.

  At the time of writing, non-live namespaces are always `NsLex`, where values
  are instances of `Node`. In the future, we may consider extending the rules.

  Values declared in namespaces, such as this value, may optionally implement
  the method `.optLiveVal` which may return a live value. This may seem with
  the existence of live namespaces which themselves return a live value via
  `.optLiveVal`. However, there are cases where a non-live declaration, in a
  non-live namespace, eventually resolves to a live declaration in a live
  namespace. One common use case is the following:

    [.use `jisp:prelude.mjs` jp]
    [jp.and]

  After macroing the first statement, the local lexical namespace, which is
  non-live, has an entry for `jp`. The value of that entry is an AST node,
  specifically the instance of `Use` created by macroing the first statement.
  `Use` implements the method `.optLiveVal`, which returns the native JS
  module object obtained by importing the requested file. By following from
  any `jp` to its declaration, which is the `Use` instance, and requesting
  its live value, we obtain the imported module. The expression `jp.and`,
  which is an instance of `IdentAccess`, is able to obtain the class `And` by
  resolving the identifier `jp` to the `Use` instance, then to the imported
  prelude module, and accessing the property `.and` on the imported module
  object.
  */
  optLiveValFromNs(src) {
    return this.optLiveValFromDec(src.optGet(this.reqName()))
  }

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

  [ji.symInsp](tar) {return super[ji.symInsp](tar).funs(this.optName)}
}

export class IdentSet extends a.TypedSet {
  reqVal(val) {return a.reqInst(val, Ident)}
}

export class IdentColl extends a.Coll {
  reqVal(val) {return a.reqInst(val, Ident)}
}
