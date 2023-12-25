import * as a from '/Users/m/code/m/js/all.mjs'
import * as jnnl from './jisp_node_node_list.mjs'

/*
Base class for macro-style `Node` classes that expect to replace an entire
`DelimNodeList` that contains a reference to the macro, rather than only the
referencing identifier.
*/
export class ListMacro extends jnnl.NodeList {
  /*
  Override for `Node.macroSrcCls`. Indicates the base class for the input
  that must be replaced by this node. Used by `DelimNodeList..macroImpl`.
  */
  static macroSrcCls() {return jnnl.NodeList}

  /*
  Override for `MixOwnNodeSourced` used by the base class `Node`. This method is
  invoked in preparation for replacing a previously-existing AST node with this
  node, and before invoking this node's `.macro` method.
  */
  setSrcNode(src) {
    const cls = this.constructor.macroSrcCls()
    if (!a.isSubCls(cls, jnnl.NodeList)) {
      throw this.err(`internal error: the superclass ${a.show(ListMacro)} assumes all subclasses to use instances of ${a.show(jnnl.NodeList)} as their source node, but macro node ${a.show(this)} expects to use ${a.show(cls)} which may not be a node list`)
    }
    if (!a.isInst(src, cls)) {
      throw this.err(`${a.show(this)} requires the source node to be an instance of ${a.show(cls)}, got ${a.show(src)}`)
    }

    /*
    TODO consider if we can avoid copying children. This has a performance cost
    but also some minor advantages. If this macro class changes the list
    structure during macroing, this allows the original source list node to
    retain the original structure. Benefits include allowing `.optSpan` and
    `.decompile` to work properly.

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
    throw out.err(`${a.show(this)} requires the child node at index ${ind} to be an instance of ${a.show(cls)}, found ${a.show(out)}`)
  }

  // TODO consider moving to `MixParentOneToMany` or `NodeList`.
  optChildInstAt(ind, cls) {
    const out = this.optChildAt(ind)
    if (a.isNil(out)) return undefined
    if (a.isInst(out, cls)) return out
    throw out.err(`${a.show(this)} requires the child node at index ${ind} to be either nil or an instance of ${a.show(cls)}, found ${a.show(out)}`)
  }
}

function isInstSome(val, ...cls) {
  for (cls of cls) if (a.isInst(val, cls)) return true
  return false
}
