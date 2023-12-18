import * as jnst from './jisp_node_str.mjs'
import * as jnm from './jisp_node_macro.mjs'
import * as jniu from './jisp_node_ident_unqual.mjs'

// FIXME remove, due to removal of `CallOpt`.
export class CallSyntaxSet extends jnm.Macro {
  static getSrcName() {return `callSyntax`}

  reqStr() {return this.reqSrcInstAt(1, jnst.Str)}
  reqIdent() {return this.reqSrcInstAt(2, jniu.IdentUnqual)}

  /*
  Declaration must be in same scope as macro node, and must be owned by the
  lexical namespace. Avoid searching mixins and ancestors. This restriction
  ensures that call opts are set in the same scope where a given name is
  declared, preventing other modules from changing them, which could easily
  break unrelated code, depending on the order of module evaluation.
  */
  optDecl() {return this.reqLexNs().get(this.reqIdent().reqName())}

  macroImpl() {
    this.reqSrcList().reqEveryChildNotCosmetic().reqChildCount(3)
    this.run()
    return undefined
  }

  run() {this.reqDecl().callOptFromStr(this.reqStr().ownVal())}
}
