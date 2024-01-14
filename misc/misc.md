## TODO

In import/module/root code, consider renaming "resolve" to "ready".

## Lisps

### Homo

Truly beautiful homoiconicity requires 1-1 equality between the following sets of types:

* Types that can exactly represent code.
* Types that can be deserialized from code.
* Types that can be serialized into code.
* Types that can be evaluated or compiled.
  * This is also the set of types that are valid AST nodes, since the purpose of the AST is to be evaluated or compiled.
* Types that can exist at runtime.

Most Lisps violate this. The set of types that can exactly represent code must include whitespace and comments, but the reader drops them, and the language doesn't provide types for them. The set of types that can be evaluated is usually equal to the set of types that can exist at runtime, which usually includes compiled functions, which can not be serialized into code.

### Special

Traditional Lisps have something called "special forms". The most minimal set of "special forms" typically consists of the following: `lambda`, `set`, `if`.

What makes them "special" and distinct from other definitions is that each of them, in order to function correctly, needs several components: how to handle the provided AST nodes at macro time; how to evaluate at runtime; how to compile. This power is traditionally not available to user code, which can define only forms with _one_ component. User macros define macro-time AST transforms. User functions define runtime execution. User code can't define new "special" forms with multiple components. That's a fundamental mistake.

Jisp makes the power of "special forms" available to users. The traditional macro approach is also available, but it's merely a less-powerful shortcut.

The power comes at a cost. It requires us to replace simple "macro functions" with objects, methods, and interfaces. Making it possible (and easy) to define new "special forms" that combine custom "macro" behavior and custom "compile" behavior requires a more powerful AST. This is one of the reasons why in Jisp, AST consists of special `Node` objects, instead of nested arrays and primitive values.

## Imports

There are two ways of importing: `use` and `import`.

* `use` is macro-time only. It brings definitions into scope, and makes them macro-time-evaluatable by default (the internal term for this is "live value"). It does not generate a native import statement or expression.

* `import` is runtime-only. It does not look for header files, does not import code into compiler, does not bring anything into scope other than the identifier or identifiers it declares, and does generate a native import statement or expression.

The only way to evaluate something at macro time is by referencing it from another module imported by `use`.

## Names

JS uses reserved keywords, special reserved names, and a large amount of special syntax. Many traditional Lisps, including Common Lisp, also use reserved names and special syntax. In contrast, Jisp has no keywords, no reserved names, and no special-case syntax. In this sense, Jisp is more general.

JS has a large amount of globally predeclared names. Many traditional Lisps, including Common Lisp, do the same. In contrast, the only predeclared name in Jisp is `use`. Jisp code imports other names on an opt-in basis.

JS built-ins tend to have verbose names such as `undefined`, `Infinity`, `globalThis`. Jisp provides shorter names such as `nil`, `inf`, `global`, which compile to the regular JS built-in names. Just like other names, these are opt-in. User code may avoid importing them.

## Misc

Should Jisp be written in itself?

Maybe convert it later. I'd say that every self-respecting compiled language should be written in itself. It's more important for languages that compile to machine code, where getting rid of the bootstrap language (assuming it's not machine code) reduces the amount of languages you're dealing with. It's less important for transpilers where the bootstrap language is also the compilation target, so you can't really get rid of it.

## Metadata

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
    * Alternatively, define additional method "initX" that idempotently allocates the corresponding own property.
  * Getters that may perform lookup on other objects, for example on parents, must be named "optX" (for optional) and "reqX" (for required).
  * Getters that may perform expensive work should avoid prefixes such as "get" or "opt". Their name should be a verb to indicate work. Examples include generating new data structures or iterating over data structures.
  * Why:
    * Methods are less error-prone in JS. Missing a property name produces `undefined`. Missing a method name produces a runtime exception.
