import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as p from '/Users/m/code/m/js/path.mjs'
import * as io from '/Users/m/code/m/js/io_deno.mjs'

export const SRC_TEXT = Deno.readTextFileSync(
  new URL(`../test_files/test_code.jisp`, import.meta.url)
).trim()

export const SRC_TEXT_SHORT = `
10 20
; comment
"double quoted"
\`grave quoted\`
$long_Ident_$123
one.two.three
[({30})]
`.trim()

/*
This is unnecessary for shallow structures that use `MixInsp`. However, this is
necessary for structures that don't use `MixInsp` or for deep structures
(because this sets an infinite depth).
*/
export function prn(desc, val) {
  console.log(desc, Deno.inspect(val, inspectOpt))
}

export const inspectOpt = {
  depth: Infinity,
  colors: true,
  compact: true,
  trailingComma: true,
  showHidden: true,
  getters: true,
}

export function testCompiled(act, exp) {
  act = a.trim(act)
  exp = a.trim(exp)

  if (act !== exp) {
    throw new t.AssertError(`
mismatch of compiled text and expected text

actual:
---
${act}
---

expected:
---
${exp}
---
`)
  }
}
