import * as a from '/Users/m/code/m/js/all.mjs'
import * as jc from './jisp_conf.mjs'
import * as jm from './jisp_misc.mjs'
import * as je from './jisp_err.mjs'
import * as jr from './jisp_ref.mjs'
import * as ji from './jisp_insp.mjs'
import * as jch from './jisp_child.mjs'
import * as jp from './jisp_parent.mjs'
import * as jsp from './jisp_span.mjs'
import * as jsn from './jisp_spanned.mjs'
import * as jnsd from './jisp_node_sourced.mjs'
import * as jcpd from './jisp_code_printed.mjs'
import * as jnsl from './jisp_ns_lexed.mjs'
import * as jlv from './jisp_live_valued.mjs'

/*
Base class for all AST nodes.

----

The lexer constructs an AST where all parent-child relations are bilateral:

             parent
  role=child ↓    ↑ role=parent
             child0

Somem macro operations involve replacing nodes with other nodes. In such cases,
some relations become unilateral.

  * The parent acquires a new child, bilaterally.
  * The old child unilaterally remembers the parent.
  * The new child unilaterally remembers the old child.

             parent
  role=child ↓    ↑ role=parent
             child1

             parent
                  ↑ role=parent
             child0

             child1 → child0
                role=src

Note: while the AST relations are by definition cyclic, parent→child relations
must avoid cycles, forming a tree. At the time of writing, `MixChild` and
`MixOwnNodeSourced` prevent cycles. If we add more common interfaces between
nodes, they must prevent cycles too.
*/
export class Node extends (
  jlv.MixLiveValued.goc(
    jnsl.MixNsLexed.goc(
      jcpd.MixCodePrinted.goc(
        jnsd.MixOwnNodeSourced.goc(
          jsn.MixOwnSpanned.goc(
            jp.MixParent.goc(
              jch.MixChild.goc(
                ji.MixInsp.goc(
                  a.Emp
                )
              )
            )
          )
        )
      )
    )
  )
) {
  // For `MixOwnSpanned`.
  get Span() {return jsp.StrSpan}
  optSpan() {return super.optSpan() || this.optSrcNode()?.optSpan()}

  get CodeErr() {return je.CodeErr}

  err(msg, opt) {
    const span = this.optSpan()
    if (!span) return super.err(msg, opt)

    opt = a.laxDict(opt)
    opt.span = span
    return new this.CodeErr(msg, opt)
  }

  /*
  Error conversion. When possible and relevant, this should adorn the error with
  additional context. In particular, it should convert non-`CodeErr` to
  `CodeErr`.
  */
  toErr(err) {
    if ((a.isInst(err, je.CodeErr) && err.span) || !this.optSpan()) return err
    return this.err(jm.renderErrLax(err), {cause: err})
  }

  /*
  Declares the current node in the nearest ancestor lexical namespace. The
  current node must implement method `.pk`, which must return a string
  representing an unqualified identifier, typically coming from some
  `IdentUnqual`. Method `.pk` must be implemented by `Ident` and all node
  subclasses that represent a named declaration such as `Const` or `Func`.
  For other node classes, this should cause an exception.

  Must start search at the parent because some macro nodes, such as `Func`,
  define their own namespace. If we didn't use the parent here, the default
  behavior would be to add the declaration to the own namespace, not to an
  ancestor namespace, which would be incorrect in several ways. For example,
  the resulting declaration would be unknown/unavailable to sibling nodes,
  breaking a lot of code. Some nodes may override this behavior. For example,
  when `Func` is used as an expression, it should add itself to its own
  namespace, but NOT to an ancestor namespace.

  TODO consider renaming to "reqX". May add an "opt" version later.
  */
  reqDeclareLex() {return this.reqParent().reqNsLex().addNode(this)}

  /*
  FIXME move this `.withToErr` wrapper to `Node.macroNode`, remove this wrapper
  method, and rename `.macroImpl` to `.macro` everywhere.

  Note that `.compile` should be symmetric: we should ensure that we call
  `.compile` with similar wrapping for every node everywhere, producing errors
  that point to failing nodes. That's currently done at the level of
  `CodePrinter..compile`.
  */
  macro() {return this.withToErr(this.macroImpl)}

  macroImpl() {throw this.errMeth(`macroImpl`)}

  /*
  Default "nop" implementation of macroing a list, which represents a "call" in
  our Lispy syntax. This is always invoked by `DelimNodeList` on its first
  element. This default implementation does not support macro calling. See
  `Ident..macroList` for an override that does.
  */
  macroList(val) {return val}

  compile() {throw this.errMeth(`compile`)}

  /*
  TODO consider moving `MixOwnNodeSourced` from `Node` elsewhere, and removing
  this override. However, this may require updates to `.macroWithLiveVal` and
  `Node.replace`.
  */
  decompile() {
    return a.laxStr(
      this.optSrcNode()?.decompile() ??
      this.optSpan()?.decompile()
    )
  }

  /*
  Minor shortcut for subclasses that may compile either in expression mode or in
  statement mode. Many expressions need to be parenthesized to ensure correct
  grouping without dealing with precedence rules.
  */
  compileStatementOrExpression(val) {
    a.reqStr(val)
    if (!val || this.isStatement()) return val
    return `(` + val + `)`
  }

  /*
  Subclasses may override this to allow some children to behave as statements.
  For example, statements are allowed in module roots, function bodies, blocks,
  and so on.

  Overrides should mind the following:

    * An expression is something whose value is used.
    * A statement is something whose value is unused.
  */
  isChildStatement(val) {
    /*
    This is nearly identical to the implementation of the base method
    `MixParent..reqValidChild`. We don't call it here to avoid surprising
    behaviors in case of unusual overrides in subclasses.
    */
    if (jc.conf.getDebug()) this.reqChildParentMatch(val)
    return false
  }

  /*
  Some parents can explicitly decide that some children are statements.
  Otherwise, it seems safer to assume that the node is an expression.
  */
  isStatement() {
    return !!a.onlyInst(this.optParent(), Node)?.isChildStatement(this)
  }

  // Used by some "macro" node types.
  reqStatement() {
    if (!this.isStatement()) {
      throw this.err(`${a.show(this)} can only be used as a statement`)
    }
    return this
  }

  // FIXME use.
  isInModuleRoot() {return false}

  // FIXME use.
  isExportable() {return this.isStatement() && this.isInModuleRoot()}

  // Some node types may override this to indicate that they may be safely
  // elided from the AST when tokenizing or lexing.
  isCosmetic() {return false}

  static macroNode(prev) {
    if (!a.optInst(prev, Node)) return undefined
    const next = prev.macro()
    if (a.isPromise(next)) return this.macroNodeAsyncWith(prev, next)
    return this.macroNodeWith(prev, next)
  }

  static macroNodeWith(prev, next) {
    a.reqInst(prev, Node)
    // This convention is used by "nop" implementations of the `.macro` method.
    // For example, this is used by all nodes representing primitive literals.
    if (prev === next) return prev
    return this.macroNode(this.replace(prev, next))
  }

  static macroNodeSync(prev) {
    if (!a.optInst(prev, Node)) return undefined
    const next = prev.macro()
    if (a.isPromise(next)) {
      throw prev.err(`expected node ${a.show(prev)} to macro synchronously, but received a promise`)
    }
    return this.macroNodeSyncWith(prev, next)
  }

  static macroNodeSyncWith(prev, next) {
    a.reqInst(prev, Node)
    if (prev === next) return prev
    return this.macroNodeSync(this.replace(prev, next))
  }

  static async macroNodeAsync(prev) {
    if (!a.optInst(prev, Node)) return undefined
    let next = prev.macro()
    if (a.isPromise(next)) next = await next
    return this.macroNodeAsyncWith(prev, next)
  }

  static async macroNodeAsyncWith(prev, next) {
    a.reqInst(prev, Node)
    if (a.isPromise(next)) next = await next
    if (next === prev) return prev
    return this.macroNodeAsync(this.replace(prev, next))
  }

  static replace(prev, next) {
    a.reqInst(prev, Node)
    if (a.isNil(next)) {
      throw prev.err(`unexpected attempt to replace node ${a.show(prev)} with nil`)
    }
    if (!a.isInst(next, Node)) {
      throw prev.err(`unexpected attempt to replace node ${a.show(prev)} with non-node ${a.show(next)}`)
    }
    if (prev === next) {
      throw prev.err(`unexpected attempt to replace node ${a.show(prev)} with itself; indicates an internal error in macro-related code`)
    }
    return next.setParent(prev.optParent()).setSrcNode(prev)
  }

  [ji.symInsp](tar) {return tar.funs(this.decompile)}

  /*
  Placeholder for hypothetical support for Lisp-style quoting and unquoting of
  code, which would require is to implement "repr" functionality for all AST
  node classes, which would require us to add appropriate imports to the
  generated code. Repr should be implemented in this base class, and used by
  the "quote" macro.

  This property must always be "own". Anything else should cause an exception
  when repring. This line must be EXACTLY copy-pasted into EVERY subclass and
  descendant class.
  */
  static moduleUrl = import.meta.url
}

export class NodeSet extends a.TypedSet {
  reqVal(val) {return a.reqInst(val, Node)}
}

/*
Note: `a.Coll` requires values to implement method `.pk` which must return a
valid key (non-falsy string or number). The base class `Node` does not
implement such a method. Only some subclasses do.
*/
export class NodeColl extends a.Coll {
  reqVal(val) {return a.reqInst(val, Node)}
}
