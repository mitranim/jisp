import * as jnp from './jisp_node_predecl.mjs'

export class Ok extends jnp.Predecl {
  static getCompiledName() {return `true`}
  ownVal() {return true}
}
