import * as a from '/Users/m/code/m/js/all.mjs'
import * as jc from './jisp_conf.mjs'
import * as jm from './jisp_misc.mjs'
import * as je from './jisp_err.mjs'
import * as ji from './jisp_insp.mjs'
import * as jre from './jisp_repr.mjs'
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

## Features

The base class implements "infrastructural" functionality common between all
AST nodes, including features like referring back to source code, dealing with
node-to-node relations, generating descriptive errors, and more. See the
"mixin" superclasses for supported features.

## Relations

The base class `Node` supports the following relations:

  * `MixChild` implements relation from child to parent.
  * `MixOwnNodeSourced` implements relation from derived node to source node.

The base class does not implement relations from parent to child. Such relations
are implemented by certain subclasses such as `NodeList`, which uses
`MixParentOneToMany`, or `IdentAccess`, which uses `MixParentOneToOne`.

The main purpose of our `Lexer` is to convert a flat stream of tokens into a
tree of parent and child nodes. Each "parent node" ensures that its child nodes
consider it their parent node, resulting in bilateral relations:

               parent
  role = child ↓    ↑ role = parent
               child

During macroing, we often replace nodes with other nodes. This changes the
parent-to-child relations, and also uses the derived-to-source relations to
trace derived nodes back to source nodes.

Example of relation changes due to macroing.

Step 0.

               parent
  role = child ↓    ↑ role = parent
               child0

Step 1.

Macroing `child0` causes it to replace itself with `child1`. The parent gets a
new child, the new child gets the old parent, bilaterally.

                parent
   role = child ↓    ↑ role = parent
                child1

The new child refers to the old child as its source node, unilaterally.

                child1
  role = source ↓
                child0

The old child keeps its old parent, unilaterally.

                parent
                     ↑ role = parent
                child0

Note: each relation type must avoid cycles. At the time of writing, `MixChild`
and `MixOwnNodeSourced` prevent cycles. `MixParentOneToOne` and
`MixParentOneToMany` do not prevent cycles directly, but they should prevent
cycles indirectly, by ensuring that each child node refers to the parent, which
involves `MixChild`, which should prevent cycles.
*/
export class Node extends (
  jlv.MixLiveValuedInner.goc(
    jnsl.MixNsLexed.goc(
      jcpd.MixCodePrinted.goc(
        jnsd.MixOwnNodeSourced.goc(
          jsn.MixOwnSpanned.goc(
            // `MixParent` is added here for `.reqChildParentMatch`.
            // It does not implement actual storage of child nodes.
            jp.MixParent.goc(
              jch.MixChild.goc(
                jre.MixRepr.goc(
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
  )
) {
  // Override for `MixErrer`.
  get Err() {return je.Err}

  err(msg, opt) {
    const ctx = this.contextDeep()
    if (!ctx) return new this.Err(msg, opt)
    return new this.Err(jm.joinParagraphs(msg, ctx), opt).setHasCode(true)
  }

  /*
  Error conversion. When possible and relevant, this should adorn the error with
  additional context.
  */
  toErr(err) {
    if (!this.optSpan()) return err
    if (a.isInst(err, je.Err) && err.optHasCode()) return err
    return this.err(jm.renderErrLax(err), {cause: err})
  }

  // Override for `MixOwnSpanned`.
  get Span() {return jsp.ReprStrSpan}

  optSpan() {return super.optSpan() || this.optSrcNode()?.optSpan()}

  context() {return a.laxStr(this.spanWithPath(this.optSpan())?.context())}

  contextDeep() {
    const src = a.laxStr(this.optSrcNodeDeep()?.contextDeep())
    const own = a.laxStr(this.spanWithPath(this.ownSpan())?.context())
    if (!own) return src

    return jm.joinParagraphs(
      own,
      (src && jm.joinParagraphs(`context of source node:`, src)),
    )
  }

  spanWithPath(span) {
    if (span && !span.ownPath()) {
      const path = this.optModulePath()
      if (path) span.setPath(path)
    }
    return span
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

  macro() {return this.errMeth(`macro`)}

  compile() {throw this.errMeth(`compile`)}
  decompile() {return a.laxStr(this.optDecompileSrcNode() ?? this.optDecompileOwn())}

  optDecompileOwn() {return this.optSpan()?.decompile()}
  reqDecompileOwn() {return a.reqStr(this.reqSpan().decompile())}

  optDecompileSrcNode() {return this.optSrcNode()?.decompile()}
  reqDecompileSrcNode() {return a.reqStr(this.reqSrcNode().decompile())}

  optSrcNodeDeep() {return this.optSrcNode() ?? this.optParentNode()?.optSrcNodeDeep()}

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
  Relevant for quoting and unquoting. See `Quote` and `Unquote`.
  Subclasses that use "parent" mixins should override this and
  invoke this method on their children.
  */
  macroRepr() {
    this.initReprSpan()
    this.initReprImport()
    return this
  }

  compileRepr() {
    let out = super.compileRepr()
    const span = this.ownSpan()
    if (span?.hasMore()) out += `.setSpan(${a.reqStr(span.compileRepr())})`
    return out
  }

  initReprSpan() {
    const span = this.spanWithPath(this.ownSpan())
    if (!span?.hasMore()) return

    const mod = this.reqModuleNodeList()
    span.setReprImportName(mod.reqAutoImportName(span.reqReprModuleUrl()))

    const path = span.optPath()
    if (path) span.setReprPathName(mod.reqAutoValName(path))

    span.setReprSrcName(mod.reqAutoValName(span.ownSrc()))
  }

  initReprImport() {
    const mod = this.reqModuleNodeList()
    this.setReprImportName(mod.reqAutoImportName(this.reqReprModuleUrl()))
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
    Nearly identical to the implementation of `MixParent..reqValidChild`.
    We don't call it here to avoid surprising behaviors in case of unusual
    overrides in subclasses.
    */
    if (jc.conf.getDebug()) this.reqChildParentMatch(val)
    return false
  }

  /*
  Some parents can explicitly decide that some children are statements.
  Otherwise, it seems safer to assume that the node is an expression.
  */
  isStatement() {return a.laxBool(this.optParentNode()?.isChildStatement(this))}

  // Used by some "macro" node types.
  reqStatement() {
    if (!this.isStatement()) {
      throw this.err(`${a.show(this)} can only be used as a statement`)
    }
    return this
  }

  /*
  Enables special JS semantics only available in module root, most notably the
  ability to use `import` and `export` statements. Should be overridden in
  subclasses.
  */
  isModuleRoot() {return false}

  isInModuleRoot() {return a.laxBool(this.optParentNode()?.isModuleRoot())}

  isExportable() {return this.isStatement() && this.isInModuleRoot()}

  /*
  Some node types may override this to indicate that they may be safely elided
  from the AST when tokenizing or lexing.
  */
  isCosmetic() {return false}

  optParentNode() {return a.onlyInst(this.optParent(), Node)}

  optModule() {return this.optAncFindType(jm.symTypeModule)}
  reqModule() {return this.reqAncFindType(jm.symTypeModule)}

  optModuleNodeList() {return this.optAncFindType(jm.symTypeModuleNodeList)}
  reqModuleNodeList() {return this.reqAncFindType(jm.symTypeModuleNodeList)}

  optModulePath() {return this.optModule()?.optSrcPathAbs()}
  reqModulePath() {return this.optModulePath() ?? this.throw(`missing module path at ${a.show(this)}`)}

  optResolveName(key) {
    a.optStr(key)
    if (!key) return undefined

    return this.optParent()?.optAncProcure(function optResolve(val) {
      return jm.ownNsLexCall(val)?.optResolve(key)
    })
  }

  /*
  Similar to macroing, and slightly more general. This method should "map" the
  current node and all its descendants by using the given function. Subclasses
  with children must override the method `.mapChildrenDeep` to use the given
  function to "map" their children to its output. Unlike `.macro`, this must be
  synchronous.

  In the future, we may consider expressing `.macro` and `.macroRepr` in terms
  of this operation. For now, this is provided for user code only.
  */
  mapDeep(fun) {return fun(this.mapChildrenDeep(fun))}
  mapChildrenDeep(fun) {return a.reqFun(fun), this}

  static reprModuleUrl = import.meta.url;

  [ji.symInsp](tar) {return tar.funs(this.decompile)}
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

export class Empty extends Node {
  macro() {return this}

  compile() {
    this.reqStatement()
    return ``
  }

  static reprModuleUrl = import.meta.url
}

/*
Takes a node and performs recursive macroing, taking care to convert arbitrary
errors to node-specific errors, terminate when relevant, and switch between
synchronous and asynchronous mode when needed. Also see `macroNodeSync` which
enforces synchronous mode.

Implementation notes.

Macroing stops when a node returns itself. This convention is used by all "nop"
macro implementations such as those on primitive literals. It's also used by
macro implementations that perform side effects without replacing the node,
such as those on identifiers.

This could be implemented either with a loop or with recursive calls. The
current implementation uses recursive calls because in case of accidental
infinite recursion, this causes an immediate stack overflow exception instead
of looping forever, at least in synchronous mode.
*/
export function macroNode(prev) {
  if (a.isNil(prev)) return undefined
  const next = macroCall(prev)
  if (a.isPromise(next)) return macroNodeAsyncWith(prev, next)
  if (prev === next) return prev
  return macroNode(replaceNode(prev, next))
}

export function macroNodeSync(prev) {
  if (a.isNil(prev)) return undefined
  const next = macroCall(prev)
  if (a.isPromise(next)) throw prev.err(msgMacroNodeSync(prev))
  if (prev === next) return prev
  return macroNodeSync(replaceNode(prev, next))
}

function msgMacroNodeSync(val) {
  return `expected node ${a.show(val)} to macro synchronously, but received a promise`
}

async function macroNodeAsyncWith(prev, next) {
  a.reqInst(prev, Node)

  try {next = await next}
  catch (err) {throw prev.toErr(err)}

  if (prev === next) return prev
  return macroNode(replaceNode(prev, next))
}

export function reqMacroReprNode(prev) {
  const next = macroReprCall(prev)
  if (prev === next) return prev
  return reqMacroReprNode(replaceNode(prev, next))
}

export function replaceNode(prev, next) {
  a.reqInst(prev, Node)
  if (a.isNil(next)) return new Empty()

  if (!a.isInst(next, Node)) {
    throw prev.err(`unexpected attempt to replace node ${a.show(prev)} with non-node ${a.show(next)}`)
  }
  if (prev === next) {
    throw prev.err(`unexpected attempt to replace node ${a.show(prev)} with itself; indicates an internal error in macro-related code`)
  }
  return next.setParent(prev.optParent()).setSrcNode(prev)
}

export function optCompileNode(src) {
  if (a.isNil(src)) return ``
  const out = compileCall(src)
  if (a.isStr(out)) return out
  throw src.err(`expected ${a.show(src)} to compile to a string, got ${a.show(out)}`)
}

export function reqCompileNode(src) {
  const out = compileCall(src)
  if (a.isValidStr(out)) return out
  throw src.err(`expected ${a.show(src)} to compile to a non-empty string, got ${a.show(out)}`)
}

export function reqCompileReprNode(src) {
  const out = compileReprCall(src)
  if (a.isValidStr(out)) return out
  throw src.err(`expected ${a.show(src)} to compile to a string representation of its AST constructor, got ${a.show(out)}`)
}

function macroCall(src) {
  a.reqInst(src, Node)
  try {return src.macro()}
  catch (err) {throw src.toErr(err)}
}

function macroReprCall(src) {
  a.reqInst(src, Node)
  try {return src.macroRepr()}
  catch (err) {throw src.toErr(err)}
}

function compileCall(src) {
  a.reqInst(src, Node)
  try {return src.compile()}
  catch (err) {throw src.toErr(err)}
}

function compileReprCall(src) {
  a.reqInst(src, Node)
  try {return src.compileRepr()}
  catch (err) {throw src.toErr(err)}
}

// For internal use by code that invokes macro functions.
export function reqValidMacroResult(src, out, fun) {
  a.reqInst(src, Node)
  if (a.isPromise(out)) return reqValidMacroResultAsync(out, fun)
  return reqValidMacroResultSync(src, out, fun)
}

// For internal use by code that invokes macro functions.
export function reqValidMacroResultSync(src, out, fun) {
  a.reqInst(src, Node)
  if (a.isNil(out)) return undefined
  if (a.isInst(out, Node)) return out
  throw src.err(`expected macro function ${a.show(fun)} to return nil or instance of ${a.show(jn.Node)}, got unexpected value ${a.show(out)}`)
}

// For internal use by code that invokes macro functions.
export async function reqValidMacroResultAsync(src, out, fun) {
  a.reqInst(src, Node)
  out = await out
  return reqValidMacroResultSync(src, out, fun)
}

/*
The optional method `.macroList` is implemented by `ListMacro` and its
subclasses. This interface allows our `Node` subclasses to optionally
implement support for list-style calling.
*/
export function isListMacro(val) {
  return a.isSubCls(val, Node) && `macroList` in val
}

/*
The optional method `.macroBare` is implemented by `BareMacro` and its
subclasses. This interface allows our `Node` subclasses to optionally
implement support for bare-style calling. Compare list-style calling
which is supported by `DelimNodeList` and used by `ListMacro`.
*/
export function isBareMacro(val) {
  return a.isSubCls(val, Node) && `macroBare` in val
}
