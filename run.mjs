import * as jr from './js/root.mjs'
import * as jdfs from './js/deno_fs.mjs'

Error.stackTraceLimit = 1024

const tar = new URL(`./.tmp_mock/`, import.meta.url)
const fs = new jdfs.DenoFs().setTarUrlStr(tar.href)
const root = new jr.Root().setFs(fs)

const url = await root.reqModuleReadyPath(
  new URL(`./main.jisp`, import.meta.url).href
)

await import(url)
