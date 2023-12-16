import * as a from '/Users/m/code/m/js/all.mjs'
import * as jco from './jisp_call_opt.mjs'
import * as jnp from './jisp_node_predef.mjs'
import * as jnnl from './jisp_node_node_list.mjs'

export class Macro extends jnp.Predef {
  static def() {return super.def().setCallStyle(jco.CallStyle.list)}

  // FIXME some macros don't do this. Should this method be defined for all?
  // Probably not! Maybe split this class into a base macro class used by all
  // macro classes, and another specialized for list-style macros.
  reqSrcList() {return this.reqSrcInst(jnnl.NodeList)}

  reqSrcInst(cls) {
    const src = this.optSrcNode()
    if (a.isInst(src, cls)) return src
    throw this.err(`macro ${a.show(this.getSrcName())} requires the source node to be an instance of ${a.show(cls)}, got ${a.show(src)}`)
  }

  reqSrcAt(ind) {
    this.req(ind, a.isNat)

    const src = this.reqSrcList()
    const len = src.childCount()

    if (!(ind < len)) {
      throw this.err(`macro ${a.show(this.getSrcName())} requires at least ${ind+1} arguments, found ${len}`)
    }

    return src.reqChildAt(ind)
  }

  optSrcAt(ind) {
    this.req(ind, a.isNat)
    return this.reqSrcList().optChildAt(ind)
  }

  reqSrcInstAt(ind, ...cls) {
    const out = this.reqSrcAt(ind)
    if (isInstSome(out, cls)) return out
    throw out.err(`macro ${a.show(this.getSrcName())} requires the argument at index ${ind} to be an instance of one of the following classes: ${a.show(cls)}, found ${a.show(out)}`)
  }

  // FIXME inconsistent with `a.opt`. Behaves like `a.only`.
  // Add variant of `a.only` and fix consistency.
  optSrcInstAt(ind, ...cls) {
    const out = this.optSrcAt(ind)
    if (a.isNil(out)) return undefined
    if (isInstSome(out, cls)) return out
    throw this.err(`macro ${a.show(this.getSrcName())} requires the argument at index ${ind} to be either missing or an instance of one of the following classes: ${a.show(cls)}, found ${a.show(out)}`)
  }

  srcNodesFrom(ind) {return this.reqSrcList().optChildSlice(ind)}

  reqStatement() {
    if (this.isExpression()) {
      throw this.err(`macro ${a.show(this.getSrcName())} can only be used as a statement due to JS syntax limitations`)
    }
    return this
  }
}

function isInstSome(val, cls) {
  for (cls of cls) if (a.isInst(val, cls)) return true
  return false
}
