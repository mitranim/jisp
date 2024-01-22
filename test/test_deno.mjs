import {t} from './test_init.mjs'
import * as ti from './test_init.mjs'
import * as c from '../js/core.mjs'

export function testCanReach(fs) {
  t.no(fs.canReach())
  t.no(fs.canReach(null))
  t.no(fs.canReach(10))
  t.no(fs.canReach(new URL(`one:two`)))
  t.no(fs.canReach(new URL(`one://two`)))
  t.no(fs.canReach(new URL(`https://path`)))

  t.ok(fs.canReach(``))
  t.ok(fs.canReach(`/path`))
  t.ok(fs.canReach(new URL(`file:///path`)))
}

export async function testReadOpt(fs) {
  t.is((await fs.readOpt(import.meta.url)), undefined)
  c.reqValidStr(await fs.readOpt(new URL(import.meta.url)))
}

export async function testTimestampOpt(fs) {
  t.is((await fs.timestampOpt(import.meta.url)), undefined)
  c.reqFin(await fs.timestamp(new URL(import.meta.url)))
}

await t.test(async function test_DenoFs() {
  if (!ti.DENO) return
  const fs = new (await import(`../js/deno.mjs`)).DenoFs()

  testCanReach(fs)

  await t.test(async function test_read() {
    await ti.fail(
      async () => fs.read(import.meta.url),
      `unable to read ${c.show(import.meta.url)}`,
    )

    c.reqValidStr(await fs.read(new URL(import.meta.url)))
  })

  await testReadOpt(fs)

  await t.test(async function test_timestamp() {
    await ti.fail(
      async () => fs.timestamp(import.meta.url),
      `No such file or directory (os error 2), stat '${import.meta.url}'`,
    )

    c.reqFin(await fs.timestamp(new URL(import.meta.url)))
  })

  await testTimestampOpt(fs)
})

if (import.meta.main) ti.flush()
