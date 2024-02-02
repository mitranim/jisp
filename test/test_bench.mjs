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

const stringForDecoding = Function(`return arguments[0]`)(`"\\n one \\r two \\n three \\n four \\n five \\u1234 six"`)

t.bench(function bench_module_read() {nop([...new c.Reader(testBenchSrc)])})
t.bench(function bench_module_roundtrip() {new TestModule().testRun()})
t.bench(function bench_srcToTar() {c.srcToTar(import.meta.url, ti.TEST_TAR_URL.href)})

/*
At the time of writing and testing, on the author's machine using Deno 1.24.3
with V8 10.4.132.20, our version is about two times slower for this particular
input.
*/
t.bench(function bench_string_decoding_native() {JSON.parse(stringForDecoding)})
t.bench(function bench_string_decoding_ours() {c.strDecode(stringForDecoding)})

if (import.meta.main) ti.flush()
