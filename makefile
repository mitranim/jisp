MAKEFLAGS := --silent --always-make
MAKE_SEQ = $(MAKE) --makefile=$(firstword $(MAKEFILE_LIST))
MAKE_PAR = $(MAKE_SEQ) -j 128
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
TAR_DIR := .jisp_target
DOC_SRC_DIR := doc
TEST_DIR := ./test
TEST_FILE := $(or $(file),test.mjs)
TEST := $(TEST_DIR)/$(TEST_FILE) --test=true $(VERB_LONG) $(RUN)
BENCH := $(TEST_DIR)/$(TEST_FILE) --bench=true $(VERB_LONG) $(PREC_LONG) $(ONCE_LONG) $(RUN)
ESLINT := eslint --config=.eslintrc --ext=mjs $(SRC_DIR) $(TEST_DIR)
WATCH := watchexec $(CLEAR_SHORT) -r -d=0 -n

# # Disables coloring in Deno.
# export NO_COLOR

ifeq ($(verb),true)
	OK = echo [$@] ok
endif

ifeq ($(OS),Windows_NT)
	RM_DIR = if exist "$(1)" rmdir /s /q "$(1)"
else
	RM_DIR = rm -rf "$(1)"
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
	$(WATCH) -w=$(SRC_DIR) -e=mjs -- $(MAKE_SEQ) lint verb=true

lint:
ifeq ($(shell which eslint),)
	deno lint --rules-exclude=no-empty,require-yield,require-await,constructor-super,no-self-assign
else
	$(ESLINT)
endif
	$(OK)

lint.fix:
	$(ESLINT) --fix

doc.srv:
	$(DENO) cli_deno.mjs $(DOC_SRC_DIR)/doc_srv.jis

clean:
	$(call RM_DIR,.tmp_test)
	$(call RM_DIR,$(TAR_DIR))

mock.deno: export JISP_TARGET := $(TAR_DIR)
mock.deno:
	$(DENO) cli_deno.mjs main.jisp
	$(OK)

mock.deno.w:
	$(WATCH) -e=jisp,jis -- $(MAKE_SEQ) mock.deno verb=$(or $(verb),true)

mock.node: export JISP_TARGET := $(TAR_DIR)
mock.node:
	$(NODE) cli_node.mjs main.jisp
	$(OK)

mock.node.w:
	$(WATCH) -e=jisp,jis -- $(MAKE_SEQ) mock.node verb=$(or $(verb),true)
