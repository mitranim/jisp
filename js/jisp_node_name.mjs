import * as a from '/Users/m/code/m/js/all.mjs'
import * as jnd from './jisp_named.mjs'
import * as jni from './jisp_node_ident.mjs'

/*
Base class for node types representing ???

FIXME: how exactly is this supposed to be different from an identifier?

FIXME: restructure / merge with `Ident`.
*/
export class Name extends jnd.MixNamed.goc(jni.Ident) {
  ownName() {throw errMeth(`ownName`, this)}
}
