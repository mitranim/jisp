// import 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.52/cli_emptty.mjs'
import * as t from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.52/test.mjs'
import * as cl from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.52/cli.mjs'
import * as c from '../js/core.mjs'

export * as t from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.52/test.mjs'
export * as cl from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.52/cli.mjs'

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

export function bench(fil) {
  t.conf.setBenchFilter(fil)
  t.deopt()
  t.benches()
}

export const fsReadOnly = DENO
  ? new (await import(`../js/deno.mjs`)).DenoFsReadOnly()
  : new (await import(`../js/node.mjs`)).NodeFsReadOnly()

export const fsReadWrite = DENO
  ? new (await import(`../js/deno.mjs`)).DenoFs()
  : new (await import(`../js/node.mjs`)).NodeFs()

export const TEST_TAR_NAME = `.tmp_test`
export const TEST_TAR_URL = new URL(`../.tmp_test/`, import.meta.url)
export const TEST_SRC_URL = new URL(`../test_files/`, import.meta.url)

/*
When `ctx[symMain]` is unset, the relative paths of files written to the target
directory are resolved relatively to the target directory itself, and as a
result, for source files located in `TEST_SRC_URL`, their target files should
be written to this directory.
*/
export const TEST_TAR_SUB_URL = new URL(`1/test_files/`, TEST_TAR_URL)

export function testRootCtx() {
  const ctx = c.rootCtx()
  ctx[c.symFs] = fsReadWrite
  ctx[c.symTar] = TEST_TAR_URL.href
  return ctx
}

export function clearTar() {return fsReadWrite.removeOpt(TEST_TAR_URL)}

export function reqFinPos(val) {
  if (c.isFin(val) && val > 0) return val
  throw TypeError(`expected positive finite number, got ${c.show(val)}`)
}

export function optFinPos(val) {return c.isNil(val) ? val : reqFinPos(val)}

// Minor shortcut. We don't particularly care about error subclasses here.
export function fail(fun, msg) {return t.throws(fun, Error, msg)}

function makeMac(fun) {
  const tar = Object.create(null)
  tar.macro = fun
  return tar
}

export const macUnreachable = makeMac(function unreachable() {throw Error(`unreachable`)})

export const macReqStatement = makeMac(function reqStatement(ctx) {
  if (c.ctxIsStatement(ctx)) return `statement_value`
  throw Error(`expected statement context, got expression context ${c.show(ctx)}`)
})

export const macReqExpression = makeMac(function reqExpression(ctx) {
  if (!c.ctxIsStatement(ctx)) return `expression_value`
  throw Error(`expected expression context, got statement context ${c.show(ctx)}`)
})

export const macSomeValue = makeMac(function funSomeValue() {return `some_value`})
export const macOne = makeMac(function funOne() {return `one`})
export const macTwo = makeMac(function funTwo() {return `two`})
export const macThree = makeMac(function funThree() {return `three`})

export const macReqExpressionOne = makeMac(function funReqExpressionOne(ctx) {
  return macReqExpression.macro(ctx), `one`
})

export const macReqExpressionTwo = makeMac(function funReqExpressionTwo(ctx) {
  return macReqExpression.macro(ctx), `two`
})

export const macReqExpressionThree = makeMac(function funReqExpressionThree(ctx) {
  return macReqExpression.macro(ctx), `three`
})

export const macReqStatementOne = makeMac(function funReqStatementOne(ctx) {
  return macReqStatement.macro(ctx), `one`
})

export const macReqStatementTwo = makeMac(function funReqStatementTwo(ctx) {
  return macReqStatement.macro(ctx), `two`
})

export const macReqStatementThree = makeMac(function funReqStatementThree(ctx) {
  return macReqStatement.macro(ctx), `three`
})

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

export class PseudoFs extends Map {
  read(src) {
    return (
      this.get(c.reqInst(src, URL).href) ??
      c.panic(Error(`missing file: ${c.show(src.href)}`))
    )
  }
}

// Indicates benchmark accuracy. Should be ±0 nanoseconds.
t.bench(function bench_baseline() {})
