import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as je from './jisp_err.mjs'
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
    if (head.decompile() === suf) throw je.LexerErr.fromNode(head, `unexpected closing ${a.show(suf)}`)
    if (head.decompile() !== pre) return undefined

    const tar = new this()
    span.skip(1)

    while (span.hasMore()) {
      const next = span.optHead()

      if (next.decompile() === suf) {
        tar.setSpan(tar.Span.range(head.reqSpan(), next.reqSpan()))
        span.skip(1)
        return tar
      }

      tar.appendChild(lex.popNext())
    }

    throw je.LexerErr.fromNode(span.reqLast(), `missing closing ${a.show(suf)}`)
  }

  macro() {
    this.reqEveryChildNotCosmetic()
    const out = this.reqFirstChild().macroList(this)
    if (out !== this) return out
    return this.macroFallback()
  }

  macroFallback() {return this.macroFrom(0)}

  compile() {
    const head = this.optChildAt(0)
    if (!head) {
      throw this.err(`unable to usefully compile empty node list ${a.show(this)}`)
    }

    const tail = this.optChildSlice(1)
    const prn = this.reqPrn()

    return (
      a.reqStr(prn.optCompile(head)) +
      a.reqStr(prn.compileParensWithExpressions(tail))
    )
  }
}
