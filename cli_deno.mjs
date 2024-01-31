import * as c from './js/core.mjs'
import * as p from './js/prelude.mjs'
import * as d from './js/deno.mjs'

Error.stackTraceLimit = 1024

const ctx = c.rootCtx()
ctx.use = p.use

const cwd = new URL(c.pathDirLike(Deno.cwd()), `file:`)
const tar = Deno.env.get(`JISP_TARGET`)

if (tar) {
  ctx[c.symFs] = new d.DenoFs()
  ctx[c.symTar] = new URL(tar, cwd).href
  ctx[c.symMain] = cwd.href
}
else {
  ctx[c.symFs] = new d.DenoFsReadOnly()
}

for (const arg of Deno.args) {
  const mod = c.ctxReqModules(ctx).getOrMake(new URL(arg, cwd).href)
  await mod.ready(ctx)
  await import(mod.tarPath)
}
