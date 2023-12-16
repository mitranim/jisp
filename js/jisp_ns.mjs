import * as a from '/Users/m/code/m/js/all.mjs'
import * as jc from './jisp_conf.mjs'
import * as jm from './jisp_misc.mjs'
import * as je from './jisp_err.mjs'
import * as jch from './jisp_child.mjs'
import * as jmi from './jisp_mixable.mjs'
import * as jp from './jisp_parent.mjs'
import * as jd from './jisp_def.mjs'
import * as jn from './jisp_node.mjs'
import * as jnm from './jisp_node_macro.mjs'
import * as jnu from './jisp_node_use.mjs'
import * as jnn from './jisp_node_name.mjs'

export class NsErr extends je.Err {}

/*
Short for "namespace". Contains compile-time declarations of names. Can be used
either for lexical scopes or public properties of objects. When used by a
lexical scope, this contains declarations of local variables. When used to
describe public properties of an object (like JS module exports), this contains
declarations of properties. This is an ordered map where declarations are
stored in the order they were added, each definition is keyed under the name of
the local variable or public property, and each definition also has knowledge
of that name (method `.pk`).
*/
export class Ns extends jp.MixParent.goc(jmi.MixMixable.goc(jch.MixChild.goc(a.Coll))) {
  // For `a.TypedMap` used by `a.Coll`.
  reqKey(key) {return a.reqValidStr(key)}
  reqVal(val) {return a.reqInst(val, jd.Def)}

  // Used by namespace mixins.
  optNs() {return this}

  /*
  For `MixMixable`.

  In namespaces, each mixin must be an object that causes us to add this mixin
  to the namespace (the "cause"), and it must provide access to a public
  namespace that we are "mixing in". We could have used a simpler interface,
  where mixins are public namespaces, without an intermediary layer. However,
  for each mixin, we also need access to the "cause" of adding the mixin, which
  is usually an AST node such as `Use`.

  For example, the `Use` macro, in "import all" mode, imports another module and
  adds its public scope as a mixin to the local lexical scope where `Use` was
  found. This allows unqualified names to refer to exports from another module.
  To actually compile that code into valid JS, we must convert unqualified
  names to qualified names, which may require access to the original `Use`,
  which is what gets added here as a mixin.
  */
  validMixin(val) {
    super.validMixin(val)
    return reqOptNsed(val)
  }

  // For `MixErrer`.
  err(...val) {return new NsErr(...val)}

  // For error messages.
  parentContext() {
    const span = this.optAncProcure(optSpan)
    if (!span) return ``
    return jm.joinLines(` in scope ${a.show(this)} declared here:`, span.context())
  }

  add(val) {return super.add(this.toValidChild(val))}

  addFromNode(node) {
    this.reqInst(node, jn.Node)
    const def = new jd.NodeDef().setSrcNode(node)
    try {this.add(def)}
    catch (err) {throw node.err(`unable to register definition with name ${a.show(def.pk())}`, err)}
    return def
  }

  set(key, val) {
    if (this.has(key)) throw this.err(this.msgRedundant(key))
    return this.replace(key, val)
  }

  replace(key, val) {return super.set(key, val)}

  msgRedundant(key) {
    return `redundant redeclaration of ${a.show(key)}${a.reqStr(this.parentContext())}`
  }

  /*
  Finds a given name in the scope, including mixins. Returns nil or `Def`.

  FIXME not good enough. When resolving from a mixin, the consumer requires
  the source of the mixin.
  */
  resolve(key) {
    this.reqKey(key)
    return this.get(key) || this.resolveFromMixins(key)
  }

  resolveFromMixins(key) {
    const resolve = val => val.optNs()?.resolve(key)
    return a.procure(this.optMixins(), resolve)
  }

  resolveNode(val) {
    return this.resolve(this.reqInst(val, jn.Node).asReqInst(jnn.Name).ownName())
  }

  /*
  Should be used when building public namespaces for native modules without a
  header file. Modules should be able to "opt out" by providing either a header
  file or a default export that's an instance of `Module`. See
  `Module.fromNative`.
  */
  addFromNativeModule(src) {
    for (const key of a.structKeys(jm.reqNativeModule(src))) {
      this.addFromNativeModuleEntry(src[key], key)
    }
    return this
  }

/*
  addFromNativeModuleEntry(val) {
    if (a.isSubCls(val, jnm.Macro)) this.add(val.def())
  }
*/

  addFromNativeModuleEntry(val) {
    const def = val?.def?.()
    if (a.isInst(def, jd.Def)) this.add(def)
  }

  /*
  Must be provided to every user-defined module, as a mixin for the lexical
  namespace, like an implicit "import all". This namespace must contain EXACTLY
  ONE member: the `Use` macro. All other built-ins must be defined in the
  `prelude` module.

  FIXME consider moving this to `Root`. A root would provide a lexical
  namespace, used by all modules in that root.
  */
  static #predecl = undefined
  static ownPredecl() {return this.#predecl ??= new this().add(jnu.Use.def())}
}

function optSpan(src) {
  return a.isObj(src) && `optSpan` in src ? src.optSpan() : undefined
}

function optNs(val) {
  return a.isObj(val) && `optNs` in val ? val.optNs() : undefined
}

// function isOptNsed(val) {return a.isInst(optNs(val), Ns)}

function isOptNsed(val) {
  return a.isInst(val.optNs(), Ns)
  // return a.isInst(optNs(val), Ns)
}

function reqOptNsed(val) {return a.req(val, isOptNsed)}
