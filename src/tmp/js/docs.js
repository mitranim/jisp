/** @jsx React.DOM */
'use strict';

/******************************* Dependencies ********************************/

// Third party
var React = require('react/addons'),
    rb    = require('react-bootstrap'),
    Link  = require('react-router').Link;

// Custom components
var id    = require('./utils').rndId,
    md    = require('./markdown').md,
    Code  = require('./code');

/******************************** Components *********************************/

var Docs = React.createClass({displayName: 'Docs',
  render: function() {
    return (

React.DOM.div({className: this.props.className}, 

React.DOM.p({className: "lead"}, 
  "Jisp is a programmable language that compiles to JavaScript."
), 

md(null, ("\nIt's simpler, terser, and more powerful than JS. Its macro system lets you treat code as data and write functions that write code for you. Jisp's extremely simple syntax protects against common JS pitfalls, and it abstracts away some legacy details, helping avoid errors and keep your code short.\n\nSee [Why Jisp](#why) for a gist of why you should use it.\n\nThe jisp compiler is itself written in jisp. See the [sourcecode on GitHub](https://github.com/Mitranim/jisp). See the [issues](https://github.com/Mitranim/jisp/issues) section for known problems, upcoming enhancements, and ideas how to contribute to the language.\n\nYou can improve this documentation by sending pull requests to the [gh-pages](https://github.com/Mitranim/jisp/tree/gh-pages) branch of the project repository.\n\n> All examples on this page are interactive: edit the jisp to see changes. The JavaScript snippets are compiled in your browser. If you don't see them, make sure JS is enabled and refresh the page.\n"









)), 

React.DOM.h2(null, "Interactive Playground"), 

Code(null, ("\n(mac task name ...args (do\n  (= pipeline `(do (handle (,(args.shift) ,(args.shift)))))\n  (while (> args.length 0) (do\n    (= left  (args.shift)\n       right (args.shift))\n    (pipeline.push `(.pipe (handle (,left ,right))))))\n  `(gulp.task ,name (fn ,pipeline))))\n\n(task       'js'\n  gulp.src  jsFiles\n  conc      'deps.js'\n  uglify    (mangle: no)\n  gulp.dest 'public/js/tmp/')\n\n(task       'jisp'\n  gulp.src  jispFiles\n  conc      'app.js'\n  jisp      ()\n  uglify    (mangle: no)\n  gulp.dest 'public/js/tmp/')\n\n; try your own macro call (this is a comment)\n"






















)), 

md(null, "Example of dynamically constructing code with a macro."), 

React.DOM.h2({id: "installation"}, "Installation and Usage"), 

md(null, ("\nGet [Node.js](http://nodejs.org). This will give you the local `node` runtime and the `npm` package manager. Install jisp with `npm`:\n\n    $ npm install -g jisp\n\nAlternatively, download the source, run `npm install` to get the dependencies, and use `./bin/jisp` and `./jisp/jisp.js` as entry points.\n\nRequire in Node, registering the file extension:\n\n    require('jisp/register');\n\nThis allows you to `require` jisp scripts directly from your code, like so:\n\n    require('./app.jisp');\n\nLaunch an interactive REPL:\n\n    $ jisp\n    jisp>\n\nCompile a file or directory:\n\n    $ jisp -c <file>\n\nStream-compile with [gulp-jisp](https://github.com/Mitranim/gulp-jisp).\n\nWhile not recommended for production, jisp can be directly used in the browser. Include the `browser/jisp.js` file with your webpage. It registers the `text/jisp` script type to automatically compile and run jisp scripts loaded with `src` or included in script tags. It also exposes a global object with the `compile` and `eval` methods for jisp code. This is how this documentation is implemented.\n\nSuper basic Sublime Text build system (OS X):\n* `sudo npm install -g jisp`\n* `Tools > Build System > New Build System`\n* put lines:\n\n      {\n        \"cmd\": [\"jisp\", \"$file\"],\n        \"path\": \"/usr/local/bin/\"\n      }\n\n* save to: `~/Library/Application Support/Sublime Text 3/Packages/User`\n"






































)), 

React.DOM.h2({id: "code-structure"}, "Code Structure"), 

md(null, ("\n_Jisp code consists of nested arrays_. To be easier on the eyes, they're delimited with parentheses `()` instead of brackets. Individual elements are separated by whitespace rather than commas. This documentation refers to them as _lists_, but it's just arrays.\n"

)), 

Code(null, ("\n; list that compiles to a function call\n(prn 'Fire in the house!')\n\n; quoted list — array literal\n`(1 NaN 'bison')\n\n; empty array literal\n`()\n\n; assignment (name binding)\n(= myVar 'myValue')\n\n; function definition\n(fn x (alert x))\n\n; see other special forms below\n"
















)), 

md(null, 
"Object literals are also delimited with parentheses, elements separated by whitespace rather than commas. This documentation often refers to object literals as _hash tables_ to discern them from objects in general."
), 

Code(null, ("\n; object literal (hash table)\n(place: 'tavern' drink: 'rum')\n\n; empty object literal\n(:)\n\n; alternate hash syntax\n(: using 'the' hash 'macro')\n"








)), 

md(null, ("\nThe built-in hash [macros](#macros) `:` and `::` give you easy ways to build hash tables as lists. `:` with two or more arguments runs purely at compile time; other forms have runtime components. See the [built-ins](#built-in-macros) section for details.\n\nIdentifiers and literals without parentheses are called _atoms_:\n"



)), 

Code(null, ("\n; number\nInfinity\n\n; string literal\n'February'\n\n; multiline string\n'split across\ntwo lines'\n\n; regex literal\n/!@#$%/\n\n; name\nparseInt\n\n; special name\nnull undefined true\n"


















)), 

md(null, ("\nStrings in jisp are multiline.\n\nParentheses in the jisp code are **not cosmetic**. Your code _consists_ of arrays. This allows to easily deconstruct and construct it when using macros. We'll get to this in the [Macros](#macros) section.\n\nJisp is mostly whitespace-agnostic. Elements in lists and hash tables are separated by whitespace, but other than that, jisp is completely insensitive to whitespace and indentation, relying on parentheses as delimiters. Forms can contain linebreaks.\n\nIn a non-quoted list, the first element is considered a function, and the list compiles as a function call:\n"







)), 

Code(null, ("\n; function call\n(alert 'A dragon cometh!')\n\n; nested call\n(isNaN (parseInt Infinity))\n"





)), 

md(null, "In fact, even operators are considered functions and use the prefix notation. This allows them to take multiple arguments:"), 

Code(null, ("\n; operator expression\n(& 2 3 4)\n(+ 'using jisp' 'you’re' 'awesome')\n\n; nested operator expressions\n(* 4 5 (- 3 6 10) (^ 1 5))\n"






)), 

md(null, "**[NYI]** Planned feature: you'll be able to pass operators around like any other function:"), 

Code(null, ("\n(= x `(1 2 3 4))\n(x.sort <)\n"


)), 

md(null, "Not all lists are function calls. Some are _special forms_ with their own resolution rules. This includes assignment, quoting, function definitions, conditionals, loops, and JS keywords."), 

React.DOM.h2({id: "everything-exp"}, "Everything an Expression"), 

md(null, ("\nMost languages distinguish statements and expressions. An expression is a piece of code with a value, something you can assign or return from a function. Statements have side effects but no value. In jisp, everything is an expression. It helps you write [functional](http://en.wikipedia.org/wiki/Functional_programming#Coding_styles) code, avoiding unnecessary data fiddling.\n\nAn atom such as a number literal, a string literal, or identifier, resolves to itself.\n\nA hash table resolves to itself, with its values resolved individually.\n\nLists resolve by special rules:\n* An unquoted empty list `()` (not ``()`) resolves to nothing.\n* Special forms starting with a keyword like `=`, `def`, and others, resolve by their own special rules.\n* Lists starting with a macro name resolve as macro calls at compile time.\n* Everything else resolves as a function call.\n\nExamples:\n"













)), 

Code(null, ("\n; name binding\n(= x 10)\n\n; anonymous function (lambda)\n(fn x (/ x 10))\n\n; `if` conditional\n(if false (/ 1 0) (^ 4 6))\n\n; function definition and call\n((fn y (+ 10 y)) 13)\n"











)), 

md(null, "Inside a nested form, forms are resolved left-to-right, inner-to-outer, just like you'd expect."), 

React.DOM.h2({id: "quoting"}, "Quoting"), 

md(null, "If lists resolve as function calls, how do you write array literals? The answer is quoting. The special form `(quote x)` prevents the list `x` from being resolved, letting it remain an array. Prepending a list with `` ` `` is shorthand syntax:"), 

Code(null, ("\n; without quote\n(1 2 3)\n\n; with quote\n(quote (1 2 3))\n\n; shorthand\n`(1 2 3)\n"








)), 

md(null, "Directly quoting a non-primitive atom (name or string) stringifies it:"), 

Code(null, ("\n; name\n`myvar\n\n; string\n`'mystring'\n"





)), 

md(null, ("\nWhich is convenient for macros. Atoms in macro call arguments are quoted implicitly.\n\nQuoting implicitly propagates to inner lists:\n"



)), 

Code(null, ("\n; without quote\n(+ (^ 2 1) (is 'π' 'Ω'))\n\n; with quote, invalid javascript\n`(+ (^ 2 1) (is 'π' 'Ω'))\n"





)), 

md(null, "To let an element resolve, _unquote_ it with a comma `,`:"), 

Code(null, ("\n; without unquote: invalid javascript\n`((* 2 3) (is true false))\n\n; with unquote: valid javascript\n`(,(* 2 3) ,(is true false))\n"





)), 

md(null, "Aside from writing array literals, quoting and unquoting is primarily used in macros. See the [Macros](#macros) section below."), 

React.DOM.h2({id: "blocks"}, "Blocks and Chaining"), 

md(null, "Because jisp code consists of nested expressions, even a multi-line block must be a single expression. How to make one? By wrapping several forms in the special form `do`:"), 

Code(null, ("\n(def elongate str\n  (do (+= str str)\n      (prn 'duplicated:' str)\n      str))\n"




)), 

md(null, ("\nOn compile, a jisp file is implicitly wrapped in a top-level `do` form.\n\n`do` resolves to the value of its last form. It's a requirement for chaining methods:\n"



)), 

Code(null, ("\n; take last value\n(prn (do (= bugs `())\n  (bugs.push 'butterfree')\n  (bugs.push 'beedrill')\n  bugs))\n\n; assign result of chaining methods\n(= str ',…x')\n(= grated (do str\n   (.replace /…/g ' … ')\n   (.replace /,/g ' , ')\n   (.trim)))\n\n"













)), 


md(null, "**Note**: `do` is the **only** jisp expression that can consist of multiple forms. The body of each function, loop, etc. is always a single form, and requires a `do` to include multiple expressions."), 

React.DOM.h2({id: "object-props"}, "Object Properties"), 

md(null, "As you'd expect, object properties are referenced with the `.dot` or `[bracket]` notation:"), 

Code(null, ("\n(= bunny (bouncy: true fluffy: false))\nbunny.bouncy\nbunny['fluffy']\n"



)), 

md(null, "Dot and bracket notation is a syntax shortcut to getting a property of an object. Internally, jisp uses the `(get obj prop)` special form:"), 

Code(null, ("\n(get bunny bouncy)\n(get bunny 'fluffy')\n"


)), 

md(null, "Quite naturally, you can access properties of resolved forms:"), 

Code(null, ("\n(String 113) .length\n(String 113) [(+ 1 1)]\n"


)), 

md(null, "But you can also access it with the `get` form, and `do` for chaining (below). This is useful in macros when you pass around names of objects and properties individually."), 

Code(null, ("\n(get (String 113) 'length')\n(get (String 113) (+ 1 1))\n"


)), 

md(null, "To chain methods, wrap them in a `do` form:"), 

Code(null, ("\n(do cartoonSnake\n   (.crawlForward 10)\n   (.turnLeft)\n   (['crawlForward'] 5)\n   (.eat 'bunny')\n   (.elongate food.weight))\n"






)), 

md(null, "Alternatively (even though it's kinda gross), you can do it like this:"), 

Code(null, ("\n(((((cartoonSnake.crawlForward 10)\n .turnLeft)\n ['crawlForward'] 5)\n .eat 'bunny')\n .elongate food.weight)\n"





)), 

React.DOM.h2({id: "functions"}, "Functions"), 

md(null, "Jisp mirrors JavaScript function facilities 1-1 and adds some more."), 

React.DOM.h3({id: "definition"}, "Definition"), 

md(null, ("\nNamed function:\n\n    (def <name> [<... params>] [<body>])\n"



)), 

Code(null, ("\n(def fact x\n  (if (is x 0) 1\n      (* x (fact (- x 1)))))\n"



)), 

md(null, ("\nAnonymous function (sometimes called _lambda_):\n\n    (fn [<... params>] [<body>])\n"



)), 

Code(null, ("\n(fn first second (+ first second))\n\n(fn returnMe)\n\n(fn)\n"





)), 

React.DOM.h3({id: "call-return"}, "Calling and Returning"), 

md(null, "A function call is a list starting with the function's name or with a form that resolves to a function:"), 

Code(null, ("\n(= ringMyBell (fn bell (prn bell)))\n\n(ringMyBell '\\x07')\n\n((fn x (+ 'Hello ' x)) 'World!')\n"





)), 

md(null, "A function returns the resolved value of its body. You almost never need to return values manually:"), 

Code(null, ("\n(def numerify x\n  (if (isNaN (Number x))\n      (do (prn 'not a number:' x)\n          NaN)\n      (Number x)))\n"





)), 

md(null, ("\nIt's often best to keep each function's body a single conditional tree with branches ending in return values.\n\nInside a function's body, `#` (**NYI**) is an array of the arguments passed to it, and `#n` refers to an individual argument by order.\n"



)), 

Code(null, "((fn (* #0 #2)) 3 100 4)"), 

md(null, "As a side effect of implicit returns, when making a prototype constructor, you need to end it with `this` as the return value to make the `new` declarations work."), 

React.DOM.h3({id: "lambda"}, "Lambda Syntax"), 

md(null, ("\nBecause functions are so cheap in JavaScript, jisp comes with a shorthand syntax for anonymous functions:\n\n    {<body>}\n"



)), 

Code(null, ("\n{alert 'It’s a dragon!'}\n\n{+ 3 4}\n\n{}\n"





)), 

md(null, "This goes hand in hand with the `#` notation:"), 

Code(null, ("\n(= array `(0 1 2 3))\n\n{* #0 #1}\n\n(array.filter {> #0 1})\n"





)), 

React.DOM.h3({id: "let"}, "Let"), 

md(null, ("\n`let` is a short way to declare variables in an isolated scope and run that scope. It resolves to the value returned by its body.\n\n    (let [var value [var value ...]] [<body>])\n"



)), 

Code(null, ("\n(let health 100\n  (prn health))   ; logs 100\n\n(? health)        ; false: out ot scope\n"




)), 

md(null, "Just like assignment, it takes variables in pairs:"), 

Code(null, ("\n(let plus  110\n     minus -12\n     (prn (^ plus minus)))\n\n(? plus minus)    ; false: out of scope\n"





)), 

md(null, "`let` is currently implemented as a self-executing anonymous function. In the future editions of EcmaScript, it will be changed to use the native `let` statement with a block."), 

React.DOM.h2({id: "assignment"}, "Assignment"), 

md(null, ("\nLike all other forms, assignment uses the prefix notation:\n\n    (= var value [... var value])\n    (= var)\n"




)), 

Code(null, ("\n(= newvar 'some value')\n\n(= pi (if (is 2 3) NaN Math.PI))\n"



)), 

md(null, ("\nAll assignments in jisp (not just `=`) automatically hoist `var` declarations, saving you keystrokes and safeguarding against leaking globals. Variables are only declared if not already in scope. To shadow an outer variable on purpose, use `let`.\n\nLike many other forms, `=` takes multiple arguments. It assigns them in pairs. Its resolved value is the last assignment:\n"



)), 

Code(null, ("\n(= lastest (= first  'Coffee'\n              second 'Beer'\n              third  'Milk'))\n"



)), 

md(null, "The right hand of an assignment can be an arbitrary form, even a block:"), 

Code(null, ("\n(= x (= shifty null\n        picky  (if false 'nose up' 'smile')\n        dodgy  (try (+ something) 'unsuccessful')))\n"



)), 

md(null, "Calling `=` with a single argument merely declares that name if not already in scope:"), 

Code(null, "(= emptyVar)"), 

React.DOM.h2({id: "destructuring"}, "Destructuring Assignment"), 

md(null, ("\nAssign to a list of identifiers to take apart the right hand side of the assignment and bind its parts:\n\n    (= (var0 [... varN]) value)\n"



)), 

Code(null, "(= (smaller bigger) `(3 Infinity))"), 

md(null, "This assignment is positional: `[0]` `[1]` and so on. To collect all remaining parts into an element, prefix it with `...` or `…`:"), 

Code(null, ("\n(= (first ...mid closing) `(4 8 0 3))\n\nmid    ; (8 0)\n"



)), 

md(null, "`...x` and `…x` is a shortcut to the `(spread x)` special form, which you can, and sometimes need to, use directly. Spreading is moderately greedy: it takes as many elements as possible, but has lower priority than non-spread identifiers."), 

React.DOM.h2({id: "spreading-rest"}, "Spreading and Rest Parameter"), 

md(null, "Borrowed straight from the upcoming EcmaScript 6 specification."), 

React.DOM.h3({id: "spread-into-list"}, "Spread Into List"), 

md(null, "In a list, prefix elements with `...` or `…` to spread their elements into the list, flattening it:"), 

Code(null, ("\n`(1 2 (3 4) (5 6))\n\n`(1 2 ...`(3 4) ...`(5 6))\n\n; (1 2 3 4 5 6)\n"





)), 

React.DOM.h3({id: "argument-spread"}, "Argument Spread"), 

md(null, "Spread a list into a function call to pass its elements as individual arguments:"), 

Code(null, ("\n(= pair `('dog' 'lizard'))\n\n(prn 'cat' ...pair)\n\n; cat dog lizard\n"





)), 

React.DOM.h3({id: "rest-parameter"}, "Rest Parameter"), 

md(null, "Prefix a parameter with `...` or `…` to make it a _rest parameter_ that collects the remaining arguments into a list. This works the same way as destructuring assignment:"), 

Code(null, ("\n(def categorise quick ...moderate slow\n  (prn (+ '(' (moderate.join ' ') ')')))\n\n(categorise 'hare' 'turtle' 'human' 'snail')\n\n; (turtle human)\n"






)), 

React.DOM.h2({id: "conditionals"}, "Conditionals"), 

md(null, ("\nJisp improves the JavaScript conditionals and gives you some new ones. It's also trivial to define your own conditionals with [macros](#macros).\n\n    is      ; equality test\n    isnt    ; inequality test\n    not     ; negation\n    or      ; ||\n    and     ; &&\n    in      ; value in iterable\n    of      ; property of object\n    isa     ; positive type check\n    isnta   ; negative type check\n    ?       ; existence check\n    ?!      ; nonexistence check\n    any     ; picks first existing value, if any\n    if      ; if\n    switch  ; switch\n"
















)), 

React.DOM.h3({id: "logic"}, "Logic"), 

md(null, ("\n`is` is the equality test. With a single argument, it checks its truthiness by double negation. With two or more arguments, it checks if the first equals any of the others by a combination of `===` and `||`:\n\n    (is <name>)\n    (is <name> <something>)\n    (is <name> <something> [<other> ...])\n"





)), 

Code(null, ("\n; truthiness check\n(is true)\n\n; equality\n(is grass 'green')\n\n; or-equality: true if any match\n(is she 'smart' 'beautiful' 'artistic')\n"








)), 

md(null, ("\n`isnt` is the inverted form of `is` which also takes multiple arguments:\n\n    (isnt <name>)\n    (isnt <name> <something>)\n    (isnt <name> <something> [<other> ...])\n"





)), 

Code(null, ("\n; falsiness check (same as `not`)\n(isnt false)\n\n; inequality\n(isnt fire wet)\n\n; and-inequality: true if none match\n(isnt she 'grumpy' 'magpie' 'far away')\n"








)), 

md(null, ("\nLogical or is `or` and logical and is `and`. Like many other forms, they take multiple arguments:\n\n    (or  [<a> [<b> ...]])\n    (and [<a> [<b> ...]])\n"




)), 

Code(null, ("\n(or NaN Infinity `myvar)\n\n(and true 'sun is hot' (< 2 3))\n"



)), 

md(null, ("\nCheck if a value is in an iterable (array or string) with `in`:\n\n    (in <value> <iterable>)\n"



)), 

Code(null, ("\n(= bush 'woods')\n\n(in bush `('forest' 'woods' 'thicket'))  ; true\n\n(in 's' 'mystring')  ; true\n"





)), 

md(null, ("\nCheck if an object has a property with `of`:\n\n    (of <property> <object>)\n"



)), 

Code(null, ("\n(= snake (venom:  yes\n          fangs:  yes\n          talons: no))\n\n(of 'venom' snake)  ; true\n"





)), 

md(null, ("\n`isa` is a short way to test an object's type. It takes multiple arguments and returns true if any match:\n\n    (isa <name> <type> [<type> ...])\n"



)), 

Code(null, ("\n(isa Math.PI 'number')         ; true\n\n(isa null 'number' 'boolean')  ; false\n"



)), 

md(null, ("\n`isnta` is the negated version of `isa`. It takes multiple arguments and returns true if none match:\n\n    (isnta <name> <type> [<type> ...])\n"



)), 

Code(null, ("\n(isnta null 'function')          ; true\n\n(isnta 'Sun' 'number' 'string')  ; false\n"



)), 

React.DOM.h3({id: "existence"}, "Existence"), 

md(null, ("\nJisp provides three powerful existence macros: `?`, `?!`, and `any`.\n\n`?` is the ultimate existence checker. This macro takes any number of arguments and resolves to `true` if any of them exist (are defined) and to `false` otherwise.\n\n    (? <name>)\n    (? <name> [<name> ...])\n    (? <object.property> [<name> ...])\n"







)), 

Code(null, ("\n(= elephants 'exist')\n\n(? dinosaurs)           ; false\n\n(? mammoths elephants)  ; true\n"





)), 

md(null, "It's smart about properties: it takes property references apart and checks them in order, starting with the base object, letting you pinpoint the existence of a property with just one conditional:"), 

Code(null, ("\n(? object.property[0]['method'])\n\n; false because object not defined\n; no runtime error\n"




)), 

md(null, ("\n`?!` is the negated version of `?` with the exact same qualities:\n\n    (?! <name>)\n    (?! <name> [<name> ...])\n    (?! <object.property> [<name> ...])\n"





)), 

Code(null, ("\n(?! myVar null)             ; false: null exists\n\n(?! obj.prop[0]['method'])  ; true: not defined\n"



)), 

md(null, ("\n`any` is a sliding switch that combines `or` and `?`: it resolves to the first value that exists and is truthy, or just the last value that exists:\n\n    (any <name> [<name> ...])\n"



)), 

Code(null, ("\n(any NaN Infinity)\n\n; Infinity: it's truthy\n\n(any false 0 obj.prop[0] Math.PI)\n\n; Math.PI\n"







)), 

md(null, "Single conditional and no runtime error."), 

React.DOM.h3({id: "if"}, "If"), 

md(null, ("\nLike everything in jisp, `if` is a single form that resolves to a value. When possible, it compiles into the ternary or binary form. You can assign an `if` to a variable or return it from a function.\n\n    (if <test> <then> [<elif test then> ...] <else>)\n    (if <test> <then> <else>)\n    (if <test> <then>)\n"





)), 

Code(null, ("\n; binary form: single statement\n(if true (prn 'breaking off'))\n\n; ternary form: single expression per branch\n(if (is 'universe expanding')      ; test\n    (prn 'flight normal')          ; then-branch\n    (alert 'catastrophe'))         ; else-branch\n\n; block form: more than one expression per branch\n(if hunting\n    (do (= beast (randomBeast))\n        (shoot beast))             ; then-branch\n    (cook 'meat'))                 ; else-branch\n"













)), 

md(null, "Like everything else, the block form resolves to a value that can be assigned or returned:"), 

Code(null, ("\n((def truthiness x\n  (if x\n    (do (prn 'truthy') x)\n    (do (prn 'falsy')  false)))\nInfinity)\n"





)), 

md(null, ("\nElse-ifs are special forms _inside_ the `if` expression. The last non-elif expression is taken as the else-branch (undefined if omitted).\n\n    (elif <test> <branch>)\n"



)), 

Code(null, ("\n(if hungry\n    (eat)                   ; then-branch\n    (elif thirsty (drink))\n    (elif tired (sleep))\n    (write code))           ; else-branch\n"





)), 

React.DOM.h3({id: "switch"}, "Switch"), 

md(null, ("\nA `switch` form automatically inserts `break;` statements, protecting you from accidental fall-through:\n\n    (switch <predicate> [<case test body> ...] <default>)\n"



)), 

Code(null, ("\n(= x 0)\n\n(switch x\n  (case -1 'negative one')\n  (case 0  'zero-ish')\n  NaN)\n"






)), 

md(null, "Quite naturally, `switch` is also an expression that resolves to a value:"), 

Code(null, ("\n(prn (switch Math.PI\n  (case 1 'welcome to Lineland')\n  (case 2 'welcome to Flatland')\n  (case 3 'welcome to ancient Egypt')\n  'world still spinning'))\n"





)), 

React.DOM.h3({id: "try-catch"}, "Try / Catch"), 

md(null, ("\nIn jisp, even `try` is an expression. Use it like so:\n\n    (try <try> (catch err <catch>) <finally>)\n    (try <try> (catch err <catch>))\n    (try <try> <catch> <finally>)\n    (try <try> <catch>)\n    (try <try>)\n"







)), 

Code(null, ("\n(prn\n  (try (jump '10 meters high')))  ; implicit catch\n\n(try (eat 'a kilogram of sushi')\n  (catch err (prn err))\n  (finally 'But I’m happy anyway'))\n"






)), 

md(null, "More conditionals coming up. The [macro](#macros) system also makes it trivial to define your own conditionals with arbitrary syntax."), 

React.DOM.h2({id: "loops"}, "Loops"), 

md(null, "Jisp abstracts away the legacy details of JavaScript loops and makes them a lot more expressive. It comes with three loops: `for`, `over`, and `while`."), 

React.DOM.h3({id: "over"}, "Over"), 

md(null, ("\nThe `over` loop iterates over values and keys of any object. It also accesses inherited properties and custom prototype methods.\n\n    (over [<value> [<key>]] <iterable> <body>)\n"



)), 

Code(null, ("\n(= animals (squirrel: 'Eevee' fox: 'Vulpix'))\n\n(over val key animals (prn key val))\n\n''\n; squirrel Eevee\n; fox Vulpix\n"







)), 

md(null, "`over` automatically builds a list of values from each iteration. This list is its resolved value:"), 

Code(null, ("\n(= cats (pink: 'Persian' yellow: 'Skitty'))\n\n(= catnames\n   (over name cats name))\n\n; ('Persian' 'Skitty')\n\n(= bigcolours\n   (over name colour cats (colour.toUpperCase)))\n\n; ('PINK' 'YELLOW')\n"











)), 

md(null, "Iteration only collects results that are not `undefined`, so you can easily filter them:"), 

Code(null, ("\n(= cats (pink: 'Mew' yellow: 'Meowth' white: 'Absol'))\n\n(= mCats\n  (over cat cats\n    (if (is (car cat) 'M')\n        cat)))\n"






)), 

React.DOM.h3({id: "for"}, "For"), 

md(null, ("\nWhen iterating over arrays and strings, you usually want to hit all elements in order and don't want extra properties tagging along. In those cases, use the `for` loop:\n\n    (for [<value> [<index>]] <iterable> <body>)\n"



)), 

Code(null, ("\n(for char index 'meow'\n  (prn index char))\n\n''\n"




)), 

md(null, "It resolves to a list of values from each iteration. Just like `over`, it filters them by `undefined`:"), 

Code(null, ("\n(= array `(('drink' 'milk')\n           ('sweet' 'icecream')\n           ('drink' 'coffee')))\n\n(prn '-- all:')\n(prn (for x array x))\n\n(prn '-- only drinks:')\n(for x array\n  (if (is (car x) 'drink') x))\n"










)), 

md(null, ("\n**[NYI]**: planned feature. If the iterable is an integer larger than 0, jisp will substitute it for a range starting at 1, making for a repeat-N loop:\n\n    (= warcry '')\n    (for 5 (+= warcry 'waagh! '))\n    warcry\n    ; waagh! waagh! waagh! waagh! waagh!\n"






)), 

React.DOM.h3({id: "while"}, "While"), 

md(null, ("\nFor finer-grained control, use the `while` loop. It works like in JavaScript, but like everything in jisp, it's an expression. By default, it resolves to a list of values from each iteration. Like `for` and `over`, it filters them by `undefined`, allowing you to skip values:\n\n    (while <test> <body>)\n"



)), 

Code(null, ("\n(= bugs `('missing comma' 'missing semicolon'))\n\n(prn\n  (while (> bugs.length 0)\n         (+ (bugs.shift) ' avoided')))\n\n(= array `(0 1 2 3 4))\n\n(= even\n  (while (> array.length 0)\n    (do (= x (array.pop))\n        (if (is (% x 2) 0) x))))\n"












)), 

md(null, ("\nYou can also order a final resolved value:\n\n    (while <test> <body> <return-value>)\n"



)), 

Code(null, ("\n(= beers 0)\n(def sober (< beers 10))\n\n(= drunk (while (sober)\n                (++ beers)\n                (+ 'drunk after ' beers ' beers')))\n\n; drunk after 10 beers\n"








)), 

React.DOM.h2({id: "comprehensions"}, "Comprehensions"), 

md(null, ("\nOther languages typically devise special syntax for list comprehensions (a set builder notation). In jisp, you get the same functionality just by combining its basic features.\n\n`range` is a trivial built-in function that returns a list from N to M:\n"



)), 

Code(null, ("\n(range 0 5)\n\n; (0 1 2 3 4 5)\n"



)), 

md(null, "`for` and `while` (see [Loops](#loops)) are list-building expressions and can be combined with `range`, and optionally `if`, to make a comprehension:"), 

Code(null, ("\n(prn\n  (for x (range 0 6) (* x x)))\n\n; (0 1 4 9 16 25 36)\n\n(for x (range 0 6)\n     (if (is (% x 2) 0)\n         (* x x)))\n\n; (0 4 16 36)\n"










)), 

React.DOM.h2({id: "macros"}, "Macros"), 

md(null, ("\nMacros are compile-time functions that generate code. A macro takes code as input and returns code that's put in its place. At compile, macro definitions are yanked from your code, then macros are recursively expanded. After all macros are expanded, jisp is compiled to JS:\n\n    Definition:\n    (mac name [<params>] <body>)\n\n    Call:\n    (<name> [<code>])\n"







)), 

Code(null, ("\n(mac firstDefinedTruthy ...values\n  `(or ,...(for value values\n    `(and (? ,value) ,value))))\n\n(firstDefinedTruthy NaN Infinity myVar)\n\n; add your own macro call here\n"







)), 

md(null, ("\nMost of [`jisp.jisp`](https://github.com/Mitranim/jisp/blob/master/src/jisp.jisp) is written with macros.\n\nThe lifetime of your code without macros:\n\n    code -> compile into JS -> execute\n\nThe lifetime with macros:\n\n    code => parse macros <-> expand macros -> compile into JS => execute\n\nIt seems to be a trend among modern languages to introduce limited macro support in form of templates. Jisp brings macros to JavaScript but it's **not** limited to templating. Macros are complete, real, custom functions using the full power of the language to run arbitrary logic and transform code in arbitrary ways.\n"











)), 

React.DOM.h3({id: "templating"}, "Templating"), 

md(null, ("\nTemplating is the most basic use. Let's make a macro that generates named function definitions:\n\n    Prefix code to return with `:\n    `(<code>)\n\n    Unquote elements with , to resolve (transclude) them during macro call:\n    `(<code> ,<elem> <code>)\n"







)), 

Code(null, ("\n; yanked at macro parse\n(mac makeReduce name operator\n  `(def ,name ...args\n    (if (isnt args.length 0)\n        (args.reduce {,operator #0 #1}))))\n\n; yanked at macroexpand\n(makeReduce mul *)\n\n; code put back at macroexpand\n; (def mul ...args\n;   (if (isnt args.length 0)\n;     (args.reduce {* #0 #1})))\n\n; add your own macro call here\n; try a non-operator\n"
















)), 

md(null, ("\nIn this example, the macro returns the form starting with `def`. Quoting with `` ` `` prevents this form from resolving during the macro call and lets the macro return it as code. Unquoting the macro arguments `name` and `operator` by prepending them with `,` transcludes them into the template. Try adding your own macro calls to generate new definitions.\n\nBecause macros are real functions, you can edit the return code in arbitrary ways. For instance, based on the arguments passed. Let's make our operator macro slightly more versatile:\n"



)), 

Code(null, ("\n(mac makeReduce name operator zeroValue\n  `(def ,name ...args (do\n    ; included if zeroValue was passed\n    ,(if (? zeroValue)\n      `(args.unshift ,zeroValue))\n    ; included always\n    (if (is args.length 0)\n      ,zeroValue  ; defaults to undefined\n      (args.reduce {,operator #0 #1})))))\n\n(makeReduce add +)\n\n(makeReduce div / 1)\n\n; try your own macro call\n"















)), 

md(null, "In this example, the logic `(args.unshift ,zeroValue)` is only included if a `zeroValue` was passed to the macro. Run the resulting functions with none and one argument to see the difference."), 

React.DOM.h3({id: "code-construction"}, "Code Construction"), 

md(null, ("\nBecause jisp code is a series of nested arrays, macros can deconstruct and construct it on the fly. This is why we have those parentheses.\n\nAs a silly example, you could enable reverse syntax by reversing the code passed to a macro:\n"



)), 

Code(null, ("\n(mac reverse form (do\n  (def rev form\n     (if (Array.isArray form)\n         (do (for f form\n               (rev f))\n             (.reverse))\n         form))\n  (rev form)))\n\n(reverse\n  (('world' 'hello ' (() quote) +) prn))\n\n; try your own reverse code\n"













)), 

md(null, ("\nBut let's get more serious. Getting back to the example at the top of the page. Suppose you're writing a gulp config file full of repetitive blocks like these:\n\n    gulp.task('jisp', function() {\n      return handle(gulp.src(jispFiles))\n      .pipe(handle(concat('app.js')))\n      .pipe(handle(jisp()))\n      .pipe(handle(uglify({mangle: false})))\n      .pipe(handle(gulp.dest('public/js/tmp/')));\n    });\n\nYou can't deduplicate this with functional abstractions alone, and are forced to write this repetitive code by hand. But you can abstract it away with a macro:\n"











)), 

Code(null, ("\n(mac task name ...args (do\n  (= pipeline `(do (handle (,(args.shift)\n                            ,(args.shift)))))\n  (while (> args.length 0) (do\n    (= left  (args.shift)\n       right (args.shift))\n    (pipeline.push `(.pipe (handle (,left ,right))))))\n  `(gulp.task ,name (fn ,pipeline))))\n\n; call it like so:\n\n(task       'jisp'\n  gulp.src  jispFiles\n  conc      'app.js'\n  jisp      ()\n  uglify    (mangle: no)\n  gulp.dest 'public/js/tmp/')\n\n; try adding your own task\n"



















)), 

md(null, ("\nWhat happened? The macro takes its arguments as an array, takes it apart in pairs, and constructs a new array of the resulting code, filling in the repetitive blocks we wanted to dedup. The constructed code in this example is:\n\n    (gulp.task 'jisp' (fn (do\n      (handle (gulp.src jispFiles))\n      (.pipe (handle (conc 'app.js')))\n      (.pipe (handle (jisp)))\n      (.pipe (handle (uglify (mangle: no))))\n      (.pipe (handle (gulp.dest 'public/js/tmp/'))))))\n\nAnd it replaces the macro call before the code is compiled.\n\nWe've just enabled a new shorter, cleaner syntax for the rest of our configuration file, and deduplicated our code in a way not possible with plain JavaScript. It should be noted that macros take any kind of input; it could be hash tables or bigger blocks of code. See [`jisp.jisp`](https://github.com/Mitranim/jisp/blob/master/src/jisp.jisp) for bigger examples.\n\nMacros can have arbitrary symbols and even literal strings as names. Suppose you're writing a lot of prototype extenders and want to shorten the definitions. In other languages, you're lucky if you have special syntax for that. In jisp, make the syntax yourself:\n"














)), 

Code(null, ("\n(mac @ obj method ...args body\n  `(= (get (get ,obj \"prototype\") ,(JSON.stringify method))\n      (fn ,...args ,body)))\n\n(@ Plant grow time speed\n  (+= this.length (* time speed)))\n\n(@ Animal growl decibels\n  (= this.loudness decibels))\n"









)), 

md(null, "Sometimes you want the code returned from a macro to contain new variable binginds. Prefix a name with `#` to make it a service name that is guaranteed to be unique in the current scope. If it clashes with any other variable, it will be renamed to avoid the conflict."), 

Code(null, ("\n(mac myDefinition\n  `(= #uniq 'my unique variable'))\n\n(myDefinition)\n\n(= uniq 'declared outside macro')\n"






)), 

md(null, "Finally, macros can self-expand on definition:"), 

Code(null, ("\n((mac pr x `(process.stdout.write ,x)) 'hello world')\n(pr 'another call')\n\n((mac add ...x `(+ ,...x)) 99 44 11)\n(add Infinity -Infinity)\n"





)), 

React.DOM.h3({id: "macro-import-export"}, "Macro Import and Export"), 

md(null, ("\nMacros can be imported in three ways:\n* compile or `require` a macro-containing file before others within the same Node runtime or on the same browser page;\n* use the `importMacros` method of the object exported by the compiler or the global `jisp` object in the browser;\n* access the `macros` store exported by the compiler.\n\nMacros are kept in the `macros` object that exists during the compiler runtime. It's exposed in the `jisp` object and can be accessed and modified directly. The recommended way to import macros is by calling the `importMacros` method that takes one or more macro stores and merges them into the macro object, overriding the existing macros. Each store is a hash table where keys are macro names and values are macro functions.\n\n    (= myStore (testMacro: (fn `nameToReturn)))\n\n    (= jisp (require 'jisp'))\n\n    (jisp.importMacros myStore)\n\n    (testMacro)  ; replaced by `nameToReturn`\n\nThe `macros` object persists between compiler calls. If you're using a build script that compiles multiple jisp files within the same runtime, you can simply put macros in a file and require or compile it before others. This also works when running jisp scripts directly with `require`.\n\nWhen a macro is referenced in code, it's embedded at the top of your program and can be assigned and exported from a module. See [`macros.jisp`](https://github.com/Mitranim/jisp/blob/master/src/macros.jisp) for an example.\n"


















)), 

React.DOM.h3({id: "macro-notes"}, "Notes"), 

md(null, ("\nAfter each macro expansion, the new code is recursively checked for macro definitions and calls. This allows macros to be nested, and even contain new macro definitions. See [`jisp.jisp`](https://github.com/Mitranim/jisp/blob/master/src/jisp.jisp) for examples; most of it is written with nested macros.\n\nTo avoid confusing macros for functions, it's good style to begin their names with `mac`.\n\nIt's important to realise that macros are compile-time, not run-time. They live in the land of names, not in the land of values like functions. Rather than passing values by names to macros, you pass _names_, or code in general. A macro doesn't give a flying duck about scope or variable bindings. You aren't constrained by scope or object reference issues, and don't have to pass around objects you want to access. You just construct the code you want, where you want it, at compile time.\n"





)), 

React.DOM.h2({id: "built-ins"}, "Built-ins and Embedding"), 

md(null, "Jisp comes with some built-in macros and functions, and faculties for importing them and embedding into compiled programs."), 

React.DOM.h3({id: "built-in-macros"}, "Macros"), 

md(null, "Most built-in macros are conditionals. See the [conditionals](#conditionals) section. Some are property accessors. `prn` is a syntax-level alias for `console.log`."), 

Code(null, ("\n(car   x)\n(head  x)\n(cdr   x)\n(tail  x)\n(init  x)\n(last  x)\n(let   x 10 (* x 2))\n(isa   x 'type')\n(isnta x 'type')\n(?     x.y)\n(?!    x.y)\n(any   x y)\n(prn   x y)\n"













)), 

md(null, "`:` is a hash table builder. When given multiple arguments, it takes them as key-value pairs and compiles to an object literal:"), 

Code(null, "(: basic 'hash' table 'syntax')"), 

md(null, "This has its use in macros (at compile time). To use the hash builder at runtime, call it with a single argument:"), 

Code(null, ("\n(= calc `('number' Math.PI 'professor' 'Archimedes'))\n\n(JSON.stringify\n  (: calc))\n"




)), 

md(null, ("\nTake note that `:` is _destructive_. `(: ( .slice))` your lists if you want to keep originals.\n\n`::` is a concatenating hash builder. It concatenates its arguments, flattening them if they're arrays, and passes the result to `:`.\n"



)), 

Code(null, ("\n(JSON.stringify\n  (:: `('first' 'pair') `('second' 'pair')))\n"


)), 

md(null, "`::` is particularly useful for building hashes in loops."), 

Code(null, ("\n(def duplicate ...args\n  (:: (for arg args `(arg arg))))\n\n(JSON.stringify\n  (duplicate 'troubles' 'happiness'))\n"





)), 

React.DOM.h3({id: "built-in-functions"}, "Functions"), 

md(null, ("\nJisp has a special faculty for adding global functions to the language. If any of them is referenced in code, it's embedded at the top of your program on compile. No globals are leaked. If the function is reassigned before being referenced, it's not embedded. Like with macros, jisp provides a way to import these functions, extending the language. It also comes with a few:\n\n`list` is a list (array) builder. It's roughly equivalent to `(Array x)`, but also accepts 0 or 1 arguments.\n\n    (list [<args> ...])\n"





)), 

Code(null, ("\n(list)\n\n; ()\n\n(list 'wizard' 'hat' 'staff')\n\n; ('wizard' 'hat' 'staff')\n"







)), 

md(null, ("\n`concat` is like `list` except it flattens lists passed as arguments, concatenating them:\n\n    (concat [<args> ...])\n"



)), 

Code(null, ("\n(concat `(yes no) `(NaN) Infinity)\n\n; (yes no NaN Infinity)\n"



)), 

md(null, ("\n`range` is a function that builds a list from N to M. It's used in comprehensions:\n\n    (range [start] end)  ; default start 0\n"



)), 

Code(null, ("\n(range -1 6)\n\n; (-1 0 1 2 3 4 5 6)\n"



)), 

React.DOM.h3({id: "function-import-export"}, "Function Import and Export"), 

md(null, ("\nSimilarly to macros, functions can be imported in two ways:\n* use the `importFunctions` method of the object imported with `require` or the global `jisp` object in the browser;\n* directly access and modify the function store exposed by the module.\n\nThe global functions are stored in the `functions` object that exists during the compiler runtime. Unlike macros, compiling a file doesn't affect the function store. You need to import them like so:\n\n    (= myFuncs (sqr:  (fn x (* x x))\n                cube: (def cube x (* x x x))))\n\n    (= jisp (require 'jisp'))\n\n    (jisp.importFunctions myFuncs)\n\n    sqr      ; function embed\n    (cube 3) ; function embed, 27\n\nTry this in a REPL or a file to see how functions are embedded after importing. This faculty makes it easy to extend the language in a modular way with zero global leaks and zero global dependency.\n"

















)), 

React.DOM.h2({id: "style"}, "Style"), 

md(null, ("\nJisp is insensitive to whitespace, but humans don't read code by counting parens; we read it by indentation. Your indentation should reflect the nesting of expressions, branches of execution. Parallel branches share the same indent, nested branches are indented further.\n\n    ; BAD, misleading about nesting\n    (def plusname name\n         (if (isNaN (Number (last name)))\n         (+ name 0)\n         (+ (init name) (+ 1 (Number (last name))))))\n\n    ; GOOD, reflects branching properly\n    (def plusname name\n         (if (isNaN (Number (last name)))\n             (+ name 0)\n             (+ (init name) (+ 1 (Number (last name))))))\n\nWhen nesting isn't deep, try lining up each next indent with the second word on the preceding line (example above). Otherwise, stick with two spaces for each new level.\n"















)), 

React.DOM.h2({id: "why"}, "Why Use Jisp"), 

md(null, ("\n#### Simple and Safe\n\nDespite being more powerful, jisp is a lot [simpler](#code-structure) than JavaScript. Is has practically no syntax; there's no semicolons, commas, or linebreaks to trip yourself over, no special rules for keywords and operators. Everything uses the same rules, making it hard to make an error.\n\nIt also absracts away legacy implementation details like [`var`](#assignment), [`break`](#switch) and the primitive [`for`](#for) loop, eliminating entire classes of easy to make and hard to spot errors.\n\n#### Powerful\n\nAt its heart, jisp is just JavaScript. But it's also much more.\n\nOn the surface level, it builds some coding patterns right into the language and provides powerful higher-level [conditionals](#conditionals) and [loops](#loops), making your programs terser. Its [expressive](#everything-exp) functional syntax and implicit value resolution lets you focus on your ideas and have the language take care of data returns.\n\nMore importantly, it lets you define syntactic abstractions and automatically [generate code](#macros), [reprogram](#macro-import-export) and [extend](#function-import-export) the language, implement embedded domain-specific languages on top of JS, deduplicate code in ways impossible with plain JavaScript.\n"













)), 

React.DOM.h3({id: "why-over"}, "Why Jisp Over [insert dialect X]"), 

md(null, ("\nThere's a bunch of Lisp-JavaScript dialects floating in the wild. So why jisp?\n\n#### JavaScript-first\n\nMost other Lisp-JavaScript implementations are attempts to port a [language X] to JavaScript. In best cases, they carry legacy design details that don't make sense in the JavaScript environment or obfuscate the code (example: artificial distinction between arrays and code in most dialects). In worse cases, they clog the runtime with a reimplementation of another language on top of JavaScript.\n\nJisp is JS-native and axiomatic. Is has no needless concepts, no legacy syntax, and no runtime cost. Jisp focuses on the core ideas of code-as-data, S-expressions, macros, and brings them to JavaScript, introducing as few new concepts as possible. Everything else is left looking familiar and fits intuitively within the new syntax.\n\nIt also carefully abstracts away legacy JavaScript pitfalls, making the language safer without introducing alien concepts as a cost.\n\nJisp doesn't target an [insert language X] programmer. It targets the JavaScript programmer.\n\n#### Featureful\n\nJisp is full of features of [immediate](#existence), practical use to a JavaScript developer. It's not different for difference sake: it enables a [whole new level](#macros) of abstraction and makes [full use](#built-ins) of it, coming prepackaged with powerful tools. It takes practical features from other modern languages and the future of JavaScript and gives them to you now. Built-in macros and functions, shortcuts to common patterns, import and embedding for macros and global functions, spreading, destructuring, and more.\n\n#### Axiomatic\n\nDespite aiming for features, jisp takes the minimalistic, simplest possible approach to design. It wants you to type less and do more with less code. It doesn't try to imitate [language X] — or JavaScript, for that matter. It aims to be [succinct](#lambda) and get out of your way.\n"



















)), 

React.DOM.h2({id: "acknowledgements"}, "Acknowledgements and Notes"), 

md(null, ("\nJisp is massively inspired by [CoffeeScript](http://coffeescript.org) and uses bits of its source for CLI utils. Design inspiration from [Arc](http://paulgraham.com/arc.html) and the Lisp family of languages, bits from other places. General inspiration from [Arc-js](https://github.com/smihica/arc-js).\n\nReach me out by instant messaging (preferably Skype) or email. See my contacts [here](http://mitranim.com). The email is also a Jabber ID.\n\nCopyright (c) 2014 Mitranim, under the MIT License ([source](https://github.com/Mitranim/jisp/blob/master/license) / [docs](https://github.com/Mitranim/jisp/blob/gh-pages/license)).\n"





))

)

    );
  }
});

/********************************** Export ***********************************/

module.exports = Docs;
