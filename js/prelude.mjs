import * as j from './jisp_2.mjs'

/*
Implementation note. We could have used `Scope..addFromNativeModule` to
automatically generate the `prelude` scope, instead of registering definitions
separately throughout the file. However, it would be incorrect because some
macro classes exported by this module should NOT be added to this scope. For
example, the `Ret` macro should be available only in functions.
*/
const mod = new j.Module().setUrl(import.meta.url)

export default mod

export class Global extends j.PredeclMacroNode {
  static getSrcName() {return `global`}
  static getCompiledName() {return `globalThis`}
  ownVal() {return globalThis}
}

mod.ownPubScope().add(Global.def())

export class Nil extends j.PredeclMacroNode {
  static getSrcName() {return `nil`}
  static getCompiledName() {return `undefined`}
  ownVal() {return undefined}
}

mod.ownPubScope().add(Nil.def())

export class Null extends j.PredeclMacroNode {
  static getSrcName() {return `null`}
  static getCompiledName() {return `null`}
  ownVal() {return null}
}

mod.ownPubScope().add(Null.def())

export class No extends j.PredeclMacroNode {
  static getSrcName() {return `no`}
  static getCompiledName() {return `false`}
  ownVal() {return false}
}

mod.ownPubScope().add(No.def())

export class Ok extends j.PredeclMacroNode {
  static getSrcName() {return `ok`}
  static getCompiledName() {return `true`}
  ownVal() {return true}
}

mod.ownPubScope().add(Ok.def())

export class CallStyleSet extends j.MacroNode {
  static getSrcName() {return `callStyle`}

  str() {return this.reqSrcInstAt(1, j.Str)}
  name() {return this.reqSrcInstAt(2, j.Name)}

  macroImpl() {
    this.reqSrcList().reqEveryMeaningful().reqLen(3)
    this.run()
    return undefined
  }

  run() {
    this.name().reqDef().callOptFromStr(this.str().ownVal())
  }
}

mod.ownPubScope().add(CallStyleSet.def())

export class Call extends j.MacroNode {
  static getSrcName() {return `call`}
}

mod.ownPubScope().add(Call.def())

/*
FIXME consider:
  * `optRef` or `ownRef` that returns `UnqualName`.
*/
export class Const extends j.MacroNode {
  static getSrcName() {return `const`}

  pk() {return this.name().pk()}
  name() {return this.reqSrcInstAt(1, j.Name)}
  val() {return this.reqSrcAt(2)}

  // Override for `MixRef`.
  ownDeref() {return this.val()}

  macroImpl() {
    this.reqSrcList().reqEveryMeaningful().reqLen(3)
    this.defineLex()
    this.macroVal()
    return this
  }

  // FIXME consider ensuring that this is not a `j.Name` identical to the
  // `j.Name` defined by this macro, because it would be invalid in JS.
  macroVal() {return this.reqSrcNode().macroAt(2)}

  compile() {
    this.reqStatement()
    const prn = this.reqPrn()
    return `const ${prn.compile(this.name())} = ${prn.compile(this.val())}`
  }
}

mod.ownPubScope().add(Const.def())

export class Ret extends j.MacroNode {
  static getSrcName() {return `ret`}
}

export class Fn extends j.MixOwnLexScoped.goc(j.MacroNode) {
  static getSrcName() {return `fn`}

  pk() {return this.name().pk()}
  name() {return this.reqSrcInstAt(1, j.Name)}
  params() {return this.reqSrcInstAt(2, j.NodeList)}
  body() {return this.srcNodesFrom(3)}

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

  /*
  Override for `Node..defineLex`. Each function has its own scope. The default
  implementation of `Node..defineLex` would accidentally add the function to
  its own scope. That behavior would be correct when the function node is an
  expression, but incorrect when it's a statement.
  */
  defineLex() {
    if (this.isExpression()) {
      return this.defineInScope(this.reqLexScope())
    }
    return this.defineInScope(this.reqParent().reqLexScope())
  }

  defineParams() {
    for (const val of this.params()) val.asReqInst(j.Name).defineLex()
  }

  macroBody() {return this.reqSrcNode().macroFrom(3)}

  makeLexScope() {return super.makeLexScope().addMixin(this.constructor.mixin)}

  compile() {
    const prn = this.reqPrn()

    return `function ${
      prn.compile(this.ident())
    }(${
      prn.compileCommaSingle(this.params())
    }) {${
      prn.compileBlock(this.body())
    }}`
  }

  static mixin = new j.PubScope().add(Ret.def())
}

mod.ownPubScope().add(Fn.def())

export class When extends j.MacroNode {
  static getSrcName() {return `when`}
}

mod.ownPubScope().add(When.def())
