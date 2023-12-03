import * as j from './jisp_3.mjs'

/*
Implementation note. We could have used `Scope..addFromNativeModule` to
automatically generate the `prelude` scope, instead of registering definitions
separately throughout the file. However, it would be incorrect because some
macro classes exported by this module should NOT be added to this scope. For
example, the `Ret` macro should be available only in functions.
*/
const mod = new j.Module().setUrl(import.meta.url)

export default mod

// export default {
//   scope: {
//     global: {
//       ...
//     },
//     nil: {
//       ...
//     },
//   },
// }

export class Global extends j.PredeclNode {
  static getSrcName() {return `global`}
  static getCompiledName() {return `globalThis`}
  ownVal() {return globalThis}
}

mod.ownScope().ownPubNs().add(Global.def())

export class Nil extends j.PredeclNode {
  static getSrcName() {return `nil`}
  static getCompiledName() {return `undefined`}
  ownVal() {return undefined}
}

mod.ownScope().ownPubNs().add(Nil.def())

export class Null extends j.PredeclNode {
  static getSrcName() {return `null`}
  static getCompiledName() {return `null`}
  ownVal() {return null}
}

mod.ownScope().ownPubNs().add(Null.def())

export class No extends j.PredeclNode {
  static getSrcName() {return `no`}
  static getCompiledName() {return `false`}
  ownVal() {return false}
}

mod.ownScope().ownPubNs().add(No.def())

export class Ok extends j.PredeclNode {
  static getSrcName() {return `ok`}
  static getCompiledName() {return `true`}
  ownVal() {return true}
}

mod.ownScope().ownPubNs().add(Ok.def())

export class CallStyleSet extends j.MacroNode {
  static getSrcName() {return `callStyle`}

  str() {return this.reqSrcInstAt(1, j.Str)}
  name() {return this.reqSrcInstAt(2, j.UnqualName)}

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

mod.ownScope().ownPubNs().add(CallStyleSet.def())

export class Call extends j.MacroNode {
  static getSrcName() {return `call`}
}

mod.ownScope().ownPubNs().add(Call.def())

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

mod.ownScope().ownPubNs().add(Const.def())

export class Ret extends j.MacroNode {
  static getSrcName() {return `ret`}
}

export class Fn extends j.MixScoper.goc(j.MacroNode) {
  static getSrcName() {return `fn`}

  pk() {return this.name().pk()}
  name() {return this.reqSrcInstAt(1, j.Name)}
  params() {return this.reqSrcInstAt(2, j.NodeList)}
  body() {return this.srcNodesFrom(3)}

  makeScope() {
    const tar = new j.LexScope()
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
    for (const val of this.params()) val.asReqInst(j.Name).defineLex()
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
  static ownMixin() {return this.#mixin ??= new j.Ns().add(Ret.def())}
}

mod.ownScope().ownPubNs().add(Fn.def())

export class When extends j.MacroNode {
  static getSrcName() {return `when`}
}

mod.ownScope().ownPubNs().add(When.def())
