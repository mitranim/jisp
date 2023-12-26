MAKEFLAGS := --silent --always-make
MAKE_PAR := $(MAKE) -j 128
# `--unstable` enables `Deno?.consoleSize` which is used for benchmark printing.
DENO := deno run -A --no-check --allow-hrtime --unstable
RUN := $(if $(run),--run="$(run)",)
VERB_SHORT := $(if $(filter $(verb),true),-v,)
VERB_LONG := $(if $(filter $(verb),true),--verb,)
PREC_LONG := $(if $(filter $(prec),true),--prec,)
ONCE_LONG := $(if $(filter $(once),true),--once,)
CLEAR_SHORT := $(if $(filter $(clear),true),-c,)
CLEAR_LONG := $(if $(filter $(clear),true),--clear,)
TEST_FILE := $(or $(file),test).mjs
TEST := test/$(TEST_FILE) --test=true $(VERB_LONG) $(RUN)
BENCH := test/$(TEST_FILE) --bench=true $(VERB_LONG) $(PREC_LONG) $(ONCE_LONG) $(RUN)
WATCH := watchexec $(CLEAR_SHORT) -r -d=0 -n
SRC_JS := ./js

# # Disables coloring in Deno.
# export NO_COLOR=

default: mock

ifeq ($(verb),true)
	OK = echo [$@] ok
endif

# TODO also watch files read by tests, in addition to imported by tests.
test.w:
	$(DENO) --watch $(TEST)

test:
	$(DENO) $(TEST)

bench.w:
	$(DENO) --watch $(BENCH)

bench:
	$(DENO) $(BENCH)

lint.w:
	$(WATCH) -w=$(SRC_JS) -e=mjs -- $(MAKE) lint verb=true

lint:
ifeq ($(shell which eslint),)
	deno lint --rules-exclude=no-empty,require-yield,require-await,constructor-super,no-self-assign
else
	eslint --config=./.eslintrc --ext=mjs $(SRC_JS)
endif
	$(OK)

mock:
	$(DENO) ./mock/mock.mjs
