import * as c from './js/core.mjs'
import * as p from './js/prelude.mjs'
import * as d from './js/deno.mjs'

Error.stackTraceLimit = 1024

c.ctxGlobal[c.symFs] = new d.DenoFs()
c.ctxGlobal[c.symTar] = new URL(`./.tmp_mock/`, import.meta.url).href
c.ctxGlobal.use = p.use

const mod = await c.ctxReqModules(c.ctxGlobal).getInit(new URL(`main.jisp`, import.meta.url).href)
await mod.ready()
await import(mod.tarPath)
