import * as ti from './test_init.mjs'
import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as jp from '../js/jisp_parent.mjs'

// TODO actual tests.

class MixParentIterManual extends a.DedupMixinCache {
  static make(cls) {
    return class MixParentIterManual extends cls {
      #chi = undefined
      setChild(val) {return this.#chi = val, this}
      childIter() {return new OptValIter(this.#chi)}
    }
  }
}

class ParentIterManual extends MixParentIterManual.goc(a.Emp) {}

class MixParentIterGen extends a.DedupMixinCache {
  static make(cls) {
    return class MixParentIterGen extends cls {
      #chi = undefined
      setChild(val) {return this.#chi = val, this}

      *childIter() {
        const val = this.#chi
        if (a.isSome(val)) yield val
      }
    }
  }
}

class ParentIterGen extends MixParentIterGen.goc(a.Emp) {}

class OptValIter extends a.Emp {
  constructor(val) {
    super()
    this.value = val
    this.done = false
    this.doneNext = false
  }

  next() {
    if (this.done) return this
    if (a.isNil(this.value) || this.doneNext) this.done = true
    this.doneNext = true
    return this
  }

  [Symbol.iterator]() {return this}
}

t.bench(function bench_parent_single_iter_new_manual() {
  a.nop(new ParentIterManual().setChild(`some_val`))
})

t.bench(function bench_parent_single_iter_new_gen() {
  a.nop(new ParentIterGen().setChild(`some_val`))
})

t.bench(function bench_parent_single_iter_run_manual() {
  a.nop([...new ParentIterManual().setChild(`some_val`).childIter()])
})

t.bench(function bench_parent_single_iter_run_gen() {
  a.nop([...new ParentIterGen().setChild(`some_val`).childIter()])
})

if (import.meta.main) ti.flush()
