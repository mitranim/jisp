/*
This entrypoint script allows to run Jisp scripts in DOM environments such as
browsers, similar to how `cli_deno.mjs` and `cli_node.mjs` run Jisp scripts in
Deno and Node.

Setup:

  <script type="module" src="<jisp_repo>/dom.mjs"></script>

Scripts with `src`:

  <script type="application/jisp" src="<some_path>.jisp"></script>
  <script type="application/jis" src="<some_path>.jis"></script>

Inline scripts:

  <script type="application/jisp">
    [use `jisp:prelude.mjs` ...]
    [declare globals]
    [console.log `hello world!`]
  </script>

  <script type="application/jis">
    use `jisp:prelude.mjs` ...
    declare globals
    console.log `hello world!`
  </script>
*/

import * as c from './js/core.mjs'
import * as p from './js/prelude.mjs'

class BrowserFsReadOnly {
  async read(path) {
    const res = await fetch(path)
    if (!res.ok) throw Error((await res.text()) || `unknown fetch error`)
    return res.text()
  }
}

const ctx = c.rootCtx()
ctx.use = p.use
ctx[c.symFs] = new BrowserFsReadOnly()

const dialects = Object.fromEntries(ctx[c.symDialects].map(dialectEntry))
function dialectType(src) {return c.reqValidStr(src.contentType)}
function dialectEntry(src) {return [dialectType(src), src]}
function dialectSelector(src) {return `script[type=${JSON.stringify(src)}]`}

for (const script of document.querySelectorAll(
  Object.keys(dialects).map(dialectSelector).join(`, `)
)) {
  const type = c.reqStr(script.type)
  const path = c.reqStr(script.src)
  const text = c.reqStr(script.textContent)
  const dialect = c.reqComp(dialects[type])
  const Reader = c.reqFun(dialect.Reader)

  if (path) {
    const ext = c.reqStr(dialect.extension)
    if (!path.endsWith(ext)) {
      throw Error(`content type ${c.show(type)} requires file extension ${c.show(ext)}, got unexpected path ${c.show(path)}`)
    }
    if (text) {
      throw Error(`unexpected inline content in script with content type ${c.show(type)} and source path ${c.show(path)}`)
    }

    const mod = c.ctxReqModules(ctx).getOrMake(path)
    mod.Reader = Reader
    await mod.ready(ctx)
    await import(mod.reqTarPath())
    continue
  }

  if (text) {
    const mod = new c.Module()
    mod.Reader = Reader
    mod.src = text
    await mod.ready(ctx)
    await import(mod.reqTarPath())
  }
}
