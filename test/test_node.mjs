import {t} from './test_init.mjs'
import * as ti from './test_init.mjs'
import * as td from './test_deno.mjs'
import * as c from '../js/core.mjs'

await t.test(async function test_NodeFs() {
  if (!ti.NODE) return
  const fs = new (await import(`../js/node.mjs`)).NodeFs()

  td.testIsPathValid(fs)

  await t.test(async function test_read() {
    await ti.fail(
      async () => fs.read(import.meta.url),
      `no such file or directory, open '${import.meta.url}'`,
    )

    c.reqValidStr(await fs.read(new URL(import.meta.url)))
  })

  await td.testReadOpt(fs)

  await t.test(async function test_timestamp() {
    await ti.fail(
      async () => fs.timestamp(import.meta.url),
      `no such file or directory, stat '${import.meta.url}'`,
    )

    c.reqFin(await fs.timestamp(new URL(import.meta.url)))
  })

  await td.testTimestampOpt(fs)
})

if (import.meta.main) ti.flush()
