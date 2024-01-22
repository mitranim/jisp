MAKEFLAGS := --silent --always-make
MAKE_PAR := $(MAKE) -j 128
# `--unstable` enables `Deno.consoleSize` which is used for benchmark printing.
DENO := deno run -A --no-check --allow-hrtime --unstable
NODE := node
RUN := $(if $(run),--run="$(run)",)
VERB_SHORT := $(if $(filter $(verb),true),-v,)
VERB_LONG := $(if $(filter $(verb),true),--verb,)
PREC_LONG := $(if $(filter $(prec),true),--prec,)
ONCE_LONG := $(if $(filter $(once),true),--once,)
CLEAR_SHORT := $(if $(filter $(clear),true),-c,)
CLEAR_LONG := $(if $(filter $(clear),true),--clear,)
SRC_DIR := ./js
TEST_DIR := ./test
TEST_FILE := $(or $(file),test.mjs)
TEST := $(TEST_DIR)/$(TEST_FILE) --test=true $(VERB_LONG) $(RUN)
BENCH := $(TEST_DIR)/$(TEST_FILE) --bench=true $(VERB_LONG) $(PREC_LONG) $(ONCE_LONG) $(RUN)
WATCH := watchexec $(CLEAR_SHORT) -r -d=0 -n

# # Disables coloring in Deno.
# export NO_COLOR

ifeq ($(verb),true)
	OK = echo [$@] ok
endif

# TODO also watch files read by tests, in addition to those imported by tests,
# by passing their paths to Deno's `--watch` flag.
test.w:
	$(DENO) --watch $(TEST) --watch

test:
	$(DENO) $(TEST)

bench.w:
	$(DENO) --watch $(BENCH) --watch

bench:
	$(DENO) $(BENCH)

lint.w:
	$(WATCH) -w=$(SRC_DIR) -e=mjs -- $(MAKE) lint verb=true

lint:
ifeq ($(shell which eslint),)
	deno lint --rules-exclude=no-empty,require-yield,require-await,constructor-super,no-self-assign
else
	eslint --config=./.eslintrc --ext=mjs $(SRC_DIR)
endif
	$(OK)

mock.deno:
	$(DENO) ./run_deno.mjs
	$(OK)

mock.deno.w:
	$(WATCH) -e=jisp -- $(MAKE) mock.deno verb=$(or $(verb),true)

mock.node:
	$(NODE) ./run_node.mjs
	$(OK)

mock.node.w:
	$(WATCH) -e=jisp -- $(MAKE) mock.node verb=$(or $(verb),true)
