## Lisps

### Homo

The word "homoiconic" gets thrown around when discussing Lisp-style languages. I'm not sure if there's an exact definition. In any case, truly beautiful homoiconicity requires 1-1 equality between the following sets of types:

* Types that can exactly represent code.
* Types that can be deserialized from code.
* Types that can be serialized into code.
* Types that can be evaluated or compiled.
  * This is also the set of types that are valid AST nodes, since the purpose of the AST is to be evaluated or compiled.
* Types that can exist at runtime.

Most Lisp-style languages, including Jisp, violate this. You could say they make essential tradeoffs. The set of types that can exactly represent code, at a conceptual level, would include whitespace and comments, but the reader drops them, and the language doesn't provide types for them. The set of types that can be evaluated is usually equal to the set of types that can exist at runtime, which usually includes compiled functions, which can not be serialized into code.

### Special

Traditional Lisps have something called "special forms". The most minimal set of "special forms" typically includes `lambda` and `if`.

In my understanding, what makes them "special" and distinct from other definitions is that each of them, in order to function correctly, needs several components: how to handle the provided AST nodes at macro time; how to evaluate at runtime; how to compile. This power is often not available to user code, which can define only forms with _one_ component. User macros define macro-time AST transforms. User functions define runtime execution.

Jisp doesn't have special forms, or rather, _all_ macros in Jisp can be special forms. User-defined macros can both transform the AST and define custom compilation behavior, if they so choose. There are no privileged forms in Jisp. There are also no reserved names.

## Imports

There are two ways of importing: `use` and `use.mac`.

* `use` is for runtime imports. It generates a native import statement or expression.

* `use.mac` is for macro imports. It immediately imports the requested module, making it available for macro-time execution. It compiles to nothing at all; the compiled code does not include this import.

## Names

JS uses reserved keywords, special reserved names, and a large amount of special syntax. Many traditional Lisps, including Common Lisp, also use reserved names and special syntax. In contrast, Jisp has no keywords, no reserved names, and no special-case syntax. In this sense, Jisp is more general.

JS has a large amount of globally predeclared names. Many traditional Lisps, including Common Lisp, do the same. In contrast, Jisp does not have any predeclared names. Jisp code imports other names on an opt-in basis.

## Misc

Should Jisp be written in itself?

Maybe convert it later. I'd say that every self-respecting compiled language should be written in itself. It's more important for languages that compile to machine code, where getting rid of the bootstrap language (assuming it's not machine code) reduces the amount of languages you're dealing with. It's less important for transpilers where the bootstrap language is also the compilation target, so you can't really get rid of it.
