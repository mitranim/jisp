import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './misc.mjs'
import * as jc from './conf.mjs'
import * as je from './err.mjs'

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
      optAncFindInst(cls) {
        a.reqCls(cls)
        return this.optAncFind(function testAncInst(val) {return a.isInst(val, cls)})
      }

      // TODO better naming. This starts search at the current node, not at the
      // parent. The name should reflect that.
      reqAncFindInst(cls) {
        return (
          this.optAncFindInst(cls) ??
          this.throw(`unable to find ancestor with class ${a.show(cls)} at descendant ${a.show(this)}`)
        )
      }

      // TODO better naming. This starts search at the current node, not at the
      // parent. The name should reflect that.
      optAncFindType(sym) {
        a.reqSym(sym)
        return this.optAncFind(function testAncType(val) {return jm.hasInternalType(val, sym)})
      }

      // TODO better naming. This starts search at the current node, not at the
      // parent. The name should reflect that.
      reqAncFindType(sym) {
        return (
          this.optAncFindType(sym) ??
          this.throw(`unable to find ancestor with internal type ${a.show(sym)} at descendant ${a.show(this)}`)
        )
      }

      // TODO better naming. This starts search at the current node, not at the
      // parent. The name should reflect that.
      optAncFind(fun) {
        a.reqFun(fun)
        return this.optAncProcure(function testAnc(val) {
          return fun(val) ? val : undefined
        })
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

      reqAncProcure(fun) {
        return (
          this.optAncProcure(fun) ??
          this.throw(`unable to procure ancestral value via function ${a.show(fun)} at descendant node ${a.show(this)}`)
        )
      }
    }
  }
}

function optParentCall(src) {
  return a.isComp(src) && `optParent` in src ? src.optParent() : undefined
}
