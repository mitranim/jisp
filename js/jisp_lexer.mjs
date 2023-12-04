import * as a from '/Users/m/code/m/js/all.mjs'
import * as je from './jisp_err.mjs'
import * as jit from './jisp_iter.mjs'
import * as js from './jisp_span.mjs'
import * as jsn from './jisp_spanned.mjs'

export class LexerErr extends je.CodeErr {}

export class Lexer extends jsn.MixOwnSpanned.goc(jit.Iter) {
  static get Span() {return js.ArrSpan}

  init(src) {return this.initSpan().init(src), super.init()}
  filter(val) {return val}
  more() {return this.reqSpan().more()}

  step() {
    const pos = this.reqSpan().ownPos()
    const node = this.popNext()
    this.advanced(pos, node)
    return this.filter(node)
  }

  popNext() {
    return this.optNext(this.optStep() || this.reqSpan().popHead())
  }

  optStep() {
    return (
      Brackets.lex(this) ||
      Parens.lex(this) ||
      Braces.lex(this) ||
      undefined
    )
  }

  optNext(prev) {
    if (!prev || !this.more()) return prev

    // May add more in the future.
    return (
      Access.lexNext(this, prev)
    )
  }

  advanced(pos, node) {
    if (this.reqSpan().ownPos() > pos) return
    throw LexerErr.atNode(node, `failed to advance position at node ${a.show(node)}`)
  }

  static fromStr(src) {return this.fromTokens(Tokenizer.tokensFromStr(src))}
  static fromTokens(src) {return new this().init(src)}
  static fromTokenizer(src) {return this.fromTokens(a.reqInst(src, Tokenizer).toArray())}
  static nodesFromStr(src) {return this.fromStr(src).toArray()}
  static nodesFromTokens(src) {return this.fromTokens(src).toArray()}
}
