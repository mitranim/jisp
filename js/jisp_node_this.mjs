import * as jnp from './jisp_node_predecl.mjs'

export class This extends jnp.Predecl {
  getCompiledName() {return `this`}
}
