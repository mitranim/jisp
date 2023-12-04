import * as a from '/Users/m/code/m/js/all.mjs'

export function preview(src) {return a.ell(src, 128)}

// FIXME rename to `compile`.
export function toJs(val) {return a.laxStr(val?.toJs())}

// FIXME rename to `decompile`.
export function toSrc(val) {return a.laxStr(val?.toSrc())}

export class Err extends Error {
  get name() {return this.constructor.name}
}

/*
FIXME:

  * Compute "row:col".
    * Unicode chars rather than UTF-16.
  * Better preview.
  * Use indentation.
  * Consider extending `SyntaxError` for tokenizer and lexer errors.
    * Requires a mixin because other errors should not extend `SyntaxError`.
*/
export class PositionError extends Err {
  constructor({msg, pos, src, cause}) {
    a.reqStr(msg)
    a.reqNat(pos)
    a.reqStr(src)
    a.optInst(cause, Error)

    super(joinLines(
      a.reqStr(msg),
      `character position (UTF-16): ${a.reqNat(pos)}`,
      a.optStr(src) && `source: ` + preview(src.slice(pos)),
    ), {cause: a.optInst(cause, Error)})

    this.msg = msg
    this.pos = pos
    this.src = src
  }
}

export class TokenizerError extends PositionError {}

export class SpanError extends PositionError {
  constructor({msg, span, cause}) {
    super({msg, pos: span.getPos(), src: span.getSrc(), cause})
    this.span = span
  }
}

export class LexerError extends SpanError {}

export class Span extends a.Emp {
  src = ``
  getSrc() {return this.src}
  setSrc(val) {return this.src = a.reqStr(val), this}

  pos = 0
  getPos() {return this.pos}
  setPos(val) {return this.pos = a.reqNat(val), this}
  nextPos() {return this.pos + this.len}

  len = 0
  getLen() {return this.len}
  setLen(val) {return this.len = a.reqNat(val), this}
  hasLen() {return this.len > 0}
  isEmpty() {return !this.hasLen()}

  slice() {return this.src.slice(this.pos, this.pos + this.len)}

  clone() {
    return new this.constructor()
      .setSrc(this.src)
      .setPos(this.pos)
      .setLen(this.len)
  }

  static range(begin, end) {
    return new this()
      .setSrc(begin.getSrc())
      .setPos(begin.getPos())
      .setLen(end.nextPos() - begin.getPos())
  }
}

/*
Implementation notes:

  * In JS, reifying intermediary arrays and operating on them tends to be
    significantly faster than using iterators. Reified values also have more
    flexibility. For example you can peek and seek on reified values, but not
    on iterators. For all these reasons, some of our code may reify an iterator
    instead of operating on a stream.

  * The `.src` field may be a string or an array.

  * This doesn't provide methods that access individual elements by index,
    because it would be an antipattern for strings. UTF-16 strings may contain
    surrogate pairs, where one character uses multiple UTF-16 code points.
*/
export class Iter extends a.Emp {
  [Symbol.iterator]() {return this}

  src = undefined
  getSrc() {return this.src}
  setSrc(val) {return this.src = val, this}

  pos = 0
  getPos() {return this.pos}
  setPos(val) {return this.pos = a.reqNat(val), this}

  toArray() {return [...this]}
  init(src) {return this.setSrc(src).setPos(0)}
  more() {return this.pos < this.src.length}
  skip(len) {return this.pos += a.reqIntPos(len), this}
  rem() {return this.remAt(this.pos)}
  remAt(pos) {return this.src.slice(a.reqNat(pos))}
  step() {this.pos++}
  discard() {return false}

  done = false
  value = undefined

  next() {
    while (this.more()) {
      this.value = this.step()
      if (!this.discard(this.value)) return this
    }
    this.done = true
    return this
  }
}

export class Tokenizer extends Iter {
  src = ``
  setSrc(val) {return super.setSrc(a.reqStr(val))}

  nextOpt() {
    return (
      BracketPre.parse(this) ||
      BracketSuf.parse(this) ||
      ParenPre.parse(this) ||
      ParenSuf.parse(this) ||
      BracePre.parse(this) ||
      BraceSuf.parse(this) ||
      Space.parse(this) ||
      Comment.parse(this) ||
      Num.parse(this) ||
      StrGrave.parse(this) ||
      StrDouble.parse(this) ||
      Nil.parse(this) ||
      Null.parse(this) ||
      False.parse(this) ||
      True.parse(this) ||
      Ident.parse(this) ||
      undefined
    )
  }

  step() {
    const pos = this.pos
    const node = this.nextOpt()
    this.found(pos, node)

    // TODO move this to `Node.parse` for consistency with `NodeList.lex`.
    this.skip(node.getSpan().getLen())

    this.advanced(pos, node)
    return node
  }

  span(len) {
    return new Span()
      .setSrc(this.getSrc())
      .setPos(this.getPos())
      .setLen(len)
  }

  discard(val) {return !isNodeMeaningful(val)}

  found(pos, node) {
    if (node) return

    throw new TokenizerError({
      msg: `unrecognized syntax`,
      pos,
      src: this.remAt(pos),
    })
  }

  advanced(pos, node) {
    if (this.pos > pos) return

    throw new TokenizerError({
      msg: `failed to advance position at node ${a.show(node)}`,
      pos,
      src: this.remAt(pos),
    })
  }
}

export class Lexer extends Iter {
  setSrc(val) {return super.setSrc(a.toTrueArr(val))}
  head() {return this.src[this.pos]}
  last() {return this.src[this.src.length - 1]}
  headPop() {return this.src[this.pos++]}
  nextPop() {return this.nextOpt() || this.headPop()}

  nextOpt() {
    return (
      Brackets.lex(this) ||
      Parens.lex(this) ||
      Braces.lex(this) ||
      undefined
    )
  }

  step() {
    const pos = this.pos
    const node = this.nextPop()
    this.advanced(pos, node)
    return node
  }

  advanced(pos, node) {
    if (this.pos > pos) return

    throw new LexerError({
      msg: `failed to advance position at node ${a.show(node)}`,
      span: node.getSpan(),
    })
  }
}

export class Node extends a.MixChild(a.Emp) {
  span = undefined
  getSpan() {return this.span}
  setSpan(val) {return this.span = a.reqInst(val, Span), this}
  gocSpan() {return this.span ||= new Span()}

  err(msg, cause) {return new SpanError({msg, span: this.getSpan(), cause})}
  fromNode(src) {return this.setSpan(src.getSpan()).setParent(src.getParent())}
  reqInst(cls) {return a.reqInst(this, cls)}
  optInst(cls) {return a.optInst(this, cls)}
  onlyInst(cls) {return a.onlyInst(this, cls)}
  toSrc() {throw errMeth(`toSrc`, this)}
  toJs() {throw errMeth(`toJs`, this)}

  matchAncestor(cls) {
    a.reqCls(cls)
    return this.findAncestor(function matchNode(val) {return a.isInst(val, cls)})
  }

  findAncestor(fun) {
    a.reqFun(fun)
    let node = this
    while ((node = node.getParent())) if (fun(node)) return node
    return undefined
  }

  optScope() {return this.findAncestor(hasScope)?.scope}

  reqScope() {
    const out = this.optScope()
    if (!out) throw this.err(`expected an enclosing scope for ${a.show(this)}, found none`)
    return out
  }

  /*
  Requires `.pk()`, which is implemented by some subclasses such as `Ident`.
  For nodes without `.pk()`, this causes an exception.
  */
  define() {return new DynDef().fromNode(this).addToScope()}

  // Potential bottleneck, TODO profile.
  getPrn() {return this.findAncestor(hasPrn)?.prn}

  macro() {return this}

  // Override in subclass.
  static parse() {throw errMeth(`parse`, this)}

  static macroNode(node) {
    while (node) {
      const prev = node
      node = node.macro() ?? new Empty()
      if (prev === node) break
      node = node.fromNode(prev)
    }
    return node
  }
}

function hasScope(val) {return !!val.scope}
function hasPrn(val) {return !!val.prn}
function joinLines(...val) {return a.joinLinesOptLax(val)}

export class Empty extends Node {toJs() {return ``}}

export class Text extends Node {
  getSrc() {return a.laxStr(this.src)}
  setSrc(val) {return this.src = a.reqStr(val), this}
  srcLen() {return this.getSrc().length}
  fromMatch(mat) {return this.setSrc(mat[0])}
  withSpan(tok) {return this.setSpan(tok.span(this.srcLen()))}
  toSrc() {return this.getSrc()}
  toJs() {return this.getSrc()}

  static match(src) {return this.reg().exec(a.reqStr(src))}

  static parse(tok) {
    const mat = this.match(tok.rem())
    if (!mat) return undefined
    return new this().fromMatch(mat).withSpan(tok)
  }
}

/*
Intended for AST nodes whose source code is fixed: predeclared identifiers,
operators, and punctuation.
*/
export class FixedText extends Text {
  // Override in subclass.
  static getSrc() {throw errMeth(`getSrc`, this)}
  getSrc() {return this.constructor.getSrc()}
}

// Compare `PredeclIdent` which has stricter termination rules.
export class Delim extends FixedText {
  static parse(tok) {
    const exp = this.getSrc()
    if (!hasPre(tok.rem(), exp)) return undefined
    return new this().withSpan(tok)
  }
}

function hasPre(str, pre) {
  return !!a.optStr(pre) && a.reqStr(str).startsWith(pre)
}

export class BracketPre extends Delim {static getSrc() {return `[`}}
export class BracketSuf extends Delim {static getSrc() {return `]`}}
export class ParenPre extends Delim {static getSrc() {return `(`}}
export class ParenSuf extends Delim {static getSrc() {return `)`}}
export class BracePre extends Delim {static getSrc() {return `{`}}
export class BraceSuf extends Delim {static getSrc() {return `}`}}

export class Space extends Text {
  static reg() {return /^\s+/}
}

export class Comment extends Text {
  static reg() {return /^;([^\n\r]*)(\r\n|\r|\n|$)/}

  body = ``
  term = ``

  fromMatch(mat) {
    super.fromMatch(mat)
    this.body = mat[1]
    this.term = mat[2]
    return this
  }

  toJs() {return `//` + a.reqStr(this.body) + a.reqStr(this.term)}
}

/*
FIXME consider subclassing `ValNode`.

Similar to `Delim`, but with stricter termination rules.
*/
export class PredeclIdent extends FixedText {
  static parse(tok) {
    const exp = this.getSrc()
    const rem = tok.rem()
    if (!hasPre(rem, exp)) return undefined

    // Valid identifier not identical to the predeclared word.
    if (/^[\w$]/.test(rem.slice(exp.length))) return undefined

    return new this().withSpan(tok)
  }
}

/*
FIXME:

  * Subclasses of `ValNode`:
    * `Nil`
    * `Null`
    * `Bool`
    * `Str`
    * `Num`
*/
export class ValNode extends Node {
  val = undefined
  getVal() {return this.val}
  setVal(val) {return this.val = val, this}
  toJs() {return this.constructor.toJs(this, this.getVal())}

  static toJs(node, val) {
    if (a.isNil(val) || a.isBool(val) || a.isNum(val)) return String(val)
    if (a.isStr(val)) return JSON.stringify(val)
    if (a.isTrueArr(val)) return this.toJsArr(node, val)
    if (a.isDict(val)) return this.toJsDict(node, val)
    throw node.err(`unable to serialize ${a.show(val)} as JS code; currently supported types: nil, bool, num, str, plain array, plain dict`)
  }

  static toJsArr(node, val) {
    let out = `[`
    let first = true

    for (val of a.reqTrueArr(val)) {
      if (first) first = false
      else out += `, `

      out += this.toJs(node, val)
    }

    out += `]`
    return out
  }

  static toJsDict(node, val) {
    let out = `{`
    let first = true

    for (const key of Object.keys(a.reqDict(val))) {
      if (first) first = false
      else out += `, `

      out += Ident.toValidDictKey(key)
      out += `: `
      out += this.toJs(node, val[key])
    }

    out += `}`
    return out
  }
}

export function MixWrapperNode(cls) {return MixWrapperNodeCache.goc(cls)}

export class MixWrapperNodeCache extends a.WeakCache {
  make(cls) {
    return class MixWrapperNodeCls extends super.make(cls) {
      src = undefined
      getSrc() {return this.src}
      setSrc(val) {return this.src = a.reqInst(val, Node), this}
      toSrc() {return toSrc(this.src)}
      fromNode(src) {return this.setSrc(src), super.fromNode(src)}
      srcNodes() {return a.reqTrueArr(this.src.nodes())}
      srcMeaningfulNodes() {return a.reqTrueArr(this.src.meaningfulNodes())}
    }
  }
}

export class SrcValNode extends MixWrapperNode(ValNode) {}

// FIXME subclass `ValNode`.
export class Nil extends PredeclIdent {
  static getSrc() {return `nil`}
  toJs() {return `undefined`}
}

// FIXME subclass `ValNode`.
export class Null extends PredeclIdent {static getSrc() {return `null`}}

// FIXME subclass `ValNode`.
export class Bool extends PredeclIdent {}

// FIXME subclass `ValNode`.
// FIXME `no`.
export class False extends Bool {static getSrc() {return `false`}}

// FIXME subclass `ValNode`.
// FIXME `ok`.
export class True extends Bool {static getSrc() {return `true`}}

// FIXME subclass `ValNode`.
export class Num extends Text {
  /*
  FIXME:

    * Support exponents.
  */
  static reg() {return /^-?\d+(_\d+)*(?:[.]\d+(_\d+)*)?(?![\w$])/}

  val = NaN

  fromMatch(mat) {
    super.fromMatch(mat)
    this.val = Number.parseInt(this.getSrc())
    return this
  }

  static isValid(val) {return isFullMatch(val, this.reg())}
}

function isFullMatch(src, reg) {
  return a.reqReg(reg).exec(a.reqStr(src))?.[0] === src
}

// FIXME subclass `ValNode`, `.body` → `.getVal()`.
export class Str extends Text {
  body = ``

  fromMatch(mat) {
    super.fromMatch(mat)
    this.body = a.reqStr(mat[1])
    return this
  }
}

export class StrGrave extends Str {
  static reg() {return /^`([^`]*)`/}
}

export class StrDouble extends Str {
  static reg() {return /^"((?:\\.|[^"])*)"/}
}

export class Ident extends Text {
  static reg() {return /^(?:[A-Za-z$_][\w$]*[.])*[A-Za-z$_][\w$]*/}
  static regLocal() {return /^[A-Za-z$_][\w$]*/}

  pk() {return this.reqLocal().getSrc()}
  sep() {return `.`}
  head() {return strSplitBefore(this.getSrc(), this.sep())}
  last() {return strSplitAfter(this.getSrc(), this.sep())}
  hasNs() {return this.getSrc().includes(this.sep())}
  getCallSyntax() {return this.optDef()?.getCallSyntax()}

  // FIXME support namespacing.
  // FIXME forbid reserved JS keywords.
  macro() {
    const def = this.reqDef()
    if (def.isMacro()) {
      throw this.err(`identifier ${a.show(this.head())} must be called as a macro rather than evaluated`)
    }
    return this
  }

  optDef() {
    const head = this.head()
    let node = this.getParent()

    while (node) {
      const scope = node.scope
      if (scope?.has(head)) return scope.get(head)
      node = node.getParent?.()
    }
    return undefined
  }

  reqDef() {
    const out = this.optDef()
    if (!out) throw this.err(`unknown identifier ${a.show(this.head())}`)
    return out
  }

  reqNonEmpty(desc) {
    if (!this.getSrc()) {
      throw this.err(`unexpected empty identifier in ${a.show(desc)}`)
    }
    return this
  }

  reqLocal(desc) {
    this.reqNonEmpty(desc)
    if (this.hasNs()) {
      throw this.err(`identifier${desc ? ` in ${a.show(desc)}` : ``} must be local, found ${a.show(this.getSrc())}`)
    }
    return this
  }

  // FIXME forbid reserved JS keywords.
  reqParam() {
    return this.reqLocal(`parameters`)
  }

  static isValidLocal(val) {return isFullMatch(val, this.regLocal())}

  static toValidDictKey(val) {
    a.reqStr(val)
    if (this.isValidLocal(val)) return val
    if (Num.isValid(val)) return val
    return JSON.stringify(val)
  }
}

function strSplitBefore(src, sep) {
  const ind = a.reqStr(src).indexOf(a.reqStr(sep))
  return ind >= 0 ? src.slice(0, ind) : src
}

function strSplitAfter(src, sep) {
  const ind = a.reqStr(src).lastIndexOf(a.reqStr(sep))
  return ind >= 0 ? src.slice(ind + sep.length) : src
}

export class NodeList extends Node {
  constructor(val) {super().$ = a.laxTrueArr(val)}

  [Symbol.iterator]() {return this.$[Symbol.iterator]()}

  // For compatibility with common JS interfaces.
  get size() {return this.$.length}

  // For our own use. Less error prone than getters.
  getLen() {return this.$.length}

  nodes() {return this.$}
  toArray() {return this.$}
  slice(...val) {return this.$.slice(...val)}
  meaningfulNodes() {return this.$.filter(isNodeMeaningful)}
  params() {for (const val of this) val.reqInst(Ident).reqParam().define()}
  macro() {return this.macroFrom(0)}
  toSrc() {return this.nodes().reduce(addSrc, ``)}
  toJs() {return this.getPrn().dump(this)}

  /*
  TODO consider automatically merging spans when adding children, instead of
  relying on span-merging special case in lexer.
  */
  add(val) {return val.setParent(this), this.$.push(val)}

  fromIter(src) {
    for (src of src) this.add(src)
    return this
  }

  macroFrom(ind) {
    ind = a.reqNat(ind)
    while (ind < this.getLen()) this.macroAt(ind++)
    return this
  }

  macroAt(ind) {
    ind = a.reqNat(ind)
    const tar = this.$
    const len = tar.length

    if (ind >= 0 && ind < len) {
      return tar[ind] = Node.macroNode(tar[ind])
    }
    throw this.err(`index ${ind} out of bounds for length ${len}`)
  }
}

function isNodeMeaningful(val) {
  return a.isObj(val) && !a.isInst(val, Space) && !a.isInst(val, Comment)
}

function addSrc(acc, val) {return a.reqStr(acc) + toSrc(val)}

export class DelimNodeList extends NodeList {
  static pre() {throw errMeth(`pre`, this)}
  static suf() {throw errMeth(`suf`, this)}

  pre() {return this.constructor.pre()}
  suf() {return this.constructor.suf()}

  // TODO simplify.
  static lex(lex) {
    const pre = this.pre()
    const suf = this.suf()
    const head = lex.head()

    if (!head) return undefined
    if (head.getSrc() === suf) throw head.err(`unexpected closing ${a.show(suf)}`)
    if (head.getSrc() !== pre) return undefined

    const tar = new this()
    lex.skip(1)

    while (lex.more()) {
      const next = lex.head()

      if (next.getSrc() === suf) {
        lex.skip(1)
        tar.setSpan(Span.range(head.getSpan(), next.getSpan()))
        return tar
      }

      tar.add(lex.nextPop())
    }

    throw lex.last().err(`missing closing ${a.show(suf)}`)
  }

  head() {return this.$.find(isNodeMeaningful)}

  macro() {
    const def = this.head()?.onlyInst(Ident)?.optDef()
    const style = def?.getCallSyntax()
    if (style === CallSyntax.macroAst) return def.macroAst(this)
    if (style === CallSyntax.macroVal) return def.macroVal(this)
    return super.macro()
  }

  toSrc() {return this.pre() + super.toSrc() + this.suf()}

  // TODO clean up. This code is too complex.
  toJs() {
    const prn = this.getPrn()
    const src = this.nodes()
    const ind = src.findIndex(isNodeMeaningful)
    if (!(ind >= 0)) return prn.spaced(src)

    const head = src[ind]
    const style = head.onlyInst(Ident)?.getCallSyntax() || CallSyntax.runtimeCall

    // Reslicing is suboptimal but probably not our bottleneck.
    const pre = src.slice(0, ind + 1)
    const suf = src.slice(ind + 1)
    const call = prn.spaced(pre) + `(` + prn.commaSingle(suf) + `)`

    if (style === CallSyntax.runtimeCall) return call
    if (style === CallSyntax.runtimeNew) return `new ` + call
    throw this.err(`invalid call style ${a.show(style)}; current context supports only ${a.show([CallSyntax.runtimeCall, CallSyntax.runtimeNew])}`)
  }
}

export class Brackets extends DelimNodeList {
  static pre() {return `[`}
  static suf() {return `]`}
}

export class Parens extends DelimNodeList {
  static pre() {return `(`}
  static suf() {return `)`}
}

export class Braces extends DelimNodeList {
  static pre() {return `{`}
  static suf() {return `}`}
}

export class Coll extends a.MixChild(a.Coll) {
  get Val() {throw errMeth(`get Val`, this)}

  set(key, val) {
    val.setParent(this)
    return super.set(key, val)
  }
}

export class Scope extends Coll {
  get Val() {return Node}

  set(key, val) {
    if (this.has(key)) {
      throw val.err(`redundant name ${a.show(key)}`)
    }
    return super.set(key, val)
  }

  replace(key, val) {return super.set(key, val)}
}

export class Root extends a.MixChild(a.Emp) {
  scope = new Scope().setParent(this)
  prn = new Prn()

  default() {
    this.scope.add(PredeclNameDef.fromName(`globalThis`))
    this.scope.add(SetCallSyntax.def())
    this.scope.add(Use.def())
    this.scope.add(Const.def())
    this.scope.add(Fn.def())
    this.scope.add(When.def())
    return this
  }
}

export class Module extends NodeList {
  scope = new Scope().setParent(this)
  init(src) {return this.fromIter(src)}
  toJs() {return this.getPrn().statements(this)}
}

export class Modules extends Coll {
  get Val() {return Module}
}

/*
FIXME:

  * `macroAstCall`
  * `macroAstNew`
  * `macroValCall`
  * `macroAst`:
    * Mere mention of the identifier calls it.
    * The input is the identifier node.
    * The macro can use parent/child relations to traverse the AST.
    * Requires special support in `NodeList`/`DelimNodeList`.
*/
export class CallSyntax extends a.Emp {
  static runtimeCall = `runtimeCall`
  static runtimeNew = `runtimeNew`
  static macroAst = `macroAst`
  static macroVal = `macroVal`

  static isValid(key) {return a.isStr(key) && a.hasOwn(this, key)}

  static valid(key, src) {
    if (this.isValid(key)) return this[key]
    throw src.err(`unrecognized key ${a.show(key)} on ${a.show(this)}; valid keys: ${a.show(Object.keys(this))}`)
  }

  static isMacro(key) {return key === this.macroAst || key === this.macroVal}
}

export class Def extends Node {
  pk() {throw errMeth(`pk`, this)}
  isMacro() {return CallSyntax.isMacro(this.getCallSyntax())}
  getCallSyntax() {return this.callSyntax || CallSyntax.runtimeCall}
  setCallSyntax(key) {return this.callSyntax = CallSyntax.valid(key, this), this}

  /*
  Must be called for any call expression where the head is an identifier
  pointing to the current `Def`, when the def has the call style
  `CallSyntax.macroAst`. Viable only when the `Def` has something callable, such
  as predeclared macro class or dynamically-defined function or class. If the
  definition is not callable, attempting to use it as a macro must cause a
  descriptive compile error. The node passed to this method must be the entire
  call expression. The node must be forwarded to the callable referred by
  `Def`.
  */
  macroAst(src) {
    const tar = this.macroNode(src)
    if (a.isNil(tar) || a.isInst(tar, Node)) return tar
    throw src.err(`expected macro to return nil or AST node, found ${a.show(tar)}`)
  }

  /*
  Similar to `.macroAst`, but expects the macro output to be a plain JS value,
  serializable via `ValNode`.
  */
  macroVal(src) {return new SrcValNode().setVal(this.macroNode(src))}

  /*
  Used internally by other "macro" methods on this type. Must be implemented by
  subclasses. Takes one argument, which must be a call expression where the
  head is an identifier pointing to the current `Def`.
  */
  macroNode() {throw errMeth(`macroNode`, this)}
}

export class PredeclNameDef extends Def {
  name = ``
  pk() {return this.name}
  setName(val) {return this.name = a.reqValidStr(val), this}
  static fromName(val) {return new this().setName(val)}
}

export class PredeclMacroDef extends PredeclNameDef {
  cls = undefined
  setCls(val) {return this.cls = a.reqCls(val), this}
  getCallSyntax() {return CallSyntax.macroAst}
  macroNode(src) {return new this.cls(src)}
}

export class DynDef extends MixWrapperNode(Def) {
  pk() {return a.pk(this.getSrc())}
  addToScope() {return this.reqScope().add(this), this}

  /*
  Note: this generates two wrapper errors; one for the macro definition site,
  and another for the macro call site.

  FIXME:

    * Errors during execution of compiled JS code must show compiled JS code.
      * `fun.toString` is viable.
  */
  macroNode(src) {
    try {
      const fun = this.reqSrc().eval()
      // console.log(`fun.toString():`, fun.toString())
      try {return fun(src)}
      catch (err) {throw this.err(`error during macro execution`, err)}
    }
    catch (err) {
      throw src.err(`exception when calling dynamically-defined macro`, err)
    }
  }

  reqSrc() {
    const out = this.getSrc()
    if (!out) {
      throw this.err(`internal compiler error: missing definition for ${a.show(this.name)}`)
    }
    return out
  }

  toJs() {return this.getPrn().js(this.getSrc())}
}

function errMeth(name, val) {
  throw TypeError(`method ${a.show(name)} not implemented on ${a.show(val)}`)
}

export class Macro extends MixWrapperNode(Node) {
  static defName() {throw errMeth(`defName`, this)}

  static def() {
    return new PredeclMacroDef().setName(this.defName()).setCls(this)
  }

  name() {return this.constructor.defName()}
  fromNode(src) {return super.fromNode(a.reqInst(src, NodeList))}
  macro() {throw errMeth(`macro`, this)}

  argAt(ind) {
    a.reqNat(ind)
    const src = this.srcNodes()
    const len = src.length

    if (!(ind < len)) {
      throw this.err(`${a.show(this.name())} requires at least ${ind+1} arguments, found ${len}`)
    }
    return src[ind]
  }

  argInstAt(cls, ind) {
    const val = this.argAt(ind)
    if (!a.isInst(val, cls)) {
      throw this.err(`${a.show(this.name())} requires instance of ${a.show(cls)} at index ${ind}, found ${a.show(val)}`)
    }
    return val
  }

  argLen(exp) {
    a.reqNat(exp)
    const src = this.srcNodes()
    const len = src.length

    if (exp !== len) {
      throw this.err(`${a.show(this.name())} requires exactly ${exp} arguments, found ${len}`)
    }
    return this
  }

  argLenRange(min, max) {
    a.reqNum(min)
    a.reqNum(max)

    const len = a.len(this.getSrc())
    if (!(len >= min && len <= max)) {
      throw this.err(`${a.show(this.name())} requires between ${min} and ${max} arguments, found ${len}`)
    }
    return this
  }
}

export class IdentMacro extends Macro {
  pk() {return this.ident().reqLocal(this.name()).pk()}
  ident() {throw errMeth(`ident`, this)}
  macro() {return this.define()}
}

export class SetCallSyntax extends Macro {
  static defName() {return `setCallSyntax`}

  ident() {return this.argInstAt(Ident, 1)}
  str() {return this.argInstAt(Str, 2)}

  macro() {
    this.argLen(3)
    this.ident().reqLocal(this.name()).reqDef().setCallSyntax(
      CallSyntax.valid(this.str().body, this.getSrc()),
    )
    return undefined
  }
}

export class Use extends IdentMacro {
  static defName() {return `use`}

  str() {return this.argInstAt(Str, 1)}
  ident() {return this.argInstAt(Ident, 2)}
  macro() {return this.argLen(3), super.macro()}

  // TODO better string printing.
  // At the time of writing, JS `import` statement doesn't allow grave strings.
  strCompat() {
    const str = this.str()
    if (!a.isInst(str, StrGrave)) return this.getPrn().js(str)
    return JSON.stringify(str.body)
  }

  toJs() {
    const prn = this.getPrn()
    return `import * as ${prn.js(this.ident())} from ${a.reqStr(this.strCompat())}`
  }
}

export class Const extends IdentMacro {
  static defName() {return `const`}

  ident() {return this.argInstAt(Ident, 1)}
  val() {return this.argAt(2)}

  macro() {
    this.argLen(3)
    this.getSrc().macroAt(2)
    return super.macro()
  }

  toJs() {
    const prn = this.getPrn()
    return `const ${prn.js(this.ident())} = ${prn.js(this.val())}`
  }
}

export class Fn extends IdentMacro {
  static defName() {return `fn`}

  scope = new Scope().setParent(this)

  ident() {return this.argInstAt(Ident, 1)}
  params() {return this.argInstAt(NodeList, 2)}
  body() {return this.getSrc().slice(3)}

  macro() {
    this.argLenRange(3, Infinity)
    this.params().params()

    /*
    FIXME before executing `.macro` for children, we must set the current node
    as their parent. This will provide them access to the new parent's scope.
    This requires changing/replacing/removing `Node.macroNode`, moving the node
    reownership feature to macro methods.
    */
    this.getSrc().macroFrom(3)

    return super.macro()
  }

  toJs() {
    const prn = this.getPrn()
    return `function ${prn.js(this.ident())} (${prn.commaSingle(this.params())}) ${prn.block(this.body())}`
  }

  /*
  FIXME:

    * Provide local scope.
      * Evaluate dependencies first, in dependency order.
    * Cache.
    * Move to superclass.
    * Implement for other nodes.
      * `Num` evaluates to its numeric value.
      * `Str` evaluates to its body.
      * ...
    * Errors during execution of compiled JS code must show compiled JS code.
  */
  eval() {
    try {
      return evaluate(toJs(this))
    }
    catch (err) {
      throw this.err(`exception when evaluating function expression`, err)
    }
  }
}

export function evaluate(src) {
  return Function(`'use strict'
return ${a.reqStr(src)}`)()
}

export class When extends Macro {
  static defName() {return `when`}

  predicate() {return this.argAt(1)}
  body() {return this.getSrc().slice(2)}

  macro() {
    this.argLenRange(2, Infinity)
    this.getSrc().macroFrom(2)
    return this
  }

  toJs() {
    const prn = this.getPrn()
    return `if (${prn.js(this.predicate())}) ${prn.block(this.body())}`
  }
}

export class Prn extends a.Emp {
  js(src) {return a.laxStr(src.toJs())}

  // FIXME avoid special case filter.
  dump(src) {return this.join(src, ``)}

  spaced(src) {return this.join(src, ` `)}
  commaSingle(src) {return this.join(src, `, `)}
  commaMulti(src) {return this.join(src, `,\n`)}
  statements(src) {return this.join(src, `;\n`)}
  block(src) {return `{\n` + this.statements(src) + `}`}

  // FIXME remove special case filter.
  join(src, sep) {
    a.reqStr(sep)

    let out = ``
    for (src of src) {
      if (a.isInst(src, Space)) continue

      const suf = this.js(src)
      out += suf

      if (a.isInst(src, Comment)) continue
      if (suf) out += sep
    }
    return out
  }
}
