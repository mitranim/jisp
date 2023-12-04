import * as a from '/Users/m/code/m/js/all.mjs'
import * as jc from './jisp_conf.mjs'
import * as je from './jisp_err.mjs'

/*
Provides shortcuts for validating child-to-parent relations. Also see `MixChild`
which is used to actually implement child-to-parent relations.
*/
export class MixParent extends a.DedupMixinCache {
  static make(cls) {
    return class MixParent extends je.MixErrer.goc(cls) {
      toValidChild(val) {
        val.setParent(this)
        if (jc.Conf.main.DEBUG) this.validChild(val)
        return val
      }

      validChild(val) {
        const par = val.ownParent()
        if (this !== par) {
          throw this.err(`parent-child mismatch: expected child ${a.show(val)} to have parent ${a.show(this)}, found ${a.show(par)}`)
        }
        return val
      }
    }
  }
}
