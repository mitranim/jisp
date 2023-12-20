import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as ti from './test_init.mjs'
import * as jdfs from '../js/jisp_deno_fs.mjs'

export function makeTestFs() {
  return new jdfs.DenoFs().setSrc(`test_files`).setTar(`.tmp`)
}

await t.test(async function test_DenoFs() {
  const fs = new jdfs.DenoFs()

  await t.test(async function test_src() {
    t.is(fs.ownSrc(), undefined)
    t.is(fs.relSrc(`.`), ``)
    t.is(fs.relSrc(`one`), `one`)
    t.is(fs.relSrc(`./one`), `one`)
    t.is(fs.relSrc(`one/two`), `one/two`)
    t.is(fs.relSrc(`./one/two`), `one/two`)

    fs.setSrc(`one`)
    t.is(fs.ownSrc(), `one`)
    t.is(fs.relSrc(`.`), `one`)
    t.is(fs.relSrc(`two`), `one/two`)
    t.is(fs.relSrc(`./two`), `one/two`)
    t.is(fs.relSrc(`two/three`), `one/two/three`)
    t.is(fs.relSrc(`./two/three`), `one/two/three`)

    fs.setSrc(`./one`)
    t.is(fs.ownSrc(), `./one`)
    t.is(fs.relSrc(`.`), `one`)
    t.is(fs.relSrc(`two`), `one/two`)
    t.is(fs.relSrc(`./two`), `one/two`)
    t.is(fs.relSrc(`two/three`), `one/two/three`)
    t.is(fs.relSrc(`./two/three`), `one/two/three`)

    fs.setSrc(`.`)
    const src = await fs.readSrc(`test_files/test_src.txt`)
    t.is(src, `This is a source file for FS testing.`)
  })

  await t.test(async function test_tar() {
    t.is(fs.ownTar(), undefined)
    t.is(fs.relTar(`.`), ``)
    t.is(fs.relTar(`one`), `one`)
    t.is(fs.relTar(`./one`), `one`)
    t.is(fs.relTar(`one/two`), `one/two`)
    t.is(fs.relTar(`./one/two`), `one/two`)

    fs.setTar(`one`)
    t.is(fs.ownTar(), `one`)
    t.is(fs.relTar(`.`), `one`)
    t.is(fs.relTar(`two`), `one/two`)
    t.is(fs.relTar(`./two`), `one/two`)
    t.is(fs.relTar(`two/three`), `one/two/three`)
    t.is(fs.relTar(`./two/three`), `one/two/three`)

    fs.setTar(`.tmp`)
    t.is(fs.ownSrc(), `.`)
    t.is(fs.ownTar(), `.tmp`)

    await fs.writeTar(`test_tar.txt`, await fs.readSrc(`test_files/test_src.txt`))
    const tar = await fs.readTar(`test_tar.txt`)
    t.is(tar, `This is a source file for FS testing.`)
  })
})

if (import.meta.main) ti.flush()
