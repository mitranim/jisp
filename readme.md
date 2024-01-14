Jisp rework, beta version.

## Setup

Running scripts and tests currently requires `deno` and `make`, which should be installed globally. Some Make tasks also require `watchexec`.

## Run

When hacking on the compiler, use any of the following Make tasks to run tests.

```sh
make
make test
make test.w
```

Running Jisp code requires an entry script written in JS. An example is provided with the repository. See `run.mjs`. Use any of the following Make tasks to run Jisp code.

```sh
make mock
make mock.w
make mock.w clear=true
```
