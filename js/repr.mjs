import * as a from '/Users/m/code/m/js/all.mjs'
import * as je from './err.mjs'

/*
This file defines internal utils related to representing JS objects as JS code.
The term "repr" stands for "representation". We're borrowing this particular
term from Python, because the analogous term in Lisp is simply "printing",
which is insufficiently descriptive for our purposes.

Representing JS objects as JS code is necessary for Lisp-style quoting. Macro
code that uses quoting needs to be compiled to JS code that constructs objects
used in our AST. Unlike traditional Lisps, our system builds the AST out of
specialized objects which can't be serialized and deserialized as plain data.
Examples include `Span` and various subclasses of `Node`. When we compile code
that uses quoting, the resulting JS code must contain constructor and builder
calls for our specialized classes.
*/

export class MixRepr extends a.DedupMixinCache {
  static make(cls) {
    return class MixRepr extends je.MixErrer.goc(cls) {
      /*
      This line must be EXACTLY copy-pasted into EVERY descendant class.

      This property, when defined correctly, allows us to automatically import
      the current class into any generated code that uses this class. More
      precisely, it allows us to generate an import statement with the address
      of the file where the current class is defined. We assume that every
      descendant class is exported by its source file, under the same name.

      To ensure that this property is defined correctly, we require it to be
      "own". If the property is inherited, we assume that this line wasn't
      copy-pasted correctly, and reject it. See below.

      Copy-paste this: ↓↓↓

        static {this.setReprModuleUrl(import.meta.url)}
      */

      static setReprModuleUrl(val) {
        a.priv(this, `reprModuleUrl`, a.reqValidStr(val))
      }

      reqReprModuleUrl() {
        const con = this.constructor
        const key = `reprModuleUrl`
        const out = con[key]

        if (!a.hasOwn(con, key)) {
          throw this.err(`expected ${a.show(con)} to have own module URL, found inherited value ${a.show(out)}`)
        }
        if (!a.isValidStr(out)) {
          throw this.err(`expected ${a.show(con)} to have non-empty module URL string, got ${a.show(out)}`)
        }
        return out
      }

      // Override in subclass as necessary.
      compileRepr() {
        return `new ${a.reqStr(this.reqReprConstructor())}()`
      }

      reqReprConstructor() {
        return a.inter(this.reqReprImportName(), `.`, this.constructor.name)
      }

      // Must be set by callers such as `Node`.
      #reprImportName = undefined
      setReprImportName(val) {return this.#reprImportName = this.req(val, a.isValidStr), this}
      optReprImportName() {return this.#reprImportName}
      reqReprImportName() {return this.optReprImportName() ?? this.throw(`missing name of module import at ${a.show(this)}`)}
    }
  }
}
