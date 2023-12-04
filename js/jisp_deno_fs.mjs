import * as a from '/Users/m/code/m/js/all.mjs'
import * as io from '/Users/m/code/m/js/io_deno.mjs'
import * as jfs from './jisp_fs.mjs'

export class DenoFs extends jfs.Fs {
  #src = undefined
  setSrc(val) {return this.#src = a.reqStr(val), this}
  ownSrc() {return this.#src}
  reqSrc() {return a.reqStr(this.#src)}
  optSrc() {return this.#src}

  #tar = undefined
  setTar(val) {return this.#tar = a.reqStr(val), this}
  ownTar() {return this.#tar}
  reqTar() {return a.reqStr(this.#tar)}
  optTar() {return this.#tar}

  async checksum(path) {return (await Deno.stat(path)).mtime}
  async read(path) {return Deno.readTextFile(path)}

  // FIXME wrong handling of relative paths (forgets to use `.#src`).
  async write(path, body) {
    await this.mkdir(io.paths.dir(path))
    await Deno.writeTextFile(path, body)
  }

  // FIXME wrong handling of relative paths (forgets to use `.#src`).
  async mkdirFor(path) {
    path = io.paths.clean(path)
    if (path) await Deno.mkdir(path, {recursive: true})
  }

  resolveSrc(path) {return io.paths.join(this.reqSrc(), path)}
  resolveTar(path) {return io.paths.join(this.reqTar(), path)}
  async writeSrc(path, body) {await this.write(this.resolveSrc(path), body)}
  async writeTar(path, body) {await this.write(this.resolveTar(path), body)}
}
