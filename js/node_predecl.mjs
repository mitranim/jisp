import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './misc.mjs'
import * as jn from './node.mjs'
import * as jnbm from './node_bare_macro.mjs'

/*
Shortcut for "bare-style" macros that want to compile to a specific predeclared
JS name. Such macros allow Jisp code to "rename" JS globals to arbitrary names
in Jisp code, while compiling to the original JS names and thus avoiding any
runtime overhead.

Unnecessary for JS globals which are used as-is, without renaming. Those should
be predeclared by using the macro `declare` with the module `global.mjs`.

Unnecessary for macros that compile to JS keywords or other JS special syntax.
Such macros should simply subclass `BareMacro` and override the `compile`
method.

See the file `predecl.mjs` which actually uses this.

FIXME needs tests.
*/
export class Predecl extends jnbm.BareMacro {
  macro() {return this}
  compile() {return this.reqValidName(this.reqName())}

  reqValidName(name) {
    this.req(name, a.isValidStr)

    if (jm.jsKeywordNames.has(name)) return name
    if (jm.jsReservedNames.has(name)) return name

    const nsp = this.optResolveName(name)
    if (a.isNil(nsp)) return name

    const dec = nsp.optGet(name)
    if (a.isNil(dec) || dec === this.constructor) return name

    const ctxOwn = this.context()
    const ctxDec = a.laxStr(a.onlyInst(dec, jn.Node)?.context())

    throw new this.Err(jm.joinParagraphs(
      `predeclared name ${a.show(name)} conflicts with existing declaration ${a.show(dec)} in namespace ${a.show(nsp)}`,
      ctxOwn,
      (ctxDec && `declaration context:`),
      ctxDec,
    )).setHasCode(!!ctxOwn || !!ctxDec)
  }

  static {this.setReprModuleUrl(import.meta.url)}
}
