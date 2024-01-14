import * as a from '/Users/m/code/m/js/all.mjs'
import * as jc from './conf.mjs'
import * as jm from './misc.mjs'

export class Err extends Error {
  /*
  Workaround for a bug in some JS engines. Allows error messages to properly
  include the name of the current error class, in a way that works for
  subclasses. Without this override, in some JS engines, error name is always
  `Error`. This includes `Deno` at the time of writing, version `1.24.3`.
  */
  get name() {return this.constructor.name}

  /*
  Should be used to indicate that the error message includes references to
  relevant source code. This flag may be used to decide whether to "upgrade"
  one error to another when additional context is available.

  Indicating this by a dedicated error class would be "cleaner", but would make
  error-generating code more awkward because references to source code tend to
  be optional. We'd have to choose the right error class based on whether or
  not we have access to source code. Not so clean after all.
  */
  hasCode = false
  setHasCode(val) {return this.hasCode = a.reqBool(val), this}
  optHasCode() {return this.hasCode}

  static fromNode(node, msg, opt) {
    return this.fromSpan(node?.optSpan(), msg, opt)
  }

  static fromSpan(span, msg, opt) {
    if (a.isNil(span)) return new this(msg, opt)

    const ctx = span.context()
    if (!a.optStr(ctx)) return new this(msg, opt)

    return new this(jm.joinParagraphs(msg, ctx), opt).setHasCode(true)
  }
}

// Placed here, rather than in the tokenizer file, to minimize cyclic imports.
export class TokenizerErr extends Err {}

// Placed here, rather than in the lexer file, to minimize cyclic imports.
export class LexerErr extends Err {}

/*
Provides shortcuts for throwing errors with additional contextual information,
such as errors pointing to source code.

TODO drop this from all non-Node types. (Why?)
*/
export class MixErrer extends a.DedupMixinCache {
  static make(cls) {
    return class MixErrer extends cls {
      /*
      Subclasses should override this to create errors with contextual
      information, such as references to source code.
      */
      err(...val) {return super.err?.(...val) || Error(...val)}

      /*
      Subclasses may override this to convert existing errors by adorning them
      with additional context, when possible.
      */
      errFrom(err) {return err}

      errMeth(name) {throw this.err(jm.msgMeth(name, this))}

      // Useful in expressions. Prefer normal `throw` in statements.
      throw(...val) {throw this.err(...val)}

      // Like `a.req` but using `this.err` for context.
      req(val, fun) {
        if (fun(val)) return val
        throw this.err(a.msgFun(val, fun))
      }

      // Like `a.opt` but using `this.err` for context.
      opt(val, fun) {
        if (a.isNil(val)) return undefined
        return this.req(val, fun)
      }

      // Like `a.optInst` but using `this.err` for context.
      optInst(val, cls) {
        if (a.isNil(val)) return undefined
        return this.reqInst(val, cls)
      }

      // Like `a.reqInst` but using `this.err` for context.
      reqInst(val, cls) {
        if (a.isInst(val, cls)) return val
        throw this.err(a.msgInst(val, cls))
      }

      /*
      Ensures that the current object is of the given class. Used for
      downcasting / upcasting.
      */
      asReqInst(cls) {return this.reqInst(this, cls)}

      /*
      Technically unnecessary because this doesn't produce exceptions on class
      mismatch. Provided for consistency with `.asReqInst`.
      */
      asOnlyInst(cls) {return a.onlyInst(this, cls)}

      // TODO better naming.
      withErr(val) {
        if (a.isPromise(val)) return this.withErrAsync(val)
        return val
      }

      // TODO better naming.
      async withErrAsync(val) {
        try {return await val}
        catch (err) {throw this.errFrom(err)}
      }
    }
  }
}
