import * as jnp from './jisp_node_predecl.mjs'

export class Nil extends jnp.Predecl {
  getCompiledName() {return `undefined`}
  ownVal() {return undefined}
}

export class Null extends jnp.Predecl {
  getCompiledName() {return `null`}
  ownVal() {return null}
}

export class No extends jnp.Predecl {
  getCompiledName() {return `false`}
  ownVal() {return false}
}

export class Ok extends jnp.Predecl {
  getCompiledName() {return `true`}
  ownVal() {return true}
}

export class Nan extends jnp.Predecl {
  getCompiledName() {return `nan`}
  ownVal() {return NaN}
}

export class Inf extends jnp.Predecl {
  getCompiledName() {return `Infinity`}
  ownVal() {return Infinity}
}

export class Global extends jnp.Predecl {
  getCompiledName() {return `globalThis`}
  ownVal() {return globalThis}
}
