# Lisps

Truly beautiful homoiconicity requires 1-1 equality between the following sets of types:

* Types that can exactly represent code.
* Types that can be deserialized from code.
* Types that can be serialized into code.
* Types that can be evaluated or compiled.
  * This is also the set of types that are valid AST nodes, since the purpose of the AST is to be evaluated or compiled.
* Types that can exist at runtime.

Most Lisps violate this. The set of types that can exactly represent code must include whitespace and comments, but the reader drops them, and the language doesn't provide types for them. The set of types that can be evaluated is usually equal to the set of types that can exist at runtime, which usually includes compiled functions, which can not be serialized into code.

# Imports

There are two ways of importing: `use` and `import`.

* `use` is compile-time only. It brings definitions into scope, and makes them compile-time-evaluatable by default (the internal term for this is "live value"). It does not generate a native import statement or expression.

* `import` is runtime-only. It does not look for header files, does not import code into compiler, does not bring anything into scope other than the identifier or identifiers it declares, and does generate a native import statement or expression.

The only way to evaluate something at compile time is by referencing it from another module imported by `use`.

# Misc

Should Jisp be written in itself?

Maybe convert it later. I'd say that every self-respecting compiled language should be written in itself. It's more important for languages that compile to machine code, where getting rid of the bootstrap language (assuming it's not machine code) reduces the amount of languages you're dealing with. It's less important for transpilers where the bootstrap language is also the compilation target, so you can't really get rid of it.
