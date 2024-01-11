import * as a from '/Users/m/code/m/js/all.mjs'
import * as jpn from './jisp_parent_node.mjs'
import * as jn from './jisp_node.mjs'

export class NodeList extends jpn.MixParentNodeOneToMany.goc(jn.Node) {
  /*
  This class should avoid defining `.macro`. It should use `Node`'s default
  implementation that throws an exception. That's because different subclasses
  of this class have different notions of how macroing should work. Having a
  working default implementation would produce unexpected or confusing behavior
  when a subclass doesn't have a sensible override. This is particularly
  notable for subclasses of `ListMacro`.

  macro() {throw this.errMeth(`macro`)}
  */

  static reprModuleUrl = import.meta.url
}
