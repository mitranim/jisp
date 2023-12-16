## Changes

The following is a non-exhaustive list of changes that need to be made when merging code from earlier versions.

* Src module vs tar module.
  * Src code -> src module -> FS IO -> tar module.
  * `<cached>`             -> FS IO -> tar module.
* Target folder is configurable:
  * Local relative folder like `.tmp`.
  * Subpaths are based on relative paths like `.tmp/src/blah.jisp`.
* Header file vs object file.
  * Requires separate files.
    * Must compare checksum before importing object file.
  * Prelude file requires hand-written header file.
  * Given a pair of header-object files, source file may be present or missing.
    * When source file is missing, checksum is ignored.
  * Paths.
    * One of:
      * Source file <-> folder with 2 files (H&O).
      * Source file <-> 2 file paths (H&O), convention for name transform.
        * `some_file.jisp` ->
          * `some_file.object.mjs`
          * `some_file.header.json`
        * This approach makes it easier to write JS with headers by hand.
* Eliding macro code and compiler code from prod bundle.
  * Minimum: include, but get rid of dependencies.
  * Maximum: ???

## Internal

Code conventions:

  * Properties vs getters vs methods:
    * Every property is #private and has public get/set methods.
    * No public properties.
    * No private properties without public get/set.
    * Property getters are allowed for common JS interfaces, such as `.size`.
    * "Set" methods have type assertions.
    * Setters are ALWAYS for own properties, named "setX".
    * Getters for own properties must be named "ownX" (not "getX").
      * They're also allowed to idempotently allocate the property.
      * Alternatively, define additional method "initX" that idempotently
        allocates the corresponding own property.
    * Getters that may perform lookup on other objects, for example on parents,
      must be named "optX" (for optional) and "reqX" (for required).
    * Getters that may perform expensive work should avoid prefixes such as
      "get" or "opt". Their name should be a verb to indicate work. Examples
      include generating new data structures or iterating over data structures.
    * Why:
      * Methods are less error-prone in JS. Missing a property name produces
        `undefined`. Missing a method name produces a runtime exception.

Common interfaces (non-exhaustive list):

  * `.optSpan`. Returns `StrSpan` referring to a region of source code, or
    `ArrSpan` referring to AST tokens. All AST nodes parsed from source must
    have a valid `StrSpan`. All AST nodes created by macros must refer to other
    nodes which ultimately have a valid `StrSpan`.

  * `.optSrcNode`. Used by nodes created by macros to replace other nodes.
    Each replacement node must use this method to refer to another node,
    ultimately referring to a node parsed from source code.

  * `.ownVal`. Compile-time evaluation. Performs arbitrary compile-time
    evaluation and returns an arbitrary value usable by macros. AST tokens
    parsed from source may return numbers, strings, booleans, etc. Identifier
    nodes may return the actual runtime values of declarations they refer to.
    For example, module A declares and exports a class that's usable as a macro,
    under name "B". Module C imports A and attempts to use B as a macro. The
    identifier node referring to B may use `.ownVal`, in combination with
    recursive search, to return the actual evaluated reference to that class
    from module A, allowing us to call that macro.

  * ... TODO more.
