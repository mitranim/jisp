import * as a from '/Users/m/code/m/js/all.mjs'
import * as jnm from './jisp_node_macro.mjs'
import * as jnnl from './jisp_node_node_list.mjs'

/*
Base class for macro-style `Node` classes that expect to replace an entire
`DelimNodeList` that contains a reference to the macro, rather than only the
referencing identifier.
*/
export class ListMacro extends jnm.Macro {
  /*
  Override for `Node.macroSrcCls`. Indicates the base class for the input
  that must be replaced by this node. Used by `DelimNodeList..macroImpl`.
  */
  static macroSrcCls() {return jnnl.NodeList}

  reqSrcList() {return this.reqSrcInst(jnnl.NodeList)}

  reqSrcAt(ind) {
    this.req(ind, a.isNat)

    const src = this.reqSrcList()
    const len = src.childCount()

    if (!(ind < len)) {
      throw this.err(`macro ${a.show(this)} requires at least ${ind+1} arguments, found ${len}`)
    }

    return src.reqChildAt(ind)
  }

  optSrcAt(ind) {
    this.req(ind, a.isNat)
    return this.reqSrcList().optChildAt(ind)
  }

  reqSrcInstAt(ind, ...cls) {
    const out = this.reqSrcAt(ind)
    if (isInstSome(out, ...cls)) return out
    throw out.err(`macro ${a.show(this)} requires the argument at index ${ind} to be an instance of one of the following classes: ${a.show(cls)}, found ${a.show(out)}`)
  }

  optSrcInstAt(ind, ...cls) {
    const out = this.optSrcAt(ind)
    if (a.isNil(out)) return undefined
    if (isInstSome(out, ...cls)) return out
    throw this.err(`macro ${a.show(this)} requires the argument at index ${ind} to be either missing or an instance of one of the following classes: ${a.show(cls)}, found ${a.show(out)}`)
  }

  onlySrcInstAt(ind, ...cls) {
    const out = this.optSrcAt(ind)
    if (isInstSome(out, ...cls)) return out
    return undefined
  }

  srcNodesFrom(ind) {return this.reqSrcList().optChildSlice(ind)}
}

function isInstSome(val, ...cls) {
  for (cls of cls) if (a.isInst(val, cls)) return true
  return false
}
