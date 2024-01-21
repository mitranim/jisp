import {a} from '../js/dep.mjs'
import {t} from './test_dep.mjs'
import * as ti from './test_init.mjs'
import * as pre from '../js/prelude.mjs'
import * as jmo from '../js/module.mjs'
import * as jns from '../js/ns.mjs'
import * as jcpd from '../js/code_printed.mjs'

const src = Deno.readTextFileSync(new URL(`../test_files/test_bench.jisp`, import.meta.url))

const live = new jns.NsLiveUnref().setLiveVal(pre)

class TestModule extends jcpd.MixOwnCodePrinted.goc(jmo.Module) {
  testRun() {
    const list = this.reqNodeList()
    list.reqNsLex().addMixin(live)
    list.parse(src).macro().compile()
  }
}

t.bench(function bench_module_roundtrip() {new TestModule().testRun()})

if (import.meta.main) ti.flush()
