import * as a from '/Users/m/code/m/js/all.mjs'

export const symInsp     = Symbol.for(`Insp`)
export const symInspMod  = Symbol.for(`Insp.mod`)
export const symInspMake = Symbol.for(`Insp.make`)
export const symInspDeno = Symbol.for(`Deno.customInspect`)
export const symInspNode = Symbol.for(`nodejs.util.inspect.custom`)

/*
Short for "mixin: inspectable". Tool for implementing support for custom
inspection (fancy pretty-printing).
*/
export class MixInsp extends a.DedupMixinCache {
  static make(cls) {
    return class MixInsp extends cls {
      get [symInsp]() {return Insp}
      [symInspMod](val) {return val}
      [symInspMake]() {return this[symInspMod](new this[symInsp]().setTar(this))}
      [symInspDeno](fun, opt) {return fun(this[symInspMake](), opt)}
      [symInspNode](_dep, opt, fun) {return fun(this[symInspMake](), opt)}
    }
  }
}

/*
Short for "inspectable". Internal tool for implementing support for custom
inspection (fancy pretty-printing). Intended for development debugging.
TODO drop on release.
*/
class Insp extends a.Emp {
  // Inspection target.
  #tar = undefined
  setTar(val) {return this.#tar = a.reqObj(val), this}
  ownTar() {return this.#tar}

  set(key, val) {return this[a.reqObjKey(key)] = val, this}
  mut(...src) {return a.assign(this, ...src)}

  funs(...fun) {
    a.reqArrOf(fun, a.isFun)
    const tar = this.ownTar()
    for (fun of fun) this[a.reqValidStr(fun.name)] = fun.call(tar)
    return this
  }

  get [Symbol.toStringTag]() {
    const tar = this.ownTar()
    return tar[Symbol.toStringTag] || tar.constructor.name
  }
}
