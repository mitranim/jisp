import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as je from './jisp_err.mjs'
import * as jr from './jisp_ref.mjs'
import * as ji from './jisp_insp.mjs'
import * as jch from './jisp_child.mjs'
import * as jsp from './jisp_span.mjs'
import * as jsn from './jisp_spanned.mjs'
import * as jnsd from './jisp_node_sourced.mjs'
import * as jcpd from './jisp_code_printed.mjs'
import * as jlns from './jisp_lex_nsed.mjs'

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
export class Node extends jlns.MixLexNsed.goc(jr.MixRef.goc(jcpd.MixCodePrinted.goc(
  jnsd.MixOwnNodeSourced.goc(jsn.MixOwnSpanned.goc(jch.MixChild.goc(ji.MixInsp.goc(a.Emp))))
))) {
  // For `MixOwnSpanned`.
  get Span() {return jsp.StrSpan}
  optSpan() {return super.optSpan() || this.optSrcNode()?.optSpan()}

  get CodeErr() {return je.CodeErr}

  err(msg, opt) {
    opt = a.laxDict(opt)
    opt.span = this.optSpan()
    return new this.CodeErr(msg, opt)
  }

  /*
  Error conversion. When possible and relevant, this should adorn the error with
  additional context. In particular, it should convert non-`CodeErr` to
  `CodeErr`.
  */
  toErr(err) {
    if (a.isInst(err, je.CodeErr) || !this.optSpan()) return err
    return this.err(jm.renderErrLax(err), {cause: err})
  }

  /*
  FIXME implement or move.

  FIXME consider the following:

    * An expression is something whose value is used.

    * A statement is something whose value is unused.

    * The above is impossible with implicit return. Remove implicit return.

    * We must implement support for detecting value used/unused anyway,
      in order to properly generate code.
  */
  isExpression() {return false}
  isStatement() {return !this.isExpression()}
  isInModuleRoot() {return false}
  isExportable() {return this.isStatement() && this.isInModuleRoot()}
  isCalled() {return false}

  /*
  Declares the current node in the nearest ancestor lexical namespace. The
  current node must implement method `.pk`, which must return a string
  representing an unqualified identifier, typically coming from some
  `IdentUnqual`. Method `.pk` must be implemented by `Ident` and all node
  subclasses that represent a named declaration such as `Const` or `Fn`. For
  other node classes, this should cause an exception.

  Must start search at the parent because some macro nodes, such as `Fn`, define
  their own namespace. If we didn't use the parent here, the default behavior
  would be to add the declaration to own namespace, not to an ancestor
  namespace, which would be incorrect in several ways. For example, the
  resulting declaration would be unknown/unavailable to sibling nodes, breaking
  a lot of code. Some nodes may override this behavior. For example, when `Fn`
  is used as an expression, it should add itself to own namespace, but NOT to
  an ancestor namespace.

  TODO consider renaming to "reqX". May add an "opt" version later.
  */
  declareLex() {return this.reqParent().reqLexNs().addFromNode(this)}

  optDecl() {}
  reqDecl() {return this.optDecl() ?? this.throw(`missing declaration at ${a.show(this)}`)}

  macro() {return this.withToErr(this.macroImpl)}
  macroImpl() {throw jm.errMeth(`macroImpl`, this)}
  compile() {throw jm.errMeth(`compile`, this)}

  // FIXME consider moving `MixOwnNodeSourced` from `Node` elsewhere,
  // and removing this override.
  decompile() {
    return a.laxStr(
      this.optSrcNode()?.decompile() ??
      this.optSpan()?.decompile()
    )
  }

  static macroNode(node) {
    while (node) {
      const next = node.macro()
      if (node === next) break
      node = this.replace(node, next)
    }
    return node
  }

  static async macroNodeAsync(node) {
    while (node) {
      let next = node.macro()
      if (a.isPromise(next)) next = await next
      if (node === next) break
      node = this.replace(node, next)
    }
    return node
  }

  static replace(src, tar) {
    if (a.isNil(tar)) return undefined
    tar.setParent(src.reqParent())
    tar.setSrcNode(src)
    src.setParent(tar)
    return tar
  }

  // Some node types may override this to indicate that they may be safely
  // elided from the AST when tokenizing or lexing.
  isCosmetic() {return false}

  [ji.symInsp](tar) {return tar.funs(this.optSpan)}

  /*
  Placeholder. This must be exactly copy-pasted into EVERY subclass and
  descendant class. This should be used for "repr" functionality, which should
  be implemented in this base class, and used by the "quote" macro. This
  property must always be "own". Anything else should cause an exception when
  repring.
  */
  static moduleUrl = import.meta.url
}
