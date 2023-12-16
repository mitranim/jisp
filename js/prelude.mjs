import * as jsc from './jisp_scope.mjs'
import * as jscd from './jisp_scoped.mjs'
import * as jns from './jisp_ns.mjs'
import * as jnst from './jisp_node_str.mjs'
import * as jnn from './jisp_node_name.mjs'
import * as jnp from './jisp_node_predecl.mjs'
import * as jnm from './jisp_node_macro.mjs'
import * as jmo from './jisp_module.mjs'
import * as jnnl from './jisp_node_node_list.mjs'
import * as jnun from './jisp_node_unqual_name.mjs'

/*
Implementation note. We could have used `Scope..addFromNativeModule` to
automatically generate the `prelude` scope, instead of registering declarations
separately throughout the file. However, it would be incorrect because some
macro classes exported by this module should NOT be added to this scope. For
example, the `Ret` macro should be available only in functions.

FIXME unfuck this by moving "private" macros from the prelude elsewhere.
*/
const mod = new jmo.Module().setUrl(import.meta.url)

export default mod

export class Global extends jnp.Predecl {
  static getSrcName() {return `global`}
  static getCompiledName() {return `globalThis`}
  ownVal() {return globalThis}
}

mod.ownScope().ownPubNs().add(Global.decl())

export class Nil extends jnp.Predecl {
  static getSrcName() {return `nil`}
  static getCompiledName() {return `undefined`}
  ownVal() {return undefined}
}

mod.ownScope().ownPubNs().add(Nil.decl())

export class Null extends jnp.Predecl {
  static getSrcName() {return `null`}
  static getCompiledName() {return `null`}
  ownVal() {return null}
}

mod.ownScope().ownPubNs().add(Null.decl())

export class No extends jnp.Predecl {
  static getSrcName() {return `no`}
  static getCompiledName() {return `false`}
  ownVal() {return false}
}

mod.ownScope().ownPubNs().add(No.decl())

export class Ok extends jnp.Predecl {
  static getSrcName() {return `ok`}
  static getCompiledName() {return `true`}
  ownVal() {return true}
}

mod.ownScope().ownPubNs().add(Ok.decl())

export class CallSyntaxSet extends jnm.Macro {
  static getSrcName() {return `callSyntax`}

  str() {return this.reqSrcInstAt(1, jnst.Str)}
  name() {return this.reqSrcInstAt(2, jnun.UnqualName)}

  /*
  Declaration must be in same scope as macro node, and must be owned by the
  lexical namespace. Avoid searching mixins and ancestors. This restriction
  ensures that call opts are set in the same scope where a given name is
  declared, preventing other modules from changing them, which could easily
  break unrelated code, depending on the order of module evaluation.
  */
  optDecl() {return this.reqScope().reqLexNs().get(this.name().pk())}

  macroImpl() {
    this.reqSrcList().reqEveryChildNotCosmetic().reqChildCount(3)
    this.run()
    return undefined
  }

  run() {this.reqDecl().callOptFromStr(this.str().ownVal())}
}

mod.ownScope().ownPubNs().add(CallSyntaxSet.decl())

export class Call extends jnm.Macro {
  static getSrcName() {return `call`}
}

mod.ownScope().ownPubNs().add(Call.decl())

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
    this.reqSrcList().reqEveryChildNotCosmetic().reqChildCount(3)
    this.declareLex()
    this.macroVal()
    return this
  }

  // FIXME consider ensuring that this is not a `jnn.Name` identical to the
  // `jnn.Name` in the "name" position, because it would be invalid in JS.
  macroVal() {return this.reqSrcNode().macroAt(2)}

  compile() {
    this.reqStatement()
    const prn = this.reqCodePrinter()
    return `const ${prn.compile(this.name())} = ${prn.compile(this.val())}`
  }
}

mod.ownScope().ownPubNs().add(Const.decl())

export class Ret extends jnm.Macro {
  static getSrcName() {return `ret`}
}

export class Fn extends jscd.MixOwnScoped.goc(jnm.Macro) {
  static getSrcName() {return `fn`}
  get Scope() {return jsc.Scope}

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

    * When declaring a static method, add `this` to `Fn`'s scope.
      Must be `NodeDecl` referring to enclosing `Class`.
      Differentiate instance and static scopes.
      Possible approach: when nearest scope belongs to `Class`.

    * Declare static when possible.
  */
  macroImpl() {
    this.reqSrcList().reqEveryChildNotCosmetic().reqChildCountMin(3)
    this.declareLex()
    this.declareParams()
    this.macroBody()
    return this
  }

  // Override for `Node..declareLex`.
  declareLex() {
    if (this.isExpression()) {
      return this.reqOwnScope().reqLexNs().addFromNode(this)
    }
    return this.reqParent().reqScope().reqLexNs().addFromNode(this)
  }

  declareParams() {
    for (const val of this.params()) val.asReqInst(jnn.Name).declareLex()
  }

  macroBody() {return this.reqSrcNode().macroFrom(3)}

  compile() {
    const prn = this.reqCodePrinter()

    return `function ${
      prn.compile(this.name())
    }${
      prn.compileParensCommaMultiLine(this.params())
    } ${
      prn.compileBracesStatementsMultiLine(this.body())
    }`
  }

  static #mixin = undefined
  static ownMixin() {return this.#mixin ??= new jns.Ns().add(Ret.decl())}
}

mod.ownScope().ownPubNs().add(Fn.decl())

export class When extends jnm.Macro {
  static getSrcName() {return `when`}
}

mod.ownScope().ownPubNs().add(When.decl())
