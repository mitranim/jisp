import * as a from '/Users/m/code/m/js/all.mjs'
import * as p from '/Users/m/code/m/js/path.mjs'

/*
For optional sanity checks.
TODO make configurable for better performance.
*/
export const DEBUG = true

/*
FIXME rename "get" to "own".

Code conventions:

  * Methods vs getters:
    * Prefer methods over property getters.
    * Use property getters only to implement common JS interfaces.
    * Methods are less error-prone. Missing a method name produces a runtime
      exception, while missing a property name produces `undefined`.
  * Method naming:
    * Use "getX" for methods that reflect a property 1-1. Such getters MUST be
      either free or very cheap. Idempotent cached allocation is also allowed.
    * Avoid the "get" prefix for methods that may perform expensive work on each
      call, including but not limited to generating new data structures,
      iterating, or walking arbitrarily-long ancestor chains.

Common interfaces (non-exhaustive list):

  * `.getSpan`. Returns a `StrSpan` referring to a region of source code. All
    AST nodes parsed from source must have a valid span. All AST nodes created
    by macros must refer to other nodes which ultimately have a valid span.

  * `.getSrcNode`. Used by nodes created by macros to replace other nodes.
    Each replacement node must use this method to refer to another node,
    ultimately referring to a node parsed from source code.

  * `.getVal`. Compile-time evaluation. Performs arbitrary compile-time
    evaluation and returns an arbitrary value usable by macros. AST tokens
    parsed from source may return numbers, strings, booleans, etc. Identifier
    nodes may return the actual runtime values of definitions they refer to.
    For example, module A defines and exports a class that's usable as a macro,
    under name "B". Module C imports A and attempts to use B as a macro. The
    identifier node referring to B may use `.getVal` to return the actual
    evaluated reference to that class from module A, allowing us to perform
    that macro.

  * ...
*/

export function decompile(val) {return a.laxStr(val?.decompile())}
export function compile(val) {return a.laxStr(val?.compile())}

export class Err extends Error {
  get name() {return this.constructor.name}
}

export class CodeErr extends Err {
  constructor({msg, span, cause}) {
    super(
      joinLines(a.reqStr(msg), span.context()),
      {cause: a.optInst(cause, Error)},
    )

    this.msg = msg
    this.span = span
  }

  static atNode(node, msg) {return new this({msg, span: node.getSpan()})}
}

function joinLines(...val) {return a.joinLinesOptLax(val)}

export class TokenizerErr extends CodeErr {}

export class LexerErr extends CodeErr {}

// Short for "inspectable".
class Insp extends a.Emp {
  #tar = undefined
  getTar() {return this.#tar}
  setTar(val) {return this.#tar = a.reqObj(val), this}

  mut(...src) {return a.assign(this, ...src)}

  funs(...fun) {
    a.reqArrOf(fun, a.isFun)
    const tar = this.getTar()
    for (fun of fun) this[fun.name] = fun.call(tar)
    return this
  }

  get [Symbol.toStringTag]() {
    const tar = this.getTar()
    return tar[Symbol.toStringTag] || tar.constructor.name
  }

  static from(val) {return new this().setTar(val)}
  static symDeno() {return Symbol.for(`Deno.customInspect`)}
  static symNode() {return Symbol.for(`nodejs.util.inspect.custom`)}
  static symMake() {return Symbol.for(`Insp.make`)}
  static symMod() {return Symbol.for(`Insp.mod`)}
}

export class MixInsp extends a.StaticWeakCache {
  static make(cls) {
    return class MixInsp extends super.make(cls) {
      [Insp.symMake()]() {return this[Insp.symMod()](Insp.from(this))}
      [Insp.symMod()](val) {return val}
      [Insp.symDeno()](fun, opt) {return fun(this[Insp.symMake()](), opt)}
      [Insp.symNode()](_dep, opt, fun) {return fun(this[Insp.symMake()](), opt)}
    }
  }
}

export class Span extends MixInsp.goc(a.Emp) {
  #src = ``
  getSrc() {return this.#src}
  setSrc(val) {return this.#src = this.reqSrc(val), this}
  reqSrc(val) {return reqStrOrArr(val)}
  withSrc(val) {return this.clone().setSrc(val)}

  #pos = 0
  getPos() {return this.#pos}
  setPos(val) {return this.#pos = a.reqNat(val), this}
  withPos(val) {return this.clone().setPos(val)}
  nextPos() {return this.#pos + this.#len}

  #len = 0
  getLen() {return this.#len}
  setLen(val) {return this.#len = a.reqNat(val), this}
  withLen(val) {return this.clone().setLen(val)}
  hasLen() {return this.#len > 0}
  isEmpty() {return !this.hasLen()}

  init(src) {return this.setSrc(src).setPos(0).setLen(src.length)}
  decompile() {return this.#src.slice(this.#pos, this.#pos + this.#len)}
  more() {return this.#pos < this.#src.length}
  inc() {return this.#pos++, this}
  skip(len) {return this.#pos += a.reqNat(len), this}
  rem() {return this.#src.slice(this.#pos)}
  remAt(pos) {return this.#src.slice(a.reqNat(pos))}

  clone() {
    return new this.constructor()
      .setSrc(this.#src)
      .setPos(this.#pos)
      .setLen(this.#len)
  }

  /*
  FIXME:

    * Compute "row:col" in Unicode chars.
    * Better preview, with indentation.
    * Consider supporting non-string source.
  */
  context() {
    return joinLines(
      `character position (UTF-16): ${this.getPos()}`,
      `source: ` + preview(this.rem()),
    )
  }

  static range(begin, end) {
    return new this()
      .setSrc(begin.getSrc())
      .setPos(begin.getPos())
      .setLen(end.nextPos() - begin.getPos())
  }

  [Insp.symMod()](tar) {
    return tar.funs(this.decompile, this.getPos, this.getLen)
  }
}

function isStrOrArr(val) {return a.isStr(val) || a.isTrueArr(val)}
function reqStrOrArr(val) {return a.req(val, isStrOrArr)}
function preview(src) {return a.ell(src, 128)}

export class StrSpan extends Span {reqSrc(val) {return a.reqStr(val)}}

export class ArrSpan extends Span {
  reqSrc(val) {return a.reqArr(val)}
  head() {return this.at(this.getPos())}
  at(ind) {return this.getSrc()[a.reqNat(ind)]}
  atRel(off) {return this.at(this.getPos() + a.reqNat(off))}
  last() {return a.last(this.getSrc())}

  popHead() {
    const tar = this.head()
    this.inc()
    return tar
  }

  findHead(fun, ctx) {
    a.reqFun(fun)

    const src = this.getSrc()
    let ind = this.getPos() - 1

    while (++ind < src.length) {
      const val = src[ind]
      if (fun.call(ctx, val)) return val
    }
    return undefined
  }
}

export class MixSpanned extends a.StaticWeakCache {
  static make(cls) {
    return class MixSpanned extends super.make(cls) {
      #span = undefined
      getSpan() {return this.#span}
      setSpan(val) {return this.#span = a.reqInst(val, this.Span), this}
      gocSpan() {return this.#span ||= new this.Span()}
      decompile() {return decompile(this.getSpan())}
      get Span() {return Span}
    }
  }
}

export class Iter extends a.Emp {
  [Symbol.iterator]() {return this}
  done = false
  value = undefined

  next() {
    while (this.more()) {
      if (a.isSome((this.value = this.step()))) return this
    }
    this.done = true
    return this
  }

  init() {return this.done = false, this.value = undefined, this}
  more() {return false}
  step() {return this.done = true, undefined}
  toArray() {return [...this]}
}

export class Tokenizer extends MixSpanned.goc(Iter) {
  get Span() {return StrSpan}
  init(src) {return this.gocSpan().init(src), super.init()}
  more() {return this.getSpan().more()}

  step() {
    const pos = this.getSpan().getPos()
    const node = this.optStep()
    this.found(node)
    this.advanced(pos, node)
    return this.filter(node)
  }

  filter(val) {return Node.isMeaningful(val) ? val : undefined}

  optStep() {
    const span = this.getSpan()

    return (
      BracketPre.parse(span) ||
      BracketSuf.parse(span) ||
      ParenPre.parse(span) ||
      ParenSuf.parse(span) ||
      BracePre.parse(span) ||
      BraceSuf.parse(span) ||
      Space.parse(span) ||
      Comment.parse(span) ||
      Num.parse(span) ||
      StrBacktick.parse(span) ||
      StrDouble.parse(span) ||
      UnqualName.parse(span) ||
      QualName.parse(span) ||
      undefined
    )
  }

  err(msg, cause) {return new TokenizerErr({msg, span: this.getSpan(), cause})}

  found(node) {
    if (node) return
    throw this.err(`unrecognized syntax`)
  }

  advanced(pos, node) {
    if (this.getSpan().getPos() > pos) return
    throw this.err(`failed to advance position at node ${a.show(node)}`)
  }

  static fromStr(src) {return new this().init(src)}
  static tokensFromStr(src) {return this.fromStr(src).toArray()}
}

export class Lexer extends MixSpanned.goc(Iter) {
  get Span() {return ArrSpan}

  init(src) {return this.gocSpan().init(src), super.init()}
  filter(val) {return val}
  more() {return this.getSpan().more()}
  popNext() {return this.optNext() || this.getSpan().popHead()}

  step() {
    const pos = this.getSpan().getPos()
    const node = this.popNext()
    this.advanced(pos, node)
    return this.filter(node)
  }

  optNext() {
    return (
      Brackets.lex(this) ||
      Parens.lex(this) ||
      Braces.lex(this) ||
      Path.lex(this) ||
      undefined
    )
  }

  advanced(pos, node) {
    if (this.getSpan().getPos() > pos) return
    throw LexerErr.atNode(node, `failed to advance position at node ${a.show(node)}`)
  }

  static fromStr(src) {return this.fromTokens(Tokenizer.tokensFromStr(src))}
  static fromTokens(src) {return new this().init(src)}
  static fromTokenizer(src) {return this.fromTokens(a.reqInst(src, Tokenizer).toArray())}
  static nodesFromStr(src) {return this.fromStr(src).toArray()}
  static nodesFromTokens(src) {return this.fromTokens(src).toArray()}
}

export class MixErr extends a.MixChildCache {
  static make(cls) {
    return class MixErr extends super.make(cls) {
      err(...val) {return super.err?.(...val) || new Err(...val)}

      // Useful in expressions. Prefer normal `throw` in statements.
      throw(...val) {throw this.err(...val)}

      // FIXME throw `this.err`.
      reqInst(cls) {return a.reqInst(this, cls)}
      optInst(cls) {return a.optInst(this, cls)}
      onlyInst(cls) {return a.onlyInst(this, cls)}

      // Like `a.req` but using `this.err` for context.
      req(val, fun) {
        if (!fun(val)) {
          throw this.err(`expected variant of ${a.showFunName(fun)}, got ${a.show(val)}`)
        }
        return val
      }
    }
  }
}

/*
This is named "node sourced" because this class is sourced FROM a node,
but doesn't have to BE a node.
*/
export class MixNodeSourced extends MixErr {
  static make(cls) {
    return class MixNodeSourced extends super.make(cls) {
      #srcNode = undefined
      getSrcNode() {return this.#srcNode}

      setSrcNode(val) {
        a.reqInst(val, Node)
        if (DEBUG) this.validateSrcNode(val)
        this.#srcNode = val
        return this
      }

      validateSrcNode(src) {
        if (src === this) {
          throw this.err(`${a.show(this)} is not allowed to be its own source node`)
        }

        let tar = src
        while ((tar = getSrcNode(tar))) {
          if (tar === this) {
            throw this.err(`forbidden cycle between end node ${a.show(this)} and source node ${a.show(src)}`)
          }
        }
      }

      decompile() {return decompile(this.getSrcNode())}
    }
  }
}

function getSrcNode(src) {
  return a.isObj(src) && `getSrcNode` in src ? src.getSrcNode() : undefined
}

export class MixChild extends MixErr {
  static make(cls) {
    return class MixChild extends super.make(cls) {
      setParent(par) {
        if (DEBUG) this.validateParent(par)
        return super.setParent(par)
      }

      validateParent(par) {
        if (par === this) {
          throw this.err(`${a.show(this)} is not allowed to be its own parent`)
        }

        let tar = par
        while ((tar = getParent(tar))) {
          if (tar === this) {
            throw this.err(`forbidden cycle between child ${a.show(this)} and parent ${a.show(par)}`)
          }
        }
      }

      reqParent() {
        return (
          this.getParent() ||
          this.throw(`missing parent for ${a.show(this)}`)
        )
      }

      optAncMatch(cls) {
        a.reqCls(cls)
        let tar = this
        while (tar) {
          if (a.isInst(tar, cls)) return tar
          tar = tar.getParent()
        }
        return undefined
      }

      reqAncMatch(cls) {
        return (
          this.optAncMatch(cls) ||
          this.throw(`expected to find ancestor of class ${a.show(cls)} for ${a.show(this)}, found none`)
        )
      }

      ancFind(fun) {
        a.reqFun(fun)
        let tar = this
        while (tar) {
          if (fun(tar)) return tar
          tar = tar.getParent()
        }
        return undefined
      }

      ancProcure(fun) {
        a.reqFun(fun)
        let tar = this
        while (tar) {
          const val = fun(tar)
          if (val) return val
          tar = getParent(tar)
        }
        return undefined
      }

      optRoot() {return this.optAncMatch(Root)}
      reqRoot() {return this.reqAncMatch(Root)}

      resolveNameLex(name) {
        this.req(name, a.isValidStr)
        const resolve = val => getLexScope(val)?.resolve(name)
        return this.ancProcure(resolve)
      }
    }
  }
}

function getParent(src) {
  return a.isObj(src) && `getParent` in src ? src.getParent() : undefined
}

export class MixPrinted extends a.StaticWeakCache {
  static make(cls) {
    return class MixPrinted extends MixChild.goc(super.make(cls)) {
      /*
      When overridden/implemented, this method must return OWN printer, without
      searching the ancestor chain. Only `.optPrn` and `.reqPrn` are allowed to
      search ancestors.
      */
      getPrn() {}

      optPrn() {return this.ancProcure(getPrn)}

      reqPrn() {
        return (
          this.optPrn() ||
          this.throw(`expected to find a printer for ${a.show(this)}, found none`)
        )
      }
    }
  }
}

function getPrn(src) {
  return a.isObj(src) && `getPrn` in src ? src.getPrn() : undefined
}

// Also see `MixLexScoped`.
export class MixLexUnscoped extends a.StaticWeakCache {
  static make(cls) {
    return class MixLexUnscoped extends MixChild.goc(super.make(cls)) {
      /*
      When overridden/implemented, this method must return OWN scope, without
      searching the ancestor chain. Only `.optLexScope` and
      `.reqLexScope` are allowed to search ancestors.
      */
      getLexScope() {}

      optLexScope() {return this.ancProcure(getLexScope)}

      reqLexScope() {
        return (
          this.optLexScope() ||
          this.throw(`expected to find an enclosing lexical scope for ${a.show(this)}, found none`)
        )
      }
    }
  }
}

function getLexScope(src) {
  return a.isObj(src) && `getLexScope` in src ? src.getLexScope() : undefined
}

export class MixLexScoped extends MixLexUnscoped {
  static make(cls) {
    return class MixLexScoped extends super.make(cls) {
      #lexScope = undefined
      getLexScope() {return this.#lexScope ||= this.makeLexScope()}
      setLexScope(val) {return this.#lexScope = a.reqInst(val, LexScope), this}
      makeLexScope() {return new LexScope().setParent(this)}
    }
  }
}

// Also see `MixPubNsScoped`.
export class MixPubNsUnscoped extends a.StaticWeakCache {
  static make(cls) {
    return class MixPubNsUnscoped extends MixChild.goc(super.make(cls)) {
      /*
      When overridden/implemented, this method must return OWN scope, without
      searching the ancestor chain. Only `.optPubNsScope` and
      `.reqPubNsScope` are allowed to search ancestors.
      */
      getPubNsScope() {}

      optPubNsScope() {return this.ancProcure(getPubNsScope)}

      reqPubNsScope() {
        return (
          this.optPubNsScope() ||
          this.throw(`expected to find an enclosing public namespace scope for ${a.show(this)}, found none`)
        )
      }
    }
  }
}

function getPubNsScope(val) {
  return a.isObj(val) && `getPubNsScope` in val ? val.getPubNsScope() : undefined
}

function isPubNsScoped(val) {return a.isInst(getPubNsScope(val), PubNsScope)}
function reqPubNsScoped(val) {return a.req(val, isPubNsScoped)}
// function optPubNsScoped(val) {return a.opt(val, isPubNsScoped)}
// function onlyPubNsScoped(val) {return a.only(val, isPubNsScoped)}

export class MixPubNsScoped extends MixPubNsUnscoped {
  static make(cls) {
    return class MixPubNsScoped extends super.make(cls) {
      #pubNsScope = undefined
      getPubNsScope() {return this.#pubNsScope ||= this.makePubNsScope()}
      setPubNsScope(val) {return this.#pubNsScope = a.reqInst(val, PubNsScope), this}
      makePubNsScope() {return new PubNsScope().setParent(this)}
    }
  }
}

/*
Before macro replacement, parent-child relation is bilateral:

             parent
  role=child ↓    ↑ role=parent
             child0

After macro replacement:

  * The parent acquires a new child, bilaterally.
  * The old child unilaterally remembers the parent.
  * The new child unilaterally remembers the old child.

             parent
  role=child ↓    ↑ role=parent
             child1

             parent
                  ↑ role=parent
             child0

             child1 → child0
                role=src

Note: while the AST relations are by definition cyclic, parent→child relations
must avoid cycles, forming a tree. At the time of writing, `MixChild` and
`MixNodeSourced` prevent cycles. If we add more common interfaces between
nodes, they must prevent cycles too.
*/
export class Node extends (
  MixPubNsUnscoped.goc(MixLexUnscoped.goc(
    MixNodeSourced.goc(MixSpanned.goc(MixChild.goc(MixInsp.goc(a.Emp))))
  ))
) {
  // For `MixSpanned`.
  get Span() {return StrSpan}
  getSpan() {return super.getSpan() || this.getSrcNode()?.getSpan()}

  fromNode(src) {
    this.setSrcNode(src)
    this.setParent(src.getParent())
    return this
  }

  err(msg, cause) {return new CodeErr({msg, span: this.getSpan(), cause})}

  toErr(err) {
    if (a.isInst(err, CodeErr) || !this.getSpan()) return err
    return this.err((a.isInst(err, Error) ? err.message : a.renderLax(err)), err)
  }

  // FIXME implement.
  isExpr() {return false}

  /*
  Defines the current node in the nearest available scope. The node must
  implement method `.pk`, which must return a local identifier string. Method
  `.pk` must be implemented by `UnqualName` and all node subclasses that
  represent a named declaration such as `Const` or `Fn`. For other node
  classes, this should cause an exception.

  TODO consider replacing with the following:

    defineLex() {return this.defineInScope(this.reqParent().reqLexScope())}
  */
  defineLex() {return this.defineInScope(this.reqLexScope())}

  defineInScope(scope) {
    a.reqInst(scope, Scope)
    const def = new NodeDef().setSrcNode(this)
    try {scope.add(def)}
    catch (err) {throw this.err(`unable to register definition with name ${a.show(def?.pk())}`, err)}
    return def
  }

  /*
  If the current object is a reference, this should refer to the original
  definition. Allows us to trace definitions from usage sites. Rules:

    * Objects without a valid origin must return nil.

    * Objects with a valid origin must return that origin.

    * Objects which ARE their own valid origin must return themselves.
      This acts as termination signal for recursive search.

    * This interface may be implemented by non-`Node` objects such as `Def`.

  Examples:

    * name -> def -> use -> module
    * name -> def -> const -> val
    * name -> def -> class
    * name -> def -> const -> val -> class
    * name -> def -> const -> name -> def -> class
  */
  getOrigin() {}

  /*
  Recursive version of `getOrigin`. Note that this does NOT use the child-parent
  ancestor chain. Origin chains are their own dimension.
  */
  optOrigin() {
    let prev = this
    while (prev) {
      const next = getOrigin(prev)
      if (prev === next) return next
      prev = next
    }
    return prev
  }

  reqOrigin() {
    return (
      this.optOrigin() ||
      this.throw(`expected to find a valid origin for ${a.show(this)}, found none`)
    )
  }

  // TODO remove.
  //
  // with(val) {return a.isPromise(val) ? this.withAsync(val) : this}
  // async withAsync(val) {return (await val), this}

  macro() {
    try {
      const val = this.macroImpl()
      if (a.isPromise(val)) return this.errFromAsync(val)
      return val
    }
    catch (err) {throw this.toErr(err)}
  }

  // Override in subclass.
  macroImpl() {throw errMeth(`macroImpl`, this)}

  async errFromAsync(val) {
    try {return await val}
    catch (err) {throw this.toErr(err)}
  }

  compile() {throw errMeth(`compile`, this)}

  decompile() {
    return a.laxStr(
      this.getSrcNode()?.decompile() ??
      this.getSpan()?.decompile()
    )
  }

  // Override in subclass.
  // Must take an instance of `StrSpan` and advance its position.
  static parse() {throw errMeth(`parse`, this)}

  static macroNode(node) {
    while (node) {
      const next = node.macro()
      if (node === next) break
      node = this.replace(node, next)
    }
    return node
  }

  static async macroNodeAsync(node) {
    while (node) {
      let next = node.macro()
      if (a.isPromise(next)) next = await next
      if (node === next) break
      node = this.replace(node, next)
    }
    return node
  }

  static replace(node, next) {
    next = (next ?? new Empty()).fromNode(node)
    node.setParent(next)
    return next
  }

  static isMeaningful(val) {
    return a.isObj(val) && !a.isInst(val, Space) && !a.isInst(val, Comment)
  }

  [Insp.symMod()](tar) {return tar.funs(this.getSpan)}
}

function getOrigin(src) {
  return a.isObj(src) && `getOrigin` in src ? src.getOrigin() : undefined
}

function errMeth(name, val) {throw TypeError(msgMeth(name, val))}

function msgMeth(name, val) {
  return `method ${a.show(name)} not fully implemented on ${a.show(val)}`
}

export class Empty extends Node {
  macro() {return this}
  compile() {return ``}
}

export class Text extends Node {
  static reg() {throw errMeth(`reg`, this)}

  static match(src) {return this.reg().exec(a.reqStr(src))}

  static parse(span) {
    const mat = this.match(span.rem())
    if (!mat) return undefined

    const tar = new this().setSpan(span.withLen(0)).fromMatch(mat)
    span.skip(tar.getSpan().getLen())
    return tar
  }

  static isValid(val) {return isFullMatch(val, this.reg())}

  fromMatch(mat) {return this.getSpan().setLen(mat[0].length), this}

  macro() {return this}
}

export class ExactText extends Text {
  static src() {throw errMeth(`src`, this)}

  static parse(span) {
    const pre = a.reqValidStr(this.src())
    if (!span.rem().startsWith(pre)) return undefined

    const tar = new this().setSpan(span.withLen(pre.length))
    span.skip(pre.length)
    return tar
  }
}

export class BracketPre extends ExactText {static src() {return `[`}}
export class BracketSuf extends ExactText {static src() {return `]`}}
export class ParenPre extends ExactText {static src() {return `(`}}
export class ParenSuf extends ExactText {static src() {return `)`}}
export class BracePre extends ExactText {static src() {return `{`}}
export class BraceSuf extends ExactText {static src() {return `}`}}

export class Space extends Text {static reg() {return /^\s+/}}

export class Comment extends Text {
  static reg() {return /^\|([^\n\r]*)(\r\n|\r|\n|$)/}
  static pre() {return `|`}
  pre() {return this.constructor.pre()}

  #body = ``
  getBody() {return this.#body}
  setBody(val) {return this.#body = a.reqStr(val), this}

  #delim = ``
  getDelim() {return this.#delim}
  setDelim(val) {return this.#delim = a.reqStr(val), this}

  fromMatch(mat) {
    super.fromMatch(mat)
    this.setBody(mat[1])
    this.setDelim(mat[2])
    return this
  }

  compile() {return `//` + a.reqStr(this.#body) + a.reqStr(this.#delim)}
}

/*
FIXME support:

  * `IntBin`
  * `BigIntBin`
  * `FracBin`
  * `IntOct`
  * `BigIntOct`
  * `FracOct`
  * `IntDec`
  * `BigIntDec`
  * `FracDec`
  * `IntHex`
  * `BigIntHex`
  * `FracHex`
*/
export class Num extends Text {
  static reg() {return /^-?\d+(_\d+)*(?:[.]\d+(_\d+)*)?(?![\w$])/}

  #val = NaN
  getVal() {return this.#val}
  setVal(val) {return this.#val = a.reqFin(val), this}

  fromMatch(mat) {
    super.fromMatch(mat)
    this.setVal(this.constructor.parseFloat(a.reqStr(mat[0])))
    return this
  }

  // Workaround for the lack of underscore support in `Number.parseFloat`.
  static parseFloat(src) {
    a.reqStr(src)
    if (src.includes(`_`)) src = src.replace(/_/g, ``)
    return Number.parseFloat(src)
  }

  [Insp.symMod()](tar) {
    return super[Insp.symMod()](tar).funs(this.getVal)
  }
}

function isFullMatch(src, reg) {
  a.reqStr(src)
  a.reqReg(reg)
  return reg.test(src) && reg.exec(src)?.[0] === src
}

export class Str extends Text {
  #val = ``
  getVal() {return this.#val}
  setVal(val) {return this.#val = a.reqStr(val), this}

  fromMatch(mat) {
    super.fromMatch(mat)
    this.setVal(mat[1])
    return this
  }

  [Insp.symMod()](tar) {
    return super[Insp.symMod()](tar).funs(this.getVal)
  }
}

export class StrBacktick extends Str {
  static reg() {return /^`([^`]*)`/}
}

export class StrDouble extends Str {
  static reg() {return /^"((?:\\.|[^"])*)"/}

  /*
  Difference from other strings: decodes escape sequences in the source string.
  The current implementation may be incomplete.
  */
  fromMatch(mat) {
    super.fromMatch(mat)
    this.setVal(JSON.parse(a.reqStr(mat[0])))
    return this
  }
}

// TODO: consider caching of definition lookup. Profile first.
export class Ident extends Text {
  static regUnqualName() {return /^[A-Za-z$_][\w$]*/}
  static regQualName() {return /^[.][A-Za-z$_][\w$]*/}
  static sep() {return `.`}
  sep() {return this.constructor.sep()}

  // TODO: consider caching. Profile first.
  optDef() {throw errMeth(`optDef`, this)}

  reqDef() {
    return (
      this.optDef() ||
      this.throw(`unknown identifier ${a.show(this.decompile())}`)
    )
  }

  macroWithDef(def) {
    a.optInst(def, Def)
    if (!def?.isMacro()) return this

    const syn = def.getCallSyntax()
    if (syn === CallSyntax.bare) return def.macroNode(this)
    throw this.err(`unexpected mention of identifier ${a.show(this.decompile())} with the following call opts: ${a.show(def.callOptStr())}`)
  }
}

export class Name extends Ident {
  getName() {throw errMeth(`getName`, this)}
}

export class StrSet extends a.TypedSet {reqVal(val) {return a.reqStr(val)}}

// Short for "unqualified name".
export class UnqualName extends Name {
  static reg() {return this.regUnqualName()}
  pk() {return this.getName()}
  getName() {return this.decompile()}

  optDef() {return this.resolveNameLex(this.pk())}
  // getOrigin() {return this.optDef()?.getOrigin()}

  /*
  FIXME:

    * If the definition is found in a mixin rather than in the lexical scope,
      convert the unqualified name into a qualified `Path`. Requires access
      to the mixin source, such as the `Use` node.
  */
  macroImpl() {
    const def = this.reqDef()
    def.addUse(this)
    return this.macroWithDef(def)
  }

  compile() {
    const def = this.optDef()
    if (def?.getCallSyntax() === CallSyntax.bare) return this.compileCall(def)
    return this.compileName()
  }

  compileCall(def) {
    const style = def.getCallStyle()
    if (style === CallStyle.call) return this.compileCallCall()
    if (style === CallStyle.new) return `new ` + a.reqStr(this.compileCallCall())
    throw CallStyle.errUnrec(this, style)
  }

  // Only for `CallStyle.call`.
  compileCallCall() {
    return a.reqStr(this.compileQualifier()) + a.reqStr(this.compileName()) + `()`
  }

  // FIXME: if the name is coming from a mixin, qualify it.
  compileQualifier() {throw errMeth(`compileQualifier`, this)}

  /*
  Supports automatic renaming of identifiers. See `Def..compileName`.

  FIXME: detect unqualified names coming from mixins, qualify if necessary.
  */
  compileName() {return this.optDef()?.compileName(this) ?? this.decompile()}

  static toValidDictKey(val) {
    if (this.isValid(val) || Num.isValid(val)) return val
    return JSON.stringify(val)
  }

  /*
  Reference:

    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#reserved_words

  Set of words that cannot be declared as identifiers in ES6+ strict mode. It
  should not include any other words. We compile to native JS modules, which
  require ES6+ and use strict mode. Therefore we should ignore older JS
  versions and loose mode.

  In violation of the guideline above, we include `undefined` as a special case
  to forbid its accidental redefinition and to avoid collision with the output
  of our macro `nil`.
  */
  static jsReservedWords = new StrSet([`arguments`, `await`, `case`, `catch`, `class`, `const`, `continue`, `debugger`, `default`, `delete`, `do`, `else`, `enum`, `eval`, `export`, `extends`, `false`, `finally`, `for`, `function`, `if`, `implements`, `import`, `in`, `instanceof`, `interface`, `let`, `new`, `null`, `package`, `private`, `protected`, `public`, `return`, `static`, `super`, `switch`, `this`, `throw`, `true`, `try`, `typeof`, `undefined`, `var`, `void`, `while`, `with`, `yield`])

  static isJsReservedWord(val) {return this.jsReservedWords.has(val)}
}

// FIXME
// Short for "qualified name".
export class QualName extends Name {
  static reg() {return this.regQualName()}
  getName() {return this.decompile().slice(this.sep().length)}
}

/*
Represents an identifier path such as `one.two.three`. The first element is
`UnqualName`. Each other element is `QualName`. An empty path is invalid and
never constructed by the compiler. A path without qualified names must behave
exactly like `UnqualName`, but is never constructed by the compiler.
*/
export class Path extends Ident {
  static lex(lex) {
    const span = lex.getSpan()
    const head = span.head()
    if (!head) return undefined

    /*
    We currently allow ".name" syntax only in identifier paths, without the
    general case of ".name" following an arbitrary expression. The general
    case is not useful because the Lisp call syntax makes it syntactically
    inconvenient. The more method calls you chain, the worse it gets.
    */
    if (a.isInst(head, QualName)) {
      throw LexerErr.atNode(head, `unexpected qualified name not preceded by unqualified name`)
    }

    if (!a.isInst(head, UnqualName)) return undefined

    span.inc()

    if (!a.isInst(span.findHead(Node.isMeaningful, Node), QualName)) {
      return head
    }

    const tar = new this()
    tar.setUnqual(head)
    span.inc()

    while (span.more()) {
      const next = span.head()

      // Drop spaces and comments if any.
      if (!Node.isMeaningful(next)) {
        span.inc()
        continue
      }

      if (a.isInst(next, QualName)) {
        tar.addQual(next)
        span.inc()
        continue
      }

      break
    }

    tar.setSpan(tar.Span.range(head.getSpan(), tar.last().getSpan()))
    return tar
  }

  #unqual = undefined
  getUnqual() {return this.#unqual}
  setUnqual(val) {
    a.reqInst(val, UnqualName)
    val.setParent(this)
    this.#unqual = val
    return this
  }

  #quals = undefined
  getQuals() {return this.#quals ||= []}
  optQuals() {return this.#quals}
  setQuals(src) {
    a.reqTrueArr(src)
    for (const val of src) a.reqInst(val, QualName).setParent(this)
    this.#quals = src
    return this
  }

  addQual(val) {
    a.reqInst(val, QualName)
    val.setParent(this)
    this.getQuals().push(val)
    return this
  }

  last() {return a.last(this.optQuals()) || this.getUnqual()}

  // /*
  // In addition to storing the source span and advancing the tokenizer, this
  // converts the path to a sequence of `Name` instances, storing them under
  // `.getNodes()`. Assigns the correct `StrSpan` to each name.

  // TODO cleanup if possible.
  // */
  // fromMatch(mat) {
  //   super.fromMatch(mat)

  //   const span = this.getSpan()
  //   const sep = a.reqStr(this.sep())
  //   const buf = a.split(mat[0], sep)

  //   let off = 0
  //   let ind = -1

  //   while (++ind < buf.length) {
  //     const len = buf[ind].length
  //     buf[ind] = new Name().setSpan(span.clone().skip(off).setLen(len))
  //     off += len + sep.length
  //   }
  //   return this.setNodes(buf)
  // }

  // head() {return a.reqTrueArr(this.getNodes())[0]}
  // rest() {return a.reqTrueArr(this.getNodes()).slice(1)}

  // qualify() {
  //   const prev = this.head()
  //   const next = prev.qualify()
  //   if (prev === next) return this

  //   // Internal sanity check. See `Name..qualify`.
  //   a.reqInst(next, Path)

  //   return new this.constructor()
  //     .fromNode(this)
  //     .setNodes(next.getNodes().concat(this.rest()))
  // }

  /*
  FIXME:

    * Resolve fully.
    * Use recursive version of `.getOrigin` at each step.
    * When a name resolves to something with a scope,
      assert that the next name is in that scope.
    * When not fully resolved, return nil.
  */
  // optDef() {
  //   // let def = this.head().optDef()
  //   // if (!(this.getLen() > 1)) return def

  //   // let orig = def?.getOrigin()

  //   // for (const val of this.rest()) {}
  // }

  // macroImpl() {
  //   let def = this.getUnqual().reqDef()

  //   for (const val of this.getQuals()) {
  //     // FIXME probably doesn't work, have to use origins.
  //     if ((def = def.resolve(val.getName()))) def.addUse(val)
  //     else break
  //   }

  //   return this.macroWithDef(def)
  // }
}

export class MixValued extends a.StaticWeakCache {
  static make(cls) {
    return class MixValued extends super.make(cls) {
      #val = undefined
      getVal() {return this.#val}
      setVal(val) {return this.#val = val, this}
    }
  }
}

export class ValNode extends MixValued.goc(Node) {
  compile() {return this.constructor.compile(this, this.getVal())}

  // Must match `.compile`.
  static isValid(val) {
    return (
      false
      || a.isNil(val)
      || a.isBool(val)
      || a.isNum(val)
      || a.isStr(val)
      || (a.isTrueArr(val) && val.every(this.isValid, this))
      || (a.isDict(val) && this.isValid(Object.values(val)))
    )
  }

  // Must match `.isValid`.
  static compile(node, val) {
    if (a.isNil(val) || a.isBool(val) || a.isNum(val)) return String(val)
    if (a.isStr(val)) return JSON.stringify(val)
    if (a.isTrueArr(val)) return this.compileArr(node, val)
    if (a.isDict(val)) return this.compileDict(node, val)
    throw node.err(`unable to encode ${a.show(val)} as JS code; currently supported types: undefined, null, bool, num, str, plain array, plain dict`)
  }

  static compileArr(node, val) {
    let out = `[`
    let first = true

    for (val of a.reqTrueArr(val)) {
      if (first) first = false
      else out += `, `

      out += this.compile(node, val)
    }

    out += `]`
    return out
  }

  static compileDict(node, val) {
    let out = `{`
    let first = true

    for (const key of Object.keys(a.reqDict(val))) {
      if (first) first = false
      else out += `, `

      out += UnqualName.toValidDictKey(key)
      out += `: `
      out += this.compile(node, val[key])
    }

    out += `}`
    return out
  }
}

export class NodeList extends Node {
  #nodes = undefined
  getNodes() {return this.#nodes ||= []}
  setNodes(val) {
    this.#nodes = a.reqTrueArr(val)
    for (val of val) this.reqNode(val).setParent(this)
    return this
  }

  // Standard JS iterable interface.
  [Symbol.iterator]() {return this.getNodes()[Symbol.iterator]()}

  // Compatibility with common JS interfaces.
  get size() {return this.getNodes().length}

  // For our own use. Less error prone than property getters.
  getLen() {return this.getNodes().length}

  // Secret interface in `@mitranim/js`.`iter.mjs`.
  toArray() {return this.getNodes()}

  addNode(val) {
    this.reqNode(val)
    val.setParent(this)
    this.getNodes().push(val)
    return this
  }

  head() {return this.getNodes()?.[0]}
  last() {return a.last(this.getNodes())}

  // TODO move to `MixErr`.
  reqNode(val) {return a.reqInst(val, Node)}

  reqLen(exp) {
    this.req(exp, a.isNat)
    const len = this.getLen()
    if (exp !== len) {
      throw this.err(`expected exactly ${exp} elements in ${a.show(this)}, got ${len}`)
    }
    return this
  }

  reqLenMin(exp) {
    this.req(exp, a.isNat)
    const len = this.getLen()
    if (!(exp <= len)) {
      throw this.err(`expected at least ${exp} elements in ${a.show(this)}, got ${len}`)
    }
    return this
  }

  reqLenMax(exp) {
    this.req(exp, a.isNat)
    const len = this.getLen()
    if (!(len <= exp)) {
      throw this.err(`expected no more than ${exp} elements in ${a.show(this)}, got ${len}`)
    }
    return this
  }

  reqLenBetween(min, max) {
    this.req(min, a.isNat)
    this.req(max, a.isNat)
    const len = this.getLen()
    if (!(min <= len) || !(len <= max)) {
      throw this.err(`expected between ${min} and ${max} elements in ${a.show(this)}, got ${len}`)
    }
    return this
  }

  macroFrom(ind) {
    this.req(ind, a.isNat)
    while (ind < this.getLen()) this.macroAt(ind++)
    return this
  }

  macroAt(ind) {
    this.req(ind, a.isNat)
    const tar = this.getNodes()
    const len = tar.length

    if (ind >= 0 && ind < len) {
      return tar[ind] = Node.macroNode(tar[ind])
    }
    throw this.err(`index ${ind} out of bounds for length ${len}`)
  }

  static fromNodes(src) {return new this().setNodes(src)}
}

export class DelimNodeList extends NodeList {
  static pre() {throw errMeth(`pre`, this)}
  static suf() {throw errMeth(`suf`, this)}

  pre() {return this.constructor.pre()}
  suf() {return this.constructor.suf()}

  // TODO simplify.
  static lex(lex) {
    const pre = a.reqValidStr(this.pre())
    const suf = a.reqValidStr(this.suf())
    const span = lex.getSpan()
    const head = span.head()

    if (!head) return undefined
    if (head.decompile() === suf) throw LexerErr.atNode(head, `unexpected closing ${a.show(suf)}`)
    if (head.decompile() !== pre) return undefined

    const tar = new this()
    span.inc()

    while (span.more()) {
      const next = span.head()

      if (next.decompile() === suf) {
        tar.setSpan(tar.Span.range(head.getSpan(), next.getSpan()))
        span.inc()
        return tar
      }

      tar.addNode(lex.popNext())
    }

    throw LexerErr.atNode(span.last(), `missing closing ${a.show(suf)}`)
  }

  meaningfulNodes() {return this.getNodes().filter(Node.isNodeMeaningful, Node)}
  firstMeaningful() {return this.getNodes().find(Node.isMeaningful, Node)}
  isEveryMeaningful() {return this.getNodes().every(Node.isMeaningful, Node)}

  reqEveryMeaningful() {
    if (!this.isEveryMeaningful()) {
      throw this.err(`expected every node to be meaningful (no whitespace or comments)`)
    }
    return this
  }

  macroImpl() {
    const def = this.firstMeaningful()?.onlyInst(Ident)?.optDef()
    if (def?.isMacro()) return def.macroNode(this)
    return this.macroFrom(0)
  }

  compile() {
    const prn = this.reqPrn()
    const src = this.getNodes()
    const ind = src.findIndex(Node.isMeaningful, Node)
    if (!(ind >= 0)) return prn.compileDense(src)

    const style = src[ind].onlyInst(Ident)?.optDef()?.getCallStyle() || CallStyle.call

    // Reslicing is suboptimal but probably not our bottleneck.
    const pre = src.slice(0, ind + 1)
    const suf = src.slice(ind + 1)
    const call = prn.compileDense(pre) + `(` + prn.compileCommaMultiLine(suf) + `)`

    if (style === CallStyle.call) return call
    if (style === CallStyle.new) return `new ` + call
    throw this.err(CallStyle.msgUnrec(style))
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

/*
Usage:

  * Subclass must define static own enumerable fields.
  * Each field must be a string, which must EXACTLY match the field name.
    * Mismatching name and value = undefined behavior.
  * Uses only own fields, ignores inherited fields.
*/
export class Enum extends a.Emp {
  constructor() {
    throw TypeError(`enum ${new.target.name} does not support instantiation`)
  }

  // TODO consider taking a node for error context.
  static reqValid(key) {
    if (!a.isStr(key)) {
      throw TypeError(`keys for enum ${this.name} must be strings, found ${a.show(val)}`)
    }
    if (!a.hasOwn(this, key)) {
      throw TypeError(`unknown key ${a.show(key)} for enum ${this.name}; known keys: ${a.show(Object.keys(this))}`)
    }
    const val = this[key]
    if (val !== key) {
      throw TypeError(`key-value mismatch in enum ${this.name}: key ${a.show(key)}, val ${a.show(val)}`)
    }
    return val
  }

  static validate() {
    const keys = Object.keys(this)
    if (!keys.length) throw TypeError(`invalid empty enum ${a.show(this)}`)
    for (const key of keys) this.reqValid(key)
  }

  static has(val) {return a.isStr(val) && a.hasOwn(this, val) && this[val] === val}

  static msgUnrec(val) {
    if (this.has(val)) {
      return `unsupported value ${a.show(val)} of enum ${this.name}`
    }
    return `unrecognized value ${a.show(val)} for enum ${this.name}`
  }
}

/*
Tentative. The "list" call syntax is the traditional Lisp approach. We currently
support it implicitly throughout the compiler. We may accidentally hardcode
assumptions that this is the only call syntax.

TODO: consider supporting additional call syntaxes. May require changes
throughout the compiler. For example:

  * Call syntax = "bare".
  * Mere mention of an identifier calls it.
  * If macro:
    * The input is the identifier node.
    * The macro can use parent/child relations to traverse the AST.
  * If runtime:
    * Compiles to a nullary call, according to `CallStyle`.
  * Requires changes in `NodeList`/`DelimNodeList` and maybe
    `Ident`/`Path`/`Name`.
*/
export class CallSyntax extends Enum {
  static list = `list`
  static bare = `bare`
  static {this.validate()}
}

export class CallTime extends Enum {
  static macro = `macro`
  static run = `run`
  static {this.validate()}
}

// TODO rename ".call" to something more specific.
export class CallStyle extends Enum {
  static call = `call`
  static new = `new`
  static {this.validate()}
}

/*
Covariance:

  * `CallTime.run` implies `CallOut.val`.
    Different `CallOut` = undefined behavior.

  * `CallOut.ast` implies `CallTime.macro`.
    Different `CallTime` = undefined behavior.

  * This may be changed in the future.
*/
export class CallOut extends Enum {
  static ast = `ast`
  static val = `val`
  static {this.validate()}
}

export class CallOpt extends MixInsp.goc(a.Emp) {
  #callSyntax = CallSyntax.list
  getCallSyntax() {return this.#callSyntax}
  setCallSyntax(val) {return this.#callSyntax = CallSyntax.reqValid(val), this}

  #callTime = CallTime.run
  getCallTime() {return this.#callTime}
  setCallTime(val) {return this.#callTime = CallTime.reqValid(val), this}

  #callStyle = CallStyle.call
  getCallStyle() {return this.#callStyle}
  setCallStyle(val) {return this.#callStyle = CallStyle.reqValid(val), this}

  #callOut = CallOut.val
  getCallOut() {return this.#callOut}
  setCallOut(val) {return this.#callOut = CallOut.reqValid(val), this}

  isMacro() {return this.getCallTime() === CallTime.macro}

  macroNode(src) {throw src.err(msgMeth(`macroNode`, this))}

  macroNodeWith(src, fun) {
    a.reqInst(src, Node)
    src.req(fun, a.isFun)
    return this.macroOut(src, this.macroCall(src, fun), fun)
  }

  macroCall(src, fun) {
    const style = this.getCallStyle()
    if (style === CallStyle.call) return this.macroCallCall(src, fun)
    if (style === CallStyle.new) return this.macroCallNew(src, fun)
    throw src.err(CallStyle.msgUnrec(style))
  }

  macroCallCall(src, fun) {
    try {return fun(src)}
    catch (err) {throw src.err(msgMacroRun(fun), err)}
  }

  macroCallNew(src, fun) {
    try {return new fun(src)}
    catch (err) {throw src.err(msgMacroRun(fun), err)}
  }

  // FIXME support async.
  macroOut(src, out, fun) {
    const outType = this.getCallOut()
    if (outType === CallOut.ast) return this.macroOutAst(src, out, fun)
    if (outType === CallOut.val) return this.macroOutVal(src, out, fun)
    throw src.err(CallOut.msgUnrec(outType))
  }

  // FIXME support async.
  macroOutAst(src, out, fun) {
    if (a.isNil(out)) return out

    if (a.isInst(out, Node)) {
      /*
      Any AST node that represents a macro call must be replaced. Otherwise we
      have to also compile it as JS, producing both a macro call and a runtime
      call. Code that represents a macro call is often not translatable into
      valid JS. Non-exhaustive list of reasons:

        * Unqualified names imported via mixins must be translated into
          qualified names. This is done as part of `Ident` macroexpansion, and
          may be skipped when calling a macro referenced by the identifier.
          When a macro returns the code as-is, the source ident is still
          unqualified and thus invalid.

        * When compiling in production mode, we want to exclude all
          macro-related code. Leaving any mention of macro names may prevent
          that.
      */
      if (src === out) {
        throw src.err(`expected macro ${a.show(fun)} to replace the source node, but the macro returned the node unchanged`)
      }
      return out
    }

    throw src.err(`expected macro ${a.show(fun)} to return nil or an AST node, got ${a.show(out)}`)
  }

  // FIXME support async.
  macroOutVal(src, out, fun) {
    const cls = ValNode
    if (cls.isValid(out)) return new cls().setVal(out)
    throw src.err(`expected macro ${a.show(fun)} to return a value compatible with ${a.show(cls)}, got ${a.show(out)}`)
  }

  callOptStr() {
    return [
      a.reqValidStr(this.getCallSyntax()),
      a.reqValidStr(this.getCallTime()),
      a.reqValidStr(this.getCallStyle()),
      a.reqValidStr(this.getCallOut()),
    ].join(` `)
  }

  callOptFromStr(src) {
    const mat = a.reqStr(src).split(` `)
    const syntax = CallSyntax.reqValid(mat[0])
    const time = CallTime.reqValid(mat[1])
    const style = CallStyle.reqValid(mat[2])
    const out = CallOut.reqValid(mat[3])

    return this
      .setCallSyntax(syntax)
      .setCallTime(time)
      .setCallStyle(style)
      .setCallOut(out)
  }

  [Insp.symMod()](tar) {
    return tar.funs(
      this.getCallSyntax,
      this.getCallTime,
      this.getCallStyle,
      this.getCallOut,
    )
  }
}

function msgMacroRun(fun) {return `error when running macro ${a.show(fun)}`}

export class MixNamed extends a.StaticWeakCache {
  static make(cls) {
    return class MixNamed extends super.make(cls) {
      #name = undefined
      getName() {return this.#name}
      setName(val) {return this.#name = a.reqValidStr(val), this}
    }
  }
}

export class Def extends MixNamed.goc(MixChild.goc(CallOpt)) {
  #uses = undefined
  getUses() {return this.#uses ||= new UnqualNameSet()}
  addUse(val) {return this.getUses().add(val), this}

  pk() {return this.getName()}
  setParent(val) {return super.setParent(a.reqInst(val, Scope))}
  // Must override in subclass. Must return a function or class.
  getVal() {throw errMeth(`getVal`, this)}

  getOrigin() {
    throw FIXME
  }

  /*
  TODO: JS reserved words must be detected contextually, only when used as bare
  names. Using them as property/method names, and in paths, is perfectly
  possible.

  TODO: implement automatic renaming. Possible causes:

    * Avoiding conflicts with JS reserved words.
    * Module merging.
  */
  compileName(node) {
    const name = this.getName()
    if (UnqualName.isJsReservedWord(name)) {
      throw node.err(`${a.show(name)} is a reserved keyword in JS; its use would generate invalid JS that doesn't run; please rename`)
    }
    return name
  }

  [Insp.symMod()](tar) {
    return super[Insp.symMod()](tar.funs(this.getName))
  }
}

export class UnqualNameSet extends a.TypedSet {
  reqVal(val) {return a.reqInst(val, UnqualName)}
}

/*
Short for "reference definition". Variant of `Def` where `.getVal` is
approximately like:

  this.getOrigin().getVal()[this.getRefName()]

Must be used for definitions in the root of user-defined Jisp modules, where the
definition refers to the module.
*/
export class RefDef extends Def {
  // FIXME: `.getVal` / `.getOrigin`.

  // #refName = undefined
  // getRefName() {return this.#refName}
  // setRefName(val) {return this.#refName = a.reqValidStr(val), this}
}

export class FunDef extends Def {
  #fun = undefined
  getFun() {return this.#fun}
  setFun(val) {return this.#fun = a.reqFun(val), this}
  getVal() {return a.reqFun(this.getFun())}
  macroNode(node) {return this.macroNodeWith(node, this.getVal())}
}

/*
Variant of `Def` used for definitions generated from AST nodes, mostly by macros
that add identifiers to scope, such as `Use`, `Const`, `Fn`.
*/
export class NodeDef extends MixNodeSourced.goc(Def) {
  // Note: `Def..pk` uses this.
  getName() {return a.pk(this.getSrcNode())}

  // // FIXME requires this to subclass `Node`.
  // macroImpl() {
  //   this.defineLex()
  //   return this
  // }
}

export class MacroNode extends Node {
  static getName() {throw errMeth(`getName`, this)}

  static def() {
    return new FunDef()
      .setName(this.getName())
      .setCallTime(CallTime.macro)
      .setCallStyle(CallStyle.new)
      .setCallOut(CallOut.ast)
      .setFun(this)
  }

  getName() {return this.constructor.getName()}
  getSrcNodes() {return a.reqTrueArr(this.reqSrcList().getNodes())}
  reqSrcList() {return this.reqSrcInst(NodeList)}

  reqSrcInst(cls) {
    const src = this.getSrcNode()
    if (a.isInst(src, cls)) return src
    throw this.err(`macro ${a.show(this.getName())} requires the source node to be an instance of ${a.show(cls)}, got ${a.show(src)}`)
  }

  reqSrcAt(ind) {
    this.req(ind, a.isNat)
    const src = this.getSrcNodes()
    const len = src.length

    if (!(ind < len)) {
      throw this.err(`macro ${a.show(this.getName())} requires at least ${ind+1} arguments, found ${len}`)
    }

    const out = src[ind]
    if (out) return out

    // Internal sanity check. Should not be possible.
    throw this.err(`macro ${a.show(this.getName())} requires a valid node at index ${ind}, found ${a.show(out)}`)
  }

  optSrcAt(ind) {
    return this.getSrcNodes()[this.req(ind, a.isNat)]
  }

  reqSrcInstAt(ind, ...cls) {
    const out = this.reqSrcAt(ind)
    if (someInst(out, cls)) return out
    throw this.err(`macro ${a.show(this.getName())} requires the argument at index ${ind} to be an instance of one of the following classes: ${a.show(cls)}, found ${a.show(out)}`)
  }

  optSrcInstAt(ind, ...cls) {
    const out = this.optSrcAt(ind)
    if (a.isNil(out)) return undefined
    if (someInst(out, cls)) return out
    throw this.err(`macro ${a.show(this.getName())} requires the argument at index ${ind} to be either missing or an instance of one of the following classes: ${a.show(cls)}, found ${a.show(out)}`)
  }

  srcNodesFrom(ind) {
    this.req(ind, a.isNat)
    if (!ind) return this.getSrcNodes()
    return this.reqSrcList().reqLenMin(ind + 1).getNodes().slice(ind)
  }
}

function someInst(val, cls) {
  for (cls of cls) if (a.isInst(val, cls)) return true
  return false
}

/*
Used for identifiers provided by both Jisp and JS, such as `null`. Motives:

  * Jisp requires all identifiers to be defined, either as built-ins or in user
    code. Unknown identifiers cause a compile error. We have no choice but to
    predefine common built-ins.

  * Unlike JS, Jisp does not pollute the syntax with keywords. For example, in
    JS `null` is a keyword, special-cased at the syntax level, but in Jisp
    `null` is merely an identifier provided by the `prelude` module.

  * Using a specialized macro class makes it easier to declare such identifiers
    and makes it possible to define special `.getVal` implementations. Other
    macros may use `instanceof` and/or `.getVal`, using primitive constants as
    part of their APIs. This is just as powerful as specialized AST tokens, but
    without syntactic special-cases.

Because Jisp has only identifiers without keywords, user code may accidentally
redefine/shadow the names of built-in constants such as `null`. It should not
affect our correctness in any way, because we track identifiers to their
definition sites, and can tell the difference between a predeclared name and a
shadowing name. For constants this behavior is bad, because editor syntax
highlighting tends to assume that they are never redefined, and highlights
built-in constants using special colors, which is incorrect after redefinition.
Additionally, this would compile to invalid JS that fails to parse. We may
resolve this in any of the following ways:

  * Don't do anything special. Generate invalid JS and allow it to fail.

  * Automatically rename keyword identifiers to non-keywords.

  * Generate compile-time exceptions, warning the user.
*/
export class PredeclMacroNode extends MacroNode {
  static getCompiledName() {throw errMeth(`getCompiledName`, this)}
  getCompiledName() {return this.constructor.getCompiledName()}
  getVal() {throw errMeth(`getVal`, this)}
  macro() {return this}
  compile() {return this.getCompiledName()}
}

/*
This must be the ONLY member of the "predeclared" scope. All other identifiers
provided by the language must be part of the "prelude" module/scope which must
be imported explicitly.

TODO:

  * Provide a similar macro that does not import the module at compile time,
    and therefore does not support using macros from that module. Useful for
    non-Jisp modules. Avoids the overhead of unnecessary compile-time imports.
    More importantly, avoids exceptions in JS libraries that assume a browser.

  * Instead of `"*"`, use `*` or `...` without quotes. Requires tokenizer
    changes.

FIXME:

  * When "*":
    * Generate a unique name.
      * Consult current scope to avoid conflicts.
    * When compiling:
      * Every `UnqualName` from this module must be qualified, using this name.
        * `UnqualName..macroImpl`.
        * Requires access from scope to `Use`.
*/
export class Use extends MixValued.goc(MacroNode) {
  static getName() {return `use`}
  static getTarName() {return this.getName()}

  pk() {return a.pk(this.reqDestName())}
  strAll() {return `*`}
  setVal(val) {return super.setVal(a.reqInst(val, Module))}
  addr() {return this.reqSrcInstAt(1, Str)}
  dest() {return this.optSrcInstAt(2, UnqualName, Str)}
  destName() {return a.onlyInst(this.dest(), UnqualName)}
  reqDestName() {return a.reqInst(this.dest(), UnqualName)}

  destStr() {
    const src = a.onlyInst(this.dest(), Str)
    if (!src) return undefined

    const str = src.getVal()
    const exp = this.strAll()
    if (str !== exp) {
      throw this.err(`macro ${a.show(this.getName())} requires argument at index 2 to be either a name or a string containing exactly ${a.show(exp)}, found invalid string ${a.show(str)}`)
    }
    return src
  }

  reqVal() {
    return (
      this.getVal() ||
      this.throw(`internal error: the imported module got requested before the import was actually executed`)
    )
  }

  macroImpl() {
    this.reqSrcList().reqEveryMeaningful().reqLenBetween(2, 3)
    this.addr()
    if (this.destStr()) return this.macroAll()
    return this.macroName()
  }

  async import() {
    this.setVal(await this.reqRoot().getModules().import(this.addr().getVal()))
  }

  async macroAll() {
    await this.import()
    this.reqLexScope().addMixin(this)
    return undefined
  }

  async macroName() {
    await this.import()
    this.defineLex()
    return this
  }

  // Required for `.macroAll`.
  getPubNsScope() {return this.reqVal().getPubNsScope()}

  // FIXME return evaluated module.
  getOrigin() {throw a.errImpl()}

  compile() {
    const prn = this.reqPrn()

    if (!this.dest()) {
      return `import ${a.reqStr(this.compileAddr(prn))}`
    }

    const name = this.destName()
    if (!name) {
      throw this.err(`internal error: unable to compile ${a.show(this.getName())} because it uses an import format incompatible with JS; must be elided from the AST before compiling to JS`)
    }

    return `import * as ${prn.compile(name)} from ${a.reqStr(this.compileAddr(prn))}`
  }

  // Normalizes quotes for compatibility with the JS syntax, which currently
  // allows only single and double quotes for imports, not backtick quotes.
  compileAddr(prn) {
    return prn.compile(JSON.stringify(this.addr().getVal()))
  }
}

export class MixMixable extends a.StaticWeakCache {
  static make(cls) {
    return class MixMixable extends MixErr.goc(super.make(cls)) {
      #mixins = undefined
      getMixins() {return this.#mixins ||= []}
      optMixins() {return this.#mixins}
      setMixins(val) {return this.#mixins = a.reqTrueArr(val), this}
      hasMixin(val) {return !!this.optMixins()?.includes(val)}

      // Override in subclass.
      reqMixin(val) {return val}

      // hasMixinDeep(val) {
      //   return (
      //     this.hasMixin(val) ||
      //     !!this.optMixins()?.some(hasMixinDeepSelf, val)
      //   )
      // }

      addMixin(val) {
        this.reqMixin(val)
        if (this.hasMixin(val)) return this
        if (DEBUG) this.validateMixin(val)
        this.getMixins().push(val)
        return this
      }

      // Known limitation: shallow, doesn't check mixins of mixins.
      validateMixin(val) {
        // this.reqMixin(val)

        if (val === this) {
          throw this.err(`${a.show(this)} is not allowed to be its own mixin`)
        }
        if (this.hasMixin(val)) {
          throw this.err(`${a.show(this)} already has mixin ${a.show(val)}`)
        }

        // This works only if mixins implement `MixMixable`.
        //
        // const mixins = this.optMixins()
        // if (mixins) {
        //   for (const mix of mixins) {
        //     if (mix.hasMixinDeep(val)) {
        //       throw this.err(`${a.show(this)} already has indirect mixin ${a.show(val)} through direct mixin ${a.show(mix)}`)
        //     }
        //   }
        // }
      }
    }
  }
}

// function hasMixinDeepSelf(val) {return val.hasMixinDeep(this)}

export class Scope extends MixMixable.goc(MixChild.goc(a.Coll)) {
  // For `a.TypedMap` used by `a.Coll`.
  reqKey(key) {return a.reqValidStr(key)}
  reqVal(val) {return a.reqInst(val, Def)}

  /*
  For `MixMixable`.

  A simpler interface would just use `Scope` instances as mixins. We use this
  more complex interface because a scope reference is insufficient. We need the
  cause, which is usually an AST node that adds an additional scope.

  For example, the `Use` macro, in "import all" mode, imports another module and
  adds its public scope as a mixin to the local lexical scope where `Use` was
  found. This allows unqualified names to refer to exports from another module.
  To actually compile that code into valid JS, we must convert unqualified
  names to qualified names, which may require access to the original `Use`,
  which is what gets added here as a mixin.
  */
  reqMixin(val) {return reqPubNsScoped(val)}

  // For `MixErr`.
  err(...val) {return new ScopeErr(...val)}

  add(val) {
    this.reqVal(val).setParent(this)
    return super.add(val)
  }

  set(key, val) {
    if (this.has(key)) {
      throw this.err(`redundant declaration of ${a.show(key)}${a.reqStr(this.parentContext())}`)
    }
    return super.set(key, val)
  }

  replace(key, val) {return super.set(key, val)}

  /*
  Finds a given name in the scope, including mixins. Returns nil or `Def`.

  FIXME not good enough. When resolving from a mixin, the consumer requires
  the source of the mixin.
  */
  resolve(key) {
    this.reqKey(key)
    return this.get(key) || this.resolveFromMixins(key)
  }

  resolveFromMixins(key) {
    const resolve = val => val.getPubNsScope().resolve(key)
    return a.procure(this.optMixins(), resolve)
  }

  // For error messages.
  parentContext() {
    const span = this.ancProcure(getSpan)
    if (!span) return ``
    return joinLines(`in scope declared here:`, span.context())
  }

  // Discredited. Our own `prelude` wants to export some macro classes without
  // automatically turning them into public macros in the Jisp module that it
  // defines.
  //
  // addFromNativeModule(src) {
  //   for (const key of a.structKeys(reqNativeModule(src))) {
  //     this.addFromNativeModuleEntry(key, src[key])
  //   }
  //   return this
  // }

  // addFromNativeModuleEntry(key, val) {
  //   if (a.isSubCls(val, MacroNode)) this.add(val.def())
  // }
}

function getSpan(src) {
  return a.isObj(src) && `getSpan` in src ? src.getSpan() : undefined
}

export class ScopeErr extends Err {}

export class LexScope extends Scope {
  getLexScope() {return this}

  // resolve(key) {return super.resolve(key) || this.resolveFromParent(key)}

  // FIXME remove.
  //
  // /*
  // Caution: not all scope types should implement this.
  //
  // Implementation note. This currently doesn't use `MixChild` methods such as
  // `.procure` because scopes are not directly in the AST child-to-ancestor
  // chain. Scopes tend to be stored as tiny dead-end branches. Scope ancestors
  // may or may not have their own scopes. As a result, `.ancProcure(getLexScope)`
  // would lead to an infinite cycle. To avoid that, we'd have to skip the parent:
  // `.getParent()?.getParent()`. But that would rely on internal details of how
  // nodes are currently related to scopes, and would break for any alternative
  // implementation, such as having a node that IS a scope, rather than HAS a
  // scope. Additionally, we prefer to recursively call `.resolve` on the nearest
  // ancestor scope, to allow scopes to substitute the implementation if necessary.
  // */
  // resolveFromParent(key) {
  //   let tar = this
  //   while ((tar = tar.getParent())) {
  //     const scope = tar.getLexScope()
  //     if (scope === this) continue
  //     if (scope) return scope.resolve(key)
  //   }
  //   return undefined
  // }
}

export class NsScope extends Scope {}

export class PubNsScope extends NsScope {
  getPubNsScope() {return this}

  /*
  Must be provided to the scope of every user-defined module, as a mixin.
  This scope must contain EXACTLY ONE member: the `use` macro. All other
  built-ins must be defined in the `prelude` module.
  */
  static predeclared = new this().add(Use.def())
}

export class Module extends (
  MixValued.goc(MixPubNsScoped.goc(MixLexScoped.goc(NodeList)))
) {
  // TODO validate that the path is absolute.
  #absPath = undefined
  getAbsPath() {return this.#absPath}
  setAbsPath(val) {return this.#absPath = a.reqValidStr(val), this}

  pk() {return this.getAbsPath()}
  setVal(val) {return super.setVal(reqNativeModule(val))}
  fromStr(src) {return this.setNodes(Lexer.nodesFromStr(src))}
  // makeLexScope() {return new ModuleLexScope().setParent(this).default()}

  // makeLexScope() {
  //   return new Scope().setParent(this).addMixin(this.constructor.predeclared)
  // }

  makeLexScope() {
    return new Scope().setParent(this).addMixin(PubNsScope.predeclared)
  }

  /*
  Async version of `NodeList..macroImpl` without support for "list call" syntax.
  This let us support `Use`, which uses dynamic imports, in module root. Other
  macro implementations must be synchronous for simplicity and speed reasons.
  */
  async macroImpl() {
    const tar = this.getNodes()
    let ind = -1
    while (++ind < tar.length) {
      tar[ind] = await Node.macroNodeAsync(tar[ind])
    }
    return this
  }

  static fromNative(key, src) {
    a.reqValidStr(key)
    reqNativeModule(src)

    return (
      a.onlyInst(src.default, Module) ||
      new this().setPubNsScope(new PubNsScope().addFromModule(src))
    )
      .setVal(src)
      .setAbsPath(key)
  }

  // static predeclared = new this().setPubNsScope(PubNsScope.predeclared)
}

// export class ModuleLexScope extends LexScope {
//   default() {return this.addMixin(PubNsScope.predeclared)}
// }

export class MixPromised extends a.StaticWeakCache {
  static make(cls) {
    return class MixPromised extends super.make(cls) {
      #promises = undefined
      getPromises() {return this.#promises ||= new PromiseMap()}
      setPromises(val) {return this.#promises = a.reqInst(val, PromiseMap), this}
    }
  }
}

export class PromiseMap extends a.TypedMap {
  reqKey(key) {return a.reqValidStr(key)}
  reqVal(val) {return a.reqPromise(val)}
}

export class NativeModuleMap extends a.TypedMap {
  reqKey(key) {return a.reqValidStr(key)}
  reqVal(val) {return reqNativeModule(val)}
}

export function isNativeModule(val) {
  return (
    a.isObj(val) &&
    a.isNil(Object.getPrototypeOf(val)) &&
    val[Symbol.toStringTag] === `Module`
  )
}

export function reqNativeModule(val) {return a.req(val, isNativeModule)}
export function optNativeModule(val) {return a.opt(val, isNativeModule)}

export class MixImporter extends MixPromised {
  static make(cls) {
    return class MixImporter extends MixChild.goc(super.make(cls)) {
      import(key) {
        return (
          this.get(key) ||
          this.getPromises().get(key) ||
          this.getPromises().setVal(key, this.importAsync(key))
        )
      }

      // Override in subclass.
      async importAsync() {}
    }
  }
}

export class NativeModuleCache extends MixImporter.goc(NativeModuleMap) {
  // Only for internal use.
  async importAsync(key) {
    const val = await import(key)
    this.set(key, val)
    return val
  }
}

export class ModuleColl extends a.Coll {
  // For `a.TypedMap` used by `a.Coll`.
  reqKey(key) {return a.reqValidStr(key)}
  reqVal(val) {return a.reqInst(val, Module)}
}

export class ModuleCache extends MixImporter.goc(ModuleColl) {
  #native = undefined
  getNative() {return this.#native ||= new NativeModuleCache()}
  setNative(val) {return this.#native = a.reqInst(val, NativeModuleCache), this}

  add(val) {
    super.add(val)
    val.setParent(this)
    return this
  }

  reqKey(key) {
    if (!a.isStr(key)) {
      throw this.err(`import paths must be string, got ${a.show(key)}`)
    }
    if (!hasScheme(key)) {
      throw this.err(`import paths must be scheme-qualified URLs (file URL or network URL), got ${a.show(key)}`)
    }
    return key
  }

  // Only for internal use.
  async importAsync(key) {
    a.reqValidStr(key)
    const scheme = a.reqValidStr(this.langScheme())
    if (key.startsWith(scheme)) {
      return this.importLangModule(key.slice(scheme.length))
    }
    return this.importAnyModule(key)
  }

  // Only for internal use.
  // TODO support Windows.
  async importLangModule(key) {
    key = this.langPath(key)

    return this.added(Module.fromNative(
      key,
      await this.getNative().import(key),
    ))
  }

  // FIXME look for header files and use them.
  async importAnyModule(key) {
    this.reqKey(key)

    return this.added(Module.fromNative(
      key,
      await this.getNative().import(key),
    ))
  }

  langScheme() {return `jisp:`}

  // TODO validate that the key is a single word.
  langPath(key) {
    return p.posix.join(
      p.posix.dir(import.meta.url),
      a.reqValidStr(key) + `.mjs`,
    )
  }
}

function hasScheme(val) {
  return a.isStr(val) && /^[A-Za-z][\w+.-]*:[/][/]/.test(val)
}

export class Root extends a.Emp {
  #modules = undefined
  getModules() {return this.#modules ||= new ModuleCache().setParent(this)}
  setModules(val) {return this.#modules = a.reqInst(val, ModuleCache), this}
}