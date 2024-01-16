import {a} from './dep.mjs'
import * as jc from './conf.mjs'
import * as jm from './misc.mjs'
import * as je from './err.mjs'
import * as ji from './insp.mjs'
import * as jre from './repr.mjs'
import * as jch from './child.mjs'
import * as jp from './parent.mjs'
import * as jsp from './span.mjs'
import * as jsn from './spanned.mjs'
import * as jcpd from './code_printed.mjs'
import * as jnsl from './ns_lexed.mjs'
import * as jlv from './live_valued.mjs'

/*
Base class for all AST nodes.

## Features

The base class implements "infrastructural" functionality common between all
AST nodes, including features like referring back to source code, dealing with
node-to-node relations, generating descriptive errors, and more. See the
"mixin" superclasses for supported features.

## Relations

The base class `Node` supports only relations from child to parent, via the
mixin `MixChild`. The base class does not implement relations from parent to
child. Such relations are implemented by certain subclasses such as `NodeList`,
which uses `MixParentOneToMany`, or `IdentAccess`, which uses
`MixParentOneToOne`.

The main purpose of our `Lexer` is to convert a flat stream of tokens into a
tree of parent and child nodes. Each "parent node" ensures that its child nodes
consider it their parent node, resulting in bilateral relations:

               parent
  role = child ↓    ↑ role = parent
               child

During macroing, we often replace nodes with other nodes. This changes the
parent-to-child relations.

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

The old child keeps its old parent, unilaterally. This should be of little
relevance because we tend to discard the old child, keeping only its source
span, if any.

                parent
                     ↑ role = parent
                child0

Each relation type must avoid cycles. At the time of writing, `MixChild`
prevents cycles. `MixParentOneToOne` and `MixParentOneToMany` do not prevent
cycles directly, but they should prevent cycles indirectly, by ensuring that
each child node refers to the parent, which involves `MixChild`, which should
prevent cycles.
*/
export class Node extends (
  jlv.MixLiveValuedInner.goc(
    jnsl.MixNsLexed.goc(
      jcpd.MixCodePrinted.goc(
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
) {
  // Override for `MixErrer`.
  get Err() {return je.Err}

  err(msg, opt) {
    const ctx = this.context()
    if (!ctx) return new this.Err(msg, opt)
    return new this.Err(jm.joinParagraphs(msg, ctx), opt).setHasCode(true)
  }

  /*
  Error conversion. When possible and relevant, this should adorn the error with
  additional context.
  */
  errFrom(err) {
    if (!this.optSpan()) return err
    if (a.isInst(err, je.Err) && err.optHasCode()) return err
    return this.err(jm.renderErrLax(err), {cause: err})
  }

  // Override for `MixOwnSpanned`.
  get Span() {return jsp.ReprStrSpan}

  context() {return a.laxStr(this.spanWithPath(this.optSpan())?.context())}

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
  decompile() {return a.laxStr(this.optSpan()?.view())}

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

    span.setReprSrcName(mod.reqAutoValName(span.ownSrc()))

    const path = span.optPath()
    if (path) span.setReprPathName(mod.reqAutoValName(path))

    span.setReprImportName(mod.reqAutoImportName(span.reqReprModuleUrl()))
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
  Enables special JS semantics only available at the top level of a module,
  most notably the ability to use `import` and `export` statements. Should
  be overridden in subclasses.
  */
  isModuleTop() {return false}

  isInModuleTop() {return a.laxBool(this.optParentNode()?.isModuleTop())}

  isExportable() {return this.isStatement() && this.isInModuleTop()}

  /*
  Some node types may override this to indicate that they may be safely elided
  from the AST when tokenizing or lexing.
  */
  isCosmetic() {return false}

  optParentNode() {return a.onlyInst(this.optParent(), Node)}

  // TODO consider supporting variadic input, for cases like `MethodFunc`.
  reqParentInst(cls) {
    this.req(cls, a.isCls)
    const tar = this.reqParent()
    if (a.isInst(tar, cls)) return tar
    throw this.err(`${a.show(this)} requires its immediate parent to be an instance of ${a.show(cls)}, got parent ${a.show(tar)}`)
  }

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

  static {this.setReprModuleUrl(import.meta.url)}
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

  static {this.setReprModuleUrl(import.meta.url)}
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

export function macroCall(src) {
  a.reqInst(src, Node)
  try {return src.withErr(src.macro())}
  catch (err) {throw src.errFrom(err)}
}

export function macroCallSync(src) {
  a.reqInst(src, Node)
  let out
  try {out = src.macro()}
  catch (err) {throw src.errFrom(err)}
  return reqMacroResultSync(src, out)
}

export function macroReprCall(src) {
  a.reqInst(src, Node)
  let out
  try {out = src.macroRepr()}
  catch (err) {throw src.errFrom(err)}
  return reqMacroResultSync(src, out)
}

function compileCall(src) {
  a.reqInst(src, Node)
  try {return src.compile()}
  catch (err) {throw src.errFrom(err)}
}

function compileReprCall(src) {
  a.reqInst(src, Node)
  try {return src.compileRepr()}
  catch (err) {throw src.errFrom(err)}
}

function reqMacroResultSync(src, out) {
  if (a.isPromise(out)) throw src.err(msgMacroNodeSync(src))
  return out
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
  throw src.err(`expected macro function ${a.show(fun)} to return nil or instance of ${a.show(Node)}, got unexpected value ${a.show(out)}`)
}

// For internal use by code that invokes macro functions.
export async function reqValidMacroResultAsync(src, out, fun) {
  a.reqInst(src, Node)
  out = await out
  return reqValidMacroResultSync(src, out, fun)
}

/*
The optional method `.macroList` is supported by `DelimNodeList` and used by
`ListMacro` and its subclasses. This interface allows us to implement macros
as subclasses of `Node` and directly reference them in macro call positions.
Most macros that ship with the language are implemented this way. Without this
interface, every macro implemented as a `Node` subclass would require an
associated wrapper function.
*/
export function isListMacro(val) {
  return a.isComp(val) && `macroList` in val && a.isFun(val.macroList)
}

/*
The optional method `.macroBare` is supported by `Ident` and used by `BareMacro`
and its subclasses. This interface allows for bare-style macro calls, where the
input to a macro is an identifier referencing that macro, not the enclosing list
if any.

Compare list-style calling which is supported by `DelimNodeList` and used by
`ListMacro` and its subclasses.
*/
export function isBareMacro(val) {
  return a.isComp(val) && `macroBare` in val && a.isFun(val.macroBare)
}

function msgMacroNodeSync(val) {
  return `expected node ${a.show(val)} to macro synchronously, but received a promise`
}
