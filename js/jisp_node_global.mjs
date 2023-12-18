import * as jnp from './jisp_node_predecl.mjs'

export class Global extends jnp.Predecl {
  getCompiledName() {return `globalThis`}
  ownVal() {return globalThis}
}
