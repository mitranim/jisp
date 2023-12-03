MAKEFLAGS := --silent --always-make
MAKE_PAR := $(MAKE) -j 128
DENO := deno run -A --no-check --allow-hrtime
RUN := $(if $(run),--run="$(run)",)
VERB_SHORT := $(if $(filter $(verb),true),-v,)
VERB_LONG := $(if $(filter $(verb),true),--verb,)
PREC_LONG := $(if $(filter $(prec),true),--prec,)
ONCE_LONG := $(if $(filter $(once),true),--once,)
CLEAR_SHORT := $(if $(filter $(clear),true),-c,)
CLEAR_LONG := $(if $(filter $(clear),true),--clear,)
TEST := test/test.mjs --test=true $(VERB_LONG) $(RUN)
BENCH := test/test.mjs --bench=true $(VERB_LONG) $(PREC_LONG) $(ONCE_LONG) $(RUN)
WATCH := watchexec $(CLEAR_SHORT) -r -d=0 -n
SRC_JS := ./js

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
