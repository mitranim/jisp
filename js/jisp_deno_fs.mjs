import * as a from '/Users/m/code/m/js/all.mjs'
import * as io from '/Users/m/code/m/js/io_deno.mjs'
import * as ji from './jisp_insp.mjs'
import * as jfs from './jisp_fs.mjs'

export class DenoFs extends ji.MixInsp.goc(jfs.Fs) {
  #src = undefined
  setSrc(val) {return this.#src = a.reqStr(val), this}
  ownSrc() {return this.#src}
  reqSrc() {return a.reqStr(this.#src)}
  laxSrc() {return a.laxStr(this.#src)}
  optSrc() {return this.#src}

  #tar = undefined
  setTar(val) {return this.#tar = a.reqStr(val), this}
  ownTar() {return this.#tar}
  reqTar() {return a.reqStr(this.#tar)}
  laxTar() {return a.laxStr(this.#tar)}
  optTar() {return this.#tar}

  resolveSrc(path) {return io.paths.join(this.laxSrc(), path)}
  readSrc(path) {return this.read(this.resolveSrc(path))}
  writeSrc(path, body) {return this.write(this.resolveSrc(path), body)}

  resolveTar(path) {return io.paths.join(this.laxTar(), path)}
  readTar(path) {return this.read(this.resolveTar(path))}
  writeTar(path, body) {return this.write(this.resolveTar(path), body)}

  async checksum(path) {return (await Deno.stat(path)).mtime}

  async read(path) {return Deno.readTextFile(path)}

  async write(path, body) {
    await this.mkdir(io.paths.dir(path))
    await Deno.writeTextFile(path, body)
  }

  async mkdir(path) {
    path = io.paths.clean(path)
    if (path) await Deno.mkdir(path, {recursive: true})
  }

  [ji.symInsp](tar) {return tar.funs(this.ownSrc, this.ownTar)}
}
