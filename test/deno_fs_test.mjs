import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jm from '../js/misc.mjs'
import * as jdfs from '../js/deno_fs.mjs'

export function makeTestFs() {return new jdfs.DenoFs().setTar(tu.TEST_TAR_NAME)}

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
    const fs = new jdfs.DenoFs().setTar(tu.TEST_TAR_NAME)
    const expTarStr = tu.TEST_TAR_URL.href

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
})

if (import.meta.main) ti.flush()
