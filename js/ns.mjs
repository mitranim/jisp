import * as a from '/Users/m/code/m/js/all.mjs'
import * as ji from './insp.mjs'
import * as je from './err.mjs'
import * as jmi from './mixable.mjs'
import * as jn from './node.mjs'
import * as jni from './node_ident.mjs'

/*
Base class for all namespaces.

Some namespaces are used lexically, in a hierarchy of AST nodes. See the class
`NsLex`. This gives birth to scoping. The concept of a "scope" emerges from
having ancestor-descendant relations where ancestors declare names and
descendants can access those names. In modern languages (at the time of
writing), the two most common scoping approaches are dynamic scoping and
lexical scoping. In both lexical and dynamic scoping, any given namespace
should be accessible only to the current-level node and descendants, but not to
ancestors. Every language has dynamic scoping, either first-class, or possible
to implement with hacks. Most languages have lexical scoping, and it tends to
be preferred. Jisp deals only with lexical scoping, because dynamic scoping is
a runtime-only feature which is out of scope for our compiler.

This is called "namespace" rather than "scope" because the term "scope" refers
to the extent in which a given name is declared, often encompassing several
layers in an AST. An individual namespace, as implemented here, is "flat",
having no ancestors or descendants of its own.

In our system, any given namespace object is simultaneously a DEFINITION of a
namespace at the eventual runtime of the compiled program, and an INSTANCE of
this namespace during compiler execution. Non-live namespaces describe only the
eventual runtime state of the compiled code, and are used only for tracking
names to their declarations. Live namespaces also describe the current runtime
state during compiler execution, and provide live values intended for immediate
macro-time execution, also known as macros, macro functions, macro classes.

In the future, we may consider adding another namespace variant used for
validating imports (for class `Import`), which would contain information
about exports provided by the given module, without providing access to
live values. In a more general case, it could provide comprehensive type
information, but type analysis is out of scope of this project, for now.

A namespace may contain a "live value": an arbitrary JS value intended for
immediate macro-time execution, which is typically done by calling the methods
of the live value. In this case, the names in the namespace must reflect the
properties of the live value, which is typically done by inspecting the live
value. This approach is implemented by `NsLive`.

A regular namespace without a "live value" is meant only for static analysis,
without immediate macro-time execution.
*/
export class NsBase extends je.MixErrer.goc(ji.MixInsp.goc(a.Emp)) {
  has(key) {
    this.req(key, a.isValidStr)
    return false
  }

  optGet(key) {
    this.req(key, a.isValidStr)
    return undefined
  }

  reqGet(key) {
    if (!this.has(key)) {
      throw this.err(`unable to find declaration of ${a.show(key)} in namespace ${a.show(this)}`)
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
  hasRefs() {return this.#refs?.size > 0}

  addRef(val) {
    this.reqInst(val, jni.Ident)

    const key = val.reqName()
    if (!this.has(key)) {
      throw this.err(`invalid addition of reference ${a.show(val)} with name ${a.show(key)} to namespace ${a.show(this)} which does not declare this name`)
    }

    this.initRefs().add(val)
    return this
  }

  hasLiveVal() {return a.isSome(this.optLiveVal())}
  optLiveVal() {}
  reqLiveVal() {return this.optLiveVal() ?? this.throw(`missing live value in namespace ${a.show(this)}`)}

  [ji.symInsp](tar) {return tar.funs(this.optRefs)}
}

export class NsLive extends NsBase {
  #val = undefined
  setLiveVal(val) {return this.#val = this.req(val, a.isComp), this}
  optLiveVal() {return this.#val}

  has(key) {
    this.req(key, a.isValidStr)
    const src = this.#val
    return a.isComp(src) && key in src
  }

  optGet(key) {
    const src = this.#val
    return (a.isComp(src) && key in src) ? src[key] : undefined
  }

  [ji.symInsp](tar) {return super[ji.symInsp](tar.funs(this.optLiveVal))}
}

/*
Variant of `NsLive` that doesn't store references. Unlike regular `NsLive`, this
may be suitable for cases where a namespace can be allocated once and reused.
*/
export class NsLiveUnref extends NsLive {addRef() {}}

/*
Encapsulates a live object, such as a native imported module, and interprets the
set of its properties as the set of names declared in this namespace, without
accessing or exposing the property values. Can be used to implement *-style
imports that compile to explicit named imports in JS. Can be used to detect
missing exports at macro time.
*/
export class NsLivePseudo extends NsLive {
  optLiveVal() {}
  optGet() {}
}

/*
Variant of `NsLivePseudo` that doesn't store references. Unlike regular
`NsLivePseudo`, this may be suitable for cases where a namespace can be
allocated once and reused.
*/
export class NsLivePseudoUnref extends NsLivePseudo {addRef() {}}

/*
Short for "namespace lexical". Unlike `NsBase` and `NsLive`, this namespace
is mutable and supports mixins.

Namespace mixins are conceptually similar to multiple inheritance. They allow a
namespace to "inherit" names from multiple other namespaces. When resolving a
name in a lexical namespace, we check its own declarations, then check mixins.
This allows us to implement "star"-imports; see `ImportBase` and its
subclasses. This also makes it easier to implement namespaces with multiple
components, such as combining live and non-live namespaces into one; see `Func`.

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
  hasDecls() {return this.#decls?.size > 0}

  has(key) {
    this.req(key, a.isValidStr)
    return !!this.optDecls()?.has(key)
  }

  optGet(key) {
    this.req(key, a.isValidStr)
    return this.#decls?.get(key)
  }

  // // Draft. May be a dumb idea.
  // addEmpty(key) {
  //   a.reqValidStr(key)
  //   const tar = this.initDecls()
  //   if (!tar.has(key)) Map.prototype.set.call(tar, key, undefined)
  //   return this
  // }

  /*
  TODO: would be ideal if these error messages referenced the code where this
  namespace was originally declared. See comment above.
  */
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

  // FIXME iterate in reverse or add mixins in reverse.
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
      #nsLex = undefined
      optNsLex() {return this.#nsLex}
      ownNsLex() {return this.initNsLex()}
      reqNsLex() {return this.initNsLex()}
      initNsLex() {return this.#nsLex ??= this.makeNsLex()}
      makeNsLex() {return new this.NsLex()}
      get NsLex() {return NsLex}
    }
  }
}

export class MixOwnNsLived extends a.DedupMixinCache {
  static make(cls) {
    return class MixOwnNsLived extends je.MixErrer.goc(cls) {
      #nsLive = undefined
      optNsLive() {return this.#nsLive}
      reqNsLive() {return this.initNsLive()}
      initNsLive() {return this.#nsLive ??= this.makeNsLive()}
      makeNsLive() {return new this.NsLive()}
      get NsLive() {return NsLive}
    }
  }
}
