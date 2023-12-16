import '/Users/m/code/m/js/cli_emptty.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as c from '/Users/m/code/m/js/cli.mjs'

Error.stackTraceLimit = Infinity

export const cli = c.Flag.os()
export const TEST = cli.boolOpt(`test`)
export const BENCH = cli.boolOpt(`bench`)
export const VERB = cli.boolOpt(`verb`)
export const RUN = cli.get(`run`)

if (VERB) t.conf.testRep = t.conf.benchRep

if (TEST) t.conf.setTestFilter(RUN)
else t.conf.setTestFilter(/(?!)/)

t.conf.setBenchFilter(RUN)

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

// Indicates benchmark accuracy. Should be single digit nanoseconds.
t.bench(function bench_baseline() {})
