import {a} from './dep.mjs'
import * as jm from './misc.mjs'
import * as ji from './insp.mjs'
import * as jnnd from './named.mjs'
import * as jn from './node.mjs'
import * as jnt from './node_text.mjs'
import * as jnnu from './node_num.mjs'

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
identifiers. We can't compile identifiers with those names into JS identifiers,
because that would generate invalid JS that fails to parse. However, we can use
such names to reference macros. Macro execution removes those identifiers from
the AST. We also ensure that such names are never accidentally compiled into
JS, by detecting such attempts and throwing descriptive exceptions pointing to
the offending Jisp code. See the methods `Ident..reqNotKeyword` and
`Ident..compile`.

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
export class Ident extends jnnd.MixOwnNamed.goc(jnt.Text) {
  static regexpIdentUnqual() {return /^([A-Za-z$_][\w$]*)/}
  static regexpIdentAccess() {return /^[.]([A-Za-z$_][\w$]*)/}

  // Used by `a.pk` and `a.Coll`.
  pk() {return this.reqName()}

  // Override for `Text..setMatch`.
  setMatch(mat) {
    super.setMatch(mat)
    return this.setName(mat[1])
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

    const val = this.optLiveValFromDec(nsp.optGet(this.reqName()))
    if (a.isSome(val)) return this.macroWithLiveVal(val)

    return this
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
    if (jn.isBareMacro(val)) {
      return jn.reqValidMacroResult(this, val.macroBare(this), val)
    }
    throw this.err(`unexpected reference ${a.show(this.reqName())} to live value ${a.show(val)}${src ? ` found in live object ${a.show(src)}` : ``}; to be usable in this position, the live value must be a subclass of \`Node\` with a static method \`.macroBare\``)
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
  compile() {return this.reqNotKeyword().reqName()}

  compileRepr() {
    return a.reqValidStr(super.compileRepr()) + `.setName(${a.show(this.reqName())})`
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
    throw this.err(`${a.show(this.reqName())} is a keyword in JS; attempting to use it as a regular identifier would generate invalid JS with a syntax error; please rename`)
  }

  isKeyword() {return jm.jsKeywordNames.has(this.reqName())}

  reqNotReserved() {
    if (!this.isReserved()) return this
    throw this.err(`${a.show(this.reqName())} is a reserved name in JS; attempting to redeclare it would generate invalid JS with a syntax error; please rename`)
  }

  isReserved() {return jm.jsReservedNames.has(this.reqName())}

  optResolveNs() {return this.optResolveName(this.reqName())}

  /*
  TODO: consider including all locally available names in the error message.
  It might be useful to exactly represent the hierarchical structure of the
  available lexical namespaces and their mixins, instead of simply listing all
  names.
  */
  reqResolveNs() {
    return (
      this.optResolveNs() ??
      this.throw(`unable to find declaration of ${a.show(this.reqName())} at ${a.show(this)}`)
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
    throw this.err(`expected ${a.show(this.reqName())} to be declared in a live namespace, but the nearest declaration was found in the non-live namespace ${a.show(val)}`)
  }

  /*
  Implementation note. Unlike `.optLiveVal`, this does not attempt to obtain a
  live value source from a non-live namespace. That's because declarations of
  unqualified identifiers in non-live namespaces may indirectly refer to live
  values, but not to live value sources. The most typical case is `NsLex`,
  where declarations are AST nodes that declare names. One common example is
  `Use`:

    [use `jisp:prelude.mjs` jp]
    jp

  In this case, the unqualified identifier `jp` resolves to the local non-live
  namespace which is an instance of `NsLex`, where the declaration of `jp` is
  an instance of `Use`, which has a live value which is the JS module that it
  imports. For the name `jp`, there is no outer object on which we would read
  the property `jp` to obtain the live value of the module. This live value is
  an orphan without a live value source.

  Note the difference with the following example:

    [use `jisp:prelude.mjs` *]
    const

  In this example, `Use` does NOT create a declaration in the local non-live
  namespace `NsLex`. The unqualified identifier `const` resolves to a live
  namespace which is an instance of `NsLive`, and we can obtain the live value
  source, which is the same JS module object as in the previous example. Note
  in the earlier example, this was the live value, not the live value source.
  */
  optLiveValSrc() {return this.optResolveNsLive()?.optLiveVal()}

  reqLiveValSrc() {
    const src = this.reqResolveNsLive()
    const val = src.optLiveVal()
    if (a.isSome(val)) return val
    throw this.err(`expected the namespace declaring ${a.show(this.reqName())} to have to a non-nil live val, found nil in namespace ${a.show(src)}`)
  }

  // SYNC[ident_live_val].
  optLiveVal() {
    const src = this.optResolveNs()
    if (a.isNil(src)) return undefined
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
    const key = this.reqName()
    if (key in src && a.isNil(src[key])) return undefined

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
  the method `.optLiveVal` which may return a live value. This may seem
  redundant with the existence of live namespaces which themselves return a
  live value via `.optLiveVal`. However, there are cases where a non-live
  declaration, in a non-live namespace, eventually resolves to a live
  declaration in a live namespace. One common use case is the following:

    [use `jisp:prelude.mjs` jp]
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
    return a.jsonEncode(val)
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

  static {this.setReprModuleUrl(import.meta.url)}
  [ji.symInsp](tar) {return super[ji.symInsp](tar).funs(this.optName)}
}

export class IdentSet extends a.TypedSet {
  reqVal(val) {return a.reqInst(val, Ident)}
}

export class IdentColl extends a.Coll {
  reqVal(val) {return a.reqInst(val, Ident)}
}
