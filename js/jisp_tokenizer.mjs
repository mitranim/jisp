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
import * as jnio from './jisp_node_ident_oper.mjs'
import * as jniu from './jisp_node_ident_unqual.mjs'
import * as jnia from './jisp_node_ident_access.mjs'

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
  // Override for `MixOwnSpanned`.
  get Span() {return jsp.StrSpan}

  init(src) {return this.initSpan().init(src), super.init()}

  // Called by `Iter`.
  more() {return this.reqSpan().hasMore()}

  // Called by `Iter`.
  step() {
    const pos = this.reqSpan().ownPos()
    const node = this.optStep()
    this.reqFound(node)
    this.reqAdvanced(pos, node)
    return this.filter(node)
  }

  filter(val) {
    if (a.isNil(val) || val.isCosmetic()) return undefined
    return val
  }

  optStep() {
    const span = this.reqSpan()

    return (
      jnbrc.BracePre.parse(span) ??
      jnbrc.BraceSuf.parse(span) ??
      jnbrk.BracketPre.parse(span) ??
      jnbrk.BracketSuf.parse(span) ??
      jnpar.ParenPre.parse(span) ??
      jnpar.ParenSuf.parse(span) ??
      jnsp.Space.parse(span) ??
      jnco.Comment.parse(span) ??
      jnnu.Num.parse(span) ??
      jnst.StrBacktick.parse(span) ??
      jnst.StrDouble.parse(span) ??
      jnio.IdentOper.parse(span) ??
      jniu.IdentUnqual.parse(span) ??
      jnia.IdentAccess.parse(span) ??
      undefined
    )
  }

  // // May override in subclass. Needs benching.
  // get BracePre() {return jnbrc.BracePre}
  // get BraceSuf() {return jnbrc.BraceSuf}
  // get BracketPre() {return jnbrk.BracketPre}
  // get BracketSuf() {return jnbrk.BracketSuf}
  // get ParenPre() {return jnpar.ParenPre}
  // get ParenSuf() {return jnpar.ParenSuf}
  // get Space() {return jnsp.Space}
  // get Comment() {return jnco.Comment}
  // get Num() {return jnnu.Num}
  // get StrBacktick() {return jnst.StrBacktick}
  // get StrDouble() {return jnst.StrDouble}
  // get IdentOper() {return jnio.IdentOper}
  // get IdentUnqual() {return jniu.IdentUnqual}
  // get IdentAccess() {return jnia.IdentAccess}

  // optStep() {
  //   const span = this.reqSpan()
  //
  //   return (
  //     this.BracePre.parse(span) ??
  //     this.BraceSuf.parse(span) ??
  //     this.BracketPre.parse(span) ??
  //     this.BracketSuf.parse(span) ??
  //     this.ParenPre.parse(span) ??
  //     this.ParenSuf.parse(span) ??
  //     this.Space.parse(span) ??
  //     this.Comment.parse(span) ??
  //     this.Num.parse(span) ??
  //     this.StrBacktick.parse(span) ??
  //     this.StrDouble.parse(span) ??
  //     this.IdentOper.parse(span) ??
  //     this.IdentUnqual.parse(span) ??
  //     this.IdentAccess.parse(span) ??
  //     undefined
  //   )
  // }

  err(msg, opt) {return je.TokenizerErr.fromSpan(this.optSpan(), msg, opt)}

  reqFound(node) {
    if (node) return
    throw this.err(`unrecognized syntax`)
  }

  reqAdvanced(pos, node) {
    if (this.reqSpan().ownPos() > pos) return
    throw this.err(`failed to advance position of ${a.show(this)} at node ${a.show(node)}`)
  }
}
