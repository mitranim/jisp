import {t} from './test_dep.mjs'
import * as ti from './test_init.mjs'
import * as jm from '../js/misc.mjs'

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

if (import.meta.main) ti.flush()
