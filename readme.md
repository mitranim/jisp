Jisp rework, beta version.

## Setup

The build system requires the following executables in your shell environment:

  * `make`
  * `deno`
  * `watchexec`

On MacOS, `make` is preinstalled, and the rest can be installed with Homebrew:

```sh
brew install deno watchexec
```

## Run

When hacking on the compiler, use any of the following Make tasks to run tests.

```sh
make
make test
make test.w
```

Running Jisp code requires an entry script written in JS. An example is provided with the repository. See `run.mjs`. Use any of the following Make tasks.

```sh
touch main.jisp

make mock
make mock.w
make mock.w clear=true
```
