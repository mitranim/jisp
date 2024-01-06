import * as a from '/Users/m/code/m/js/all.mjs'
import * as jc from './jisp_conf.mjs'
import * as jm from './jisp_misc.mjs'
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
      optSrcNode() {return this.#srcNode}

      setSrcNode(val) {
        this.reqInst(val, jn.Node)
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

      reqValidSrcNode(src) {return this.reqAcyclicSrcNode(src)}

      reqAcyclicSrcNode(src) {
        this.reqInst(src, jn.Node)
        if (src === this) {
          throw this.err(`${a.show(this)} is not allowed to be its own source node`)
        }

        let cur = src
        while ((cur = optSrcNode(cur))) {
          if (cur === this) throw this.errSrcNodeCycle(src)
        }
        return src
      }

      errSrcNodeCycle(src) {
        const tarCtx = this.context()
        const srcCtx = src.context()

        /*
        Semi-placeholder. This error message is hard to understand due to lack
        of visual separation between sections. TODO improve.
        */
        return new this.Err(jm.joinParagraphs(
          `forbidden cycle between two nodes`,
          a.spaced(`target node:`, a.show(this)),
          tarCtx ? jm.joinParagraphs(`target node context:`, tarCtx) : ``,
          a.spaced(`source node:`, a.show(src)),
          srcCtx ? jm.joinParagraphs(`source node context:`, srcCtx) : ``,
        )).setHasCode(!!tarCtx || !!srcCtx)
      }

      // decompile() {
      //   return super.decompile?.() ?? this.optSrcNode()?.decompile()
      // }
    }
  }
}

function optSrcNode(src) {
  return a.isObj(src) && `optSrcNode` in src ? src.optSrcNode() : undefined
}
