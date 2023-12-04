import * as jsc from './jisp_scope.mjs'
import * as jscd from './jisp_scoped.mjs'
import * as jns from './jisp_ns.mjs'
import * as jnst from './jisp_node_str.mjs'
import * as jnn from './jisp_node_name.mjs'
import * as jnp from './jisp_node_predecl.mjs'
import * as jnm from './jisp_node_macro.mjs'
import * as jnmo from './jisp_node_module.mjs'
import * as jnnl from './jisp_node_node_list.mjs'
import * as jnun from './jisp_node_unqual_name.mjs'

/*
Implementation note. We could have used `Scope..addFromNativeModule` to
automatically generate the `prelude` scope, instead of registering definitions
separately throughout the file. However, it would be incorrect because some
macro classes exported by this module should NOT be added to this scope. For
example, the `Ret` macro should be available only in functions.
*/
const mod = new jnmo.Module().setUrl(import.meta.url)

export default mod

export class Global extends jnp.Predecl {
  static getSrcName() {return `global`}
  static getCompiledName() {return `globalThis`}
  ownVal() {return globalThis}
}

mod.ownScope().ownPubNs().add(Global.def())

export class Nil extends jnp.Predecl {
  static getSrcName() {return `nil`}
  static getCompiledName() {return `undefined`}
  ownVal() {return undefined}
}

mod.ownScope().ownPubNs().add(Nil.def())

export class Null extends jnp.Predecl {
  static getSrcName() {return `null`}
  static getCompiledName() {return `null`}
  ownVal() {return null}
}

mod.ownScope().ownPubNs().add(Null.def())

export class No extends jnp.Predecl {
  static getSrcName() {return `no`}
  static getCompiledName() {return `false`}
  ownVal() {return false}
}

mod.ownScope().ownPubNs().add(No.def())

export class Ok extends jnp.Predecl {
  static getSrcName() {return `ok`}
  static getCompiledName() {return `true`}
  ownVal() {return true}
}

mod.ownScope().ownPubNs().add(Ok.def())

export class CallSyntaxSet extends jnm.Macro {
  static getSrcName() {return `callSyntax`}

  str() {return this.reqSrcInstAt(1, jnst.Str)}
  name() {return this.reqSrcInstAt(2, jnun.UnqualName)}

  /*
  Definition must be in same scope as macro node, and must be owned by the
  lexical namespace. Avoid searching mixins and ancestors. This restriction
  ensures that call opts are set in the same scope where a given name is
  defined, preventing other modules from changing them, which could easily
  break unrelated code, depending on the order of module evaluation.
  */
  optDef() {return this.reqScope().reqLexNs().get(this.name().pk())}

  macroImpl() {
    this.reqSrcList().reqEveryMeaningful().reqLen(3)
    this.run()
    return undefined
  }

  run() {this.reqDef().callOptFromStr(this.str().ownVal())}
}

mod.ownScope().ownPubNs().add(CallSyntaxSet.def())

export class Call extends jnm.Macro {
  static getSrcName() {return `call`}
}

mod.ownScope().ownPubNs().add(Call.def())

/*
FIXME consider:
  * `optRef` or `ownRef` that returns `UnqualName`.
*/
export class Const extends jnm.Macro {
  static getSrcName() {return `const`}

  pk() {return this.name().pk()}
  name() {return this.reqSrcInstAt(1, jnn.Name)}
  val() {return this.reqSrcAt(2)}

  // Override for `MixRef`.
  ownDeref() {return this.val()}

  macroImpl() {
    this.reqSrcList().reqEveryMeaningful().reqLen(3)
    this.defineLex()
    this.macroVal()
    return this
  }

  // FIXME consider ensuring that this is not a `jnn.Name` identical to the
  // `jnn.Name` defined by this macro, because it would be invalid in JS.
  macroVal() {return this.reqSrcNode().macroAt(2)}

  compile() {
    this.reqStatement()
    const prn = this.reqPrn()
    return `const ${prn.compile(this.name())} = ${prn.compile(this.val())}`
  }
}

mod.ownScope().ownPubNs().add(Const.def())

export class Ret extends jnm.Macro {
  static getSrcName() {return `ret`}
}

export class Fn extends jscd.MixOwnScoped.goc(jnm.Macro) {
  static getSrcName() {return `fn`}

  pk() {return this.name().pk()}
  name() {return this.reqSrcInstAt(1, jnn.Name)}
  params() {return this.reqSrcInstAt(2, jnnl.NodeList)}
  body() {return this.srcNodesFrom(3)}

  makeScope() {
    const tar = new jsc.LexScope()
    tar.ownLexNs().addMixin(this.constructor.ownMixin())
    return tar
  }

  /*
  FIXME:

    * When defining a static method, add `this` to `Fn`'s scope.
      Must be `NodeDef` referring to enclosing `Class`.
      Differentiate instance and static scopes.
      Possible approach: when nearest scope belongs to `Class`.

    * Define static when possible.
  */
  macroImpl() {
    this.reqSrcList().reqEveryMeaningful().reqLenMin(3)
    this.defineLex()
    this.defineParams()
    this.macroBody()
    return this
  }

  // Override for `Node..defineLex`.
  defineLex() {
    if (this.isExpression()) {
      return this.defineIn(this.reqOwnScope().reqLexNs())
    }
    return this.defineIn(this.reqParent().reqScope().reqLexNs())
  }

  defineParams() {
    for (const val of this.params()) val.asReqInst(jnn.Name).defineLex()
  }

  macroBody() {return this.reqSrcNode().macroFrom(3)}

  compile() {
    const prn = this.reqPrn()

    return `function ${
      prn.compile(this.name())
    }${
      prn.compileParensCommaMultiLine(this.params())
    } ${
      prn.compileBracesStatementsMultiLine(this.body())
    }`
  }

  static #mixin = undefined
  static ownMixin() {return this.#mixin ??= new jns.Ns().add(Ret.def())}
}

mod.ownScope().ownPubNs().add(Fn.def())

export class When extends jnm.Macro {
  static getSrcName() {return `when`}
}

mod.ownScope().ownPubNs().add(When.def())
