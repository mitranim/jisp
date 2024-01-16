import {a} from './dep.mjs'
import * as jm from './misc.mjs'
import * as je from './err.mjs'
import * as jn from './node.mjs'
import * as jnnl from './node_node_list.mjs'

export class DelimNodeList extends jnnl.NodeList {
  static prefix() {throw jm.errMeth(`prefix`, this)}
  prefix() {return this.constructor.prefix()}

  static suffix() {throw jm.errMeth(`suffix`, this)}
  suffix() {return this.constructor.suffix()}

  // TODO simplify.
  static lex(lex /* : Lexer */) {
    const pre = a.reqValidStr(this.prefix())
    const suf = a.reqValidStr(this.suffix())
    const span = lex.reqSpan()
    const head = span.optHead()

    if (!head) return undefined
    if (head.decompile() === suf) throw je.LexerErr.fromNode(head, `unexpected closing ${a.show(suf)}`)
    if (head.decompile() !== pre) return undefined

    const tar = new this()
    span.skip(1)

    while (span.hasMore()) {
      const next = span.optHead()

      if (next.decompile() === suf) {
        tar.initSpan().setRange(head.reqSpan(), next.reqSpan())
        span.skip(1)
        return tar
      }

      tar.appendChild(lex.popNext())
    }

    throw je.LexerErr.fromNode(span.reqLast(), `missing closing ${a.show(suf)}`)
  }

  /*
  This method implements support for list-style calling of macro functions.
  Macro functions are "live values" found in the current lexical scope by
  resolving identifiers. See `Ident..reqLiveVal` and other similar methods.

  Just like in traditional Lisps, macro functions receive AST nodes as arguments
  and must return AST nodes. Unlike in traditional Lisps, our AST consists of
  specialized objects, not arbitrary values. Regardless of how a macro function
  is invoked, it must return nil or an instance of `Node`. Any other return
  value is invalid and causes an immediate exception. Also unlike in traditional
  Lisps, macros can be either regular functions or classes, and can optionally
  declare support for alternative calling styles. See below.

  If the macro function doesn't declare support for alternative calling styles,
  then we simply call it, passing list elements as arguments. We also provide
  the list itself, as `this`. The type of `this` is typically a subclass of
  `DelimNodeList`, such as `Brackets`. Macro functions can use methods of
  `DelimNodeList` to validate their inputs, and have access to the AST even
  when invoked with no arguments.

  If the macro function has the optional static method `.macroList`, we call
  this method instead of calling the function. This allows to implement macros
  as classes and directly reference them in call positions. Most macros that
  ship with the language are implemented this way. See the base class
  `ListMacro` used by various macro classes.

  If the macro function has the optional static method `.macroBare`, we don't
  invoke it here. Bare-style calling is supported at the level of `Ident`.

  If the macro function has the optional static method `.macroReprList`, it's
  treated like `.macroList` when macroing in "representation" mode. See the
  method `DelimNodeList..macroRepr` which supports this. Also see `Quote`
  which actually uses this mode.

  TODO add tests for various macro behaviors, and for nil return values.

  Known issue: when we resolve the identifier in the call position to a live
  value, we don't add that identifier as a reference to the namespace where it
  was found (via `NsBase..addRef`). At the time of writing, it's not entirely
  clear whether we should do that for identifiers which are removed from the
  AST as a result of macroing.
  */
  macro() {
    const head = this.optFirstChild()
    if (a.isNil(head)) return this.macroFallback()

    const fun = jm.optLiveValCall(head)
    if (a.isNil(fun)) return this.macroFallback()

    if (!a.isFun(fun)) {
      throw this.err(`unexpected non-function live value ${a.show(fun)} in call position`)
    }

    if (jn.isListMacro(fun)) {
      return jn.reqValidMacroResult(this, fun.macroList(this), fun)
    }
    if (jn.isBareMacro(fun)) {
      return this.macroFallback()
    }
    return jn.reqValidMacroResult(this, fun.apply(this, this.optChildSlice(1)), fun)
  }

  /*
  Implements support for macroing in "representation" mode, which is used by the
  `Quote` macro.
  */
  macroRepr() {
    const fun = jm.optLiveValCall(this.optFirstChild())

    /*
    The optional method `.macroReprList` is implemented by `Unquote`. This
    interface allows our `Node` subclasses to optionally implement support
    for interpolation in quoted AST. See `Quote` and related tests.
    */
    if (a.isSubCls(fun, jn.Node) && `macroReprList` in fun) {
      return jn.reqValidMacroResult(this, fun.macroReprList(this), fun)
    }

    return super.macroRepr()
  }

  macroFallback() {return this.macroFrom(0)}

  compile() {
    const head = this.optFirstChild()
    if (!head) {
      throw this.err(`unable to usefully compile empty node list ${a.show(this)}`)
    }

    const tail = this.optChildSlice(1)
    const prn = this.reqPrn()

    return (
      a.reqStr(prn.optCompile(head)) +
      a.reqStr(prn.compileParensWithExpressions(tail))
    )
  }

  static {this.setReprModuleUrl(import.meta.url)}
}
