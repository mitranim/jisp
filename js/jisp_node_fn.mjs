import * as jns from './jisp_ns.mjs'
import * as jnlm from './jisp_node_list_macro.mjs'
import * as jnnl from './jisp_node_node_list.mjs'
import * as jniu from './jisp_node_ident_unqual.mjs'
import * as jnr from './jisp_node_ret.mjs'

export class Fn extends jns.MixOwnNsLexed.goc(jnlm.ListMacro) {
  static getSrcName() {return `fn`}

  pk() {return this.reqIdent().reqName()}
  reqIdent() {return this.reqSrcInstAt(1, jniu.IdentUnqual)}
  reqParams() {return this.reqSrcInstAt(2, jnnl.NodeList)}
  body() {return this.srcNodesFrom(3)}

  // Override for `MixOwnNsLexed`.
  makeNsLex() {return super.makeNsLex().addMixin(this.makeNsMixin())}

  makeNsMixin() {
    const tar = a.npo()
    tar.ret = jnr.Ret
    return new jns.NsLive().setVal(tar)
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
      return this.ownNsLex().addNode(this)
    }
    return this.reqParent().reqNsLex().addNode(this)
  }

  declareParams() {
    for (const val of this.reqParams()) val.asReqInst(jniu.IdentUnqual).declareLex()
  }

  macroBody() {return this.reqSrcNode().macroFrom(3)}

  compile() {
    const prn = this.reqCodePrinter()

    return `function ${
      a.reqStr(this.reqIdent().compile())
    }${
      prn.compileParensCommaMultiLine(this.reqParams())
    } ${
      prn.compileBracesStatementsMultiLine(this.body())
    }`
  }
}
