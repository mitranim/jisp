import * as jnp from './jisp_node_predecl.mjs'

export class Nil extends jnp.Predecl {
  getCompiledName() {return `undefined`}
  ownVal() {return undefined}
}
