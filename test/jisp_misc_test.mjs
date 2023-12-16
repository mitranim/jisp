import * as ti from './test_init.mjs'
import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as jm from '../js/jisp_misc.mjs'

function* optValIter(val) {if (a.isSome(val)) yield val}

t.test(function test_OptValIter() {
  function test(val, exp) {t.eq([...new jm.OptValIter(val)], exp)}

  test(undefined, [])
  test(0, [0])
  test(10, [10])
})

t.test(function test_optValIter() {
  function test(val, exp) {t.eq([...optValIter(val)], exp)}

  test(undefined, [])
  test(0, [0])
  test(10, [10])
})

t.bench(function bench_val_iter_new_OptValIter() {
  a.nop(new jm.OptValIter(`some_val`))
})

t.bench(function bench_val_iter_new_optValIter() {
  a.nop(optValIter(`some_val`))
})

t.bench(function bench_val_iter_run_OptValIter_nil() {
  a.nop([...new jm.OptValIter()])
})

t.bench(function bench_val_iter_run_optValIter_nil() {
  a.nop([...optValIter()])
})

t.bench(function bench_val_iter_run_OptValIter_some() {
  a.nop([...new jm.OptValIter(`some_val`)])
})

t.bench(function bench_val_iter_run_optValIter_some() {
  a.nop([...optValIter(`some_val`)])
})

if (import.meta.main) ti.flush()
