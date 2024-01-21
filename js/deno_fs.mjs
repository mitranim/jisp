import {a, io} from './dep.mjs'
import * as jm from './misc.mjs'
import * as ji from './insp.mjs'
import * as jfs from './fs.mjs'

export class DenoFs extends ji.MixInsp.goc(jfs.Fs) {
  #tarUrlStr = undefined
  setTarUrlStr(val) {return this.#tarUrlStr = a.req(val, jm.isAbsUrlStrDirLike), this}
  optTarUrlStr() {return this.#tarUrlStr}

  optTarUrl() {
    const src = this.optTarUrlStr()
    return src && new jm.Url(src)
  }

  reqTarUrl() {return new jm.Url(this.reqTarUrlStr())}

  /*
  If the target path is relative, this implicitly resolves it relative to
  CWD. That's common and expected behavior, but in our system, we tend to
  be explicit about relative vs absolute. TODO consider if the behavior
  should be reflected in the name.
  */
  setTar(val) {
    this.#tarUrlStr = new jm.Url(val, this.cwdUrl()).toUndecorated().toDirLike().href
    return this
  }

  cwdUrl() {return new jm.Url(io.paths.dirLike(io.cwd()), `file:`)}

  canReach(val) {
    if (a.isStr(val)) return true
    if (a.isInst(val, URL)) return jm.isFileUrl(val)
    throw TypeError(`type mismatch: ${a.show(this)} does not support paths like ${showPath(val)}`)
  }

  async reqRead(path) {
    try {
      return await Deno.readTextFile(path)
    }
    catch (err) {
      /*
      Motive: at the time of writing, Deno does not include path into error
      message for "not found" errors.
      */
      throw Error(`unable to read ${showPath(path)}`, {cause: err})
    }
  }

  optRead(path) {
    if (!this.canReach(path)) return undefined
    return skipNotFound(Deno.readTextFile(path))
  }

  async reqWrite(path, body) {
    await this.mkdirForFile(path)
    await Deno.writeTextFile(path, body)
  }

  /*
  Would prefer `Deno.writeFile` or `Deno.writeTextFile` with `{append: true}`
  with an empty input. However, when the input is empty, these functions seem
  to skip the FS operation entirely.
  */
  async reqTouch(path) {
    await this.reqWrite(path, await this.reqRead(path))
  }

  async optTimestamp(path) {
    if (!this.canReach(path)) return undefined
    return skipNotFound(this.reqTimestamp(path))
  }

  async reqTimestamp(path) {
    const stat = await Deno.stat(path)
    const out = stat.mtime?.valueOf()
    if (!a.isFin(out)) {
      throw TypeError(`unexpected non-finite modification time ${a.show(out)} in stat ${a.show(stat)} for path ${showPath(path)}`)
    }
    return out
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

async function skipNotFound(val) {
  try {
    return await val
  }
  catch (err) {
    if (a.isInst(err, Deno.errors.NotFound)) return undefined
    throw err
  }
}

function showPath(val) {return a.show(a.renderOpt(val) ?? val)}
