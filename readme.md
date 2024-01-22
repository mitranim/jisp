Jisp rework, beta version.

## Setup

The build system requires the following executables in your shell environment:

  * `make`
  * `deno` or `node`
  * `watchexec`

On MacOS, `make` is preinstalled, and the rest can be installed with Homebrew:

```sh
brew install deno watchexec
```

## Run

When hacking on the compiler, use any of the following Make tasks to run tests. Tests require Deno.

```sh
make
make test
make test.w
```

Running Jisp code requires an entry script written in JS. An example is provided with the repository. See `run_deno.mjs` and `run_node.mjs`. Use any of the following Make tasks.

```sh
touch main.jisp

make mock.deno
make mock.deno.w
make mock.deno.w clear=true

make mock.node
make mock.node.w
make mock.node.w clear=true
```
