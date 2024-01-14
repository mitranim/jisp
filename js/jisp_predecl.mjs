import * as jnp from './jisp_node_predecl.mjs'

/*
These macros allow "renaming" common built-in JS globals to shorter Jisp names,
while compiling to the original JS names and avoiding any runtime overhead.
Example:

  [use `jisp:prelude.mjs` *]

  nil    ->   undefined
  null   ->   null
  no     ->   false
  ok     ->   true
  nan    ->   NaN
  inf    ->   Infinity

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
  static {this.setReprModuleUrl(import.meta.url)}
}

export class Null extends jnp.Predecl {
  reqName() {return `null`}
  ownVal() {return null}
  static {this.setReprModuleUrl(import.meta.url)}
}

export class No extends jnp.Predecl {
  reqName() {return `false`}
  ownVal() {return false}
  static {this.setReprModuleUrl(import.meta.url)}
}

export class Ok extends jnp.Predecl {
  reqName() {return `true`}
  ownVal() {return true}
  static {this.setReprModuleUrl(import.meta.url)}
}

export class Nan extends jnp.Predecl {
  reqName() {return `NaN`}
  ownVal() {return NaN}
  static {this.setReprModuleUrl(import.meta.url)}
}

export class Inf extends jnp.Predecl {
  reqName() {return `Infinity`}
  ownVal() {return Infinity}
  static {this.setReprModuleUrl(import.meta.url)}
}

export class Global extends jnp.Predecl {
  reqName() {return `globalThis`}
  ownVal() {return globalThis}
  static {this.setReprModuleUrl(import.meta.url)}
}
