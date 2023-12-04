import * as a from '/Users/m/code/m/js/all.mjs'
import * as jp from './jisp_parent.mjs'
import * as jn from './jisp_node.mjs'

export class NodeList extends jp.MixParent.goc(jn.Node) {
  #nodes = undefined
  ownNodes() {return this.#nodes ??= []}
  optNodes() {return this.#nodes}
  hasNodes() {return !!this.#nodes?.length}
  setNodes(val) {
    this.#nodes = this.req(val, a.isTrueArr)
    for (val of val) this.toValidChild(val)
    return this
  }

  // Standard JS iterable interface.
  [Symbol.iterator]() {return this.ownNodes()[Symbol.iterator]()}

  // Compatibility with common JS interfaces.
  get size() {return this.nodesLen()}

  // Secret interface in `@mitranim/js`.`iter.mjs`.
  toArray() {return this.ownNodes()}

  // For our own use. Less error prone than property getters.
  nodesLen() {return this.ownNodes()?.length}

  // Override for `MixParent`.
  toValidChild(val) {return super.toValidChild(this.reqInst(val, jn.Node))}
  toValidChildBase(val) {return super.toValidChild(val)}

  addNode(val) {return this.ownNodes().push(this.toValidChild(val)), this}

  optHead() {return this.optNodes()?.[0]}
  reqHead() {return this.optHead() ?? this.throw(`missing first element in list ${a.show(this)}`)}

  optLast() {return a.last(this.optNodes())}
  reqLast() {return this.optLast() ?? this.throw(`missing last element in list ${a.show(this)}`)}

  optSpan() {
    return (
      super.optSpan() ??
      this.Span.optRange(this.optHead()?.optSpan(), this.optLast()?.optSpan())
    )
  }

  reqLen(exp) {
    this.req(exp, a.isNat)
    const len = this.nodesLen()
    if (exp !== len) {
      throw this.err(`expected exactly ${exp} elements in ${a.show(this)}, got ${len}`)
    }
    return this
  }

  reqLenMin(exp) {
    this.req(exp, a.isNat)
    const len = this.nodesLen()
    if (!(exp <= len)) {
      throw this.err(`expected at least ${exp} elements in ${a.show(this)}, got ${len}`)
    }
    return this
  }

  reqLenMax(exp) {
    this.req(exp, a.isNat)
    const len = this.nodesLen()
    if (!(len <= exp)) {
      throw this.err(`expected no more than ${exp} elements in ${a.show(this)}, got ${len}`)
    }
    return this
  }

  reqLenBetween(min, max) {
    this.req(min, a.isNat)
    this.req(max, a.isNat)
    const len = this.nodesLen()
    if (!(min <= len) || !(len <= max)) {
      throw this.err(`expected between ${min} and ${max} elements in ${a.show(this)}, got ${len}`)
    }
    return this
  }

  macroFrom(ind) {
    this.req(ind, a.isNat)
    while (ind < this.nodesLen()) this.macroAt(ind++)
    return this
  }

  macroAt(ind) {
    this.req(ind, a.isNat)
    const tar = this.ownNodes()
    const len = tar.length

    if (ind >= 0 && ind < len) {
      return tar[ind] = jn.Node.macroNode(tar[ind])
    }
    throw this.err(`index ${ind} out of bounds for length ${len}`)
  }

  static fromNodes(src) {return new this().setNodes(src)}
}
