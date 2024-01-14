import {a} from './dep.mjs'

/*
Base class for iterable objects. Provides shortcuts that make it easier to
implement iteration.
*/
export class Iter extends a.Emp {
  // Part of standard JS iteration protocol.
  [Symbol.iterator]() {return this}

  // Part of standard JS iteration protocol.
  done = false

  // Part of standard JS iteration protocol.
  value = undefined

  init() {
    this.done = false
    this.value = undefined
    return this
  }

  next() {
    while (this.more()) {
      const val = this.step()
      this.value = val
      if (a.isSome(val)) return this
    }
    this.done = true
    return this
  }

  /*
  Override in subclass.

  This is called `.more` rather than `.hasMore` because some iterators may want
  to perform side effects in this method. A non-boolean name indicates this
  possibility.
  */
  more() {return false}

  // Override in subclass.
  step() {
    this.done = true
    return undefined
  }

  toArray() {return [...this]}
}
