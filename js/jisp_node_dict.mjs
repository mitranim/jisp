import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as jns from './jisp_ns.mjs'
import * as jn from './jisp_node.mjs'
import * as jnlm from './jisp_node_list_macro.mjs'
import * as jnst from './jisp_node_str.mjs'
import * as jni from './jisp_node_ident.mjs'

/*
Known missing features:

  * Support for getters.
  * Support for setters.

In principle we could support the JS shorthand syntax for methods in object
literals, but there's not much point. The general-case syntax with explicit
string key and function value also works, and we'd rather encourage users
to write proper classes instead.
*/
export class Dict extends jnlm.ListMacro {
  macro() {return this.macroFrom(1)}

  compile() {
    if (!(this.childCount() > 1)) return `{}`

    const src = a.reqArr(this.optChildSlice(1))
    const len = src.length

    if (len % 2) {
      throw this.err(`${a.show(this)} requires an even number of children, got ${a.show(len)} children`)
    }

    return `{` + jm.mapPair.call(this, src, this.compilePair).join(`, `) + `}`
  }

  compilePair(key, val) {
    return this.compileKey(key) + `: ` + this.compileVal(val)
  }

  compileKey(key) {
    if (a.isInst(key, jnst.Str)) {
      return jni.Ident.toValidDictKey(key.ownVal())
    }
    return `[` + jn.reqCompileNode(key) + `]`
  }

  compileVal(val) {return jn.reqCompileNode(val)}
}
