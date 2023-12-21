// import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as ti from './test_init.mjs'
import * as jm from '../js/jisp_misc.mjs'

await t.test(async function test_strToHash() {
  await t.throws(async () => jm.strToHash(), TypeError, `expected variant of isStr, got undefined`)
  await t.throws(async () => jm.strToHash(10), TypeError, `expected variant of isStr, got 10`)

  t.is(
    await jm.strToHash(`one`),
    `7692c3ad3540bb803c020b3aee66cd8887123234ea0c6e7143c0add73ff431ed`,
  )

  t.is(
    await jm.strToHash(`two`),
    `3fc4ccfe745870e2c0d99f71f30ff0656c8dedd41cc1d7d3d376b0dbe685e2f3`,
  )
})

// await t.test(async function test_strToHash_timing() {
//   await jm.strToHash(`304d83bdace546b595151ad667a05182`)
// })

// await t.test(async function test_strToHash_timing() {
//   await jm.strToHash(`48e132ce5cba45c18dbcb03d17a60aa2`)
// })

// await t.test(async function test_strToHash_timing() {
//   await jm.strToHash(`686b273684ff4dd88cc51161dded2d8c`)
// })

// await t.test(async function test_strToHash_timing() {
//   await jm.strToHash(`39e7cc64280f410297b9e920fab88889`)
// })

// await t.test(async function test_strToHash_timing() {
//   await jm.strToHash(`02d3b969fc9f45cabe84f74b4edac54f`)
// })

if (import.meta.main) ti.flush()
