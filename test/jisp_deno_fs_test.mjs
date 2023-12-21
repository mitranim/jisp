import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as ti from './test_init.mjs'
import * as jm from '../js/jisp_misc.mjs'
import * as jdfs from '../js/jisp_deno_fs.mjs'

export function makeTestFs() {return new jdfs.DenoFs().setTar(`.tmp`)}

await t.test(async function test_DenoFs() {
  t.test(function test_empty() {
    const fs = new jdfs.DenoFs()

    t.is(fs.optTarUrlStr(), undefined)
    t.is(fs.optTarUrl(), undefined)

    t.throws(() => fs.reqTarUrlStr(), Error, `missing target URL in FS [object DenoFs]`)
    t.throws(() => fs.reqTarUrl(), Error, `missing target URL in FS [object DenoFs]`)
  })

  /*
  This code assumes that the CWD is the repository root.
  If this test runs with a different CWD, it's expected to fail.
  */
  t.test(function test_with_target() {
    const fs = new jdfs.DenoFs().setTar(`.tmp`)
    const expTarStr = new URL(`../.tmp/`, import.meta.url).href

    t.is(fs.optTarUrlStr(), fs.reqTarUrlStr())
    t.is(fs.reqTarUrlStr(), expTarStr)

    {
      const tar = fs.optTarUrl()
      t.inst(tar, jm.Url)
      t.is(tar.href, expTarStr)

      t.isnt(fs.optTarUrl(), fs.optTarUrl())
      t.is(fs.optTarUrl().href, fs.optTarUrl().href)
    }

    {
      const tar = fs.reqTarUrl()
      t.inst(tar, jm.Url)
      t.is(tar.href, expTarStr)

      t.isnt(fs.reqTarUrl(), fs.reqTarUrl())
      t.is(fs.reqTarUrl().href, fs.reqTarUrl().href)
    }

    t.isnt(fs.optTarUrl(), fs.reqTarUrl())
    t.is(fs.optTarUrl().href, fs.reqTarUrl().href)
  })

  return

  // return
  // const fs = new jdfs.DenoFs()

  await t.test(async function test_src() {
    t.is(fs.ownSrc(), undefined)
    t.is(fs.srcRel(`.`), ``)
    t.is(fs.srcRel(`one`), `one`)
    t.is(fs.srcRel(`./one`), `one`)
    t.is(fs.srcRel(`one/two`), `one/two`)
    t.is(fs.srcRel(`./one/two`), `one/two`)

    fs.setSrc(`one`)
    t.is(fs.ownSrc(), `one`)
    t.is(fs.srcRel(`.`), `one`)
    t.is(fs.srcRel(`two`), `one/two`)
    t.is(fs.srcRel(`./two`), `one/two`)
    t.is(fs.srcRel(`two/three`), `one/two/three`)
    t.is(fs.srcRel(`./two/three`), `one/two/three`)

    fs.setSrc(`./one`)
    t.is(fs.ownSrc(), `./one`)
    t.is(fs.srcRel(`.`), `one`)
    t.is(fs.srcRel(`two`), `one/two`)
    t.is(fs.srcRel(`./two`), `one/two`)
    t.is(fs.srcRel(`two/three`), `one/two/three`)
    t.is(fs.srcRel(`./two/three`), `one/two/three`)

    fs.setSrc(`.`)
    const src = await fs.read(new jm.Url(`../test_files/test_src.txt`), import.meta.url)
    t.is(src, `This is a source file for FS testing.`)
  })

  await t.test(async function test_tar() {
    t.is(fs.ownTar(), undefined)
    t.is(fs.tarRel(`.`), ``)
    t.is(fs.tarRel(`one`), `one`)
    t.is(fs.tarRel(`./one`), `one`)
    t.is(fs.tarRel(`one/two`), `one/two`)
    t.is(fs.tarRel(`./one/two`), `one/two`)

    fs.setTar(`one`)
    t.is(fs.ownTar(), `one`)
    t.is(fs.tarRel(`.`), `one`)
    t.is(fs.tarRel(`two`), `one/two`)
    t.is(fs.tarRel(`./two`), `one/two`)
    t.is(fs.tarRel(`two/three`), `one/two/three`)
    t.is(fs.tarRel(`./two/three`), `one/two/three`)

    fs.setTar(`.tmp`)
    t.is(fs.ownSrc(), `.`)
    t.is(fs.ownTar(), `.tmp`)

    const srcUrl = new jm.Url(`../test_files/test_src.txt`, import.meta.url)
    const tarUrl = new jm.Url(`test_tar.txt`, fs.reqTarUrlStr())

    await fs.write(tarUrl, await fs.read(srcUrl))
    const tar = await fs.read(tarUrl)
    t.is(tar, `This is a source file for FS testing.`)
  })
})

if (import.meta.main) ti.flush()
