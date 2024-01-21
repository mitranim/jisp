import * as c from './core.mjs'

export class DenoFs {
  canReach(path) {return c.isStr(path) || isFileUrl(path)}

  async read(path) {
    try {
      return await Deno.readTextFile(path)
    }
    catch (err) {
      /*
      At the time of writing, Deno does not include path into error message
      for "not found" errors.
      */
      throw Error(`unable to read ${showPath(path)}`, {cause: err})
    }
  }

  readOpt(path) {return skipNotFound(Deno.readTextFile(path))}

  async write(path, body) {
    await this.mkdir(pathToDir(path))
    await Deno.writeTextFile(path, body)
  }

  async mkdir(path) {await Deno.mkdir(path, {recursive: true})}
  async timestamp(path) {return c.reqFin((await Deno.stat(path)).mtime?.valueOf())}
  async timestampOpt(path) {return skipNotFound(this.timestamp(path))}

  /*
  Would prefer `Deno.writeFile` or `Deno.writeTextFile` with `{append: true}`
  with an empty input. However, when the input is empty, these functions seem
  to skip the FS operation entirely.
  */
  async touch(path) {await this.write(path, await this.read(path))}
}

function isFileUrl(val) {return c.isInst(val, URL) && val.protocol === `file:`}

function pathToDir(path) {
  if (c.isInst(path, URL)) return new URL(`.`, path)
  return c.pathDir(path)
}

async function skipNotFound(val) {
  try {return await val}
  catch (err) {
    if (err instanceof Deno.errors.NotFound) return undefined
    throw err
  }
}

function showPath(val) {return c.show(c.renderOpt(val) ?? val)}
