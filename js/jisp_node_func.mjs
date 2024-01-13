import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as jns from './jisp_ns.mjs'
import * as jn from './jisp_node.mjs'
import * as jnlm from './jisp_node_list_macro.mjs'
import * as jnnl from './jisp_node_node_list.mjs'
import * as jniu from './jisp_node_ident_unqual.mjs'
import * as jnr from './jisp_node_ret.mjs'

export class FuncBase extends jns.MixOwnNsLexed.goc(jnlm.ListMacro) {
  // Used by `a.pk` and `a.Coll`.
  pk() {return this.reqIdent().reqName()}
  reqIdent() {return this.reqChildInstAt(1, jniu.IdentUnqual)}
  optParams() {return this.optChildInstAt(2, jnnl.NodeList)}
  reqParams() {return this.reqChildInstAt(2, jnnl.NodeList)}
  body() {return this.optChildSlice(3)}
  hasBody() {return this.childCount() > 3}
  optBodyInit() {return this.optChildSlice(3, -1)}
  optBodyLast() {return this.hasBody() ? this.reqLastChild() : undefined}

  macro() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCountMin(2)
    this.reqIdent().reqCanDeclare()
    this.reqDeclareLex()
    this.declareParams()
    return this.macroBody()
  }

  macroBody() {return this.macroFrom(3)}

  // Override for `Node..reqDeclareLex`.
  reqDeclareLex() {
    if (this.isStatement()) {
      return this.reqParent().reqNsLex().addNode(this)
    }
    return this.initNsLex().addNode(this)
  }

  declareParams() {
    const src = this.optParams()
    if (a.isNil(src)) return
    for (const val of src.childIter()) {
      val.asReqInst(jniu.IdentUnqual).reqDeclareLex()
    }
  }

  compile() {
    return a.spaced(
      a.reqStr(this.compileExportPrefix()),
      a.reqStr(this.compilePrefix()),
      a.reqStr(this.compileName()),
      a.reqStr(this.compileParams()),
      a.reqStr(this.compileBody()),
    )
  }

  compileExportPrefix() {return this.isExportable() ? `export` : ``}
  compilePrefix() {return `function`}
  compileName() {return jn.optCompileNode(this.reqIdent())}
  compileParams() {return this.reqPrn().compileParensWithExpressions(this.optParams()?.childIter())}
  compileBody() {return this.compileBodyWithImplicitReturn()}
  compileBodyWithoutImplicitReturn() {return this.reqPrn().compileBracesWithStatements(this.body())}

  compileBodyWithImplicitReturn() {
    const prn = this.reqPrn()

    return prn.wrapBraces(jm.joinLines(
      this.compileBodyInit(),
      prn.optTerminateStatement(this.compileBodyLast()),
    ))
  }

  compileBodyInit() {return this.reqPrn().compileStatements(this.optBodyInit())}
  compileBodyLast() {return this.reqPrn().optCompileReturn(this.optBodyLast())}

  isChildStatement(val) {
    super.isChildStatement(val)

    return val.optParent() === this && (
      true
      && val !== this.optChildAt(0)
      && val !== this.optChildAt(1)
      && val !== this.optChildAt(2)
      && val !== this.optBodyLast()
    )
  }

  static reprModuleUrl = import.meta.url
}

export class Func extends FuncBase {
  static get async() {return FuncAsync}
  static get asyncImplicit() {return FuncAsyncImplicit}
  static reprModuleUrl = import.meta.url
}

export class FuncAsync extends FuncBase {
  compilePrefix() {return `async function`}
  static reprModuleUrl = import.meta.url
}

/*
TODO consider using `.reqParentMatch` to ensure that the parent is either a
class node, or an object literal node.
*/
export class MethodFuncBase extends FuncBase {
  /*
  Override for `FuncBase..reqDeclareLex`.

  In JS, methods can be referenced only via property access, and can't be
  referenced via unqualified identifiers. They add themselves to the prototype
  of the current class or to the current object literal, but not to the current
  lexical namespace.

  Note that in JS, redundant / overlapping declarations of properties / methods
  are valid. The last one takes priority. Ideally, we should detect collisions
  at compile time.
  */
  reqDeclareLex() {}

  compilePrefix() {return ``}

  static reprModuleUrl = import.meta.url
}

/*
Intended for class instance methods and for object literal methods.
For our purposes, they're identical.
*/
export class MethodFunc extends MethodFuncBase {
  static get async() {return MethodFuncAsync}
  compilePrefix() {return ``}
  static reprModuleUrl = import.meta.url
}

export class MethodFuncAsync extends MethodFuncBase {
  compilePrefix() {return `async`}
  static reprModuleUrl = import.meta.url
}

export class MethodFuncStatic extends MethodFuncBase {
  static get async() {return MethodFuncStaticAsync}
  compilePrefix() {return `static`}
  static reprModuleUrl = import.meta.url
}

export class MethodFuncStaticAsync extends MethodFuncBase {
  compilePrefix() {return `static async`}
  static reprModuleUrl = import.meta.url
}
