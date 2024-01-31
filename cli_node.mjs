import * as c from './js/core.mjs'
import * as p from './js/prelude.mjs'
import * as n from './js/node.mjs'

Error.stackTraceLimit = 1024

const ctx = c.rootCtx()
ctx.use = p.use

const cwd = new URL(c.pathDirLike(process.cwd()), `file:`)
const tar = process.env[`JISP_TARGET`]

if (tar) {
  ctx[c.symFs] = new n.NodeFs()
  ctx[c.symTar] = new URL(tar, cwd).href
  ctx[c.symMain] = cwd.href
}
else {
  ctx[c.symFs] = new n.NodeFsReadOnly()
}

for (const arg of Deno.args) {
  const mod = c.ctxReqModules(ctx).getOrMake(new URL(arg, cwd).href)
  await mod.ready(ctx)
  await import(mod.tarPath)
}
