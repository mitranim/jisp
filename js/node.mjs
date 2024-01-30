import * as c from './core.mjs'
import * as fs from 'fs/promises'

export class NodeFsReadOnly {
  read(path) {return fs.readFile(path, `utf-8`)}

  readOpt(path) {
    if (c.isNil(path)) return undefined
    return skipNotFound(this.read(path))
  }
}

export class NodeFs extends NodeFsReadOnly {
  isPathValid(path) {return c.isStr(path) || isFileUrl(path)}

  async write(path, body) {
    await this.mkdir(pathToDir(path))
    await fs.writeFile(path, body)
  }

  async remove(path) {await fs.rm(path, {recursive: true})}
  async removeOpt(path) {await skipNotFound(this.remove(path))}
  async mkdir(path) {await fs.mkdir(path, {recursive: true})}
  async timestamp(path) {return c.reqFin((await fs.stat(path)).mtime?.valueOf())}

  async timestampOpt(path) {
    if (!this.isPathValid(path)) return undefined
    return skipNotFound(this.timestamp(path))
  }
}

function isFileUrl(val) {return c.isInst(val, URL) && val.protocol === `file:`}

function pathToDir(path) {
  if (c.isInst(path, URL)) return new URL(`.`, path)
  return c.pathDir(path)
}

async function skipNotFound(val) {
  try {return await val}
  catch (err) {
    if (err?.code === `ENOENT`) return undefined
    throw err
  }
}
