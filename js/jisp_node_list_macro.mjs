import * as a from '/Users/m/code/m/js/all.mjs'
import * as jn from './jisp_node.mjs'
import * as jnnl from './jisp_node_node_list.mjs'

/*
Base class for macro-style `Node` classes that expect to replace an entire
`DelimNodeList` that contains a reference to the macro, rather than only the
referencing identifier.
*/
export class ListMacro extends jnnl.NodeList {
  /*
  Override for `MixOwnNodeSourced` used by the base class `Node`. This method
  should be invoked in preparation for replacing a previous node, and before
  invoking this node's `.macro` method, as part of recursive macroing. See
  functions `macroNode` and `replaceNode`.
  */
  setSrcNode(src) {
    const errer = this.optSpan()
      ? this
      : a.isInst(src, jn.Node) && src.optSpan()
      ? src
      : this

    const cls = jnnl.NodeList
    if (!a.isInst(src, cls)) {
      throw errer.err(`${a.show(this)} expected the source node to be an instance of ${a.show(cls)}, got ${a.show(src)}`)
    }

    /*
    TODO consider if we should copy children or reuse the child array without
    copying. The copying has a performance cost but also some minor advantages.
    If this macro class changes the list structure during macroing, this allows
    the original source list node to retain the original structure. Benefits
    include allowing `.optSpan` and `.decompile` to work properly.

    The implementation of `.setChildren` should also change each child's parent
    to the current node, which is essential for some of our functionality, such
    as statement / expression detection. See `Node..isStatement` and
    `Node..isChildStatement`. Note that unlike the DOM API, our AST is more
    loose about parent-child or child-parent relations, sometimes allowing them
    to be unilateral. In particular, this call should change the parent of all
    these children, but without removing them from their original parent which
    is the source list in question.
    */
    this.setChildren(...src.childIter())

    return super.setSrcNode(src)
  }

  // TODO consider moving to `MixParentOneToMany` or `NodeList`.
  reqChildInstAt(ind, cls) {
    const out = this.reqChildAt(ind)
    if (a.isInst(out, cls)) return out
    throw out.err(`${a.show(this)} expected the child node at index ${ind} to be an instance of ${a.show(cls)}, found ${a.show(out)}`)
  }

  // TODO consider moving to `MixParentOneToMany` or `NodeList`.
  optChildInstAt(ind, cls) {
    const out = this.optChildAt(ind)
    if (a.isNil(out)) return undefined
    if (a.isInst(out, cls)) return out
    throw out.err(`${a.show(this)} expected the child node at index ${ind} to be either nil or an instance of ${a.show(cls)}, found ${a.show(out)}`)
  }

  // TODO consider supporting variadic input, for cases like `MethodFunc`.
  reqParentMatch(cls) {
    this.req(cls, a.isCls)
    const tar = this.reqParent()
    if (a.isInst(tar, cls)) return tar
    throw this.err(`${a.show(this)} requires its immediate parent to be an instance of ${a.show(cls)}, got parent ${a.show(tar)}`)
  }
}
