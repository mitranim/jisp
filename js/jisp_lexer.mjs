import * as a from '/Users/m/code/m/js/all.mjs'
import * as je from './jisp_err.mjs'
import * as jit from './jisp_iter.mjs'
import * as jsp from './jisp_span.mjs'
import * as jsn from './jisp_spanned.mjs'
import * as jt from './jisp_tokenizer.mjs'
import * as jnbrc from './jisp_node_braces.mjs'
import * as jnbrk from './jisp_node_brackets.mjs'
import * as jnpar from './jisp_node_parens.mjs'
import * as jnia from './jisp_node_ident_access.mjs'

export class LexerErr extends je.CodeErr {}

export class Lexer extends jsn.MixOwnSpanned.goc(jit.Iter) {
  get Tokenizer() {return jt.Tokenizer}
  get Span() {return jsp.ArrSpan}

  init(src) {
    super.init()
    this.initSpan().init(a.arr(src))
    return this
  }

  initFromStr(src) {
    return this.init(new this.Tokenizer().init(src))
  }

  // Copied from `Tokenizer` for API consistency.
  // Can override in subclass to skip some nodes.
  filter(val) {return val}

  // Called by `Iter`.
  more() {return this.reqSpan().hasMore()}

  // Called by `Iter`.
  step() {
    const pos = this.reqSpan().ownPos()
    const node = this.popNext()
    this.reqAdvanced(pos, node)
    return this.filter(node)
  }

  popNext() {
    return this.optNext(this.optStep() ?? this.reqSpan().popHead())
  }

  optStep() {
    return (
      jnbrc.Braces.lex(this) ??
      jnbrk.Brackets.lex(this) ??
      jnpar.Parens.lex(this) ??
      undefined
    )
  }

  optNext(prev) {
    if (!prev || !this.more()) return prev

    // May add more in the future.
    return (
      jnia.IdentAccess.lexNext(this, prev)
    )
  }

  reqAdvanced(pos, node) {
    if (this.reqSpan().ownPos() > pos) return
    throw LexerErr.atNode(node, `failed to advance position of ${a.show(this)} at node ${a.show(node)}`)
  }
}
