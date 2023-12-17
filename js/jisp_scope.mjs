import * as a from '/Users/m/code/m/js/all.mjs'
import * as je from './jisp_err.mjs'
import * as jch from './jisp_child.mjs'
import * as jns from './jisp_ns.mjs'
import * as jlns from './jisp_lex_nsed.mjs'
import * as jpns from './jisp_pub_nsed.mjs'

/*

FIXME:

  * Remove the reified abstraction "scope".
  * Remove the reified abstraction "pub NS".
  * Everything that's currently "own scoped" becomes "own lex NSed".
  * The notion of a "scope" becomes emergent (from nodes having own lex NS).
  * The current use of pub NS as mixins of lex NS is mostly preserved, as in,
    the mixins are still there, but they're no longer pub NSes, and they don't
    provide decls.

*/

export class ScopeErr extends je.Err {}

/*
Base class for various scope implementations.

Some AST nodes, such as `Module` or `Fn`, have a scope. Each scope has multiple
namespaces. Depending on scope type, some namespaces may or may not be present.
Consumers such as name-declaring macros `Const` or `Fn` must look for the
nearest ancestor scope and request specific namespaces from that scope. If a
scope is found but a required namespace is missing, a consumer must produce a
descriptive exception, instead of continuing the search across the ancestor
hierarchy.

Cautionary note. This is called "scope" because in our system, the concepts of
scope definition and scope instance are not distinct. Each instance of this
class is simultaneously a DEFINITION of a runtime scope, and an INSTANCE of a
compile-time scope.

FIXME remove. See above.
*/
export class Scope extends jch.MixChild.goc(a.Emp) {
  // For `MixErrer`.
  err(...val) {return new ScopeErr(...val)}

  ownLexNs() {}
  optLexNs() {}
  reqLexNs() {return this.optLexNs() ?? this.throw(`missing lexical namespace at ${a.show(this)}`)}

  ownPubNs() {}
  optPubNs() {}
  reqPubNs() {return this.optPubNs() ?? this.throw(`missing public namespace at ${a.show(this)}`)}
}

/*
Should be used by AST nodes that define an "intangible" lexical scope for inner
code without public exports: blocks, function bodies, loop bodies, and more.

FIXME remove. See above.
*/
export class LexScope extends jlns.MixLexNsed.goc(Scope) {}

/*
Should be used by AST nodes that define a tangible namespace for public exports
without a lexical scope for inner code: dict literals, class statics, class
prototypes.

FIXME use for `TarModule` and others.

FIXME remove. See above.
*/
export class PubScope extends jpns.MixPubNsed.goc(Scope) {}

/*
Should be used by AST nodes that provide a lexical scope for inner code and a
tangible namespace for public exports. Currently only modules support this.
See `ModuleScope`.

FIXME remove. See above.
*/
export class FullScope extends jpns.MixPubNsed.goc(jlns.MixLexNsed.goc(Scope)) {}

// FIXME remove. See above.
export class ModuleScope extends FullScope {
  makeLexNs() {return super.makeLexNs().addMixin(jns.Ns.ownPredecl())}
}
