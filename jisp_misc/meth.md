My main difficulty is the syntax for property access, method calls, method chaining.

The new compiler currently uses the `.` syntax, just like JS. The lexer supports grouping `.key` with the preceding expression into one. As a result, `<expr>.key` becomes one expression, and this expression type supports namespace lookup, macro execution, etc. Basically the compiler has this special-case support for non-Lispy infix/postfix. Property chaining is fine, but method chaining is unusable for humans.

```
one.two
one.two.three
[one.two three]
[one.two.three four]
[one.two].three
[[one.two].three].four
[[[one.two].three].four]
[[[[one.two].three].four].five]
```

We could compile standalone `[.method]` to a standalone JS method call:

```
[.method arg arg]
→
.method(arg, arg)


[SomeCls].property[.method][.method]
→
new SomeCls().property.method().method()

[SomeCls]
.property
[.method]
[.method]
→
new SomeCls()
.property
.method()
.method()
```

...but it's very non-Lispy. In a normal Lisp syntax, expressions are either atomic or delimited by brackets. The approach where `[expr][.expr]` is a single expression (method call) violates this principle, creating problems for macros which care about the amount of expressions. Grouping them inside the compiler is possible, but defeats one of the selling points of Lisp syntax, which is that the code structure visibly matches the AST structure. For example:

```
[const name [SomeCls][.someMethod]]
```

This would be a compile error because `const` enforces exactly one expression as its body, unless the compiler starts looking for those method calls and invisibly combining each with the previous expression at the AST level.

We could borrow the "threading macro" from Clojure:

```
[-> [SomeCls] .property [.method] [.method]]

[-> [SomeCls]
  .property
  [.method]
  [.method]
]

→
new SomeCls().property.method().method()
```

...but having used Clojure for years, I don't recommend this. You have to wrap/unwrap your code when adding or removing calls, gets tiresome fast. I want to just append a call without editing the previous code.

We could also consider the following perversion:

```
[SomeCls].property.[method].[method]
one.two.[three four].[five six]
```

...but I'm not sure how to define the behavior when the method name is replaced with an arbitrary expression:

```
one.two.[]
one.two.[10 20]
one.two.[[three four] five]
```

We could support `[.method receiver]` syntax, like Clojure. It would invert the order of method calls. In fact, it would make the order consistent between method calls and normal function calls, but inconsistent with property access:

```
[.method1 [.method0 [SomeCls].property0.property1]]
->
new SomeCls().property0.property1.method0().method1()
```

Finally, we could just use the `func[]` call notation:

```
SomeCls[].property.method[].method[]

const[someVar 123]

fn[someFunc [someArg] +[someArg 10 20]]

if[one two three]
```

Compared to supporting `expr.property` and `expr[.method]` in a Lisp syntax, the `.method[]` notation makes it easier to detect method calls and combine them with the previous expression into one expression, both for compilers and human readers. However, it still has potential for order mismatch:

```
func4[func3[func0[].prop1.meth2[]]].meth5[]
```

An ideal solution would order normal calls and method calls the same way. JS has pending proposals for "piping" that allows to insert non-methods into method chains. Something like:

```
func0[]
.prop1
.meth2[]
|> func3[%]
|> func4[%]
.meth5[]
```

We could make an infix piping operator such as `|>` unnecessary by implementing a special macro that replaces itself with the previous expression, reordering the code. Let's say `↑` is this macro:

```
[func0]
↑.prop1
[↑.meth2]
[func3 ↑]
[func4 ↑]
[↑.meth5]

->

[[func4 [func3 [[func0].prop1.meth2]]].meth5]
```

Version with `func[]`:

```
func0[]
.prop1
.meth2[]
func3[↑]
func4[↑]
.meth5[]

->

func4[func3[func0[].prop1.meth2[]]].meth5[]
```

Need something better...
