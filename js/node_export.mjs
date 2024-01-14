import {a} from './dep.mjs'
import * as jn from './node.mjs'
import * as jnlm from './node_list_macro.mjs'
import * as jniu from './node_ident_unqual.mjs'
import * as jnst from './node_str.mjs'

/*
Usage:
    
  [export someName]
  [export someName aliasName]

TODO: support string literals in target position.

TODO consider a similar macro for re-exporting from another module:

  [exportFrom `./some_path.some_ext` *]

  [exportFrom `./some_path.some_ext` someName]

  [exportFrom `./some_path.some_ext` [someName aliasName]]

  [exportFrom `./some_path.some_ext`
    someName0
    someName1
    [someName2 aliasName2]
    [someName3 aliasName3]
  ]
*/
export class Export extends jnlm.ListMacro {
  reqSrc() {return this.reqChildInstAt(0, jniu.IdentUnqual)}
  optTar() {return this.optChildAt(1)}
  optTarIdent() {return this.optChildInstAt(1, jniu.IdentUnqual)}
  optTarStr() {return this.optChildInstAt(1, jnst.Str)}

  macro() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCountBetween(1, 2)
    this.reqSrc()
    // Note: we want to macro the exported name, but not the optional alias.
    return this.macroChildAt(0)
  }

  compile() {
    this.reqCanCompile()

    const tar = this.optTar()
    if (!tar) return `export {` + jn.optCompileNode(this.reqSrc()) + `}`

    if (a.isInst(tar, jniu.IdentUnqual)) {
      return `export {` + jn.reqCompileNode(this.reqSrc()) + ` as ` + a.reqValidStr(tar.reqName()) + `}`
    }

    if (a.isInst(tar, jnst.Str)) {
      return `export {` + jn.reqCompileNode(this.reqSrc()) + ` as ` + a.jsonEncode(tar.ownVal()) + `}`
    }

    throw tar.err(`${a.show(this)} requires the target name to be either an unqualified identifier or a literal string, got ${a.show(tar)}`)
  }

  reqCanCompile() {
    this.reqStatement()
    if (!this.isInModuleRoot()) throw this.err(`${a.show(this)} can be used only in module root`)
    return this
  }

  static {this.setReprModuleUrl(import.meta.url)}
}
