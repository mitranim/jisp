import * as jnp from './jisp_node_predecl.mjs'

export class No extends jnp.Predecl {
  getCompiledName() {return `false`}
  ownVal() {return false}
}
