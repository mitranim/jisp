import * as a from '/Users/m/code/m/js/all.mjs'
import * as jit from './jisp_iter.mjs'
import * as js from './jisp_span.mjs'

export class TokenizerErr extends je.CodeErr {}

/*
Parses source code, generating a stream of tokens. The output is typically fed
into a `Lexer` which converts a stream of tokens into a tree of AST nodes.

We don't implement intermediary token types distinct from AST nodes. Instead, we
instantiate tokens immediately as AST nodes. This simplifies the class system
and avoids the need for conversion from tokens to nodes. As a tradeoff, this
requires us to define node types for delimiters, such as opening and closing
parentheses, which are only valid as tokens, and should not occur in a lexed
AST.
*/
export class Tokenizer extends js.MixOwnSpanned.goc(jit.Iter) {
  static get Span() {return js.StrSpan}
  init(src) {return this.initSpan().init(src), super.init()}
  more() {return this.reqSpan().more()}

  step() {
    const pos = this.reqSpan().ownPos()
    const node = this.optStep()
    this.found(node)
    this.advanced(pos, node)
    return this.filter(node)
  }

  filter(val) {return Node.isMeaningful(val) ? val : undefined}

  optStep() {
    const span = this.reqSpan()

    return (
      BracketPre.parse(span) ||
      BracketSuf.parse(span) ||
      ParenPre.parse(span) ||
      ParenSuf.parse(span) ||
      BracePre.parse(span) ||
      BraceSuf.parse(span) ||
      Space.parse(span) ||
      Comment.parse(span) ||
      Num.parse(span) ||
      StrBacktick.parse(span) ||
      StrDouble.parse(span) ||
      UnqualName.parse(span) ||
      Key.parse(span) ||
      undefined
    )
  }

  err(msg, cause) {return new TokenizerErr({msg, span: this.optSpan(), cause})}

  found(node) {
    if (node) return
    throw this.err(`unrecognized syntax`)
  }

  advanced(pos, node) {
    if (this.reqSpan().ownPos() > pos) return
    throw this.err(`failed to advance position at node ${a.show(node)}`)
  }

  static fromStr(src) {return new this().init(src)}
  static tokensFromStr(src) {return this.fromStr(src).toArray()}
}
