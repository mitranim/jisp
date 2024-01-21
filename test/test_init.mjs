import 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.51/cli_emptty.mjs'
import * as t from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.51/test.mjs'
import * as cl from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.51/cli.mjs'
import * as c from '../js/core.mjs'
import * as d from '../js/deno.mjs'
import * as p from '../js/prelude.mjs'

export * as t from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.51/test.mjs'
export * as cl from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.51/cli.mjs'


/*
Should be sufficiently large to show any non-overflow stack traces, but also
sufficiently small to avoid overflowing terminal scrollback buffers in cases
of stack overflow.
*/
Error.stackTraceLimit = 1024
// Error.stackTraceLimit = Infinity

export const cli = cl.Flag.os()
export const TEST = cli.boolOpt(`test`)
export const BENCH = cli.boolOpt(`bench`)
export const VERB = cli.boolOpt(`verb`)
export const RUN = cli.get(`run`)

/*
Should be duplicated from Deno flags. Allows us to disable some tests that cause
infinite restarting in watch mode.
*/
export const WATCH = cli.boolOpt(`watch`)

if (VERB) t.conf.testRep = t.ConsoleStartEndAvgReporter.with(t.tsMilli)

if (TEST) t.conf.setTestFilter(RUN)

if (BENCH) {
  t.conf.setTestFilter(/(?!)/)
  t.conf.setBenchFilter(RUN)
}

// Allows to bench code in "slow mode", without much warmup.
if (cli.boolOpt(`once`)) t.conf.benchRunner = new t.CountRunner(1)

// Opt-in for benchmarks that require more precision than whole nanoseconds.
if (cli.boolOpt(`prec`)) t.conf.benchRep = t.ConsoleAvgReporter.with(t.tsPico)

export function flush() {
  if (TEST) {
    console.log(`[test] ok`)
  }
  if (BENCH) {
    t.deopt()
    t.benches()
  }
}

export const TEST_TAR_NAME = `.tmp_test`
export const TEST_TAR_URL = new URL(`../.tmp_test/`, import.meta.url)
export const TEST_SRC_URL = new URL(`../test_files/`, import.meta.url)

export const TEST_TAR_SUB_URL = new URL(
  (await c.strHash(`test_files:.tmp_test`)) + `/`,
  TEST_TAR_URL,
)

c.ctxGlobal[c.symFs] = new d.DenoFs()
c.ctxGlobal[c.symTar] = TEST_TAR_URL.href
c.ctxGlobal.use = p.use

export function clearTar() {
  try {
    Deno.removeSync(TEST_TAR_URL, {recursive: true})
  }
  catch (err) {
    if (err instanceof Deno.errors.NotFound) return
    throw err
  }
}

export function reqFinPos(val) {
  if (c.isFin(val) && val > 0) return val
  throw TypeError(`expected positive finite number, got ${c.show(val)}`)
}

export function optFinPos(val) {return c.isNil(val) ? val : reqFinPos(val)}

// Minor shortcut. We don't use distinct error classes here.
export function fail(fun, msg) {return t.throws(fun, Error, msg)}

export function macUnreachable() {throw Error(`unreachable`)}

export function macReqStatement() {
  if (c.ctxIsStatement(this)) return `statement_value`
  throw Error(`expected statement context, got expression context ${c.show(this)}`)
}

export function macReqExpression() {
  if (!c.ctxIsStatement(this)) return `expression_value`
  throw Error(`expected expression context, got statement context ${c.show(this)}`)
}

export function macSomeValue() {return `some_value`}

export function macOne() {return `one`}
export function macTwo() {return `two`}
export function macThree() {return `three`}

export function macReqExpressionOne() {return macReqExpression.call(this), `one`}
export function macReqExpressionTwo() {return macReqExpression.call(this), `two`}
export function macReqExpressionThree() {return macReqExpression.call(this), `three`}

export function macReqStatementOne() {return macReqStatement.call(this), `one`}
export function macReqStatementTwo() {return macReqStatement.call(this), `two`}
export function macReqStatementThree() {return macReqStatement.call(this), `three`}

export function objFlat(src) {
  const out = []
  while (c.isObj(src)) {
    out.push(ownVals(src))
    src = Object.getPrototypeOf(src)
  }
  return out
}

export function ownVals(src) {
  const out = Object.create(null)
  for (const key of Object.getOwnPropertySymbols(src)) out[key] = src[key]
  for (const key of Object.getOwnPropertyNames(src)) out[key] = src[key]
  return out
}

// Indicates benchmark accuracy. Should be ±0 nanoseconds.
t.bench(function bench_baseline() {})
