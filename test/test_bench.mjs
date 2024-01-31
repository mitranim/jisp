import {t} from './test_init.mjs'
import * as ti from './test_init.mjs'
import * as c from '../js/core.mjs'
import * as pre from '../js/prelude.mjs'

const testBenchSrc = await ti.fsReadOnly.read(new URL(`../test_files/test_bench.jisp`, import.meta.url))

class TestModule extends c.Module {
  testRun() {
    const ctx = c.ctxWithModule(c.ctxWithMixin(pre), this)
    const nodes = [...new this.Reader(testBenchSrc)]
    c.joinStatements(c.compileNodes(c.macroNodes(ctx, nodes)))
  }
}

function nop() {}

t.bench(function bench_module_read() {nop([...new c.Reader(testBenchSrc)])})
t.bench(function bench_module_roundtrip() {new TestModule().testRun()})
t.bench(function bench_srcToTar() {c.srcToTar(import.meta.url, ti.TEST_TAR_URL.href)})

if (import.meta.main) ti.flush()
