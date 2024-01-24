import '/Users/m/code/m/js/cli_emptty.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as cl from '/Users/m/code/m/js/cli.mjs'
import * as c from '../js/core.mjs'
import * as p from '../js/prelude.mjs'

export * as t from '/Users/m/code/m/js/test.mjs'
export * as cl from '/Users/m/code/m/js/cli.mjs'

/*
Should be sufficiently large to show any non-overflow stack traces, but also
sufficiently small to avoid overflowing terminal scrollback buffers in cases
of stack overflow.
*/
Error.stackTraceLimit = 1024
// Error.stackTraceLimit = Infinity

export const DENO = c.isComp(globalThis.Deno)
export const NODE = c.isComp(globalThis.process)

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

export const fs = DENO
  ? new (await import(`../js/deno.mjs`)).DenoFs()
  : new (await import(`../js/node.mjs`)).NodeFs()

export const TEST_TAR_NAME = `.tmp_test`
export const TEST_TAR_URL = new URL(`../.tmp_test/`, import.meta.url)
export const TEST_SRC_URL = new URL(`../test_files/`, import.meta.url)

/*
When `ctxGlobal[symMain]` is unset, the relative paths of files written to the
target directory are resolved relatively to the target directory itself, and as
a result, for source files located in `TEST_SRC_URL`, their target files should
be written to this directory.
*/
export const TEST_TAR_SUB_URL = new URL(`1/test_files/`, TEST_TAR_URL)

c.ctxGlobal[c.symFs] = fs
c.ctxGlobal[c.symTar] = TEST_TAR_URL.href
c.ctxGlobal.use = p.use

export function clearTar() {return fs.removeOpt(TEST_TAR_URL)}

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

export function inspect(val) {
  return globalThis.Deno?.inspect(val) ?? c.show(val)
}

// Indicates benchmark accuracy. Should be ±0 nanoseconds.
t.bench(function bench_baseline() {})
