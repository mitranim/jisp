import * as jnp from './jisp_node_predecl.mjs'

/*
These macros allow "renaming" common built-in JS globals to shorter Jisp names,
while compiling to the original JS names and avoiding any runtime overhead.
Example:

  [use `jisp:prelude.mjs` *]

  nil   ; JS `undefined`
  null  ; JS `null`
  no    ; JS `false`
  ok    ; JS `true`
  nan   ; JS `NaN`
  inf   ; JS `Infinity`

Note that this is needed ONLY for renaming. For JS globals which are used
without renaming, use regular predeclaration:

  [declare `jisp:global.mjs`]

  Object
  Array
  Math
  JSON
  console
  ... more
*/

export class Nil extends jnp.Predecl {
  reqName() {return `undefined`}
  ownVal() {return undefined}
  static reprModuleUrl = import.meta.url
}

export class Null extends jnp.Predecl {
  reqName() {return `null`}
  ownVal() {return null}
  static reprModuleUrl = import.meta.url
}

export class No extends jnp.Predecl {
  reqName() {return `false`}
  ownVal() {return false}
  static reprModuleUrl = import.meta.url
}

export class Ok extends jnp.Predecl {
  reqName() {return `true`}
  ownVal() {return true}
  static reprModuleUrl = import.meta.url
}

export class Nan extends jnp.Predecl {
  reqName() {return `NaN`}
  ownVal() {return NaN}
  static reprModuleUrl = import.meta.url
}

export class Inf extends jnp.Predecl {
  reqName() {return `Infinity`}
  ownVal() {return Infinity}
  static reprModuleUrl = import.meta.url
}

export class Global extends jnp.Predecl {
  reqName() {return `globalThis`}
  ownVal() {return globalThis}
  static reprModuleUrl = import.meta.url
}
