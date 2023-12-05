import * as a from '/Users/m/code/m/js/all.mjs'
import * as jit from './jisp_iter.mjs'
import * as je from './jisp_err.mjs'
import * as jsp from './jisp_span.mjs'
import * as jsd from './jisp_spanned.mjs'
import * as jn from './jisp_node.mjs'
import * as jnbrc from './jisp_node_braces.mjs'
import * as jnbrk from './jisp_node_brackets.mjs'
import * as jnpar from './jisp_node_parens.mjs'
import * as jnsp from './jisp_node_space.mjs'
import * as jnco from './jisp_node_comment.mjs'
import * as jnnu from './jisp_node_num.mjs'
import * as jnst from './jisp_node_str.mjs'
import * as jnun from './jisp_node_unqual_name.mjs'
import * as jnk from './jisp_node_key.mjs'

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
export class Tokenizer extends jsd.MixOwnSpanned.goc(jit.Iter) {
  static get Span() {return jsp.StrSpan}
  init(src) {return this.initSpan().init(src), super.init()}
  more() {return this.reqSpan().more()}

  step() {
    const pos = this.reqSpan().ownPos()
    const node = this.optStep()
    this.found(node)
    this.advanced(pos, node)
    return this.filter(node)
  }

  filter(val) {
    if (a.isNil(val) || val.isCosmetic()) return undefined
    return val
  }

  optStep() {
    const span = this.reqSpan()

    return (
      jnbrc.BracePre.parse(span) ||
      jnbrc.BraceSuf.parse(span) ||
      jnbrk.BracketPre.parse(span) ||
      jnbrk.BracketSuf.parse(span) ||
      jnpar.ParenPre.parse(span) ||
      jnpar.ParenSuf.parse(span) ||
      jnsp.Space.parse(span) ||
      jnco.Comment.parse(span) ||
      jnnu.Num.parse(span) ||
      jnst.StrBacktick.parse(span) ||
      jnst.StrDouble.parse(span) ||
      jnun.UnqualName.parse(span) ||
      jnk.Key.parse(span) ||
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
