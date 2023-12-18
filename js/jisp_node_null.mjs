import * as jnp from './jisp_node_predecl.mjs'

export class Null extends jnp.Predecl {
  getCompiledName() {return `null`}
  ownVal() {return null}
}
