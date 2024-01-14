import * as a from '/Users/m/code/m/js/all.mjs'
import * as jn from './node.mjs'
import * as jnnl from './node_node_list.mjs'

/*
Base class for macro-style `Node` classes intended for list-style calling.
The typical input (source node) for such macros is `DelimNodeList`.
Compare the base class `BareMacro` intended for bare-style calling.
Note that it's possible for one macro class to implement both styles.
*/
export class ListMacro extends jnnl.NodeList {
  /*
  This optional method is used by `DelimNodeList` to detect macro classes with
  support for list-style calling.
  */
  static macroList(src) {
    a.reqInst(src, jn.Node)

    const cls = jnnl.NodeList
    if (!a.isInst(src, cls)) {
      throw src.err(`${a.show(this)} expected the source node to be an instance of ${a.show(cls)}, got ${a.show(src)}`)
    }

    /*
    The implementation of `.setChildArr` must also change each child's parent
    to the new parent node we're constructing, which is essential for some of
    our functionality, such as statement / expression detection. For some use
    cases, see `Node..isStatement` and `Node..isChildStatement`. Note that
    unlike the DOM API, our AST is more loose about parent-child or
    child-parent relations, sometimes allowing them to be unilateral. In
    particular, this call should change the parent of all these children, but
    without removing them from their original parent which is the source list
    in question.
    */
    return new this().setChildArr(src.optChildSlice(1))
  }

  static {this.setReprModuleUrl(import.meta.url)}
}
