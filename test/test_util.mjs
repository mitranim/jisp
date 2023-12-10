import * as p from '/Users/m/code/m/js/path.mjs'
import * as io from '/Users/m/code/m/js/io_deno.mjs'

export const SRC_FILE_URL = urlRel(import.meta.url, `../test_files/test_code.jisp`)

export const SRC_TEXT = Deno.readTextFileSync(SRC_FILE_URL).trim()

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

/*
Usage: `urlRel(import.meta.url, someRelPath)`.

Seems like the easiest way to relate a file name to the directory of the current
file. Simply writing `./test_code.jisp` would not work, since that would be
relative to CWD, not relative to current file.
*/
export function urlRel(url, path) {
  return new URL(path, p.posix.dirLike(p.posix.dir(url)))
}

export function readFileRel(url, path) {
  return Deno.readTextFileSync(urlRel(url, path))
}
