import * as a from '/Users/m/code/m/js/all.mjs'

export const symInspCls  = Symbol.for(`Insp.cls`)
export const symInspInit = Symbol.for(`Insp.init`)
export const symInspMake = Symbol.for(`Insp.make`)
export const symInspDeno = Symbol.for(`Deno.customInspect`)
export const symInspNode = Symbol.for(`nodejs.util.inspect.custom`)

/*
Short for "mixin: inspectable". Tool for implementing support for custom
inspection (fancy pretty-printing).

TODO: consider overriding inspection depth here.
*/
export class MixInsp extends a.DedupMixinCache {
  static make(cls) {
    return class MixInsp extends cls {
      get [symInspCls]() {return Insp}

      [symInspInit](val) {return val}

      [symInspMake]() {
        let insp = new this[symInspCls]()
        insp = insp.setSrc(this)
        insp = this[symInspInit](insp)
        return insp.initTar()
      }

      [symInspDeno](fun, opt) {return fun(this[symInspMake](), opt)}
      [symInspNode](_dep, opt, fun) {return fun(this[symInspMake](), opt)}
    }
  }
}

/*
Short for "inspectable" or "inspector". Internal tool for implementing support
for custom inspection (fancy pretty-printing). Intended mainly for debugging.
*/
export class Insp extends a.Emp {
  // Inspection source. This is what we're trying to "picture".
  #src = undefined
  setSrc(val) {return this.#src = a.reqObj(val), this}
  ownSrc() {return this.#src}

  // Inspection target. This is a "picture" of the inspection source
  // passed to runtime-specific inspection functions.
  #tar = undefined
  initTar() {return this.#tar ??= this.makeTar()}
  ownTar() {return this.#tar}

  makeTar() {
    const src = this.ownSrc()
    return this.makeNamedObject(src[Symbol.toStringTag] || src.constructor.name)
  }

  set(key, val) {return this[a.reqObjKey(key)] = val, this}
  mut(...src) {return a.assign(this, ...src)}

  funs(...fun) {
    a.reqArrOf(fun, a.isFun)
    const src = this.ownSrc()
    for (fun of fun) this.initTar()[a.reqValidStr(fun.name)] = fun.call(src)
    return this
  }

  /*
  Ideally, we would simply make a null-prototype object with the appropriate
  property `Symbol.toStringTag` (non-enumerable). However, at the time of
  writing, `Deno.inspect` always prints the property `Symbol.toStringTag` even
  when it's non-enumerable and redundant. So we use a constructor-based
  workaround to avoid that.
  */
  makeNamedObject(name) {
    const cls = NamedClassCache.goc(name)
    return cls ? new cls() : a.npo()
  }
}

export class NamedClassCache extends a.StaticCache {
  static make(name) {
    if (!a.optStr(name)) return undefined
    class Tar extends a.Emp {}
    a.priv(Tar, `name`, name)
    return Tar
  }
}
