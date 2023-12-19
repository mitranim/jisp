import * as a from '/Users/m/code/m/js/all.mjs'
import * as p from '/Users/m/code/m/js/path.mjs'
import * as io from '/Users/m/code/m/js/io_deno.mjs'
import * as jm from './jisp_misc.mjs'
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

  relSrc(path) {return io.paths.join(this.laxSrc(), path)}
  readSrc(path) {return this.read(this.relSrc(path))}
  writeSrc(path, body) {return this.write(this.relSrc(path), body)}

  relTar(path) {return io.paths.join(this.laxTar(), path)}
  readTar(path) {return this.read(this.relTar(path))}
  writeTar(path, body) {return this.write(this.relTar(path), body)}

  toAbs(path) {
    if (p.posix.isAbs(path)) return path
    return io.paths.join(io.cwd(), path)
  }

  async checksum(path) {return (await Deno.stat(path)).mtime}
  async read(path) {return Deno.readTextFile(path)}

  async write(path, body) {
    await this.mkdirForFile(path)
    await Deno.writeTextFile(path, body)
  }

  async mkdirForFile(path) {
    if (a.isInst(path, URL)) path = jm.dirUrl(path)
    else path = io.paths.dir(path)
    if (path) await Deno.mkdir(path, {recursive: true})
  }

  async mkdir(path) {
    path = io.paths.clean(path)
    if (path) await Deno.mkdir(path, {recursive: true})
  }

  [ji.symInsp](tar) {return tar.funs(this.ownSrc, this.ownTar)}
}
