import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as jco from './jisp_call_opt.mjs'
import * as jn from './jisp_node.mjs'
import * as jni from './jisp_node_ident.mjs'
import * as jnnl from './jisp_node_node_list.mjs'

export class DelimNodeList extends jnnl.NodeList {
  static prefix() {throw jm.errMeth(`prefix`, this)}
  prefix() {return this.constructor.prefix()}

  static suffix() {throw jm.errMeth(`suffix`, this)}
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

      tar.appendChild(lex.popNext())
    }

    throw LexerErr.atNode(span.reqLast(), `missing closing ${a.show(suf)}`)
  }

  reqEveryChildNotCosmetic() {
    let ind = 0
    while (ind < this.childCount()) this.reqChildNotCosmeticAt(ind++)
    return this
  }

  reqChildNotCosmeticAt(ind) {
    const val = this.reqChildAt(ind)
    if (val.isCosmetic()) {
      throw this.err(`unexpected cosmetic child node ${a.show(val)} at index ${a.show(ind)} in parent ${a.show(this)}`)
    }
    return val
  }

  macroImpl() {
    this.macroAt(0)
    const decl = this.optFirstChild()?.optDecl()
    if (decl?.isMacro()) return decl.macroNode(this)
    return this.macroFrom(1)
  }

  /*
  FIXME:

    * Use `.optFirstChild()` and `.rest()` (???) instead of searching for meaning.
    * Head is required. Exception when empty.
  */
  compile() {
    const prn = this.reqCodePrinter()
    const src = this.childArr()

    const ind = src.findIndex(jm.isNotCosmetic)
    if (!(ind >= 0)) return prn.compileDense(src)

    const style = a.onlyInst(src[ind], jni.Ident)?.optDecl()?.ownCallSyntax() || jco.CallSyntax.call

    // Reslicing is suboptimal but probably not our bottleneck.
    const pre = src.slice(0, ind + 1)
    const suf = src.slice(ind + 1)
    const call = prn.compileDense(pre) + prn.compileParensCommaMultiLine(suf)

    if (style === jco.CallSyntax.call) return call
    if (style === jco.CallSyntax.new) return `new ` + call
    throw this.err(jco.CallSyntax.msgUnrec(style))
  }
}
