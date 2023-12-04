import * as a from '/Users/m/code/m/js/all.mjs'

// TODO convert fields to `camelLower`.
export class Conf extends a.MixMain(a.Emp) {
  // `DEBUG` enables optional sanity checks. TODO make configurable.
  DEBUG = true
  SCHEME = `jisp:`
  EXT_LANG = `.jisp`
  EXT_NATIVE = `.mjs`
  DISK_CACHING = false
  CACHE_DIR_NAME = `jisp_cache`
}
