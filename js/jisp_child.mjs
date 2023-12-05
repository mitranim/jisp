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
      ownParent() {return this.#parent}
      optParent() {return this.#parent}

      setParent(val) {
        if (jc.Conf.main.DEBUG) this.validParent(val)
        this.#parent = val
        return this
      }

      validParent(par) {
        if (par === this) {
          throw this.err(`${a.show(this)} is not allowed to be its own parent`)
        }

        let tar = par
        while ((tar = jm.optParent(tar))) {
          if (tar === this) {
            throw this.err(`forbidden cycle between child ${a.show(this)} and parent ${a.show(par)}`)
          }
        }
        return par
      }

      reqParent() {
        return (
          this.optParent() ??
          this.throw(`missing parent at ${a.show(this)}`)
        )
      }

      optAncMatch(cls) {
        a.reqCls(cls)
        let tar = this
        while (tar) {
          if (a.isInst(tar, cls)) return tar
          tar = tar.optParent()
        }
        return undefined
      }

      reqAncMatch(cls) {
        return (
          this.optAncMatch(cls) ??
          this.throw(`missing ancestor with class ${a.show(cls)} at descendant ${a.show(this)}`)
        )
      }

      ancFind(fun) {
        a.reqFun(fun)
        let tar = this
        while (tar) {
          if (fun(tar)) return tar
          tar = tar.optParent()
        }
        return undefined
      }

      ancProcure(fun) {
        a.reqFun(fun)
        let tar = this
        while (tar) {
          const val = fun(tar)
          if (val) return val
          tar = jm.optParent(tar)
        }
        return undefined
      }

      optRoot() {return this.optAncMatch(Root)}
      reqRoot() {return this.reqAncMatch(Root)}

      optModule() {return this.optAncMatch(Module)}
      reqModule() {return this.reqAncMatch(Module)}

      optScoper() {return this.ancFind(jm.ownScope)}
      reqScoper() {return this.optScoper() ?? this.throw(`missing scope at ${a.show(this)}`)}
    }
  }
}
