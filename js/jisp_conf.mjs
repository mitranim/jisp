import * as a from '/Users/m/code/m/js/all.mjs'

/*
TODO consider making this non-global by moving this to `Root`. Descendants would
acquire `Conf` from ancestors.

TODO: add an option that allows `Import` to import target modules at compile
time and validate references. Disable by default for performance. Opt-in for
production builds.
*/
export const conf = new class Conf extends a.Emp {
  // TODO change to `false` by default. Set to `true` in testing.
  #debug = true
  setDebug(val) {return this.#debug = a.reqBool(val), this}
  getDebug() {return this.#debug}

  #urlScheme = `jisp:`
  setUrlScheme(val) {return this.#urlScheme = a.reqValidStr(val), this}
  getUrlScheme() {return this.#urlScheme}

  #fileExtSrc = `.jisp`
  setFileExtSrc(val) {return this.#fileExtSrc = a.reqValidStr(val), this}
  getFileExtSrc() {return this.#fileExtSrc}

  #fileExtOut = `.mjs`
  setFileExtOut(val) {return this.#fileExtOut = a.reqValidStr(val), this}
  getFileExtOut() {return this.#fileExtOut}

  /*
  Not implemented. This is meant to control whether `Root` attempts to reuse
  files already found on disk. Actual, proper implementation of caching
  requires us to detect when a file is outdated, which requires us to detect if
  any of its compile-time dependencies is outdated, which requires knowing
  dependencies, which may require metadata stored separately from the compiled
  files. We may implement those features in the future.

  Note that we ALWAYS write compiled files to disk regardless of this setting.
  */
  #fsCaching = false
  setFsCaching(val) {return this.#fsCaching = a.reqBool(val), this}
  getFsCaching() {return this.#fsCaching}

  // See above about FS caching.
  #fsCacheDirName = `jisp_cache`
  setFsCacheDirName(val) {return this.#fsCacheDirName = a.reqValidStr(val), this}
  getFsCacheDirName() {return this.#fsCacheDirName}
}()

/*
If we were committed to configuration being global, it would be simpler to
express it as exported variables, instead of defining a class. See the example
below. However, it might be better to make configuration non-global by moving
it to `Root`.



export let debug = false
export function setDebug(val) {debug = a.reqBool(val)}

export let urlScheme = `jisp:`
export function setUrlScheme(val) {urlScheme = a.reqValidStr(val)}

export let fileExtSrc = `.jisp`
export function setFileExtSrc(val) {fileExtSrc = a.reqValidStr(val)}

export let fileExtOut = `.mjs`
export function setFileExtOut(val) {fileExtOut = a.reqValidStr(val)}

export let fsCaching = false
export function setFsCaching(val) {fsCaching = a.reqBool(val)}

export let fsCacheDirName = `jisp_cache`
export function setFsCacheDirName(val) {fsCacheDirName = a.reqValidStr(val)}
*/
