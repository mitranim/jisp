import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './misc.mjs'
import * as je from './err.mjs'
import * as jn from './node.mjs'
import * as jni from './node_ident.mjs'
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

  This supports two different types of macro functions: subclasses of `Node`
  and regular functions.

  Subclasses of `Node` receive special treatment. They "opt into" specific
  styles of macroing, by implementing certain optional methods. To enable
  list-style calling, a `Node` subclass needs to implement the optional static
  method `.macroList`. See the base class `ListMacro` used by various macro
  classes. If the given live value is a `Node` subclass which does not
  implement this method, we ignore it here, and macro the children of this
  node list one by one. In such cases, the identifier in the call position
  will handle that live value using its own rules. See also:

    * `Ident` which implements support for "bare" calls.
    * `DelimNodeList` which implements support for "list" and "repr list" calls.
    * `BareMacro` which is used for "bare" calls.
    * `ListMacro` which is used for "list" calls.
    * `Unquote` which is used for "repr list" calls in `Quote`.

  Regular functions are treated like in traditional Lisps: they receive their
  arguments as AST nodes and must return AST nodes.

  One notable difference with traditional Lisps is that our AST consists of
  specialized objects, not arbitrary values. Regardless of how a macro function
  is invoked, it must return nil or an instance of `Node`. Any other return
  value is invalid and causes an immediate exception.

  When invoking a regular macro function, in addition to providing the elements
  of the node list as arguments, we also provide the list itself, as `this`.
  The type of `this` is typically a subclass of `DelimNodeList`, such as
  `Brackets`. Macro functions can use methods of `DelimNodeList` to validate
  their inputs, and have access to the AST even when invoked with no arguments.

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

    if (a.isSubCls(fun, jn.Node)) {
      if (jn.isListMacro(fun)) {
        return jn.reqValidMacroResult(this, fun.macroList(this), fun)
      }
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
