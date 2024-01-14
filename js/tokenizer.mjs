import * as a from '/Users/m/code/m/js/all.mjs'
import * as jit from './iter.mjs'
import * as je from './err.mjs'
import * as jsp from './span.mjs'
import * as jsd from './spanned.mjs'
import * as jn from './node.mjs'
import * as jnbrc from './node_braces.mjs'
import * as jnbrk from './node_brackets.mjs'
import * as jnpar from './node_parens.mjs'
import * as jnsp from './node_space.mjs'
import * as jnco from './node_comment.mjs'
import * as jnnu from './node_num.mjs'
import * as jnst from './node_str.mjs'
import * as jnio from './node_ident_oper.mjs'
import * as jniu from './node_ident_unqual.mjs'
import * as jnia from './node_ident_access.mjs'

/*
Parses source code, generating a stream of tokens. The output is typically fed
into a `Lexer` which converts a stream of tokens into a tree of AST nodes.

In our system, tokens are represented with AST nodes. Our lexer uses most of
them as-is, without further conversion from tokens to nodes. As a tradeoff,
this requires us to define node types for delimiters, such as opening and
closing parentheses, which are only valid as tokens, and should not occur
in a lexed AST.
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
      this.Space.parse(span) ??
      this.Comment.parse(span) ??
      this.BracePre.parse(span) ??
      this.BraceSuf.parse(span) ??
      this.BracketPre.parse(span) ??
      this.BracketSuf.parse(span) ??
      this.ParenPre.parse(span) ??
      this.ParenSuf.parse(span) ??
      this.Num.parse(span) ??
      this.StrBacktick.parse(span) ??
      this.StrDouble.parse(span) ??
      this.IdentOper.parse(span) ??
      this.IdentUnqual.parse(span) ??
      this.IdentAccess.parse(span) ??
      undefined
    )
  }

  /*
  User code may subclass `Tokenizer` and override some of these getters.
  This allows user code to provide custom classes for built-in syntax.
  */
  get Space() {return jnsp.Space}
  get Comment() {return jnco.CommentFenced}
  get BracePre() {return jnbrc.BracePre}
  get BraceSuf() {return jnbrc.BraceSuf}
  get BracketPre() {return jnbrk.BracketPre}
  get BracketSuf() {return jnbrk.BracketSuf}
  get ParenPre() {return jnpar.ParenPre}
  get ParenSuf() {return jnpar.ParenSuf}
  get Num() {return jnnu.Num}
  get StrBacktick() {return jnst.StrBacktick}
  get StrDouble() {return jnst.StrDouble}
  get IdentOper() {return jnio.IdentOper}
  get IdentUnqual() {return jniu.IdentUnqual}
  get IdentAccess() {return jnia.IdentAccess}

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
