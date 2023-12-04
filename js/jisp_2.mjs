import * as a from '/Users/m/code/m/js/all.mjs'
import * as p from '/Users/m/code/m/js/path.mjs'

// `DEBUG` enables optional sanity checks. TODO make configurable.
export const DEBUG = true
export const SCHEME = `jisp:`
export const EXT_LANG = `.jisp`
export const EXT_NATIVE = `.mjs`

/*
Code conventions:

  * Methods vs getters:
    * Prefer methods over property getters.
    * Use property getters only to implement common JS interfaces.
    * Methods are less error-prone. Missing a method name produces a runtime
      exception, while missing a property name produces `undefined`.
  * Method naming:
    * Use "ownX" for methods that reflect a property 1-1. Such getters MUST be
      either free or very cheap. Idempotent cached allocation is also allowed.
    * Avoid the "get" prefix for methods that may perform expensive work on each
      call, including but not limited to generating new data structures,
      iterating, or walking arbitrarily-long ancestor chains.

Common interfaces (non-exhaustive list):

  * `.optSpan`. Returns `StrSpan` referring to a region of source code, or
    `ArrSpan` referring to AST tokens. All AST nodes parsed from source must
    have a valid `StrSpan`. All AST nodes created by macros must refer to other
    nodes which ultimately have a valid `StrSpan`.

  * `.optSrcNode`. Used by nodes created by macros to replace other nodes.
    Each replacement node must use this method to refer to another node,
    ultimately referring to a node parsed from source code.

  * `.ownVal`. Compile-time evaluation. Performs arbitrary compile-time
    evaluation and returns an arbitrary value usable by macros. AST tokens
    parsed from source may return numbers, strings, booleans, etc. Identifier
    nodes may return the actual runtime values of definitions they refer to.
    For example, module A defines and exports a class that's usable as a macro,
    under name "B". Module C imports A and attempts to use B as a macro. The
    identifier node referring to B may use `.ownVal`, in combination with
    recursive search, to return the actual evaluated reference to that class
    from module A, allowing us to call that macro.

  * ...
*/

export function decompile(val) {return a.laxStr(val?.decompile())}
export function compile(val) {return a.laxStr(val?.compile())}

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

function joinLines(...val) {return a.joinLinesOptLax(val)}

export class TokenizerErr extends CodeErr {}

export class LexerErr extends CodeErr {}

// TODO drop this from all non-Node types.
export class MixErr extends a.StaticWeakCache {
  static make(cls) {
    return class MixErr extends super.make(cls) {
      err(...val) {return super.err?.(...val) || new Err(...val)}

      // Useful in expressions. Prefer normal `throw` in statements.
      throw(...val) {throw this.err(...val)}

      asReqInst(cls) {return this.reqInst(this, cls)}

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
    }
  }
}

// Short for "inspectable".
class Insp extends a.Emp {
  #tar = undefined
  ownTar() {return this.#tar}
  setTar(val) {return this.#tar = a.reqObj(val), this}

  mut(...src) {return a.assign(this, ...src)}

  funs(...fun) {
    a.reqArrOf(fun, a.isFun)
    const tar = this.ownTar()
    for (fun of fun) this[fun.name] = fun.call(tar)
    return this
  }

  get [Symbol.toStringTag]() {
    const tar = this.ownTar()
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
  ownSrc() {return this.#src}
  setSrc(val) {return this.#src = reqStrOrArr(val), this}
  withSrc(val) {return this.clone().setSrc(val)}

  #pos = 0
  ownPos() {return this.#pos}
  setPos(val) {return this.#pos = a.reqNat(val), this}
  withPos(val) {return this.clone().setPos(val)}
  nextPos() {return this.#pos + this.#len}

  #len = 0
  ownLen() {return this.#len}
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

  static range(begin, end) {
    return new this()
      .setSrc(begin.ownSrc())
      .setPos(begin.ownPos())
      .setLen(end.nextPos() - begin.ownPos())
  }

  static optRange(begin, end) {
    return a.isSome(begin) && a.isSome(end) ? this.range(begin, end) : undefined
  }

  [Insp.symMod()](tar) {
    return tar.funs(this.decompile, this.ownPos, this.ownLen)
  }
}

function isStrOrArr(val) {return a.isStr(val) || a.isTrueArr(val)}
function reqStrOrArr(val) {return a.req(val, isStrOrArr)}
function preview(src) {return a.ell(src, 128)}

export class StrSpan extends Span {
  setSrc(val) {return super.setSrc(a.reqStr(val))}
  rowCol() {return new RowCol().fromUtf16(this.ownSrc(), this.ownPos())}

  /*
  FIXME:

    * Consider including preceding code (requires highlighting).
    * Consider indentation.
    * Consider colors.
    * Consider highlighting specific region with carets.
  */
  context() {
    return joinLines(
      // `position (UTF-16): ` + this.ownPos(),
      `row:col: ` + this.rowCol().strShort(),
      `source ↓:\n` + preview(this.rem()),
    )
  }
}

export class ArrSpan extends Span {
  setSrc(val) {return super.setSrc(a.reqArr(val))}
  optHead() {return this.at(this.ownPos())}
  at(ind) {return this.ownSrc()[a.reqNat(ind)]}
  atRel(off) {return this.at(this.ownPos() + a.reqNat(off))}
  optLast() {return a.last(this.ownSrc())}
  reqLast() {return this.optLast() ?? a.panic(new Err(`missing last element for span ${a.show(this)}`))}

  popHead() {
    const tar = this.optHead()
    this.inc()
    return tar
  }

  findHead(fun, ctx) {
    a.reqFun(fun)

    const src = this.ownSrc()
    let ind = this.ownPos() - 1

    while (++ind < src.length) {
      const val = src[ind]
      if (fun.call(ctx, val)) return val
    }
    return undefined
  }

  skipWhile(fun, ctx) {
    a.reqFun(fun)
    while (this.more()) {
      if (fun.call(ctx, this.optHead())) this.inc()
      else return this
    }
    return this
  }

  skipMeaningless() {return this.skipWhile(Node.isMeaningless, Node)}
}

export class MixOwnSpanned extends MixErr {
  static make(cls) {
    return class MixOwnSpanned extends super.make(cls) {
      #span = undefined
      ownSpan() {return this.#span}
      optSpan() {return this.#span}
      setSpan(val) {return this.#span = this.reqInst(val, this.Span), this}
      initSpan() {return this.#span ||= new this.Span()}

      reqSpan() {
        return (
          this.optSpan() ??
          this.throw(`missing span at ${a.show(this)}`)
        )
      }

      decompile() {return decompile(this.optSpan())}
      get Span() {return this.constructor.Span}
      static get Span() {return Span}
    }
  }
}

export class RowCol extends MixInsp.goc(a.Emp) {
  #row = undefined
  ownRow() {return this.#row}
  setRow(val) {return this.#row = a.reqNat(val), this}

  #col = undefined
  ownCol() {return this.#col}
  setCol(val) {return this.#col = a.reqNat(val), this}

  strShort() {
    const row = this.ownRow()
    const col = this.ownCol()
    return row && col ? (row + `:` + col) : ``
  }

  /*
  Regular JS strings are encoded as UTF-16. The indexing syntax `str[ind]`
  and various methods such as `.slice` use UTF-16 code points, not Unicode
  characters. However, the `for..of` loop iterates Unicode characters, not
  UTF-16 points. Each chunk may have `.length > 1`. This method takes a
  UTF-16 position and returns row and col in Unicode characters.
  */
  fromUtf16(src, pos) {
    a.reqStr(src)
    a.reqNat(pos)

    let off = 0
    let row = 0
    let col = 0

    for (const char of src) {
      if (off >= pos) break
      off += char.length

      if (char === `\r` && (src.length > off+1) && (src[off] === `\n`)) {
        continue
      }

      if (char === `\r` || char === `\n`) {
        row++
        col = 0
        continue
      }

      col++
    }

    row++
    col++
    return this.setRow(row).setCol(col)
  }

  [Insp.symMod()](tar) {return tar.funs(this.ownRow, this.ownCol)}
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

export class Tokenizer extends MixOwnSpanned.goc(Iter) {
  static get Span() {return StrSpan}
  init(src) {return this.initSpan().init(src), super.init()}
  more() {return this.reqSpan().more()}

  step() {
    const pos = this.reqSpan().ownPos()
    const node = this.optStep()
    this.found(node)
    this.advanced(pos, node)
    return this.filter(node)
  }

  filter(val) {return Node.isMeaningful(val) ? val : undefined}

  optStep() {
    const span = this.reqSpan()

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
      Key.parse(span) ||
      undefined
    )
  }

  err(msg, cause) {return new TokenizerErr({msg, span: this.optSpan(), cause})}

  found(node) {
    if (node) return
    throw this.err(`unrecognized syntax`)
  }

  advanced(pos, node) {
    if (this.reqSpan().ownPos() > pos) return
    throw this.err(`failed to advance position at node ${a.show(node)}`)
  }

  static fromStr(src) {return new this().init(src)}
  static tokensFromStr(src) {return this.fromStr(src).toArray()}
}

export class Lexer extends MixOwnSpanned.goc(Iter) {
  static get Span() {return ArrSpan}

  init(src) {return this.initSpan().init(src), super.init()}
  filter(val) {return val}
  more() {return this.reqSpan().more()}

  step() {
    const pos = this.reqSpan().ownPos()
    const node = this.popNext()
    this.advanced(pos, node)
    return this.filter(node)
  }

  popNext() {
    return this.optNext(this.optStep() || this.reqSpan().popHead())
  }

  optStep() {
    return (
      Brackets.lex(this) ||
      Parens.lex(this) ||
      Braces.lex(this) ||
      undefined
    )
  }

  optNext(prev) {
    if (!prev || !this.more()) return prev

    // May add more in the future.
    return (
      Access.lexNext(this, prev)
    )
  }

  advanced(pos, node) {
    if (this.reqSpan().ownPos() > pos) return
    throw LexerErr.atNode(node, `failed to advance position at node ${a.show(node)}`)
  }

  static fromStr(src) {return this.fromTokens(Tokenizer.tokensFromStr(src))}
  static fromTokens(src) {return new this().init(src)}
  static fromTokenizer(src) {return this.fromTokens(a.reqInst(src, Tokenizer).toArray())}
  static nodesFromStr(src) {return this.fromStr(src).toArray()}
  static nodesFromTokens(src) {return this.fromTokens(src).toArray()}
}

/*
This is named "node sourced" because this class is sourced FROM a node,
but doesn't have to BE a node.
*/
export class MixOwnNodeSourced extends MixErr {
  static make(cls) {
    return class MixOwnNodeSourced extends super.make(cls) {
      #srcNode = undefined
      ownSrcNode() {return this.#srcNode}
      optSrcNode() {return this.#srcNode}

      setSrcNode(val) {
        a.reqInst(val, Node)
        if (DEBUG) this.validSrcNode(val)
        this.#srcNode = val
        return this
      }

      reqSrcNode() {
        return (
          this.optSrcNode() ??
          this.throw(`missing source node at ${a.show(this)}`)
        )
      }

      validSrcNode(src) {
        if (src === this) {
          throw this.err(`${a.show(this)} is not allowed to be its own source node`)
        }

        let tar = src
        while ((tar = optSrcNode(tar))) {
          if (tar === this) {
            throw this.err(`forbidden cycle between end node ${a.show(this)} and source node ${a.show(src)}`)
          }
        }
        return src
      }

      decompile() {return decompile(this.optSrcNode())}
    }
  }
}

function optSrcNode(src) {
  return a.isObj(src) && `optSrcNode` in src ? src.optSrcNode() : undefined
}

export class MixParent extends MixErr {
  static make(cls) {
    return class MixParent extends super.make(cls) {
      toValidChild(val) {
        val.setParent(this)
        if (DEBUG) this.validChild(val)
        return val
      }

      validChild(val) {
        const par = val.ownParent()
        if (this !== par) {
          throw this.err(`parent-child mismatch: expected child ${a.show(val)} to have parent ${a.show(this)}, found ${a.show(par)}`)
        }
        return val
      }
    }
  }
}

export class MixOwnParented extends MixErr {
  static make(cls) {
    return class MixOwnParented extends super.make(cls) {
      #parent = undefined
      ownParent() {return this.#parent}
      optParent() {return this.#parent}

      setParent(val) {
        if (DEBUG) this.validParent(val)
        this.#parent = val
        return this
      }

      validParent(par) {
        if (par === this) {
          throw this.err(`${a.show(this)} is not allowed to be its own parent`)
        }

        let tar = par
        while ((tar = optParent(tar))) {
          if (tar === this) {
            throw this.err(`forbidden cycle between child ${a.show(this)} and parent ${a.show(par)}`)
          }
        }
        return par
      }

      reqParent() {
        return (
          this.optParent() ??
          this.throw(`missing parent at ${a.show(this)}`)
        )
      }

      optAncMatch(cls) {
        a.reqCls(cls)
        let tar = this
        while (tar) {
          if (a.isInst(tar, cls)) return tar
          tar = tar.optParent()
        }
        return undefined
      }

      reqAncMatch(cls) {
        return (
          this.optAncMatch(cls) ??
          this.throw(`missing ancestor with class ${a.show(cls)} at descendant ${a.show(this)}`)
        )
      }

      ancFind(fun) {
        a.reqFun(fun)
        let tar = this
        while (tar) {
          if (fun(tar)) return tar
          tar = tar.optParent()
        }
        return undefined
      }

      ancProcure(fun) {
        a.reqFun(fun)
        let tar = this
        while (tar) {
          const val = fun(tar)
          if (val) return val
          tar = optParent(tar)
        }
        return undefined
      }

      optRoot() {return this.optAncMatch(Root)}
      reqRoot() {return this.reqAncMatch(Root)}

      optModule() {return this.optAncMatch(Module)}
      reqModule() {return this.reqAncMatch(Module)}

      resolveNameLex(name) {
        this.req(name, a.isValidStr)
        const resolve = val => optLexScope(val)?.resolve(name)
        return this.ancProcure(resolve)
      }
    }
  }
}

function optParent(src) {
  return a.isObj(src) && `optParent` in src ? src.optParent() : undefined
}

export class MixPrinted extends MixOwnParented {
  static make(cls) {
    return class MixPrinted extends super.make(cls) {
      // Override in subclass.
      ownPrn() {}

      optPrn() {return this.ownPrn() || optPrn(this.optParent())}

      reqPrn() {
        return (
          this.optPrn() ??
          this.throw(`missing printer at ${a.show(this)}`)
        )
      }
    }
  }
}

function optPrn(src) {
  return a.isObj(src) && `optPrn` in src ? src.optPrn() : undefined
}

export class MixNamed extends MixErr {
  static make(cls) {
    return class MixNamed extends super.make(cls) {
      ownName() {}
      optName() {}
      reqName() {
        return (
          this.optName() ??
          this.throw(`missing name at ${a.show(this)}`)
        )
      }
    }
  }
}

export class MixOwnNamed extends MixNamed {
  static make(cls) {
    return class MixOwnNamed extends super.make(cls) {
      #name = undefined
      ownName() {return this.#name}
      optName() {return this.#name}
      setName(val) {return this.#name = this.req(val, a.isValidStr), this}
    }
  }
}

export class MixValued extends MixErr {
  static make(cls) {
    return class MixValued extends super.make(cls) {
      ownVal() {}
      optVal() {}
      reqVal() {
        return (
          this.optVal() ??
          this.throw(`missing value at ${a.show(this)}`)
        )
      }
    }
  }
}

export class MixOwnValued extends MixValued {
  static make(cls) {
    return class MixOwnValued extends super.make(cls) {
      #val = undefined
      ownVal() {return this.#val}
      optVal() {return this.#val}
      setVal(val) {return this.#val = val, this}
    }
  }
}

export class MixRef extends a.StaticWeakCache {
  static make(cls) {
    return class MixRef extends super.make(cls) {
      /*
      Override in subclass.

      Some `Node` and `Def` types are considered "references", and
      may "dereference" into another object responsible for the value of the
      given node or definition. This allows us to trace from usage sites to
      original definitions or declarations. Rules:

        * Objects without a valid reference must return nil.

        * Objects with a valid reference must return that reference.

        * Objects which don't reference themselves, but MAY be referenced by
          others, must return themselves. This acts as termination signal for
          recursive search.

      Examples:

        * name -> def -> use -> module
        * name -> def -> const -> val
        * name -> def -> class
        * name -> def -> const -> val -> class
        * name -> def -> const -> name -> def -> class
      */
      ownDeref() {return this}

      // Recursive version of `.ownDeref`.
      optDeref() {
        let tar = this
        while (tar) {
          const val = ownDeref(tar)
          if (val === tar) return tar
          tar = val
        }
        return tar
      }

      reqDeref() {
        return (
          this.optDeref() ??
          this.throw(`missing dereference at ${a.show(this)}`)
        )
      }
    }
  }
}

function ownDeref(src) {
  return a.isObj(src) && `ownDeref` in src ? src.ownDeref() : undefined
}

export class MixLexScoped extends MixOwnParented {
  static make(cls) {
    return class MixLexScoped extends super.make(cls) {
      ownLexScope() {}
      optLexScope() {return this.ancProcure(ownLexScope)}
      // FIXME this is wrong. Must search for scope carrier instead.
      reqLexScope() {
        return (
          this.optLexScope() ??
          this.throw(`missing lexical scope at ${a.show(this)}`)
        )
      }
    }
  }
}

function optLexScope(src) {
  return a.isObj(src) && `optLexScope` in src ? src.optLexScope() : undefined
}

function ownLexScope(src) {
  return a.isObj(src) && `ownLexScope` in src ? src.ownLexScope() : undefined
}

export class MixOwnLexScoped extends MixLexScoped {
  static make(cls) {
    return class MixOwnLexScoped extends MixParent.goc(super.make(cls)) {
      #lexScope = undefined
      ownLexScope() {return this.#lexScope ||= this.makeLexScope()}
      optLexScope() {return this.#lexScope}
      setLexScope(val) {return this.#lexScope = this.toValidChild(this.reqInst(val, LexScope)), this}
      makeLexScope() {return this.toValidChild(new LexScope())}
    }
  }
}

export class MixPubScoped extends MixOwnParented {
  static make(cls) {
    return class MixPubScoped extends super.make(cls) {
      ownPubScope() {}
      optPubScope() {return this.ancProcure(ownPubScope)}
      // FIXME this is wrong. Must search for scope carrier instead.
      reqPubScope() {
        return (
          this.optPubScope() ??
          this.throw(`missing public scope at ${a.show(this)}`)
        )
      }
    }
  }
}

function optPubScope(val) {
  return a.isObj(val) && `optPubScope` in val ? val.optPubScope() : undefined
}

function ownPubScope(val) {
  return a.isObj(val) && `ownPubScope` in val ? val.ownPubScope() : undefined
}

function isOptPubScoped(val) {return a.isInst(optPubScope(val), PubScope)}
function reqOptPubScoped(val) {return a.req(val, isOptPubScoped)}

export class MixOwnPubScoped extends MixPubScoped {
  static make(cls) {
    return class MixOwnPubScoped extends MixParent.goc(super.make(cls)) {
      #pubScope = undefined
      ownPubScope() {return this.#pubScope ||= this.makePubScope()}
      optPubScope() {return this.#pubScope}
      setPubScope(val) {return this.#pubScope = this.toValidChild(this.reqInst(val, PubScope)), this}
      makePubScope() {return this.toValidChild(new PubScope())}
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
must avoid cycles, forming a tree. At the time of writing, `MixOwnParented` and
`MixOwnNodeSourced` prevent cycles. If we add more common interfaces between
nodes, they must prevent cycles too.
*/
export class Node extends (
  MixPubScoped.goc(
    MixLexScoped.goc(
      MixRef.goc(
        MixPrinted.goc(
          MixOwnNodeSourced.goc(
            MixOwnSpanned.goc(
              MixOwnParented.goc(
                MixInsp.goc(
                  a.Emp
                )
              )
            )
          )
        )
      )
    )
  )
) {
  // For `MixOwnSpanned`.
  static get Span() {return StrSpan}
  optSpan() {return super.optSpan() || this.optSrcNode()?.optSpan()}

  fromNode(src) {
    this.setParent(src.reqParent())
    this.setSrcNode(src)
    return this
  }

  err(msg, cause) {return new CodeErr({msg, span: this.optSpan(), cause})}

  toErr(err) {
    if (a.isInst(err, CodeErr) || !this.optSpan()) return err
    return this.err((a.isInst(err, Error) ? err.message : a.renderLax(err)), err)
  }

  // FIXME implement.
  isExpression() {return false}
  isStatement() {return !this.isExpression()}
  isInModuleRoot() {return false}
  isExportable() {return this.isStatement() && this.isInModuleRoot()}

  /*
  Defines the current node in the nearest available scope. The node must
  implement method `.pk`, which must return a local identifier string. Method
  `.pk` must be implemented by `UnqualName` and all node subclasses that
  represent a named declaration such as `Const` or `Fn`. For other node
  classes, this should cause an exception.

  TODO consider replacing with the following, to ensure that by default this
  defines in the lexical scope of the parent, rather than own. Relevant for
  macros such as `Fn` which create their own lexical scope but also add
  themselves to scope. However, many if not all of those macros choose between
  own and parent scope based on whether the macro node is in expression context
  or statement context, so they have to override this method anyway.

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

  optDef() {}
  reqDef() {return this.optDef() ?? this.throw(`missing definition at ${a.show(this)}`)}

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
      this.optSrcNode()?.decompile() ??
      this.optSpan()?.decompile()
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

  static isMeaningful(val) {return !this.isMeaningless(val)}

  static isMeaningless(val) {
    return a.isNil(val) || a.isInst(val, Space) || a.isInst(val, Comment)
  }

  [Insp.symMod()](tar) {return tar.funs(this.optSpan)}
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
    span.skip(tar.reqSpan().ownLen())
    return tar
  }

  static isValid(val) {return isFullMatch(val, this.reg())}

  fromMatch(mat) {return this.reqSpan().setLen(mat[0].length), this}
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

  macro() {return this}
}

export class BracketPre extends ExactText {static src() {return `[`}}
export class BracketSuf extends ExactText {static src() {return `]`}}
export class ParenPre extends ExactText {static src() {return `(`}}
export class ParenSuf extends ExactText {static src() {return `)`}}
export class BracePre extends ExactText {static src() {return `{`}}
export class BraceSuf extends ExactText {static src() {return `}`}}

export class Space extends Text {
  static reg() {return /^\s+/}
  macro() {return this}
}

export class Comment extends Text {
  static reg() {return /^\|([^\n\r]*)(\r\n|\r|\n|$)/}
  static pre() {return `|`}
  pre() {return this.constructor.pre()}

  #body = ``
  ownBody() {return this.#body}
  setBody(val) {return this.#body = this.req(val, a.isStr), this}

  #delim = ``
  ownDelim() {return this.#delim}
  setDelim(val) {return this.#delim = this.req(val, a.isStr), this}

  fromMatch(mat) {
    super.fromMatch(mat)
    this.setBody(mat[1])
    this.setDelim(mat[2])
    return this
  }

  macro() {return this}
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
export class Num extends MixOwnValued.goc(Text) {
  static reg() {return /^-?\d+(_\d+)*(?:[.]\d+(_\d+)*)?(?![\w$])/}

  ownVal() {return super.ownVal() ?? NaN}
  setVal(val) {return super.setVal(this.req(val, a.isFin))}

  fromMatch(mat) {
    super.fromMatch(mat)
    this.setVal(this.constructor.parseFloat(a.reqStr(mat[0])))
    return this
  }

  macro() {return this}

  // Workaround for the lack of underscore support in `Number.parseFloat`.
  static parseFloat(src) {
    a.reqStr(src)
    if (src.includes(`_`)) src = src.replace(/_/g, ``)
    return Number.parseFloat(src)
  }

  [Insp.symMod()](tar) {
    return super[Insp.symMod()](tar).funs(this.ownVal)
  }
}

function isFullMatch(src, reg) {
  a.reqStr(src)
  a.reqReg(reg)
  return reg.test(src) && reg.exec(src)?.[0] === src
}

export class Str extends MixOwnValued.goc(Text) {
  ownVal() {return super.ownVal() ?? ``}
  setVal(val) {return super.setVal(this.req(val, a.isStr))}

  fromMatch(mat) {
    super.fromMatch(mat)
    this.setVal(mat[1])
    return this
  }

  macro() {return this}

  [Insp.symMod()](tar) {
    return super[Insp.symMod()](tar).funs(this.ownVal)
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
//
// FIXME: move most methods to `Name`, make this superclass of `Name` and
// `Access`.
export class Ident extends Text {
  static regUnqualName() {return /^[A-Za-z$_][\w$]*/}
  static regQualName() {return /^[.][A-Za-z$_][\w$]*/}
  static sep() {return `.`}
  sep() {return this.constructor.sep()}

  // TODO: consider caching. Profile first.
  optDef() {throw errMeth(`optDef`, this)}

  reqDef() {
    return (
      this.optDef() ??
      this.throw(`missing definition for ${a.show(this.decompile())} at ${a.show(this)}`)
    )
  }

  macroImpl() {
    this.reqDef()
    return super.macroImpl()
  }

  // macroWithDef(def) {
  //   a.optInst(def, Def)
  //   if (!def?.isMacro()) return this

  //   const syn = def.ownCallStyle()
  //   if (syn === CallStyle.bare) return def.macroNode(this)
  //   throw this.err(`unexpected mention of identifier ${a.show(this.decompile())} with the following call opts: ${a.show(def.callOptStr())}`)
  // }

  macroWithDef(def) {
    a.optInst(def, Def)
    if (def?.isMacroBare()) return def.macroNode(this)
    return this
  }

  // FIXME rename, rewrite, and use.
  reqUsable() {
    const def = this.reqDef()
    const syn = def.ownCallStyle()
    if (syn === CallStyle.bare) return this
    throw this.err(`unexpected mention of ${a.show(this.decompile())} with the following call opts: ${a.show(def.callOptStr())}`)
  }
}

export class Name extends MixNamed.goc(Ident) {
  ownName() {throw errMeth(`ownName`, this)}
}

export class StrSet extends a.TypedSet {
  reqVal(val) {return a.reqStr(val)}
}

// Short for "unqualified name".
export class UnqualName extends Name {
  static reg() {return this.regUnqualName()}
  pk() {return this.ownName()}
  ownName() {return this.decompile()}
  optDef() {return this.resolveNameLex(this.pk())}

  macroImpl() {
    const def = this.reqDef()
    def.addUse(this)
    return this.macroWithDef(def)
  }

  compile() {
    const def = this.optDef()
    if (def?.isMacroBare()) return this.compileCall(def)
    return this.compileName()
  }

  compileCall(def) {
    const style = def.ownCallSyntax()
    if (style === CallSyntax.call) return this.compileCallCall()
    if (style === CallSyntax.new) return `new ` + a.reqStr(this.compileCallCall())
    throw CallSyntax.errUnrec(this, style)
  }

  // Only for `CallSyntax.call`.
  compileCallCall() {
    return a.reqStr(this.compileQualifier()) + a.reqStr(this.compileName()) + `()`
  }

  // FIXME: if the name is coming from a mixin, generate a qualifier.
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

  static isJsReservedWord(val) {return jsReservedWords.has(val)}
}

/*
Reference:

  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#reserved_words

Set of words that cannot be declared as identifiers in ES6+ strict mode. It
should not include any other words. We compile to native JS modules, which
require ES6+ and use strict mode. Therefore we ignore older JS versions and
loose mode.

In violation of the guideline above, we include `undefined` as a special case
to forbid its accidental redefinition and to avoid collision with the output
of our macro `nil`.
*/
export const jsReservedWords = new StrSet([`arguments`, `await`, `case`, `catch`, `class`, `const`, `continue`, `debugger`, `default`, `delete`, `do`, `else`, `enum`, `eval`, `export`, `extends`, `false`, `finally`, `for`, `function`, `if`, `implements`, `import`, `in`, `instanceof`, `interface`, `let`, `new`, `null`, `package`, `private`, `protected`, `public`, `return`, `static`, `super`, `switch`, `this`, `throw`, `true`, `try`, `typeof`, `undefined`, `var`, `void`, `while`, `with`, `yield`])

// // FIXME replace with `Key`.
// // Short for "qualified name".
// export class QualName extends Name {
//   static reg() {return this.regQualName()}
//   ownName() {return this.decompile().slice(this.sep().length)}
// }

// FIXME implement.
export class Key extends Name {
  static reg() {return this.regQualName()}
  ownName() {return this.decompile().slice(this.sep().length)}
}

/*
Represents an identifier path such as `one.two.three`. The first element is
`UnqualName`. Each other element is `QualName`. An empty path is invalid and
never constructed by the compiler. A path without qualified names must behave
exactly like `UnqualName`, but is never constructed by the compiler.
*/
// export class Path extends MixParent.goc(Ident) {
//   static lex(lex) {
//     const span = lex.reqSpan()
//     const head = span.optHead()
//     if (!head) return undefined

//     /*
//     We currently allow ".name" syntax only in identifier paths, without the
//     general case of ".name" following an arbitrary expression. The general
//     case is not useful because the Lisp call syntax makes it syntactically
//     inconvenient. The more method calls you chain, the worse it gets.
//     */
//     if (a.isInst(head, QualName)) {
//       throw LexerErr.atNode(head, `unexpected qualified name not preceded by unqualified name`)
//     }

//     if (!a.isInst(head, UnqualName)) return undefined
//     span.inc()

//     if (!a.isInst(span.findHead(Node.isMeaningful, Node), QualName)) {
//       return head
//     }

//     const tar = new this()
//     tar.setUnqual(head)

//     while (span.more()) {
//       const next = span.optHead()

//       // Drop spaces and comments if any.
//       if (!Node.isMeaningful(next)) {
//         span.inc()
//         continue
//       }

//       if (a.isInst(next, QualName)) {
//         tar.addQual(next)
//         span.inc()
//         continue
//       }

//       break
//     }

//     tar.setSpan(tar.Span.range(head.reqSpan(), tar.reqLast().reqSpan()))
//     return tar
//   }

//   #unqual = undefined
//   ownUnqual() {return this.#unqual}
//   setUnqual(val) {return this.#unqual = this.toValidChild(a.reqInst(val, UnqualName)), this}

//   #quals = undefined
//   ownQuals() {return this.#quals ||= []}
//   optQuals() {return this.#quals}
//   hasQuals() {return !!this.#quals?.length}
//   setQuals(src) {
//     a.reqTrueArr(src)
//     for (const val of src) this.toValidChild(a.reqInst(val, QualName))
//     this.#quals = src
//     return this
//   }

//   addQual(val) {
//     this.ownQuals().push(this.toValidChild(a.reqInst(val, QualName)))
//     return this
//   }

//   optLast() {return a.last(this.optQuals()) || this.ownUnqual()}
//   reqLast() {return this.optLast() ?? this.throw(`missing last element in path ${a.show(this)}`)}

//   /*
//   FIXME:

//     * Resolve fully.
//     * Use recursive version of `.getOrigin` at each step.
//     * When a name resolves to something with a scope,
//       assert that the next name is in that scope.
//     * When not fully resolved, return nil.

//   Additional:

//     * Each name may resolve to compile-time val.
//       * Unqual name may resolve to native module val.
//       * Qual name may resolve to something inside module.
//       * We may evaluate this at compile time for sanity checking.
//       * Even when definitions are unavailable, or especially when definitions
//         are unavailable, we may dynamically inspect the _runtime_ values of
//         objects addressed by a path at _compile time_, and sanity-check them.
//   */
//   // optDef() {}

//   optDef_() {
//     let def = this.ownUnqual()?.optDef()
//     const quals = this.optQuals()
//     for (const qual of this.ownQuals()) {
//       def = def?.optDeref()?.optPubScope()?.resolveNode(qual)
//     }
//     return def
//   }
// }

/*
Combines an arbitrary expression with `.key` access, forming one expression.
Supports namespace resolution.
*/
export class Access extends MixParent.goc(Ident) {
  static lexNext(lex, prev) {
    const span = lex.reqSpan()
    span.skipMeaningless()

    const next = span.optHead()
    if (!a.isInst(next, Key)) return prev
    span.inc()

    return this.lexNext(
      lex,
      new this()
        .setPrev(prev)
        .setKey(next)
        .setSpan(this.Span.range(
          prev.reqSpan(),
          next.reqSpan(),
        ),
    ))
  }

  #prev = undefined
  ownPrev() {return this.#prev}
  setPrev(val) {return this.#prev = this.toValidChild(this.reqInst(val, Node)), this}
  optPrev() {return this.#prev}
  reqPrev() {return this.optPrev() ?? this.throw(`missing previous expression at ${a.show(this)}`)}

  #key = undefined
  ownKey() {return this.#key}
  setKey(val) {return this.#key = this.toValidChild(this.reqInst(val, Key)), this}
  optKey() {return this.#key}
  reqKey() {return this.optKey() ?? this.throw(`missing key at ${a.show(this)}`)}

  optDef() {
    return this.reqPrev().optDef()?.optDeref()?.optPubScope()?.resolveNode(this.reqKey())
  }

  macroImpl() {
    this.setPrev(Node.macroNode(this.reqPrev()))
    const def = this.optDef()
    if (def?.isMacroBare()) return def.macroNode(this)
    return this
  }

  [Insp.symMod()](tar) {
    return super[Insp.symMod()](tar).funs(this.ownPrev, this.ownKey)
  }
}

export class ValNode extends MixOwnValued.goc(Node) {
  compile() {return this.constructor.compile(this, this.ownVal())}

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

export class NodeList extends MixParent.goc(Node) {
  #nodes = undefined
  ownNodes() {return this.#nodes ||= []}
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

  // For our own use. Less error prone than property getters.
  nodesLen() {return this.ownNodes()?.length}

  // Secret interface in `@mitranim/js`.`iter.mjs`.
  toArray() {return this.ownNodes()}

  // Override for `MixParent`.
  toValidChild(val) {return super.toValidChild(this.reqInst(val, Node))}

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
    const span = lex.reqSpan()
    const head = span.optHead()

    if (!head) return undefined
    if (head.decompile() === suf) throw LexerErr.atNode(head, `unexpected closing ${a.show(suf)}`)
    if (head.decompile() !== pre) return undefined

    const tar = new this()
    span.inc()

    while (span.more()) {
      const next = span.optHead()

      if (next.decompile() === suf) {
        tar.setSpan(tar.Span.range(head.reqSpan(), next.reqSpan()))
        span.inc()
        return tar
      }

      tar.addNode(lex.popNext())
    }

    throw LexerErr.atNode(span.reqLast(), `missing closing ${a.show(suf)}`)
  }

  meaningfulNodes() {return this.ownNodes().filter(Node.isNodeMeaningful, Node)}
  firstMeaningful() {return this.ownNodes().find(Node.isMeaningful, Node)}
  isEveryMeaningful() {return this.ownNodes().every(Node.isMeaningful, Node)}

  reqEveryMeaningful() {
    if (!this.isEveryMeaningful()) {
      throw this.err(`expected every node to be meaningful (no whitespace or comments)`)
    }
    return this
  }

  // FIXME: macro first node first.
  // macroImpl() {
  //   const def = a.onlyInst(this.firstMeaningful(), Ident)?.optDef()
  //   if (def?.isMacro()) return def.macroNode(this)
  //   return this.macroFrom(0)
  // }

  macroImpl() {
    this.macroAt(0)
    const def = this.optHead()?.optDef()
    if (def?.isMacro()) return def.macroNode(this)
    return this.macroFrom(1)
  }

  /*
  FIXME:

    * Use `.optHead()` and `.rest()` instead of searching for meaning.
    * Head is required. Exception when empty.
  */
  compile() {
    const prn = this.reqPrn()
    const src = this.ownNodes()
    const ind = src.findIndex(Node.isMeaningful, Node)
    if (!(ind >= 0)) return prn.compileDense(src)

    const style = a.onlyInst(src[ind], Ident)?.optDef()?.ownCallSyntax() || CallSyntax.call

    // Reslicing is suboptimal but probably not our bottleneck.
    const pre = src.slice(0, ind + 1)
    const suf = src.slice(ind + 1)
    const call = prn.compileDense(pre) + `(` + prn.compileCommaMultiLine(suf) + `)`

    if (style === CallSyntax.call) return call
    if (style === CallSyntax.new) return `new ` + call
    throw this.err(CallSyntax.msgUnrec(style))
  }

  [Insp.symMod()](tar) {
    return super[Insp.symMod()](tar).funs(this.optNodes)
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
      throw TypeError(`keys for enum ${this.name} must be strings, found ${a.show(key)}`)
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
    * Compiles to a nullary call, according to `CallSyntax`.
  * Requires changes in `NodeList`/`DelimNodeList` and maybe
    `Ident`/`Path`/`Name`.
*/
export class CallStyle extends Enum {
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
export class CallSyntax extends Enum {
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
  #callStyle = CallStyle.list
  ownCallStyle() {return this.#callStyle}
  setCallStyle(val) {return this.#callStyle = CallStyle.reqValid(val), this}

  #callTime = CallTime.run
  ownCallTime() {return this.#callTime}
  setCallTime(val) {return this.#callTime = CallTime.reqValid(val), this}

  #callSyntax = CallSyntax.call
  ownCallSyntax() {return this.#callSyntax}
  setCallSyntax(val) {return this.#callSyntax = CallSyntax.reqValid(val), this}

  // TODO consider removing. Can be done by individual macros, or by a macro
  // wrapper.
  #callOut = CallOut.val
  ownCallOut() {return this.#callOut}
  setCallOut(val) {return this.#callOut = CallOut.reqValid(val), this}

  isBare() {return this.ownCallStyle() === CallStyle.bare}
  isMacro() {return this.ownCallTime() === CallTime.macro}
  isMacroBare() {return this.isMacro() && this.isBare()}

  macroNode(src) {throw src.err(msgMeth(`macroNode`, this))}

  macroNodeWith(src, fun) {
    a.reqInst(src, Node)
    src.req(fun, a.isFun)
    return this.macroOut(src, this.macroCall(src, fun), fun)
  }

  macroCall(src, fun) {
    const style = this.ownCallSyntax()
    if (style === CallSyntax.call) return this.macroCallCall(src, fun)
    if (style === CallSyntax.new) return this.macroCallNew(src, fun)
    throw src.err(CallSyntax.msgUnrec(style))
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
    const outType = this.ownCallOut()
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
      a.reqValidStr(this.ownCallStyle()),
      a.reqValidStr(this.ownCallTime()),
      a.reqValidStr(this.ownCallSyntax()),
      a.reqValidStr(this.ownCallOut()),
    ].join(` `)
  }

  callOptFromStr(src) {
    const mat = this.req(src, a.isStr).split(` `)
    const syntax = CallStyle.reqValid(mat[0])
    const time = CallTime.reqValid(mat[1])
    const style = CallSyntax.reqValid(mat[2])
    const out = CallOut.reqValid(mat[3])

    return this
      .setCallStyle(syntax)
      .setCallTime(time)
      .setCallSyntax(style)
      .setCallOut(out)
  }

  [Insp.symMod()](tar) {
    return tar.funs(
      this.ownCallStyle,
      this.ownCallTime,
      this.ownCallSyntax,
      this.ownCallOut,
    )
  }
}

function msgMacroRun(fun) {return `error when running macro ${a.show(fun)}`}

export class Def extends (
  MixRef.goc(MixValued.goc(MixOwnNamed.goc(MixOwnParented.goc(CallOpt))))
) {
  #uses = undefined
  ownUses() {return this.#uses ||= new UnqualNameSet()}
  addUse(val) {return this.ownUses().add(val), this}

  pk() {return this.ownName()}
  setParent(val) {return super.setParent(a.reqInst(val, Scope))}

  // Must override in subclass. Must return a function or class.
  ownVal() {throw errMeth(`ownVal`, this)}

  /*
  TODO: JS reserved words must be detected contextually, only when used as bare
  names. Using them as property/method names, and in paths, is perfectly
  possible.

  TODO: implement automatic renaming. Possible causes:

    * Avoiding conflicts with JS reserved words.
    * Module merging.
  */
  compileName(node) {
    const name = this.ownName()
    if (UnqualName.isJsReservedWord(name)) {
      throw node.err(`${a.show(name)} is a reserved keyword in JS; its use would generate invalid JS that doesn't run; please rename`)
    }
    return name
  }

  [Insp.symMod()](tar) {
    return super[Insp.symMod()](tar.funs(this.ownName))
  }
}

export class UnqualNameSet extends a.TypedSet {
  reqVal(val) {return a.reqInst(val, UnqualName)}
}

export class FunDef extends MixOwnValued.goc(Def) {
  setVal(val) {return super.setVal(this.req(val, a.isFun))}
  macroNode(node) {return this.macroNodeWith(node, this.ownVal())}
}

/*
Variant of `Def` used for definitions generated from AST nodes, mostly by macros
that add identifiers to scope, such as `Use`, `Const`, `Fn`.

The use of `MixOwnNodeSourced` is tentative here. We may reserve that mixin for
nodes replacing other nodes in the macroexpansion process. A `NodeDef`
currently does not replace the node responsible for it. However, SOME way of
setting the source node is mandatory. An instance of `NodeDef` added to a scope
must ALWAYS have a source node, and its methods should assert this.
*/
export class NodeDef extends MixOwnNodeSourced.goc(Def) {
  // For `Def..pk`.
  ownName() {return super.ownName() ?? a.pk(this.reqSrcNode())}

  // Override for `MixRef`. Allows tracing definitions back to sources.
  ownDeref() {return this.reqSrcNode()}

  // FIXME.
  macroNode(node) {
    // const src = this.ownSrcNode()
    // console.log(`src:`, src)

    // const mod = this.reqModule()
    // console.log(`mod:`, mod)
    // console.log(`mod.ownPubScope():`, mod.ownPubScope())
    // console.log(`mod.ownVal():`, mod.ownVal())

    // console.log(`this.optParent():`, this.optParent())
    // console.log(`this.optParent().constructor:`, this.optParent().constructor)

    // console.log(`node:`, node)
    return super.macroNode(node)
  }
}

export class Macro extends Node {
  static getSrcName() {throw errMeth(`getSrcName`, this)}

  static def() {
    return new FunDef()
      .setName(this.getSrcName())
      .setCallTime(CallTime.macro)
      .setCallSyntax(CallSyntax.new)
      .setCallOut(CallOut.ast)
      .setVal(this)
  }

  getSrcName() {return this.constructor.getSrcName()}
  reqSrcList() {return this.reqSrcInst(NodeList)}
  optSrcNodes() {return a.reqTrueArr(this.reqSrcList().optNodes())}
  reqSrcNodes() {return a.reqTrueArr(this.reqSrcList().ownNodes())}

  reqSrcInst(cls) {
    const src = this.optSrcNode()
    if (a.isInst(src, cls)) return src
    throw this.err(`macro ${a.show(this.getSrcName())} requires the source node to be an instance of ${a.show(cls)}, got ${a.show(src)}`)
  }

  reqSrcAt(ind) {
    this.req(ind, a.isNat)
    const src = this.reqSrcNodes()
    const len = src.length

    if (!(ind < len)) {
      throw this.err(`macro ${a.show(this.getSrcName())} requires at least ${ind+1} arguments, found ${len}`)
    }

    const out = src[ind]
    if (out) return out

    // Internal sanity check. Should not be possible.
    throw this.err(`macro ${a.show(this.getSrcName())} requires a valid node at index ${ind}, found ${a.show(out)}`)
  }

  optSrcAt(ind) {
    return this.reqSrcNodes()[this.req(ind, a.isNat)]
  }

  reqSrcInstAt(ind, ...cls) {
    const out = this.reqSrcAt(ind)
    if (someInst(out, cls)) return out
    throw this.err(`macro ${a.show(this.getSrcName())} requires the argument at index ${ind} to be an instance of one of the following classes: ${a.show(cls)}, found ${a.show(out)}`)
  }

  optSrcInstAt(ind, ...cls) {
    const out = this.optSrcAt(ind)
    if (a.isNil(out)) return undefined
    if (someInst(out, cls)) return out
    throw this.err(`macro ${a.show(this.getSrcName())} requires the argument at index ${ind} to be either missing or an instance of one of the following classes: ${a.show(cls)}, found ${a.show(out)}`)
  }

  srcNodesFrom(ind) {
    this.req(ind, a.isNat)
    if (!ind) return this.reqSrcNodes()
    return this.reqSrcList().reqLenMin(ind + 1).ownNodes().slice(ind)
  }

  reqStatement() {
    if (this.isExpression()) {
      throw this.err(`macro ${a.show(this.getSrcName())} can only be used as a statement due to JS syntax limitations`)
    }
    return this
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
    and makes it possible to define special `.ownVal` implementations. Other
    macros may use `instanceof` and/or `.ownVal`, using primitive constants as
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
export class PredeclMacro extends Macro {
  static getCompiledName() {throw errMeth(`getCompiledName`, this)}
  static def() {return super.def().setCallStyle(CallStyle.bare)}

  // FIXME remove.
  // getVal() {throw errMeth(`getVal`, this)}

  getCompiledName() {return this.constructor.getCompiledName()}
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
  * Forbid use as expression.
*/
export class Use extends MixOwnValued.goc(Macro) {
  static getSrcName() {return `use`}
  static getTarName() {return this.getSrcName()}

  pk() {return a.pk(this.reqDestName())}
  setVal(val) {return super.setVal(a.reqInst(val, Module))}
  strAll() {return `*`}
  addr() {return this.reqSrcInstAt(1, Str)}
  dest() {return this.optSrcInstAt(2, UnqualName, Str)}
  destName() {return a.onlyInst(this.dest(), UnqualName)}
  reqDestName() {return a.reqInst(this.dest(), UnqualName)}

  destStr() {
    const src = a.onlyInst(this.dest(), Str)
    if (!src) return undefined

    const str = src.ownVal()
    const exp = this.strAll()
    if (str !== exp) {
      throw this.err(`macro ${a.show(this.getSrcName())} requires argument at index 2 to be either a name or a string containing exactly ${a.show(exp)}, found invalid string ${a.show(str)}`)
    }
    return src
  }

  reqVal() {
    return (
      this.optVal() ??
      this.throw(`missing imported module at ${a.show(this)}; possible cause: module got requested before executing import`)
    )
  }

  macroImpl() {
    this.reqSrcList().reqEveryMeaningful().reqLenBetween(2, 3)
    this.addr()
    if (this.destStr()) return this.macroAll()
    return this.macroName()
  }

  async import() {
    this.setVal(await this.reqModule().import(this.addr().reqVal()))

    // this.setVal(await this.reqRoot().ownModules().import(
    //   this.reqModule().importPath(this.addr().reqVal())
    // ))

    // this.setVal(await this.reqRoot().ownModules().import(this.addr().reqVal()))
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

  // Allows this object to be a scope mixin. Required for `.macroAll`.
  optPubScope() {return this.reqVal().optPubScope()}

  // Override for `MixRef`. Returns AST node responsible for this definition.
  ownDeref() {return this.reqVal()}

  compile() {
    this.reqStatement()
    const prn = this.reqPrn()

    if (!this.dest()) return `import ${a.reqStr(this.compileAddr(prn))}`

    const name = this.destName()
    if (!name) {
      throw this.err(`internal error: unable to compile ${a.show(this.getSrcName())} because it uses an import format incompatible with JS; must be elided from the AST before compiling to JS`)
    }

    return `import * as ${prn.compile(name)} from ${a.reqStr(this.compileAddr(prn))}`
  }

  // Normalizes quotes for compatibility with the JS syntax, which currently
  // allows only single and double quotes for imports, not backtick quotes.
  compileAddr(prn) {
    return prn.compile(JSON.stringify(this.addr().reqVal()))
  }
}

export class MixMixable extends MixErr {
  static make(cls) {
    return class MixMixable extends super.make(cls) {
      #mixins = undefined
      ownMixins() {return this.#mixins ||= []}
      optMixins() {return this.#mixins}
      hasMixins() {return !!this.#mixins?.length}
      setMixins(val) {return this.#mixins = this.req(val, a.isTrueArr), this}
      hasMixin(val) {return !!this.optMixins()?.includes(val)}

      addMixin(val) {
        this.validMixin(val)
        if (this.hasMixin(val)) return this
        this.ownMixins().push(val)
        return this
      }

      // Override in subclass.
      // Known limitation: shallow, doesn't check mixins of mixins.
      validMixin(val) {
        if (!DEBUG) return val

        if (val === this) {
          throw this.err(`${a.show(this)} is not allowed to be its own mixin`)
        }
        if (this.hasMixin(val)) {
          throw this.err(`${a.show(this)} already has mixin ${a.show(val)}`)
        }
        return val
      }
    }
  }
}

// function hasMixinDeepSelf(val) {return val.hasMixinDeep(this)}

export class Scope extends MixParent.goc(MixMixable.goc(MixOwnParented.goc(a.Coll))) {
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
  validMixin(val) {
    super.validMixin(val)
    return reqOptPubScoped(val)
  }

  // For `MixErr`.
  err(...val) {return new ScopeErr(...val)}

  add(val) {return super.add(this.toValidChild(val))}

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
    const resolve = val => val.optPubScope().resolve(key)
    return a.procure(this.optMixins(), resolve)
  }

  resolveNode(val) {
    return this.resolve(this.reqInst(val, Node).asReqInst(Name).ownName())
  }

  // For error messages.
  parentContext() {
    const span = this.ancProcure(optSpan)
    if (!span) return ``
    return joinLines(` in scope declared here:`, span.context())
  }

  /*
  Should be used for native modules without a "header". Modules should be able
  to "opt out" by providing either a header file or a default export that's an
  instance of `Module`. See `Module.fromNative`.
  */
  addFromNativeModule(src) {
    for (const key of a.structKeys(reqNativeModule(src))) {
      this.addFromNativeModuleEntry(key, src[key])
    }
    return this
  }

  addFromNativeModuleEntry(key, val) {
    if (a.isSubCls(val, Macro)) this.add(val.def())
  }
}

function optSpan(src) {
  return a.isObj(src) && `optSpan` in src ? src.optSpan() : undefined
}

export class ScopeErr extends Err {}

export class LexScope extends Scope {
  ownLexScope() {return this}
  optLexScope() {return this}
}

export class NsScope extends Scope {}

export class PubScope extends NsScope {
  ownPubScope() {return this}
  optPubScope() {return this}

  /*
  Must be provided to the scope of every user-defined module, as a mixin.
  This scope must contain EXACTLY ONE member: the `use` macro. All other
  built-ins must be defined in the `prelude` module.
  */
  static predeclared = new this().add(Use.def())
}

// FIXME convert to non-`Node`.
export class Module extends (
  MixOwnValued.goc(MixOwnPubScoped.goc(MixOwnLexScoped.goc(NodeList)))
) {
  // FIXME consider enforcing `URL`.
  #url = undefined
  ownUrl() {return this.#url}
  setUrl(val) {return this.#url = this.req(val, isCanonicalModuleUrlStr), this}
  reqUrl() {return this.ownUrl() ?? this.throw(`missing module URL at ${a.show(this)}`)}

  // #url = undefined
  // ownUrl() {return this.#url}
  // setUrl(val) {return this.#url = this.req(val, isCanonicalModuleUrl), this}

  pk() {return this.ownUrl()}
  setVal(val) {return super.setVal(reqNativeModule(val))}
  fromStr(val) {return this.setNodes(Lexer.nodesFromStr(val))}
  makeLexScope() {return super.makeLexScope().addMixin(PubScope.predeclared)}
  import(val) {return this.reqRoot().importRel(val, this.reqUrl())}

  // joinPath(val) {
  //   const own = this.ownUrl()
  //   if (!own) {
  //     throw this.err(`unable to join with path ${a.show(val)}: current module does not have its own path`)
  //   }
  //   return p.posix.join(p.posix.dir(own), val)
  // }

  /*
  Async version of `NodeList..macroImpl` without support for "list call" syntax.
  This let us support `Use`, which uses dynamic/async imports, in module root.
  Other macro implementations must be synchronous for simplicity and speed.
  */
  async macroImpl() {
    const tar = this.ownNodes()
    let ind = -1
    while (++ind < tar.length) {
      tar[ind] = await Node.macroNodeAsync(tar[ind])
    }
    return this
  }

  static fromNative(key, src) {
    a.req(key, isAbsUrlStr)
    reqNativeModule(src)

    return (
      a.onlyInst(src.default, Module) ||
      new this().setPubScope(new PubScope().addFromNativeModule(src))
    ).setVal(src).setUrl(key)
  }

  [Insp.symMod()](tar) {
    return tar.funs(this.optSpan, this.optLexScope, this.optPubScope)
  }
}

// // FIXME remove.
// export class MixPromised extends MixErr {
//   static make(cls) {
//     return class MixPromised extends super.make(cls) {
//       #promises = undefined
//       ownPromises() {return this.#promises ||= new PromiseMap()}
//       setPromises(val) {return this.#promises = this.reqInst(val, PromiseMap), this}
//     }
//   }
// }

export class PromiseMap extends a.TypedMap {
  reqKey(key) {return a.reqValidStr(key)}
  reqVal(val) {return a.reqPromise(val)}
}

export class PromiseCache extends PromiseMap {
  goc(key, fun, ctx) {
    a.reqFun(fun)
    if (this.has(key)) return this.get(key)
    return this.setVal(key, fun.call(ctx, key))
  }
}

export class MixPromiseCached extends MixErr {
  static make(cls) {
    return class MixPromiseCached extends super.make(cls) {
      #promiseCache = undefined
      ownPromiseCache() {return this.#promiseCache ||= new PromiseCache()}
      setPromiseCache(val) {return this.#promiseCache = this.reqInst(val, PromiseCache), this}
    }
  }
}

export class NativeModuleMap extends a.TypedMap {
  reqKey(key) {return reqCanonicalModuleUrlStr(key)}
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

// // FIXME remove.
// export class MixImporter extends MixPromised {
//   static make(cls) {
//     return class MixImporter extends super.make(cls) {
//       import(key) {
//         return (
//           this.get(key) ||
//           this.ownPromises().get(key) ||
//           this.ownPromises().setVal(key, this.importAsync(key))
//         )
//       }

//       // Override in subclass.
//       async importAsync() {}
//     }
//   }
// }

// export class NativeModuleCache extends MixImporter.goc(NativeModuleMap) {
//   // Only for internal use.
//   async importAsync(key) {
//     this.req(key, a.isScalar)
//     return this.setVal(key, await import(key))
//   }
// }

/*
Note. This type, and particularly its promise cache, is somewhat redundant
because JS engines have their own RAM cache for imported modules. Simply
calling `import(path)` any number of times with any number of paths that
resolve to the same path will be deduped by the engine, reading/downloading
and evaluating the targeted module only once. However, JS engines don't allow
SYNCHRONOUS access to already-imported modules. Our cache fills this niche.
The semi-redundant promise cache allows to avoid redundant mutation of the
synchronous cache component.

FIXME remove. Unnecessary due to `Root`-level caching.
*/
// export class NativeModuleCache extends MixPromiseCached.goc(NativeModuleMap) {
//   import(key) {
//     return this.ownPromiseCache().goc(key, this.#import, this)
//   }

//   async #import(key) {
//     return this.setVal(key, await import(this.req(key, a.isScalar)))
//   }
// }

export class ModuleColl extends a.Coll {
  // For `a.TypedMap` used by `a.Coll`.
  reqKey(key) {return reqCanonicalModuleUrlStr(key)}
  reqVal(val) {return a.reqInst(val, Module)}
}

// export class ModuleCache extends (
//   MixParent.goc(MixOwnParented.goc(MixImporter.goc(MixErr.goc(ModuleColl))))
// ) {
//   #native = undefined
//   ownNative() {return this.#native ||= new NativeModuleCache()}
//   setNative(val) {return this.#native = this.reqInst(val, NativeModuleCache), this}
//
//   add(val) {return super.add(this.toValidChild(val))}
//
//   // For `a.TypedMap` used by `a.Coll`.
//   reqKey(key) {return this.validAbs(key)}
//
//   // For internal use.
//   validAbs(key) {return this.req(this.req(key, a.isStr), isCanonicalModuleUrlStr)}
//   validRel(key) {return this.req(this.req(key, a.isStr), isStrictRelStr)}
//
//   optFs() {return this.optRoot().ownFs()}
//   reqFs() {return this.optFs() ?? this.throw(`missing FS at ${a.show(this)}`)}
//
//   // Only for internal use.
//   // Must generate and cache our own module for the given path.
//   async importAsync(key) {
//     this.validAbs(key)
//
//     return this.added(Module.fromNative(
//       key,
//       await this.ownNative().import(key),
//     ))
//   }
//
//   // // Only for internal use.
//   // async importAsync(key) {
//   //   a.reqValidStr(key)
//   //   const scheme = a.reqValidStr(this.langScheme())
//   //   if (key.startsWith(scheme)) {
//   //     return this.importLangModule(key.slice(scheme.length))
//   //   }
//   //   return this.importAnyModule(key)
//   // }
//
//   // // Only for internal use.
//   // // TODO support Windows.
//   // async importLangModule(key) {
//   //   return this.importAnyModule(this.langPath(key))
//   // }
//
//   // // FIXME look for header files and use them.
//   // async importAnyModule(key) {
//   //   this.validAbs(key)
//
//   //   return this.added(Module.fromNative(
//   //     key,
//   //     await this.ownNative().import(key),
//   //   ))
//   // }
//
//   // langScheme() {return `jisp:`}
//
//   // langPath(key) {
//   //   return p.posix.join(
//   //     p.posix.dir(import.meta.url),
//   //     this.validRel(key) + EXT_NATIVE,
//   //   )
//   // }
// }

// FIXME use.
// function isCanonicalModuleUrl(val) {
//   return isAbsUrl(val) && !val.search && !val.hash
// }

// function isAbsUrl(val) {
//   return isAbsFileUrl(val) || isAbsNetworkUrl(val)
// }

// function isAbsFileUrl(val) {
//   return a.isInst(val, URL) && val.protocol === `file:` && !val.hostname
// }

// function isAbsNetworkUrl(val) {
//   return a.isInst(val, URL) && val.protocol !== `file:` && !!val.hostname
// }

function isCanonicalModuleUrlStr(val) {
  return a.isStr(val) && !isParametrizedStr(val) && isAbsUrlStr(val)
}

function reqCanonicalModuleUrlStr(val) {
  return a.req(val, isCanonicalModuleUrlStr)
}

function isParametrizedStr(val) {
  return a.isStr(val) && (val.includes(`?`) || val.includes(`#`))
}

function isAbsUrlStr(val) {
  return isAbsFileUrlStr(val) || isAbsNetworkUrlStr(val)
}

/*
Reflects how `URL` parses `file:` URLs.

The following are absolute. After a decoding-encoding roundtrip, their href
begins with `file:///`. Substituting slashes for backslashes makes no
difference.

  * `file:`
  * `file:c:`
  * `file:one`
  * `file:c:/one`
  * `file:./one` (strips off `./`)
  * `file:./c:/one` (strips off `./`)
  * `file:../one` (strips off `../`)
  * `file:../c:/one` (strips off `../`)
  * `file:/`
  * `file:/c:`
  * `file:/one`
  * `file:/c:/one`
  * `file:/./one` (strips off `./`)
  * `file:/./c:/one` (strips off `./`)
  * `file:/../one` (strips off `../`)
  * `file:/../c:/one` (strips off `../`)
  * `file://`
  * `file://c:`
  * `file://c:/one`
  * `file:///`
  * `file:///one`
  * `file:///c:/one`
  * `file:///./one` (strips off `./`)
  * `file:///./c:/one` (strips off `./`)

The following are relative.

  * `file://one`
  * `file://.`
  * `file://./`
  * `file://./one`
*/
function isAbsFileUrlStr(val) {
  return hasFileScheme(val) && !isRelFileUrlStr(val)
}

function isRelFileUrlStr(val) {
  return a.isStr(val) && /^file:[/][/](?!$)(?![/]|[A-Za-z]:)/.test(val)
}

function isAbsNetworkUrlStr(val) {
  return a.isStr(val) && !hasFileScheme(val) && hasScheme(val)
}

function hasScheme(val) {return a.isStr(val) && /^\w+:/.test(val)}
function hasFileScheme(val) {return a.isStr(val) && val.startsWith(`file:`)}

/*
More restrictive than normal relative path format.
Requires the path to have NO special prefix.
Used for paths in `jisp:<path>`.
*/
function isStrictRelStr(val) {
  return (
    a.isStr(val) &&
    !val.startsWith(`/`) &&
    !val.startsWith(`\\`) &&
    !val.startsWith(`.`) &&
    !hasScheme(val) &&
    !isAbsUrlStr(val)
  )
}

// function isLangImportPath(val) {
//   return a.isStr(val) && val.startsWith(SCHEME)
// }

// FIXME move to `Root` for better assertions.
function toCompFileUrl(val) {
  return p.posix.join(
    p.posix.dir(import.meta.url),
    unparametrize(a.req(val, isStrictRelStr)) + EXT_NATIVE,
  )
}

function unparametrize(src) {
  return stripAt(stripAt(src, `?`), `#`)
}

function stripAt(src, str) {
  src = a.reqStr(src)
  str = a.reqStr(str)
  const ind = src.indexOf(str)
  if (ind >= 0) return src.slice(0, ind)
  return src
}

export class Fs extends MixOwnParented.goc(a.Emp) {
  async read() {throw errMeth(`read`, this)}
  async checksum() {throw errMeth(`checksum`, this)}
}

export class DenoFs extends Fs {
  async read(path) {return Deno.readTextFile(path)}
  async checksum(path) {return (await Deno.stat(path)).mtime}
}

/*
First approximation:

  * Pluggable FS implementation, read-only.
  * RAM-only caching.
  * Dedup imports.
  * No disk writes.

TODO second approximation:

  * Disk writes.
  * Disk/net caching.
  * Module dependency graphs (acyclic).
  * Checksums (ƒ of path).
  * Use header files.
  * Use cached files, invalidate by own and dependency checksums.
*/
export class Root extends MixParent.goc(MixErr.goc(a.Emp)) {
  #fs = undefined
  ownFs() {return this.#fs}
  setFs(val) {return this.#fs = this.toValidChild(a.reqInst(val, Fs)), this}
  reqFs() {return this.ownFs() ?? this.throw(`missing FS at ${a.show(this)}`)}

  // #nativeModuleCache = undefined
  // ownNativeModuleCache() {return this.#nativeModuleCache ||= this.toValidChild(new NativeModuleCache())}
  // setNativeModuleCache(val) {return this.#nativeModuleCache = this.toValidChild(this.reqInst(val, NativeModuleCache)), this}

  #moduleColl = undefined
  ownModuleColl() {return this.#moduleColl ||= new ModuleColl()}
  setModuleColl(val) {return this.#moduleColl = this.reqInst(val, ModuleColl), this}

  #importPromiseCache = undefined
  ownImportPromiseCache() {return this.#importPromiseCache ||= new PromiseCache()}
  setImportPromiseCache(val) {return this.#importPromiseCache = this.reqInst(val, PromiseCache), this}

  /*
  FIXME: handle self-import.

  Somewhat similar to the JS built-in dynamic `import`, with various differences:

    * The output type is our own `Module` which combines a native JS module with
      our own metadata.

    * If the target is a Jisp file, we automatically convert it to JS, reusing
      from cache if possible.

    * If the target is available synchronously, returns `Module` rather than
      `Promise<Module>`. (Tentative, TODO split off to separate method.)
  */
  importRel(key, modUrl) {
    key = unparametrize(key)
    this.req(modUrl, isCanonicalModuleUrlStr)

    if (key.startsWith(SCHEME)) {
      return this.importComp(key.slice(SCHEME.length))
    }

    if (!hasScheme(key)) {
      // TODO revise. URLs don't always end with a file name we can strip off.
      const dir = p.posix.dir(modUrl)
      key = p.posix.join(dir, key)
    }

    // this.req(key, isCanonicalModuleUrlStr)
    if (key.endsWith(EXT_LANG)) return this.importLang(key)
    return this.importNative(key)
  }

  importComp(key) {return this.importNative(toCompFileUrl(key))}

  importNative(key) {
    return this.importCached(key, this.importNativeUncached)
  }

  async importNativeUncached(key) {
    this.req(key, isCanonicalModuleUrlStr)
    return this.ownModuleColl().added(Module.fromNative(key, await import(key)))
  }

  importLang(key) {return this.importCached(key, this.importLangUncached)}

  // FIXME actual shit!
  async importLangUncached(key) {
    this.req(key, isCanonicalModuleUrlStr)
    console.log(`key:`, key)

    /*
    FIXME disk caching. Requires cache invalidation via checksums stored in
    header file and calculated from both the requested file and all its
    dependencies, which requires a module dependency graph.
    */
    if (false) {
      const nativeUrl = new URL(a.reqStr(key) + `.native` + EXT_NATIVE)
      const headerUrl = new URL(a.reqStr(key) + `.header` + EXT_NATIVE)

      // FIXME skip on 404.
      const [native, header] = await Promise.all([
        this.reqFs().read(nativeUrl),
        this.reqFs().read(headerUrl),
      ])

      if (native && header) {
        /*
        FIXME cache invalidation:
          * Header stores checksums.
          * Header stores dependency list.
          * Compare to checksums for:
            * Requested module.
            * Dependencies.
        */
      }
    }

    const srcUrl = new URL(a.reqStr(key))
    const src = await this.reqFs().read(srcUrl)

    // FIXME perhaps module requires path and registers in root immediately.
    // Allows self-import.
    //
    // Root may cache both lang modules and native modules???
    //
    // Separate lang modules from native modules?
    const mod = new Module().setParent(this).fromStr(src).setUrl(srcUrl.href)
    await mod.macro()

    console.log(`mod:`, mod)

    // FIXME:
    // * Module:
    //   * Compile to native.
    //   * Compile to header.
    //   * Write both to disk.
    //   * Import both.
    //   * Generate module from imported.

    throw FIXME
  }

  importCached(key, fun) {
    a.reqStr(key)
    a.reqFun(fun)
    return (
      this.ownModuleColl().get(key) ||
      this.ownImportPromiseCache().goc(key, fun, this)
    )
  }
}
