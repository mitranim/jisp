import * as c from './core.mjs'

export class DenoFs {
  canReach(path) {return c.isStr(path) || isFileUrl(path)}

  async read(path) {
    try {return await Deno.readTextFile(path)}
    catch (err) {throw Error(`unable to read ${showPath(path)}`, {cause: err})}
  }

  readOpt(path) {return skipNotFound(Deno.readTextFile(path))}

  async write(path, body) {
    await this.mkdir(pathToDir(path))
    await Deno.writeTextFile(path, body)
  }

  async remove(path) {await Deno.remove(path, {recursive: true})}
  async removeOpt(path) {await skipNotFound(this.remove(path))}

  async mkdir(path) {await Deno.mkdir(path, {recursive: true})}
  async timestamp(path) {return c.reqFin((await Deno.stat(path)).mtime?.valueOf())}
  async timestampOpt(path) {return skipNotFound(this.timestamp(path))}
}

function isFileUrl(val) {return c.isInst(val, URL) && val.protocol === `file:`}
function showPath(val) {return c.show(c.renderOpt(val) ?? val)}

function pathToDir(path) {
  if (c.isInst(path, URL)) return new URL(`.`, path)
  return c.pathDir(path)
}

async function skipNotFound(val) {
  try {return await val}
  catch (err) {
    if (c.isInst(err, Deno.errors.NotFound)) return undefined
    throw err
  }
}
