### Table of Contents

* **Description**
* **Installation and Usage**
* **Docs**
  * Data Types
  * Code Structure
  * Everything an Expression
  * Quoting
  * Blocks
  * Object Properties
  * Functions
  * Assignment
  * Destructuring Assignment
  * Spreading and Rest Parameter
  * Comprehensions
  * Conditionals
  * Loops
  * Macros
  * Built-ins
  * Style
* **Known Bugs and NYI**
* **Why Use It**
* **ToDo Upcoming**
* **ToDo Wishlist**
* **Acknowledgements**


## Description

Jisp is the modern JavaScript for the modern developer. Its macro system lets you treat code as data and write functions that write code for you. Reuse code without runtime limitations, make your code more abstract and shorter, reprogram the language itself.

Jisp's extremely simple syntax protects against common JS pitfalls, and it builds some common coding patterns right into the language, helping keep your code short.

The compiler itself is written in jisp.

This is an early release. See Known Bugs and NYI and expect change.

## Installation and Usage

Install from npm:

    $ npm install -g jisp

Or download the source and use `./bin/jisp` and `./jisp/jisp.js` as entry points.

Require in Node:

    require('jisp/register')

This allows you to `require` jisp scripts directly from your code.

Launch a REPL:

    $ jisp
    jisp>

Compile a file:

    $ jisp -c <file>

Stream-compile for the browser with [gulp-jisp](https://github.com/Mitranim/gulp-jisp) (not friendly to old engines, todo polyfill).

Super basic Sublime Text build system:
* _Tools_ > _Build System_ > _New Build System_
* put line: `"cmd": ["jisp", "$file"]`
* save to: `~/Library/Application Support/Sublime Text 3/Packages/User`


## Docs

### Data types

    ---------------- JS ---------------- | -------------- Jisp --------------
    name: x $_y0                         | name: x $_y0
    string: 'str' "str"                  | string: 'str' "str"
    number: 0 1 2.5                      | number: 0 1 2.5
    boolean: true false                  | boolean: true / yes false / no
    special: null undefined              | special: null undefined
    regex: /!@#$%/                       | regex: /!@#$%/
    array literal: [a, b, c]             | quoted list: `(a b c)
    object literal:                      | hash table:
      {key0: val0, key1: val1}           |   (key0: val0 key1: val1)

> Note to Lispers: jisp doesn't have an explicit symbol type. Names and string literals are used in place of symbols. See Quoting and Macros.

### Code Structure

Jisp code consists of _forms_. There are only three kinds of forms:

Atom — a single item not enclosed in parens:

    5                               | number
    'February'                      | string literal
    /!@#$%/                         | regex literal
    parseInt                        | name
    null true undefined             | reserved name

Hash table — a list of `key: value` pairs:

    (:)                             | empty
    (place: 'tavern' drink: 'rum')  | object literal (hash table)

List — an expression inside parens:

    `()                             | empty list
    `(1 NaN 'bison')                | array literal (quoted list)
    (= name <body>)                 | assignment, or _binding_
    (special <arguments>)           | one of the special forms with
                                    |  their own rules
    (func <arguments>)              | function call, where `func`
                                    |  is the function

In jisp, all data structures are _lists_, using parentheses `()` as delimiter. Lists are roughly equivalent to arrays in JavaScript. This documentation uses the term _array_ specifically for _quoted_ lists, but the distinction is transient. Object literals are represented as lists of `key: value` pairs (_hash tables_). An empty array is ``()` and a blank object literal is `(:)`.

More importantly, the jisp code itself is lists. When parsed, it's directly converted to JS arrays which are easy to manipulate and edit. This turns out to be a powerful concept when paired with _syntactic abstractions_ (macros) that let you edit and generate code as data structures, using the full power of the language.

Jisp is mostly whitespace-agnostic. It uses whitespace to separate elements in lists, but the amount and kind of that whitespace doesn't matter. Jisp is completely insensitive to linebreaks and indentation, relying on parentheses as delimiters. (See the Style section.)

Most languages use the _prefix_ notation for functions: `func(args)` and the _infix_ notation for operators: `2 + 2 = 5`. In jisp, there are no operators. Things like `+` are considered functions and use the prefix notation. This makes syntax consistent and allows arithmetic 'operators' to take multiple arguments, and sometimes one or none:

    (+ 2 7 5 1 2)                          ;; 17
    (*)                                    ;; 1
    (/ 4)                                  ;; 0.25
    (+ 'using jisp' ' you’re ' 'awesome')  ;; + takes multiple strings

**[NYI]** You can also pass them around like any other function:

    (sort < (range 1 4))    ;; (4 3 2 1)

Not everything is a function. Some forms are _special forms_: `=` `quote` `unquote` `fn` `def` `mac` `if` `switch` `for` `over` `try` `get` `spread`, and a few others. These have their own resolution rules. Read on to find out.

### Everything an Expression

Each and every form in jisp is an expression: it returns a result. There are no 'statements'; every form resolves to something. Atoms resolve to themselves; hash tables resolve to themselves with resolved values; lists resolve by special rules.

An unquoted empty list `()` (not an empty array `` `() ``!) resolves to nothing.

Forms starting with `=`, `def`, `fn`, `mac`, `let`, and a few other keywords, resolve as _abstraction_ expressions. In other words, as name binding:

    (= x 10)                              ;; bound variable
    (def cowsay moo (+ 'Cow says ' moo))  ;; named function
    (fn x (/ x 10))                       ;; anonymous function (lambda)

See the Macros section below.

A list starting with a name or a function definition resolves as an _application_ expression. In other words, as a function call:

    (+ 2 3)             ;; 5
    (String Math.PI)    ;; '3.141592653589793'
    ((fn (+ 10 #)) 13)  ;; 23

Inside a nested form, forms are resolved left-to-right, inner-to-outer, just like you'd expect.

### Quoting

Sometimes you don't want a list to resolve, or want only _some_ of its elements to resolve. That's what quoting is for. The `quote` function takes a single argument and returns it without resolving it. Prepending with `` ` `` is shorthand syntax:

    (quote (list 'Darwin'))   ;; (list 'Darwin')

Quoting prevents all elements in a list from being resolved as jisp forms:

    `(1 2 3)                      ;; (1 2 3)  ;; array literal
    `(+ (^ 2 1) (+ 'π' 'Ω'))      ;; (+ (^ 2 1) ('π' 'Ω'))

Directly quoting a non-primitive atom (name or string) stringifies it:

    `myvar       ;; 'myvar'
    `"mystring"  ;; '"mystring"'

This is convenient when defining and using macros. Atoms in macro call arguments are quoted implicitly.

To let an element resolve, _unquote_ it with a comma `,`.

    `(+ ,(* 2 3) (^ 9 0))     ;; (+ 6 (^ 9 0))

Mentally visualise `` ` `` `,` as an off/on switch. Quoting and unquoting is primarily used in macros. See the Macros section below.

### Blocks

In imperative programming, you often want to run multiple consequtive actions in a single block, usually for side effects. Combine them into one expression with `do`:

    (do
      (washFace 1)
      (brushTeeth 2)
      (eatBreakfast 5)
      ready)           ;; true

`do` returns the result of evaluating the last form.

Use in combination with `let` to run series of actions in an isolated scope:

    (= h (let health 100                       ;; scoped to `let`
              horse  (getRandomHorse)          ;; scoped to `let`
              (do (console.log horse.neigh)    ;; Ni-i-ighhh!
                  (spur)
                  (if (dodgeTree)
                      (grin)
                      (-= health 30))
                  (dismount)
                  health)))
    (console.log h)                            ;; 70

`let` is equivalent to (and implemented as) an anonymous function that is executed right away:

    (let x 5 y 6
         (;; body))

Becomes:

    (do (fn x y
            (;; body))
        5 6)

In future editions of EcmaScript, `let` will use the native `let` statement for block scoping, and won't be a function. Keep this in mind for future compatibility.

### Object Properties

As you'd expect, object properties are referenced with dot or bracket notation:

    (= obj (bouncy: true fluffy: false))
    obj.bouncy                            ;; true
    obj['fluffy']                         ;; false

This notation is just syntax shorthand for "get property of object". Jisp converts dot and bracket notation into it internally, and you can use it directly:

    (get obj bouncy)  ;; true

**[NYI]: for now, use `(get object property)`.**
Can access properties of resolved forms:

    (console.log (String 113).length)    ;; 3

But this would get messy when consequtively chaining methods. Instead, wrap them in a `do`:

    (do cartoonSnake
        (.crawlForward 10)
        (.turnLeft)
        (['crawlForward'] 5)
        (.eat 'bunny')
        (+ .length food.weight))

In a block, orphan `.dot` or `[bracket]` notation refers to the return value of the previous expression. In this example, `cartoonSnake` resolves to self, and each of its methods is assumed to return `this` or another object, allowing method chaining.

### Functions

Jisp mirrors JavaScript function facilities 1-1 and adds some more.

Named function:

    (def myfun <params> <body>)

Anonymous function (_lambda_):

    (fn <params> <body>)

A name referencing a lambda:

    (= myfun (fn <params> <body>))

Parameters immediately follow the function name or `fn` keyword. The last form in a function declaration is taken as a body of the function. If it's an atom, the function will be a closure that simply returns that atom.

    (def myfun p0 p1 p2 (+ p0 p1 p2))
    (fn myfun)      ;; returns the `myfun` function

To call a function, wrap it in parentheses, followed by arguments separated by spaces.

    (def ringMyBell \x07)
    (ringMyBell)          ;; \x07
    (+ 2 3)               ;; 5      ;; `+` is a function

This also works for functions defined in-place:

    ((fn (console.log 'Hello World!')))
    ; 'Hello World!'
    ((fn (console.log #0 ' are tasty!')) 'Sushi')
    ; 'Sushi are tasty!'

Inside a function body, `#` (**NYI**) is the array of arguments passed to it, and `#n` refers to an individual argument by order.

    (fn (console.log #) 'ToDo:' 'Call Mom')  ;; ToDo:, Call Mom
    (fn (* #0 #2) 3 100 4)                   ;; 12

The return value of a function is what its `(body)` resolves to. Break out early with `return` when you're done. In jisp, keywords like `return` require parentheses, just like functions.

    ((fn (switch #0
           (case (< #0 0)'Negative')
           (case (is #0 0) 'Nolla')
           (case (> #0 0) 'Positive')
           NaN))     ;; default case
         'Check me!')    ;; returns NaN

Each conditional branch gets an implicit collector variable assignment. The `switch` form ends with that collector, and the function returns it. Unless you want multiple consequtive actions for side effects, you don't need to type `return` manually.

A side effect of implicit returns is that when constructing a prototype (a 'class'), you need to add `this` as its last (return) value for the prototype to work.

#### Anonymous Functions

Because functions are so cheap in JavaScript, jisp comes with a shorthand notation for lambdas (anonymous functions):

    {alert 'It’s a dragon!'}
    ;; becomes:
    (fn (alert 'It’s a dragon!'))

This goes hand in hand with the `#` notation and spreading:

    {* #0 #1}                        ;;  same as (fn x y (* x y))
    ({+ …#} 3 4 5)                   ;;  12
    (spices.filter {/pepper/.test})  ;;  ('chili pepper' 'black pepper')

**[NYI]**: `#`.

### Assignment

Like all other forms, assignment uses the prefix notation:

    (= newvar 'some value')
    newvar
    ; 'some value'

Like many other forms, it takes multiple arguments. In pairs:

    (= first  'Coffee'
       second 'Beer'
       third  'Milk')
    `(first second third)
    ; ('Coffee' 'Beer' 'Milk')

An assignment returns the last assigned name, and the right hand can be an arbitrary expression itself:

    (= x (= shifty null
            dodgy  undefined
            picky  (if false
                       'nose up'
                       'smile')))
    x
    ; 'smile'

Jisp automatically declares variables within scope with `var` and hoists them to the top of the scope. Variables already in scope are not re-declared, so it's not possible to shadow an outer variable accidentally (you can do it on purpose by calling a function's argument by that name). And it's not possible to accidentally leak a global by missing it. You can, however, declare a variable without assigning a value:

    (= x)

Will hoist a `var` declaration (if not already within scope), defaulting the variable to `undefined`.

### Destructuring Assignment

Use a list as a left-hand in an assignment to take apart the right-hand side and assign parts:

    (= (smaller bigger) (range 2 8))  ;;  smaller becomes 2, bigger becomes 3

This assignment is positional: `[0]` `[1]` and so on. To collect all remaining parts into an element, prefix it with `...` or `…`:

    (= (first ...mid closing) 'cartoon')
    ; first    ->  'c'
    ; mid      ->  ('a' 'r' 't' 'o' 'o')
    ; closing  ->  'n'

This works the same way as destructuring in function parameters (see below).

### Spreading and Rest Parameter

Borrowed straight from the upcoming EcmaScript 6 specification.

#### Spread Into List

In a list, prefix elements with `...` or `…` to pour their elements inside the list, flattening it:

    `(1 2 ...`(3 4) ...`(4 5))  |    (1 2 3 4 4 5)

`...x` is a shorthand for the `(spread x)` special form, which you can use directly.

#### Argument Spread

Similarly to lists, you can spread arguments into a function call:

    (list 'cat' ...('dog' 'lizard'))  ;;  ('cat' 'dog' 'lizard')

#### Rest Parameter

Prefix a parameter with `...` or `…` to make it a _rest parameter_ that collects the remaining arguments into a list:

    (= multiHi (fn x y ...rest
                   (do (console.log x)
                       (console.log y)
                       (console.log rest))))

    (multiHi 'Hello' 'from' 'Kara ' 'Mira ' 'Nova')
    ; Hello
    ; from
    ; ('Kara' 'Mira' 'Nova')

### Comprehensions

Other languages typically devise special syntax for list comprehensions (set builder notation). Jisp has a limited version of it without any special notation.

`range` is a trivial function that returns a list from N to M:

    (range 0 Infinity)
    ;; (0 1 2 3 4 5 6 ... hangs your program

Because `for` and `while` are list-building expressions, jisp doesn't need special set builder syntax:

    (for x (range 0 6) (* x x))
    ;; (0 1 4 9 16 25 36)

### Conditionals

Jisp gives you better conditionals. Some examples:

    (is she 'smart'        ;; true if any match
            'beautiful'    ;;
            'artistic')    ;; she === 'smart' || she === 'beautiful' || she === 'artistic'

equivalent to:

    (or (is x ...)
        (is x ...)
        (is x ...))

negated version:

    (isnt she 'grumpy'     ;; true if none match
              'magpie'
              'far away')

equivalent to:

    (and (isnt x ...)    ;;  (not (is x val0
         (isnt x ...)    ;;             val1
         (isnt x ...))   ;;             val2))

It's trivial to define your own conditionals with macros.

`is` with a single argument checks its truthiness:

    (is 'strings are truthy')  ;; true

Check if an element is in an array with `in`:

    (= bush 'woods')
    (in bush `('forest' 'woods' 'thicket'))  ;; true

Check if something exists (is defined) with `(?)`:

    (? undefinedVar)  ;; false

Negated version: `(?!)`:

    (?! undefined)    ;; true

See `operators.jisp` and `macros.jisp` for more.

#### If, Switch

An `if` is a single expression that resolves to a value. Else-ifs are special clauses _inside_ that expression. If you're returning a single value, there's no need to assign it manually.

    (if <test>
        <body-then>
        (elif <test> <body>)
        ; < ... >            ;; any number of these
        (elif <test> <body>)
        <body-else>)         ;; defaults to `undefined` if omitted

    (= x (if false "you won't see me"
             (elif (is 2 3) "universe splitting apart")
             "cosmic catastrophe averted"))
    x
    ;; 'cosmic catastrophe averted'

A `switch` form automatically inserts `break;` statements, protecting you from accidental fall-through.

    (switch predicate
      (case <val> <body>)
      ; < ... >              ;; any number of these
      (case <val> <body>)
      <body-default>)        ;; `undefined` if omitted

[NYI] More awesome conditionals coming up, stay tuned.

### Loops

Jisp comes with three loops: `for`, `over`, and `while`.

#### Over

The `(over ...)` loop iterates over properties and keys of any object, even arrays and strings. It's great when you want everything it has and don't care in what order it comes:

    ;; (over <value> <key> <iterable> <body>)

    (= animals (squirrel: 'Eevee' fox: Vulpix))
    (over val key animals (console.log key val))
    ;; squirrel Eevee
    ;; fox Vulpix

If you only want values, omit the key argument:

    (over char 'mew' (console.log char))
    ;; m
    ;; e
    ;; w

If you want neither values nor indices, omit both to iterate blindly:

    (= cats `('persian' 'skitty'))
    (over cats (console.log 'meow'))
    ;; meow
    ;; meow

The `over` loop includes _custom and inherited properties_ and _does not preserve element order_. It compiles into the JavaScript `for..in` loop.

#### For

When iterating over arrays and strings, you usually want to hit all elements in order and don't want extra properties tagging along. In those cases, use the `(for ...)` loop:

    ;; (for <value> <index> <iterable> <body>)
    ;; (for <value> <iterable> <body>)
    ;; (for <integer> <body>)

    (for char 'mystring' char)
    ;; ('m' 'y' 's' 't' 'r' 'i' 'n' 'g')

`for` compiles into the JavaScript `for (<initialisation>, <condition>, <final-expression>)` loop.

Just like the `over` loop, `for` returns an array of values from each iteration:

    (= epochs `('pliocene' 'pleistocene' 'holocene'))
    (= ordered (for epoch num epochs
                    (+ num ': ' epoch)))
    ordered
    ;; ('0: pliocene' '1: pleistocene' '2: holocene')

**[NYI]** If the iterable is an integer larger than 0, jisp will substitute it for an 1..N array, making for a `repeat`-like loop:

    (= warcry '')
    (for 5 (+= warcry 'waagh! '))
    warcry
    ;; waagh! waagh! waagh! waagh! waagh!

#### While

For finer-grained control, use the `while` loop. It works as you'd expect, but like everything in jisp, it's an expression. By default, it returns an array of values from each iteration.

    ;; (while <test> <body>)

    (while (bugsLeft)
           (squash bug))   ;; ('missing comma' 'missing semicolon')

You can also order a final return value:

    ;; (while <test> <body> <final-value>)

    (while sober
           (++ beers)
           beers)          ;; 10

### Macros

Macros are compile-time functions that generate code. A macro takes code as input and returns code that's put in its place. After all macros are expanded, jisp is compiled to JS. Since they run at compile time, they allow arbitrary transformations of code. This allows to reuse code without runtime restrictions, and build syntactic abstractions all the way up to a domain-specific language.

    (mac myFirstMacro inputCode
         `(console.log ,inputCode))        ;; yanked from code at macro-parse step

    (myFirstMacro 'Pizza delivery here!')  ;; yanked from code at macroexpand step


    (console.log 'Pizza delivery here!')         ;; code put back

Most of `jisp.js` is generated with macros.

The lifetime of your code without macros:

    code -> compile into JS -> execute

But you can also do this:

    code => parse macros <-> expand macros -> compile into JS => execute

It seems to be a trend among modern languages to introduce limited macro support, usually as templates. Jisp brings macros to JavaScript, but it's **not** limited to templating. Macros are complete, real, custom functions using the full power of the language to run arbitrary logic and transform code in arbitrary ways.

#### Templating

Templating is the most basic use of macros:

    (mac makeOp name operator
         (do (console.log (+ 'defining ' name))  ;; run during macro expansion
             `(def ,name ...args
                   `(if (isnt args.length 0)
                        (args.reduce {,operator #0 #1})))))  ;; returned value

    (makeOp add +)  ;; yanked from code during macro expansion

    ; defining add

    ;; code put back:
    (def add ...args
         `(if (isnt args.length 0)
              (args.reduce {+ #0 #1})))

Quoting with `` `x `` or `(quote x)` soaks up one resolution, letting you return that code instead of resolving it during the macro call. Unquoting with `,x` or `(unquote x)` lets individual elements resolve, putting them into the template. Spreading with `...x` or `(spread x)` also unquotes its argument.

Because macros are real functions, there's nothing stopping you from using conditionals to customise the template depending on the arguments passed. Let's make our operator macro more versatile:

    (mac makeOp name operator zeroValue
    ; <func-name> <operator> <zero-value>
      `(def ,name ...args
        ,(if (? zeroValue)
          `(do (args.unshift ,zeroValue)
               (if (is args.length 0)
                   ,zeroValue
                   (args.reduce {,operator #0 #1})))    ;; will be included if a zeroValue was passed
               `(if (isnt args.length 0)
                    (args.reduce {,operator #0 #1})))))  ;; will be included otherwise

You can choose which parts of a template to let through, based on conditionals.

#### Code Construction

Because jisp code is a series of nested arrays, macros can deconstruct and construct it on the fly. This is the reason for all those parentheses.

For instance, you could enable a silly reverse syntax by reversing the code passed to a macro:

    (mac reverse form
      (get ((for exp i form
        (if (Array.isArray exp)
            (exp.reverse)
            exp)) reverse)))              ;; macro definition

    (reverse
      (('world' 'hello ' +) console.log)) ;; new reverse syntax enabled by macro

    ; 'hello world'                       ;; runtime result

Suppose you're writing a gulp config file full of repetitive blocks like these:

    gulp.task('js', function() {
      return handle(gulp.src(jsSrcList))
      .pipe(handle(concat('deps.js')))
      .pipe(handle(uglify({mangle: false})))
      .pipe(handle(gulp.dest('public/js/tmp/')));
    });

There's no way to deduplicate these repeating parts using JS alone, and you're forced to write them by hand. But you can abstract them away with a macro.

    (mac task name ...args (do
      (= pipeline `(do (handle (,(args.shift) ,(args.shift)))))
      (while (> args.length 0) (do
        (= left  (args.shift)
           right (args.shift))
        (if (is right null) (= right ""))
        (pipeline.push `(.pipe (handle (,left ,right))))))
      `(gulp.task ,name (fn ,pipeline))))

Call it like this:

    (task       "js"
      gulp.src  jsSrcList
      concat    "deps.js"
      uglify    (mangle: no)
      gulp.dest "public/js/tmp/")

And it produces the very same output we saw earlier. What happened? The macro takes the arguments as an array, takes it apart in pairs, and dynamically constructs a new array representing the resulting code, filling in the repetitive blocks we've abstracted away. The constructed code is:

    (gulp.task "js" (fn (do
      (handle (gulp.src jsSrcList))
      (.pipe (handle (concat "deps.js")))
      (.pipe (handle (uglify (mangle: no))))
      (.pipe (handle (gulp.dest "public/js/tmp/"))))))

Which compiles into the above JS output. Now you can use this much shorter and cleaner `task` syntax for the rest of your configuration file.

#### Macro Import and Export

Macros can be imported in two ways: compiling or `require`ing a macro-containing file before others, or with the `importMacros` method of the `jisp` object.

Macros are kept in the `macro` object that exists during the compiler runtime. It's exported by the compiler and can be accessed and modified directly. The compiler also exports the `importMacros` function that takes one or more macro stores and merges them into the `macro` object, overriding the existing macros. Each store is a hash table where keys are macro names and values are macro functions.

    (= myStore (testMacro: (fn `nameToReturn)))
    (= jisp (require "jisp"))
    (jisp.importMacros myStore)
    (testMacro)  ;; nameToReturn

The `macro` object persists between compiler calls. If you're using a build script that calls compile for multiple files on the same jisp object, you can simply put macros in a file and compile it before others. This also works when running jisp scripts directly by `require`ing them.

#### Notes

After each macro expansion, the new code is checked for macro definitions and calls. This allows macros to be nested, and even contain new macro definitions. See `jisp.jisp` for an example; most of it is written with nested macros.

To avoid confusing macros for functions, it's good style to start their names with `mac`.

It's important to realise that macros are compile-time, not run-time. They live in the land of names, not in the land of values like functions. You can't pass values by names to macros; you pass _names_ instead. A macro doesn't give a flying duck about scope or variable bindings. You aren't constrained by scope or object reference issues, and don't have to pass around objects you want to access within a generated function. You just construct the code you want, where you want it, at compile time.

### Built-ins

Jisp comes with some built-in convenience macros and functions. The functions, if you use them, are embedded into your program on compile. No globals are leaked.

Examples:

    (car `(3 4 5))           ;; 3
    (cdr (range 3 6))        ;; `(4 5 6)
    (init 'headscratcher')   ;; 'headscratche'
    (last (range 4 7))       ;; 7

`list` is a list (array) builder. It's roughly equivalent to (Array x), but works a bit differently.

    (list 'cat' `('dog' 'lizard'))  ;;  ('cat' ('dog' 'lizard'))

`concat` is like `list` except it flattens lists passed as arguments into a single list.

    (concat `(1 2) `(3 4) 5)  ;; (1 2 3 4 5)

Which is the same as spreading them:

    `(...`(1 2) ...`(3 4) 5)

**[NYI: planned]** `js` function takes a string and passes it through as JS:

    (js "console.log('hello');")  ;;  console.log('hello');

`isa` is a shorter version of `(is typeof ...)`:

    (isa Math.PI 'number')  ;; true

See `toplevel.jisp` and `macros.jisp`.

### Style

Jisp is insensitive to whitespace, but humans don't read code by counting parens; we read it by indentation. Your indentation should reflect the nesting of expressions; in other words, the branches of execution. Each indent should only start the branches that are on the same level of nesting.

    ;; BAD, bad, misleading
    (def maketest condition
         (if (is (typeof condition) "function")
             (fn tokens (condition tokens[0]))
         (elif (isRegex condition)
               (fn tokens (condition.test tokens[0])))
         (elif (isAtom condition)
               (fn tokens (is tokens[0] condition)))
         (elif (isList condition)  ; assume list of tests
               (fn tokens
                   (if (for cond i condition
                            (if (not ((maketest cond) (tokens.slice i)))
                                (return false)))
                       true)))
         (throw (Error (+ "can't test against " condition)))))

    ;; GOOD: reflects nesting
    (def maketest condition
         (if (is (typeof condition) "function")
             (fn tokens (condition tokens[0]))
             (elif (isRegex condition)
                   (fn tokens (condition.test tokens[0])))
             (elif (isAtom condition)
                   (fn tokens (is tokens[0] condition)))
             (elif (isList condition)  ; assume list of tests
                   (fn tokens
                       (if (for cond i condition
                                (if (not ((maketest cond) (tokens.slice  i)))
                                    (return false)))
                           true)))
             (throw (Error (+ "can't test against " condition)))))

If nesting isn't too deep, it's nice to line up the indent with the second word on the previous line. If not, just stick with two spaces for each level.

## Known Bugs and NYI

Syntax (tokeniser and lexer limitations):
  * [NYI] `.dot` and `[bracket]` notation can't be used with primitive literals and lists, using `(get object property)` notation for now.
  * `#n` notation can't be used with `` ` `` `...` `.dot` and `[bracket]` notation.
  * Regex literals are mangled when passed as an argument to a function.
  * Whitespace in regexes bugs out the tokeniser regexes.
  * Tokeniser can't handle more than one backslash immediately preceding a quote.
  * Tokeniser fails to split `"}"}`.
  * Tokeniser fails to split things like `form[` in `form[,i]`.
  * [NYI] Identifier names (variables etc) can't include non-ASCII letters.

REPL:
  * Multiline counts parens inside strings and all.

Operator-functions like `+`:
  * [NYI] spread not implemented.
  * [NYI] can't be passed around by name.

Macros quirks:
  * Macros break when they contain strings with quotes inside them (probably tokeniser).
  * Dot and bracket notation on regexes renders as `[native code]`, use  `(get regex property)` notation for now.
  * In quoted lists in macros, internal quoted lists have to be double-quoted. Todo comprehend and fix.
  * (Not sure if bug, todo review.) When passing a non-quoted list to a macro, it's spread out instead of being passed as a list. (Got fixed? ToDo check.)

The parser (?) appends an extra `undefined` to the end of the file if the last line is a comment (got fixed? need to check).

When using conditionals (e.g. `and`) with forms that compile to multiple lines, all but last line will be put before the conditional, executing regardless of which of the tests are passed.

Hoisting of multi-line statements above their place in code causes some actions to be executed out of order.

[NYI] It's somewhat awkward to pass a 'nothing' to a macro (e.g. in a list of arguments); you have to test it in a macro and change value to "". Considering a special clause for `undefined` or `null`, or perhaps a special `nil` virtual value.

[NYI] `command` doesn't automatically load the `register` module.

Macro embedding-hoisting doesn't respect global scope, overwrites previously defined names. Not sure what to do about this; it might be a good thing, considering that macros are going to be more and more core to the language.

More 'operators' need to support multiple arguments.

## Why Use It

Why?

#### Simple

Despite being more powerful, jisp is simpler than JavaScript. It has barely any syntax: everything is written as [S-expressions](http://en.wikipedia.org/wiki/S-expression), in other words, nested lists. There are no operators or keywords to demand special treatment, no commas or semicolons to trip yourself over. All operators, functions, keywords, special forms are written the same way.

Here's what little syntax there is.

    {stuff}           =>  (fn stuff)
    ...x …x           =>  (spread x)
    `(stuff)          =>  (quote (stuff))
    ,x                =>  (unquote x)
    object.property
    object[property]  =>  (get object property)

And that's it. There's no other syntax in jisp. Everything else is atoms or nested lists.

The `.dot` and `[bracket]` notation (in any language) is effectively just syntax shorthands for the `(get object property)` function. You can use this form directly. (In fact, currently you have to, due to some NYI.)

#### Powerful

At its heart, jisp is just JavaScript. But it's also much more. It gives you the power of syntactic abstractions unmatched by any non-Lisp language. Makes it possible to build programs bottom-up by reprogramming the language itself, and implement domain-specific languages as JS libraries.

#### Safe

In a relative sense. Jisp protects against many common pitfalls of JS with its simple, extremely regular syntax, automatic var declarations, break statements, wrapping of compiled files into a lambda to prevent global leaks. But it also gives you lots of power which can be useful or dangerous. Jisp makes you safer in the same sense taking a quad damage powerup makes you safer.

## ToDo Upcoming

Working on these.

* Fix the known bugs and NYI.
* More built-in macros.
* Embedding of operator-functions to allow passing them around by name (e.g. `(arr.sort >)`).
* Compiler error messages for when special forms like `=` and `quote`, as well as JS keywords, are met outside their destined place (first element in list).
* Lexer or parser error messages for common but hard to spot errors like infix `+`.
* Polyfill for the browser compatibility layer.
* A webpage.

## ToDo Wishlist

These will take me a while. Get hacking and contribute!

Bigger:

* A test suite.
* Source map support.
* Syntax highlighting for HTML and language module for Sublime Text.
* Some way of generating guaranteed unique variable names in macros (like `gensym`). Not sure this is necessary.
* Compiler option to only macroexpand and print out expanded jisp code (will require a jisp beautifier).

Smaller:

* Prettier JS output (fewer parens etc.).
* Distinguish between `;` `;;` and `;;;` comments. `;;` should quote the next form in parentheses, ignoring end-of-line. `;;;` should be a multiline block comment.
* Auto-reindent plugin for Sublime Text (there's a Lisp indent plugin, but it's no good for jisp).
* Output into a file option for CLI.
* Multiple expression support for `elif` tests when possible (comma-separated).
* Case test grouping for `switch`.
* Multiline regexes.
* REPL non-verbose option.
* REPL history.

## Acknowledgements

Jisp is massively inspired by [CoffeeScript](http://coffeescript.org) and uses bits of its source for CLI utils. Design inspiration from [Arc](http://paulgraham.com/arc.html) and the Lisp family of languages, bits from other sources. Also see [Arc-js](https://github.com/smihica/arc-js) for a more radical version of bringing Lisp to JavaScript.
