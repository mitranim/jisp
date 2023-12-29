import * as a from '/Users/m/code/m/js/all.mjs'
import * as jnlm from './jisp_node_list_macro.mjs'
import * as jniu from './jisp_node_ident_unqual.mjs'

/*
Usage:
    
  [export someName]
  [export someName aliasName]

TODO consider a similar macro for re-exporting from another module:

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
  reqSrc() {return this.reqChildInstAt(1, jniu.IdentUnqual)}
  optTar() {return this.optChildInstAt(2, jniu.IdentUnqual)}

  macroImpl() {
    this.reqStatement()
    this.reqEveryChildNotCosmetic()
    this.reqChildCountBetween(2, 3)
    this.reqSrc()
    this.optTar()
    return this.macroAt(1)
  }

  compile() {
    const src = this.reqSrc().compile()
    const tar = this.optTar()?.compile()

    if (tar) {
      return `export {` + a.reqStr(src) + ` as ` + a.reqStr(tar) + `}`
    }
    return `export {` + a.reqStr(src) + `}`
  }
}
