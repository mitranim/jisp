import * as a from '/Users/m/code/m/js/all.mjs'
import * as jco from './jisp_call_opt.mjs'
import * as jnp from './jisp_node_predef.mjs'
import * as jnnl from './jisp_node_node_list.mjs'

export class Macro extends jnp.Predef {
  static def() {return super.def().setCallStyle(jco.CallStyle.list)}

  reqSrcList() {return this.reqSrcInst(jnnl.NodeList)}
  optSrcNodes() {return a.reqTrueArr(this.reqSrcList().optNodes())}
  reqSrcNodes() {return a.reqTrueArr(this.reqSrcList().ownNodes())}

  reqSrcInst(cls) {
    const src = this.optSrcNode()
    if (a.isInst(src, cls)) return src
    throw this.err(`macro ${a.show(this.getSrcName())} requires the source node to be an instance of ${a.show(cls)}, got ${a.show(src)}`)
  }

  reqSrcAt(ind) {
    this.req(ind, a.isNat)
    const src = this.reqSrcNodes()
    const len = src.length

    if (!(ind < len)) {
      throw this.err(`macro ${a.show(this.getSrcName())} requires at least ${ind+1} arguments, found ${len}`)
    }

    const out = src[ind]
    if (out) return out

    // Internal sanity check. Should not be possible.
    throw this.err(`macro ${a.show(this.getSrcName())} requires a valid node at index ${ind}, found ${a.show(out)}`)
  }

  optSrcAt(ind) {
    return this.reqSrcNodes()[this.req(ind, a.isNat)]
  }

  reqSrcInstAt(ind, ...cls) {
    const out = this.reqSrcAt(ind)
    if (someInst(out, cls)) return out
    throw this.err(`macro ${a.show(this.getSrcName())} requires the argument at index ${ind} to be an instance of one of the following classes: ${a.show(cls)}, found ${a.show(out)}`)
  }

  optSrcInstAt(ind, ...cls) {
    const out = this.optSrcAt(ind)
    if (a.isNil(out)) return undefined
    if (someInst(out, cls)) return out
    throw this.err(`macro ${a.show(this.getSrcName())} requires the argument at index ${ind} to be either missing or an instance of one of the following classes: ${a.show(cls)}, found ${a.show(out)}`)
  }

  srcNodesFrom(ind) {
    this.req(ind, a.isNat)
    if (!ind) return this.reqSrcNodes()
    return this.reqSrcList().reqLenMin(ind + 1).ownNodes().slice(ind)
  }

  reqStatement() {
    if (this.isExpression()) {
      throw this.err(`macro ${a.show(this.getSrcName())} can only be used as a statement due to JS syntax limitations`)
    }
    return this
  }
}

function someInst(val, cls) {
  for (cls of cls) if (a.isInst(val, cls)) return true
  return false
}
