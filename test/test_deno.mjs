import {t} from './test_init.mjs'
import * as ti from './test_init.mjs'
import * as c from '../js/core.mjs'

export function testIsPathValid(fs) {
  t.no(fs.isPathValid())
  t.no(fs.isPathValid(null))
  t.no(fs.isPathValid(10))
  t.no(fs.isPathValid(new URL(`one:two`)))
  t.no(fs.isPathValid(new URL(`one://two`)))
  t.no(fs.isPathValid(new URL(`https://path`)))

  t.ok(fs.isPathValid(``))
  t.ok(fs.isPathValid(`/path`))
  t.ok(fs.isPathValid(new URL(`file:///path`)))
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

  testIsPathValid(fs)

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
