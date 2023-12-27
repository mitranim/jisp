import * as jnp from './jisp_node_predecl.mjs'

export class Nan extends jnp.Predecl {
  getCompiledName() {return `nan`}
  ownVal() {return NaN}
}
