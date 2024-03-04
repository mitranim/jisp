import {t} from './test_init.mjs'
import * as ti from './test_init.mjs'
import * as c from '../js/core.mjs'
import * as pre from '../js/prelude.mjs'

const testSrcDelim = await ti.fsReadOnly.read(new URL(`../test_files/test_bench.jisp`, import.meta.url))
const testSrcIndent = await ti.fsReadOnly.read(new URL(`../test_files/test_bench.jis`, import.meta.url))

function run(src, Reader) {
  c.joinStatements(c.compileNodes(c.macroNodes(
    c.ctxWithModule(c.ctxWithMixin(pre), new c.Module()),
    [...new Reader(src)],
  )))
}

t.bench(function bench_srcToTar() {c.srcToTar(import.meta.url, ti.TEST_TAR_URL.href)})

const stringForDecoding = Function(`return arguments[0]`)(`"\\n one \\r two \\n three \\n four \\n five \\u1234 six"`)

t.bench(function bench_string_decoding_native() {JSON.parse(stringForDecoding)})
t.bench(function bench_string_decoding_ours() {c.strDecode(stringForDecoding)})

t.bench(function bench_module_delim_read() {[...new c.DelimReader(testSrcDelim)]})
t.bench(function bench_module_delim_roundtrip() {run(testSrcDelim, c.DelimReader)})

t.bench(function bench_module_indent_read() {[...new c.IndentReader(testSrcIndent)]})
t.bench(function bench_module_indent_roundtrip() {run(testSrcIndent, c.IndentReader)})

if (import.meta.main) ti.flush()
