import {t} from './test_init.mjs'
import * as ti from './test_init.mjs'
import * as c from '../js/core.mjs'

t.test(function test_Span() {
  const span = new c.Span()

  t.is(span.src, ``)
  t.is(span.pos, 0)
  t.is(span.end, 0)
  t.no(span.hasMore())
  t.is(span.view(), ``)
  t.is(span.context(), ``)

  const src = `one
two
three`

  span.init(src)
  t.is(span.src, src)
  t.is(span.pos, 0)
  t.is(span.end, src.length)
  t.ok(span.hasMore())
  t.is(span.view(), src)
  t.is(span.context(), c.joinParagraphs(`:1:1`, src))

  span.skip(4)
  t.is(span.src, src)
  t.is(span.pos, 4)
  t.is(span.end, src.length)
  t.ok(span.hasMore())
  t.is(span.view(), `two
three`)
  t.is(span.context(), `:2:1

…
two
three`)

  span.skip(2)
  t.is(span.src, src)
  t.is(span.pos, 6)
  t.is(span.end, src.length)
  t.ok(span.hasMore())
  t.is(span.view(), `o
three`)
  t.is(span.context(), `:2:3

…
…o
three`)

  span.skip(123)
  t.is(span.src, src)
  t.is(span.pos, 129)
  t.is(span.end, src.length)
  t.no(span.hasMore())
  t.is(span.view(), ``)
  t.is(span.context(), ``)

  span.init(src, 0, 4)
  t.is(span.src, src)
  t.is(span.pos, 0)
  t.is(span.end, 4)
  t.ok(span.hasMore())
  t.is(span.view(), `one
`)
  t.is(span.context(), `:1:1

one
two
three`)

  span.init(src, 3, 4)
  t.is(span.src, src)
  t.is(span.pos, 3)
  t.is(span.end, 4)
  t.ok(span.hasMore())
  t.is(span.view(), `\n`)
  t.is(span.context(), `:1:4

…
two
three`)

  span.init(src, 4, 4)
  t.is(span.src, src)
  t.is(span.pos, 4)
  t.is(span.end, 4)
  t.no(span.hasMore())
  t.is(span.view(), ``)
  t.is(span.context(), `:2:1

…
two
three`)

  span.init(src, 9, 4)
  t.is(span.src, src)
  t.is(span.pos, 9)
  t.is(span.end, 4)
  t.no(span.hasMore())
  t.is(span.view(), ``)
  t.is(span.context(), `:3:2

…
…hree`)
})

export const srcLong = `
10
20 [30 40] 50
b170f9ac8ac4452da3459f04eecc2a0e
8256285e7c1e44b6ab1ace0e2660f4e3
8c15bdb2fa3e4f9eb030f4ff54f9c25e
415b26f753b346968149e9b934df3253
bad0e077c8344f7685c6ef859e3d3343
96c214786802449392bda446b51ddf83
b8af2a6003834b31b82f12b77129ab3a
9734e33ba3da405cadae84842c28cee4
8388a68c22544962b27a2e117934dce1
`

export const contextLong = `:3:4

…
…[30 40] 50
b170f9ac8ac4452da3459f04eecc2a0e
8256285e7c1e44b6ab1ace0e2660f4e3
8c15bdb2fa3e4f9eb030f4ff54f9c25e
415b26f753b346968…`

t.test(function test_span_context() {
  t.test(function test_from_start() {
    const span = new c.Span(srcLong, 0, 14)

    t.is(span.view(), `
10
20 [30 40]`)

    t.is(span.context(), `:1:1


10
20 [30 40] 50
b170f9ac8ac4452da3459f04eecc2a0e
8256285e7c1e44b6ab1ace0e2660f4e3
8c15bdb2fa3e4f9eb030f4ff54f9c25e
415b26f753…`)
  })

  t.test(function test_from_middle() {
    const span = new c.Span(srcLong, 7, 14)
    t.is(span.view(), `[30 40]`)
    t.is(span.context(), contextLong)
  })

  t.test(function test_with_path() {
    const path = c.reqValidStr(import.meta.url)
    const span = new c.Span(srcLong, 7, 14, path)
    t.is(span.view(), `[30 40]`)
    t.is(span.context(), path + contextLong)
  })
})

if (import.meta.main) ti.flush()
