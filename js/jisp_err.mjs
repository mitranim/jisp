import * as a from '/Users/m/code/m/js/all.mjs'

export class Err extends Error {
  get name() {return this.constructor.name}
}

export class CodeErr extends Err {
  constructor({msg, span, cause}) {
    super(joinLines(a.reqStr(msg), span?.context?.()), {cause})
    this.msg = msg
    this.span = span
  }

  static atNode(node, msg) {return new this({msg, span: node.optSpan()})}
}

/*
Provides shortcuts for throwing errors with additional contextual information,
such as errors pointing to source code.

TODO drop this from all non-Node types. (Why?)
*/
export class MixErrer extends a.DedupMixinCache {
  static make(cls) {
    return class MixErrer extends cls {
      // Subclasses should override this to create errors with contextual
      // information, such as references to source code.
      err(...val) {return super.err?.(...val) || new Err(...val)}

      // Useful in expressions. Prefer normal `throw` in statements.
      throw(...val) {throw this.err(...val)}

      // Like `a.req` but using `this.err` for context.
      req(val, fun) {
        if (fun(val)) return val
        throw this.err(a.msgFun(val, fun))
      }

      // Like `a.reqInst` but using `this.err` for context.
      reqInst(val, cls) {
        if (a.isInst(val, cls)) return val
        throw this.err(a.msgInst(val, cls))
      }

      // Shortcut for "downcasting" the instance into one of its superclasses.
      asReqInst(cls) {return this.reqInst(this, cls)}
    }
  }
}