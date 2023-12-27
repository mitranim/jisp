import * as jnp from './jisp_node_predecl.mjs'

export class Inf extends jnp.Predecl {
  getCompiledName() {return `Infinity`}
  ownVal() {return Infinity}
}
