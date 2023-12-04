import * as a from '/Users/m/code/m/js/all.mjs'
import * as jp from './jisp_parent.mjs'
import * as jn from './jisp_node.mjs'
import * as jnnl from './jisp_node_node_list.mjs'

export class DelimNodeList extends jnnl.NodeList {
  static pre() {throw errMeth(`pre`, this)}
  static suf() {throw errMeth(`suf`, this)}

  pre() {return this.constructor.pre()}
  suf() {return this.constructor.suf()}

  // TODO simplify.
  static lex(lex) {
    const pre = a.reqValidStr(this.pre())
    const suf = a.reqValidStr(this.suf())
    const span = lex.reqSpan()
    const head = span.optHead()

    if (!head) return undefined
    if (head.decompile() === suf) throw LexerErr.atNode(head, `unexpected closing ${a.show(suf)}`)
    if (head.decompile() !== pre) return undefined

    const tar = new this()
    span.inc()

    while (span.more()) {
      const next = span.optHead()

      if (next.decompile() === suf) {
        tar.setSpan(tar.Span.range(head.reqSpan(), next.reqSpan()))
        span.inc()
        return tar
      }

      tar.addNode(lex.popNext())
    }

    throw LexerErr.atNode(span.reqLast(), `missing closing ${a.show(suf)}`)
  }

  meaningfulNodes() {return this.ownNodes().filter(jn.Node.isNodeMeaningful, jn.Node)}
  firstMeaningful() {return this.ownNodes().find(jn.Node.isMeaningful, jn.Node)}
  isEveryMeaningful() {return this.ownNodes().every(jn.Node.isMeaningful, jn.Node)}

  reqEveryMeaningful() {
    if (!this.isEveryMeaningful()) {
      throw this.err(`expected every node to be meaningful (no whitespace or comments)`)
    }
    return this
  }

  macroImpl() {
    this.macroAt(0)
    const def = this.optHead()?.optDef()
    if (def?.isMacro()) return def.macroNode(this)
    return this.macroFrom(1)
  }

  /*
  FIXME:

    * Use `.optHead()` and `.rest()` instead of searching for meaning.
    * Head is required. Exception when empty.
  */
  compile() {
    const prn = this.reqCodePrinter()
    const src = this.ownNodes()
    const ind = src.findIndex(jn.Node.isMeaningful, jn.Node)
    if (!(ind >= 0)) return prn.compileDense(src)

    const style = a.onlyInst(src[ind], Ident)?.optDef()?.ownCallSyntax() || CallSyntax.call

    // Reslicing is suboptimal but probably not our bottleneck.
    const pre = src.slice(0, ind + 1)
    const suf = src.slice(ind + 1)
    const call = prn.compileDense(pre) + prn.compileParensCommaMultiLine(suf)

    if (style === CallSyntax.call) return call
    if (style === CallSyntax.new) return `new ` + call
    throw this.err(CallSyntax.msgUnrec(style))
  }

  [ji.symInspMod](tar) {
    return super[ji.symInspMod](tar).funs(this.optNodes)
  }
}
