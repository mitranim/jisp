import * as a from '/Users/m/code/m/js/all.mjs'

/*
TODO convert fields to `camelLower`.

TODO: add an option that allows `Import` to import target modules at compile
time and validate references. Disabled by default for performance. Opt-in for
production builds.
*/
export class Conf extends a.MixMain(a.Emp) {
  DEBUG = true
  SCHEME = `jisp:`
  EXT_LANG = `.jisp`
  EXT_NATIVE = `.mjs`
  DISK_CACHING = false
  CACHE_DIR_NAME = `jisp_cache`
}
