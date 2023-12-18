import * as a from '/Users/m/code/m/js/all.mjs'
import * as jc from './jisp_conf.mjs'
import * as jm from './jisp_misc.mjs'

export class Err extends Error {
  get name() {return this.constructor.name}
}

export class CodeErr extends Err {
  constructor(msg, {cause, span}) {
    super(jm.joinLines(a.reqStr(msg), span?.context?.()), {cause})
    this.msg = msg
    this.span = span
  }

  static atNode(node, msg) {return new this(msg, {span: node.optSpan()})}
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

      // Technically unnecessary because this doesn't produce exceptions on
      // class mismatch. Provided for API consistency.
      asOnlyInst(cls) {return a.onlyInst(this, cls)}

      // TODO better naming.
      withToErr(method) {
        try {
          const val = method.call(this)
          if (a.isPromise(val)) return this.withToErrAsync(val)
          return val
        }
        catch (err) {throw this.toErr(err)}
      }

      // TODO better naming.
      withToErrSync(method) {
        try {return method.call(this)}
        catch (err) {throw this.toErr(err)}
      }

      // TODO better naming.
      async withToErrAsync(val) {
        if (jc.conf.getDebug()) this.req(val, a.isPromise)
        try {return await val}
        catch (err) {throw this.toErr(err)}
      }
    }
  }
}
