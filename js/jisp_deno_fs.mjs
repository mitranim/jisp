import * as a from '/Users/m/code/m/js/all.mjs'
import * as p from '/Users/m/code/m/js/path.mjs'
import * as io from '/Users/m/code/m/js/io_deno.mjs'
import * as jm from './jisp_misc.mjs'
import * as ji from './jisp_insp.mjs'
import * as jfs from './jisp_fs.mjs'

export class DenoFs extends ji.MixInsp.goc(jfs.Fs) {
  #tarUrlStr = undefined
  setTarUrlStr(val) {return this.#tarUrlStr = a.req(val, jm.isAbsUrlStrDirLike), this}
  optTarUrlStr() {return this.#tarUrlStr}

  optTarUrl() {
    const src = this.optTarUrlStr()
    return src && new jm.Url(src)
  }

  reqTarUrl() {return new jm.Url(this.reqTarUrlStr())}

  setTar(val) {
    this.#tarUrlStr = new jm.Url(val, this.cwdUrl()).toUndecorated().toDirLike().href
    return this
  }

  cwdUrl() {return new jm.Url(io.paths.dirLike(io.cwd()), `file:`)}

  async read(path) {return Deno.readTextFile(path)}
  async checksum(path) {return (await Deno.stat(path)).mtime}

  async write(path, body) {
    await this.mkdirForFile(path)
    await Deno.writeTextFile(path, body)
  }

  async mkdirForFile(path) {
    if (a.isInst(path, URL)) {
      await Deno.mkdir(new jm.Url(path).toDir(), {recursive: true})
      return
    }
    await this.mkdir(io.paths.dir(path))
  }

  async mkdir(path) {
    path = io.paths.clean(path)

    // When the directory path is an empty string, then the directory should
    // already exist. We could check, but it would be an unnecessary expense.
    // Passing this to `Deno.mkdir` would cause an exception.
    if (!path) return

    await Deno.mkdir(path, {recursive: true})
  }

  [ji.symInsp](tar) {return tar.funs(this.ownSrc, this.ownTar)}
}
