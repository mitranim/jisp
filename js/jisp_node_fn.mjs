import * as jsc from './jisp_scope.mjs'
import * as jns from './jisp_ns.mjs'
import * as jnm from './jisp_node_macro.mjs'
import * as jnnl from './jisp_node_node_list.mjs'
import * as jniu from './jisp_node_ident_unqual.mjs'

export class Fn extends jns.MixOwnLexNsed.goc(jnm.Macro) {
  static getSrcName() {return `fn`}

  pk() {return this.reqName().pk()}
  reqName() {return this.reqSrcInstAt(1, jniu.IdentUnqual)}
  reqParams() {return this.reqSrcInstAt(2, jnnl.NodeList)}
  body() {return this.srcNodesFrom(3)}

  // Override for `MixOwnLexNsed`.
  makeLexNs() {return super.makeLexNs().addMixin(this.constructor.initMixin())}

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
      return this.ownLexNs().addFromNode(this)
    }
    return this.reqParent().reqLexNs().addFromNode(this)
  }

  declareParams() {
    for (const val of this.reqParams()) val.asReqInst(jniu.IdentUnqual).declareLex()
  }

  macroBody() {return this.reqSrcNode().macroFrom(3)}

  compile() {
    const prn = this.reqCodePrinter()

    return `function ${
      a.reqStr(this.reqName().compile())
    }${
      prn.compileParensCommaMultiLine(this.reqParams())
    } ${
      prn.compileBracesStatementsMultiLine(this.body())
    }`
  }

  // FIXME convert to something similar to what `Use` does in star mode.
  static mixin = undefined
  static initMixin() {return this.mixin ??= new jns.Ns().add(Ret.decl())}
}
