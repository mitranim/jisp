import * as p from '/Users/m/code/m/js/path.mjs'
import * as io from '/Users/m/code/m/js/io_deno.mjs'

export const SRC_FILE_NAME = `test_code.jisp`

/*
Seems like the easiest way to relate a file name to the directory of the current
file. Simply writing `./test_code.jisp` would not work, since that would be
relative to CWD, not relative to current file.
*/
export const SRC_FILE_URL = new URL(SRC_FILE_NAME, p.posix.dirLike(p.posix.dir(import.meta.url)))

export const SRC_TEXT = Deno.readTextFileSync(SRC_FILE_URL).trim()

/*
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
*/
