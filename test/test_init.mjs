import '/Users/m/code/m/js/cli_emptty.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as c from '/Users/m/code/m/js/cli.mjs'

Error.stackTraceLimit = Infinity

export const cli = c.Flag.os()

if (cli.boolOpt(`verb`)) t.conf.testRep = t.conf.benchRep

if (cli.boolOpt(`test`)) t.conf.setTestFilter(cli.get(`run`))
else t.conf.setTestFilter(/(?!)/)

t.conf.setBenchFilter(cli.get(`run`))

// Allows to bench code in "slow mode", without much warmup.
if (cli.boolOpt(`once`)) t.conf.benchRunner = new t.CountRunner(1)

// Opt-in for benchmarks that require more precision than whole nanoseconds.
if (cli.boolOpt(`prec`)) t.conf.benchRep = t.ConsoleAvgReporter.with(t.tsPico)

// Indicates benchmark accuracy. Should be single digit nanoseconds.
t.bench(function bench_baseline() {})
