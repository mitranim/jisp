import * as a from '/Users/m/code/m/js/all.mjs'
import * as jc from './jisp_conf.mjs'
import * as je from './jisp_err.mjs'
import * as jn from './jisp_node.mjs'

/*
This is named "node sourced" because this class is sourced FROM a node, but
doesn't have to BE a node. For example, this may be used for objects that
describe information derived from nodes, such as identifier declarations.
This relation allows us to track the origin of such declarations.
*/
export class MixOwnNodeSourced extends a.DedupMixinCache {
  static make(cls) {
    return class MixOwnNodeSourced extends je.MixErrer.goc(cls) {
      #srcNode = undefined
      ownSrcNode() {return this.#srcNode}
      optSrcNode() {return this.#srcNode}

      setSrcNode(val) {
        a.reqInst(val, jn.Node)
        if (jc.conf.getDebug()) this.reqValidSrcNode(val)
        this.#srcNode = val
        return this
      }

      reqSrcNode() {
        return (
          this.optSrcNode() ??
          this.throw(`missing source node at ${a.show(this)}`)
        )
      }

      reqValidSrcNode(src) {
        if (src === this) {
          throw this.err(`${a.show(this)} is not allowed to be its own source node`)
        }

        let tar = src
        while ((tar = optSrcNode(tar))) {
          if (tar === this) {
            throw this.err(`forbidden cycle between end node ${a.show(this)} and source node ${a.show(src)}`)
          }
        }
        return src
      }

      decompile() {return this.optSrcNode()?.decompile()}
    }
  }
}

function optSrcNode(src) {
  return a.isObj(src) && `optSrcNode` in src ? src.optSrcNode() : undefined
}
