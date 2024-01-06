import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as jc from './jisp_conf.mjs'
import * as je from './jisp_err.mjs'

/*
Provides shortcuts for implementing and using child-to-parent relations. This is
used widely throughout our code. All AST nodes and many non-AST objects have
parent-child relations. Note that in our system, the relation between parents
and children is not always reciprocal.
*/
export class MixChild extends a.DedupMixinCache {
  static make(cls) {
    return class MixChild extends je.MixErrer.goc(cls) {
      #parent = undefined
      optParent() {return this.#parent}

      setParent(val) {
        if (jc.conf.getDebug()) this.reqValidParent(val)
        this.#parent = val
        return this
      }

      reqParent() {
        return (
          this.optParent() ??
          this.throw(`missing parent at ${a.show(this)}`)
        )
      }

      reqValidParent(par) {return this.reqAcyclicParent(par)}

      reqAcyclicParent(par) {
        if (par === this) {
          throw this.err(`${a.show(this)} is not allowed to be its own parent`)
        }

        let tar = par
        while ((tar = optParentCall(tar))) {
          if (tar === this) {
            throw this.err(`forbidden cycle between child ${a.show(this)} and parent ${a.show(par)}`)
          }
        }

        return par
      }

      // TODO better naming. This starts search at the current node, not at the
      // parent. The name should reflect that.
      optAncMatch(cls) {
        a.reqCls(cls)
        let tar = this
        while (tar) {
          if (a.isInst(tar, cls)) return tar
          tar = tar.optParent()
        }
        return undefined
      }

      // TODO better naming. This starts search at the current node, not at the
      // parent. The name should reflect that.
      reqAncMatch(cls) {
        return (
          this.optAncMatch(cls) ??
          this.throw(`unable to find ancestor with class ${a.show(cls)} at descendant ${a.show(this)}`)
        )
      }

      // TODO better naming. This starts search at the current node, not at the
      // parent. The name should reflect that.
      optAncFind(fun) {
        a.reqFun(fun)
        let tar = this
        while (tar) {
          if (fun(tar)) return tar
          tar = tar.optParent()
        }
        return undefined
      }

      // TODO better naming. This starts search at the current node, not at the
      // parent. The name should reflect that.
      reqAncFind(fun) {
        return (
          this.optAncFind(fun) ??
          this.throw(`unable to find ancestor matching test function ${a.show(fun)} at descendant ${a.show(this)}`)
        )
      }

      // TODO better naming. This starts search at the current node, not at the
      // parent. The name should reflect that.
      optAncProcure(fun) {
        a.reqFun(fun)
        let tar = this
        while (tar) {
          const val = fun(tar)
          if (a.isSome(val)) return val
          tar = optParentCall(tar)
        }
        return undefined
      }
    }
  }
}

function optParentCall(src) {
  return a.isObj(src) && `optParent` in src ? src.optParent() : undefined
}
