import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as ji from './jisp_insp.mjs'
import * as jp from './jisp_parent.mjs'
import * as jco from './jisp_call_opt.mjs'
import * as jn from './jisp_node.mjs'
import * as jni from './jisp_node_ident.mjs'
import * as jnnl from './jisp_node_node_list.mjs'

export class DelimNodeList extends jnnl.NodeList {
  static prefix() {throw errMeth(`prefix`, this)}
  static suffix() {throw errMeth(`suffix`, this)}

  prefix() {return this.constructor.prefix()}
  suffix() {return this.constructor.suffix()}

  // TODO simplify.
  static lex(lex) {
    const pre = a.reqValidStr(this.prefix())
    const suf = a.reqValidStr(this.suffix())
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

  notCosmeticNodes() {return this.ownNodes().filter(jn.Node.isNodeMeaningful, jn.Node)}
  firstNotCosmetic() {return this.ownNodes().find(jm.isNotCosmetic)}
  isEveryNotCosmetic() {return this.ownNodes().every(jm.isNotCosmetic)}

  reqEveryNotCosmetic() {
    if (!this.isEveryNotCosmetic()) {
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
    const ind = src.findIndex(jm.isNotCosmetic)
    if (!(ind >= 0)) return prn.compileDense(src)

    const style = a.onlyInst(src[ind], jni.Ident)?.optDef()?.ownCallSyntax() || jco.CallSyntax.call

    // Reslicing is suboptimal but probably not our bottleneck.
    const pre = src.slice(0, ind + 1)
    const suf = src.slice(ind + 1)
    const call = prn.compileDense(pre) + prn.compileParensCommaMultiLine(suf)

    if (style === jco.CallSyntax.call) return call
    if (style === jco.CallSyntax.new) return `new ` + call
    throw this.err(jco.CallSyntax.msgUnrec(style))
  }

  [ji.symInspInit](tar) {return super[ji.symInspInit](tar).funs(this.optNodes)}
}
