import * as a from '/Users/m/code/m/js/all.mjs'
import * as ji from './jisp_insp.mjs'
import * as jn from './jisp_node.mjs'
import * as jen from './jisp_enum.mjs'
import * as jnv from './jisp_node_val.mjs'

/*

FIXME drop!

*/

export class CallOpt extends ji.MixInsp.goc(a.Emp) {
  #callTime = CallTime.run
  setCallTime(val) {return this.#callTime = CallTime.reqValid(val), this}
  ownCallTime() {return this.#callTime}

  #callStyle = CallStyle.list
  setCallStyle(val) {return this.#callStyle = CallStyle.reqValid(val), this}
  ownCallStyle() {return this.#callStyle}

  #callSyntax = CallSyntax.call
  setCallSyntax(val) {return this.#callSyntax = CallSyntax.reqValid(val), this}
  ownCallSyntax() {return this.#callSyntax}

  // TODO consider removing. Can be done by individual macros, or by a macro
  // wrapper.
  #callOut = CallOut.val
  setCallOut(val) {return this.#callOut = CallOut.reqValid(val), this}
  ownCallOut() {return this.#callOut}

  isBare() {return this.ownCallStyle() === CallStyle.bare}
  isMacro() {return this.ownCallTime() === CallTime.macro}
  isMacroBare() {return this.isMacro() && this.isBare()}

  macroNode(src) {throw src.err(msgMeth(`macroNode`, this))}

  macroNodeWith(src, fun) {
    a.reqInst(src, jn.Node)
    src.req(fun, a.isFun)
    return this.macroOut(src, this.macroCall(src, fun), fun)
  }

  macroCall(src, fun) {
    const style = this.ownCallSyntax()
    if (style === CallSyntax.call) return this.macroCallCall(src, fun)
    if (style === CallSyntax.new) return this.macroCallNew(src, fun)
    throw src.err(CallSyntax.msgUnrec(style))
  }

  macroCallCall(src, fun) {
    try {return fun(src)}
    catch (err) {throw src.err(msgMacroRun(fun), err)}
  }

  macroCallNew(src, fun) {
    try {return new fun(src)}
    catch (err) {throw src.err(msgMacroRun(fun), err)}
  }

  // FIXME support async.
  macroOut(src, out, fun) {
    const outType = this.ownCallOut()
    if (outType === CallOut.ast) return this.macroOutAst(src, out, fun)
    if (outType === CallOut.val) return this.macroOutVal(src, out, fun)
    throw src.err(CallOut.msgUnrec(outType))
  }

  // FIXME support async.
  macroOutAst(src, out, fun) {
    if (a.isNil(out)) return out

    if (a.isInst(out, jn.Node)) {
      /*
      Any AST node that represents a macro call must be replaced. Otherwise we
      have to also compile it as JS, producing both a macro call and a runtime
      call. Code that represents a macro call is often not translatable into
      valid JS. Non-exhaustive list of reasons:

        * Unqualified names imported via mixins must be translated into
          qualified names. This is done as part of `Ident` macroexpansion, and
          may be skipped when calling a macro referenced by the identifier.
          When a macro returns the code as-is, the source ident is still
          unqualified and thus invalid.

        * When compiling in production mode, we want to exclude all
          macro-related code. Leaving any mention of macro names may prevent
          that.
      */
      if (src === out) {
        throw src.err(`expected macro ${a.show(fun)} to replace the source node, but the macro returned the node unchanged`)
      }
      return out
    }

    throw src.err(`expected macro ${a.show(fun)} to return nil or an AST node, got ${a.show(out)}`)
  }

  // FIXME support async.
  macroOutVal(src, out, fun) {
    const cls = jnv.Val
    if (cls.isValid(out)) return new cls().setVal(out)
    throw src.err(`expected macro ${a.show(fun)} to return a value compatible with ${a.show(cls)}, got ${a.show(out)}`)
  }

  callOptStr() {
    return [
      a.reqValidStr(this.ownCallStyle()),
      a.reqValidStr(this.ownCallTime()),
      a.reqValidStr(this.ownCallSyntax()),
      a.reqValidStr(this.ownCallOut()),
    ].join(` `)
  }

  callOptFromStr(src) {
    const mat = this.req(src, a.isStr).split(` `)
    const time = CallTime.reqValid(mat[1])
    const style = CallStyle.reqValid(mat[0])
    const syntax = CallSyntax.reqValid(mat[2])
    const out = CallOut.reqValid(mat[3])

    return this
      .setCallTime(time)
      .setCallStyle(style)
      .setCallSyntax(syntax)
      .setCallOut(out)
  }

  [ji.symInsp](tar) {
    return tar.funs(
      this.ownCallTime,
      this.ownCallStyle,
      this.ownCallSyntax,
      this.ownCallOut,
    )
  }
}

function msgMacroRun(fun) {return `error when running macro ${a.show(fun)}`}

export class CallTime extends jen.Enum {
  static macro = `macro`
  static run = `run`
  static {this.validate()}
}

/*
Tentative. The "list" call syntax is the traditional Lisp approach. We currently
support it implicitly throughout the compiler. We may accidentally hardcode
assumptions that this is the only call syntax.

TODO: consider supporting additional call syntaxes. May require changes
throughout the compiler. For example:

  * Call syntax = "bare".
  * Mere mention of an identifier calls it.
  * If macro:
    * The input is the identifier node.
    * The macro can use parent/child relations to traverse the AST.
  * If runtime:
    * Compiles to a nullary call, according to `CallSyntax`.
  * Requires changes in `NodeList`/`DelimNodeList` and maybe
    `Ident`/`Path`/`Name`.
*/
export class CallStyle extends jen.Enum {
  static bare = `bare`
  static list = `list`
  static {this.validate()}
}

// FIXME disambigui "bare"
// TODO rename ".call" to something more specific.
export class CallSyntax extends jen.Enum {
  // Tentative. This means don't call it at all, but use as-is. When "call time"
  // is "macro" and "call syntax" is "bare", then it can take no inputs since
  // we're not invoking a function, but its output depends on "call out".
  // If "call out" is "ast", the value must be a valid AST node or nil.
  // If "call out" is "val", the value must be serializable.
  static bare = `bare`
  static call = `call`
  static new = `new`
  static {this.validate()}
}

/*
Covariance:

  * `CallTime.run` implies `CallOut.val`.
    Different `CallOut` = undefined behavior.

  * `CallOut.ast` implies `CallTime.macro`.
    Different `CallTime` = undefined behavior.

  * This may be changed in the future.
*/
export class CallOut extends jen.Enum {
  static ast = `ast`
  static val = `val`
  static {this.validate()}
}
