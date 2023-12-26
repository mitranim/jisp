import * as a from '/Users/m/code/m/js/all.mjs'
import * as ji from './jisp_insp.mjs'
import * as jm from './jisp_misc.mjs'
import * as je from './jisp_err.mjs'
import * as jv from './jisp_valued.mjs'
import * as jmi from './jisp_mixable.mjs'
import * as jn from './jisp_node.mjs'
import * as jni from './jisp_node_ident.mjs'

/*
Base class for all namespaces.

A non-"live" namespace stores compile-time declarations, used for static
analysis and compilation.

A "live" namespace provides access to the properties of a "live" object,
intended for immediate compile-time usage. At the time of writing, we plan to
support exactly one interface for compile-time usage of imported live values:
they must be subclasses of `Node`. Any reference to a live value assumes that
it's a node class, instantiates it, and replaces the reference with the
resulting node instance. In the future, we may consider supporting other ways
of using live values.

Some namespaces are used lexically, in a hierarchy of AST nodes. See the class
`NsLex`. This gives birth to scoping. The concept of a "scope" emerges from
having ancestor-descendant relations where ancestors declare names and
descendants can access those names. In modern languages (at the time of
writing), the two most common scoping approaches are dynamic scoping and
lexical scoping. In both lexical and dynamic scoping, any given namespace
should be accessible only to the current-level node and descendants, but not to
ancestors. Every language has dynamic scoping, either first-class, or possible
to hack it in. Most languages have lexical scoping, and it tends to be
preferred. Jisp deals only with lexical scoping, because dynamic scoping is a
runtime-only feature which is out of scope for our compiler.

This is called "namespace" rather than "scope" because the term "scope" refers
to the extent in which a given name is declared, often encompassing several
layers in an AST. An individual namespace, as implemented here, is "flat",
having no ancestors or descendants of its own.

In our system, a namespace is simultaneously a definition of this namespace at
the eventual runtime of the compiled program, and an instance of this namespace
at compile time. Non-live namespaces describe an eventual runtime state, and do
not participate in immediate compile-time evaluation. Live namespaces refer to
live values intended for immediate compile-time evaluation / node replacement,
also known as macroexpansion or macroing.

In the future, we may consider adding another namespace variant used for
validating imports (for class `Import`), which would contain information
about exports provided by the given module, without providing access to
live values. In a more general case, it could provide comprehensive type
information, but type analysis is out of scope of this project, for now.
*/
export class NsBase extends je.MixErrer.goc(a.Emp) {
  isLive() {return false}

  has(key) {
    this.req(key, a.isValidStr)
    return false
  }

  optGet(key) {
    this.req(key, a.isValidStr)
    return false
  }

  reqGet(key) {
    if (!this.has(key)) {
      throw this.err(`missing declaration of ${a.show(key)} in namespace ${a.show(this)}`)
    }

    const tar = this.optGet(key)
    if (a.isSome(tar)) return tar

    throw this.err(`unexpected nil declaration of ${a.show(key)} in namespace ${a.show(this)}`)
  }

  optResolve(key) {
    if (this.has(key)) return this
    return undefined
  }

  /*
  Collection of "references": identifier nodes that refer to names in this
  namespace. May be used to find if the namespace is used at all, or which
  names are used.
  */
  #refs = undefined
  initRefs() {return this.#refs ??= new jni.IdentSet()}
  optRefs() {return this.#refs}

  addRef(val) {
    this.reqInst(val, jni.Ident)

    const key = val.reqName()
    if (!this.has(key)) {
      throw this.err(`invalid addition of reference ${a.show(val)} with name ${a.show(key)} to namespace ${a.show(this)} which does not declare this name`)
    }

    this.initRefs().add(val)
    return this
  }

  [ji.symInsp](tar) {return tar.funs(this.optRefs)}
}

export class NsLive extends jv.MixOwnValued.goc(NsBase) {
  isLive() {return true}

  // Override for `MixOwnValued`.
  setVal(val) {return super.setVal(this.req(val, a.isObj))}

  has(key) {
    this.req(key, a.isValidStr)
    return a.hasIn(this.optVal(), key)
  }

  optGet(key) {
    if (this.has(key)) return this.reqVal()[key]
    return undefined
  }

  [ji.symInsp](tar) {return super[ji.symInsp](tar.funs(this.optVal))}
}

/*
Short for "namespace with predeclared names".
Intended for declaring JS globals.
TODO better name.
*/
/*
export class NsPredecl extends NsBase {
  #set = undefined
  initSet() {return this.#set ??= new jm.ValidStrSet()}
  optSet() {return this.#set}

  has(key) {return !!this.optSet()?.has(key)}
  add(key) {return this.initSet().add(key), this}

  addMany(...val) {
    for (val of val) this.add(val)
    return this
  }

  [ji.symInsp](tar) {return super[ji.symInsp](tar.funs(this.optSet))}
}
*/

/*
Short for "namespace lexical". Unlike `NsBase` and `NsLive`, this namespace
is mutable.

TODO: consider also storing the node that declares this namespace, and using its
code span in error messages. Relevant sample of removed code:

  msgRedundant(key) {
    return `redundant redeclaration of ${a.show(key)}${a.reqStr(this.parentContext())}`
  }

  // For error messages.
  parentContext() {
    const span = this.optAncProcure(optSpanCall)
    if (!span) return ``
    return jm.joinLines(` in scope ${a.show(this)} declared here:`, span.context())
  }
*/
export class NsLex extends jmi.MixMixable.goc(NsBase) {
  #decls = undefined
  initDecls() {return this.#decls ??= new jn.NodeColl()}
  optDecls() {return this.#decls}

  has(key) {
    this.req(key, a.isValidStr)
    return !!this.optDecls()?.has(key)
  }

  optGet(key) {
    this.req(key, a.isValidStr)
    return this.#decls?.get(key)
  }

  // Draft. May be a dumb idea.
  addEmpty(key) {
    a.reqValidStr(key)
    const tar = this.initDecls()
    if (!tar.has(key)) Map.prototype.set.call(tar, key, undefined)
    return this
  }

  // TODO: would be ideal if these error messages referenced the code where this
  // namespace was originally declared. See comment above.
  addNode(node) {
    this.reqInst(node, jn.Node)

    const key = a.pkOpt(node)
    if (!key) {
      throw node.err(`unable to declare ${a.show(node)} in namespace ${a.show(this)}: missing name`)
    }

    if (this.has(key)) {
      throw node.err(`redundant declaration of ${a.show(key)} in namespace ${a.show(this)}`)
    }

    this.initDecls().add(node)
    return this
  }

  // Override for `MixMixable`.
  reqValidMixin(val) {
    return super.reqValidMixin(this.reqInst(val, NsBase))
  }

  optResolve(key) {return super.optResolve(key) ?? this.resolveMixinOpt(key)}

  resolveMixinOpt(key) {
    const src = this.optMixins()
    if (src) for (const val of src) if (val.optResolve(key)) return val
    return undefined
  }

  [ji.symInsp](tar) {return super[ji.symInsp](tar.funs(this.optDecls, this.optMixins))}
}

/*
Short for "mixin: own lexically namespaced". Any class using this mixin is
considered to have its own lexical namespace. Also see `MixNsLexed`.
*/
export class MixOwnNsLexed extends a.DedupMixinCache {
  static make(cls) {
    return class MixOwnNsLexed extends je.MixErrer.goc(cls) {
      get NsLex() {return NsLex}
      #nsLex = undefined
      ownNsLex() {return this.initNsLex()}
      optNsLex() {return this.#nsLex}
      reqNsLex() {return this.optNsLex() ?? this.throw(`missing own lexical namespace at ${a.show(this)}`)}
      initNsLex() {return this.#nsLex ??= this.makeNsLex()}
      makeNsLex() {return new this.NsLex()}
    }
  }
}

export class MixOwnNsLived extends a.DedupMixinCache {
  static make(cls) {
    return class MixOwnNsLived extends je.MixErrer.goc(cls) {
      get NsLive() {return NsLive}
      #nsLive = undefined
      ownNsLive() {return this.initNsLive()}
      optNsLive() {return this.#nsLive}
      reqNsLive() {return this.optNsLive() ?? this.throw(`missing own live namespace at ${a.show(this)}`)}
      initNsLive() {return this.#nsLive ??= this.makeNsLive()}
      makeNsLive() {return new this.NsLive()}
    }
  }
}
