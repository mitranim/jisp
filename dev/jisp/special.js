'use strict'

/**
* Custom logic for special forms.
* These functions are called by List.prototype.plan; `this` refers to
* the List instance being compiled
*
* Text -> Tokens -> Data Structures -> Form ** -> Plan -> ** Code -> Output
*/

/******************************* Dependencies ********************************/

// Third party
var _       = require('lodash'),
    inspect = require('util').inspect

// Custom components
var Plan    = require('./plan'),
    Atom    = require('./atom'),
    Hash    = require('./hash'),
    List    = require('./list'),
    Code    = require('./code')

// Shortcuts
var True          = require('./utils').True,
    isString      = require('./utils').isString,
    isIdentifier  = require('./utils').isIdentifier,
    isName        = require('./utils').isName,
    Inline        = Code.Inline,
    Chain         = Code.Chain,
    Infix         = Code.Infix,
    Expression    = Code.Expression,
    Statement     = Code.Statement,
    CaseStatement = Code.CaseStatement,
    Block         = Code.Block,
    Sequence      = Code.Sequence,
    BlockSequence = Code.BlockSequence,
    Ternary       = Code.Ternary,
    Multiline     = Code.Multiline,
    CaseSequence  = Code.CaseSequence

/********************************** Globals **********************************/

var special = {}

/********************************* Utilities *********************************/

function plan (/* ... variants */) {
  var variants = [].slice.call(arguments, 0)
  return function() {
    this.value.shift()
    return new Plan(this, variants)
  }
}

function tryPlan (child, context) {
  if (_.isObject(child) && child.plan) return child.plan(context)
}

function tryCode (child, context, fallback) {
  var plan = tryPlan.apply(null, arguments)
  if (plan) return plan.code()
  else return new Code(fallback || '')
}

/********************************** Methods **********************************/

special['='] = plan({
  test: function() {return this.value.length === 1},
  code: function() {
    this.first().assert(function() {return isIdentifier(this.value)}, 'identifier')
    var name = this.first().plan(this.context).code().print()
    this.scope.declare(name)
    return new Code()
  }
},
{
  test: function() {return this.value.length >= 2},
  code: function() {
    var context = this.context.child({expression: true, operator: '='}),
        codes   = this.each(function (child, index) {
          if (index % 2) return child.plan(context).code()
          else {
            var name = child.plan(context).code().print()
            this.scope.declare(name)
            return name
          }
        }),
        pairs = []
        while (codes.length) {
          pairs.push(Infix('=', codes.shift(), codes.shift()))
        }
    return this.context.expression ? Expression(pairs) : Sequence(pairs)
  }
})

special['get'] = plan({
  test: function() {return this.value.length === 2},
  code: function() {
    var context = this.context.child({expression: true}),
        obj     = this.value[0].plan(context).code(),
        prop    = this.value[1].plan(context).code(),
        propPrinted = prop.print(),
        propSliced  = propPrinted.slice(1, -1)
    return isString(propPrinted) && isName(propSliced) ?
           Inline(obj, '.', propSliced)
           : Inline(obj, '[', prop, ']')
  }
},
{
  test: function() {return this.value.length === 1},
  code: function() {
    var context = this.context.child({expression: true}),
        prop    = this.value[0].plan(context).code(),
        propPrinted = prop.print(),
        propSliced  = propPrinted.slice(1, -1)
    return isString(propPrinted) && isName(propSliced) ?
           Inline('.', propSliced)
           : Inline('[', prop, ']')
  }
})

special['quote'] = plan({
  test: function() {
    return this.value.length === 1 && this.value[0] instanceof Atom
  },
  code: function() {
    return this.value[0].plan(this.context.child({quote: true})).code()
  }
},
{
  test: function() {
    return this.value.length === 1 && this.value[0] instanceof List
  },
  code: function() {
    return this.value[0].plan(this.context.child({quote: true})).code()
  }
})

special['do'] = plan({
  test: function() {return this.value.length},
  code: function() {
    /**
    * Convert children to Code instances, grouping orphan property notations
    * into Chains. If the context requires the `do` form to return an
    * expression, the last child is planned as one
    */
    var codes = [], index = -1, form, next, chained, context
    while (++index < this.value.length) {
      form = this.value[index], chained = []
      while ((next = this.value[index + 1]) && next.isOrphanProperty()) {
        chained.push(next.plan(this.context).code())
        ++index
      }
      context = this.context.lastValue && index + 1 === this.value.length ?
                this.context.child({expression: true})
                : this.context
      codes.push(chained.length ?
                 Chain(form.plan(context).code(), chained)
                 : form.plan(context).code())
    }
    // Declare variables if top level
    if (this.beginsScope && this.scope.number()) {
      codes.unshift(Statement(Inline('var ', Expression(this.scope.list()))))
    }
    return codes.length <= 1 ?
           Expression(codes)
           : this.context.expression ?
           Sequence(codes).returnify().enfunc()
           : Sequence(codes)
  }
})

/**
* Function definition. Covers both named functions (`def`) and
* anonymous functions (`fn`)
*/
special['def'] = special['fn'] = plan({
  test: function() {
    return this.word === 'def' ? this.value.length >= 1 : true
  },
  code: function() {
    // Function name
    if (this.word === 'def') {
      this.first().assert(function() {
        return isIdentifier(this.value)
      }, 'valid function name')
      var funcName = this.value.shift().plan(this.context).code().print()
    }
    // Function body
    var body = this.value.pop()
    if (body) {
      var bodyContext = this.context.child({statement: true, lastValue: true, returnValue: true}),
          bodyCode    = body.plan(bodyContext).code().enveil(Block).returnify()
    } else var bodyCode = Block()
    // Variable declarations
    if (this.scope.number()) {
      bodyCode.value.unshift(Statement(Inline('var ', Expression(this.scope.list()))))
    }
    // Arguments
    var argContext = this.context.child({expression: true}),
        argsCode   = Expression(this.value.map(function (arg) {
          return arg.plan(argContext).code()
        }))
    // The whole thing
    var funcCode = ['function ', funcName ? funcName + ' ' : '', '(', argsCode, ') ', bodyCode]
    // Anonymous functions need to be wrapped in parens to be a valid statement
    if (this.word === 'fn' && this.context.statement) {
      funcCode.unshift('(')
      funcCode.push(')')
    }
    return Inline(funcCode)
  }
})

/**
* `if` has three forms: ternary expression, binary statement, and multipart
* statement. When it's required to be an expression, I'm going to try and
* compile it into nested ternaries, rather than collect results from branches
* with a shadow variable. Probably a silly idea.
*/
special['if'] = plan({
  // Ternary
  test: function() {return this.context.expression},
  code: function() {
    var context = this.context,
        test    = tryCode(this.value.shift(), context, 'false'),
        then    = tryCode(this.value.shift(), context, 'undefined'),
        valElse = this.last() && this.last().word !== 'elif' ?
                  this.value.pop().plan(context).code()
                  : Expression('undefined')

    // Collect elifs into nested ternaries
    while (this.value.length) {
      this.last().assertWord('elif')
      var elif = this.value.pop().plan(context).code()
      valElse = Ternary(elif.value.shift(), elif.value.shift(), valElse)
    }

    return Ternary(test, then, valElse)
  }
},
{
  // Binary and multipart
  test: True,
  code: function() {
    var contextTest = this.context.child({expression: true}),
        contextBody = this.context.child({statement: true}),
        test        = tryCode(this.value.shift(), contextTest, 'false'),
        then        = tryCode(this.value.shift(), contextBody).optionalBlock()

    var sequence = [Statement(Inline('if (', test, ')'), then)]

    // Collect elifs, if any
    while (this.value.length && this.first().word === 'elif') {
      sequence.push(this.value.shift().plan(this.context).code())
    }

    // Add the `else` form, if any
    if (this.value.length) {
      sequence.push(Statement('else', tryCode(this.value.shift(), this.context).optionalBlock()))
    }
    this.end()

    return BlockSequence(sequence)
  }
})

special['elif'] = plan({
  // Stub for decomposition in the ternary `if`
  test: function() {return this.context.expression && this.value.length <= 2},
  code: function() {
    var test = tryCode(this.value.shift(), this.context, 'false'),
        then = tryCode(this.value.shift(), this.context, 'undefined')
    return Expression(test, then)
  }
},
{
  test: function() {return this.value.length <= 2},
  code: function() {
    var test = tryCode(this.value.shift(), this.context.child({expression: true}), 'false'),
        then = tryCode(this.value.shift(), this.context).optionalBlock()
    return Statement(Inline('else if (', test, ')'), then)
  }
})

special['switch'] = plan({
  test: function() {return this.context.expression},
  code: function() {
    var test  = tryCode(this.value.shift(), this.context, 'false'),
        cases = []
    while (this.value.length && this.first().word === 'case') {
      cases.push(this.value.shift().plan(this.context).code())
    }
    if (this.value.length) {
      var def = this.value.shift().plan(this.context)
                .code().enveil(CaseSequence).optionalBlock().returnify()
      cases.push(Statement(Inline('default:'), def))
    }
    this.end()
    return Statement(Inline('switch (', test, ')'), Block(cases)).enfunc()
  }
},
{
  test: function() {return this.context.statement},
  code: function() {
    var test  = tryCode(this.value.shift(), this.context.child({expression: true}), 'false'),
        cases = []
    while (this.value.length && this.first().word === 'case') {
      cases.push(this.value.shift().plan(this.context).code())
    }
    if (this.value.length) {
      var def = this.value.shift().plan(this.context.child({statement: true}))
                .code().enveil(CaseSequence).optionalBlock()
      cases.push(Statement(Inline('default:'), def))
    }
    this.end()
    return Statement(Inline('switch (', test, ')'), Block(cases))
  }
})

special['case'] = plan({
  test: function() {return this.value.length === 1},
  code: function() {
    var test = this.first().plan(this.context.child({expression: true})).code()
    return CaseStatement(Inline('case ', test, ':'))
  }
},
{
  test: function() {return this.value.length === 2 && this.context.expression},
  code: function() {
    var test = this.first().plan(this.context).code(),
        body = this.last().plan(this.context).code()
               .enveil(CaseSequence).optionalBlock().returnify()
    return Statement(CaseStatement(Inline('case ', test, ':')), body)
  }
},
{
  test: function() {return this.value.length === 2 && this.context.statement},
  code: function() {
    var test = this.first().plan(this.context.child({expression: true})).code(),
        body = this.last().plan(this.context.child({statement: true}))
               .code().enveil(CaseSequence).optionalBlock()
    body.value.push(Statement('break'))
    return Statement(CaseStatement(Inline('case ', test, ':')), body)
  }
})

special['try'] = plan({
  test: function() {return this.context.expression},
  code: function() {
    var tryBody   = tryCode(this.value.shift(), this.context.child({statement: true, lastValue: true}));
    if (this.value.length && this.first().word === 'catch') {
      var catchBody = this.value.shift().plan(this.context).code()
    }
    if (this.value.length && this.first().word === 'finally') {
      var finalBody = this.value.shift().plan(this.context).code()
    }
    this.end()
    if (!catchBody && !finalBody) {
      var catchBody = Statement(Inline('catch (', this.scope.declareShadow('err'), ')'), Block())
    }
    return Block(BlockSequence(Statement(new Code('try'), tryBody.enveil(Block).returnify()), catchBody, finalBody)).enfunc()
  }
},
{
  test: function() {return this.context.statement},
  code: function() {
    var tryBody   = tryCode(this.value.shift(), this.context.child({statement: true, lastValue: true}));
    if (this.value.length && this.first().word === 'catch') {
      var catchBody = this.value.shift().plan(this.context).code()
    }
    if (this.value.length && this.first().word === 'finally') {
      var finalBody = this.value.shift().plan(this.context).code()
    }
    this.end()
    if (!catchBody && !finalBody) {
      var catchBody = Statement(Inline('catch (', this.scope.declareShadow('err'), ')'), Block())
    }
    return BlockSequence(Statement(new Code('try'), tryBody.enveil(Block)), catchBody, finalBody)
  }
})

special['catch'] = plan({
  test: function() {return this.context.expression && this.value.length === 1},
  code: function() {
    var name = this.scope.declareShadow('err'),
        body = this.value.shift().plan(this.context.child({statement: true, lastValue: true})).code().enveil(Block).returnify()
    return Statement(Inline('catch (', name, ')'), body)
  }
},
{
  test: function() {return this.context.expression && this.value.length === 2},
  code: function() {
    var name = this.value.shift().plan(this.context).code().assert(isIdentifier, 'identifier'),
        body = this.value.shift().plan(this.context.child({statement: true, lastValue: true})).code().enveil(Block).returnify()
    return Statement(Inline('catch (', name, ')'), body)
  }
},
{
  test: function() {return this.context.statement && this.value.length === 1},
  code: function() {
    var name = this.scope.declareShadow('err'),
        body = this.value.shift().plan(this.context).code().enveil(Block)
    return Statement(Inline('catch (', name, ')'), body)
  }
},
{
  test: function() {return this.context.statement && this.value.length === 2},
  code: function() {
    var name = this.value.shift().plan(this.context).code().assert(isIdentifier, 'identifier'),
        body = this.value.shift().plan(this.context).code().enveil(Block)
    return Statement(Inline('catch (', name, ')'), body)
  }
})

special['finally'] = plan({
  test: function() {return this.context.expression && this.value.length === 1},
  code: function() {
    var body = this.value.shift().plan(this.context.child({statement: true, lastValue: true})).code().enveil(Block).returnify()
    return Statement('finally', body)
  }
},
{
  test: function() {return this.context.statement && this.value.length === 1},
  code: function() {
    var body = this.value.shift().plan(this.context).code().enveil(Block)
    return Statement('finally', body)
  }
})

special['while'] = plan({
  test: function() {return this.context.statement && this.value.length === 1},
  code: function() {
    var test = this.value.shift().plan(this.context.child({expression: true})).code()
    return Statement(Inline('while (', test, ')'))
  }
},
{
  test: function() {return this.context.statement && this.value.length === 2},
  code: function() {
    var test = this.value.shift().plan(this.context.child({expression: true})).code(),
        body = this.value.shift().plan(this.context).code().optionalBlock()
    return Statement(Inline('while (', test, ')'), body)
  }
},
{
  test: function() {return this.context.expression && this.value.length <= 2},
  code: function() {
    var test = tryCode(this.value.shift(), this.context, 'false'),
        body = this.value.length ?
               this.value.shift().plan(this.context.child({statement: true, lastValue: true})).code().enveil(Block)
               : Block(),
        last = body.last(),
        funcBody  = Statement(Inline('while (', test, ')'), body).enveil(Block),
        reference = this.scope.makeShadowName('ref'),
        collector = this.scope.makeShadowName('res')
    funcBody.value.unshift(Statement(Inline('var ', Expression(reference, Infix('=', collector, '[]')))))

    // ToDo: here's we should check if the loop contains a `return` statement
    // and throw an error if it does

    if (last && last.beginsWithStatementKeyword()) {
      throw new Error("can't collect values from a non-expression:", last)
    } else if (last) {
      body.value.push(Infix('=', reference, body.value.pop()))
      body.value.push(Statement(Inline('if (', reference, ' !== undefined) ', collector, '.push(', reference, ')')))
    } else {
      body.value.push(Statement(Inline(collector, '.push(undefined)')))
    }
    funcBody.value.push(Statement('return', collector))

    return funcBody.enfunc()
  }
})

special['for'] = plan({
  /**
  * (for [<index>] <integer> <body>)
  * Repeat <body> an <integer> number of times, statement version
  */
  test: function() {
    var iterable = this.value[this.value.length - 2]
    return this.context.statement && iterable instanceof Atom && !isNaN(parseInt(iterable.value))
  },
  code: function() {
    var body     = this.value.pop().plan(this.context).code().optionalBlock(),
        iterable = this.value.pop().plan(this.context).code()
    if (this.value.length) {
      var index = this.value.shift().assert(isIdentifier, 'identifier').plan(this.context).code()
      this.scope.declare(index)
    } else {
      var index = this.scope.declareShadow('index')
    }
    this.end()
    return Statement(Inline('for (', Infix('=', index, '0'), '; ', Infix('<', index, iterable), '; ++', index, ')'), body)
  }
},
{
  /**
  * (for [<index>] <integer> <body>)
  * Repeat <body> an <integer> number of times, expression version
  */
  test: function() {
    var iterable = this.value[this.value.length - 2]
    return this.context.expression && iterable instanceof Atom && !isNaN(parseInt(iterable.value))
  },
  code: function() {
    var body     = this.value.pop().plan(this.context).code().enveil(Block),
        iterable = this.value.pop().plan(this.context).code()
    if (this.value.length) {
      var index = this.value.shift().assert(isIdentifier, 'identifier').plan(this.context).code()
      this.scope.declare(index)
    } else {
      var index = this.scope.declareShadow('index')
    }
    this.end()
    return Statement(Inline('for (', Infix('=', index, '0'), '; ', Infix('<', index, iterable), '; ++', index, ')'), body)
  }
},
{
  test: function() {return this.context.statement && this.value.length > 1},
  code: function() {
    var context  = this.context.child({expression: true}),
        body     = this.value.pop().plan(this.context).code().optionalBlock(),
        iterable = this.value.pop().plan(context).code()
    if (this.value.length) {
      var value = this.value.shift().assert(isIdentifier, 'identifier').plan(context).code()
      this.scope.declare(value)
    } else {
      var value = this.scope.declareShadow('value')
    }
    if (this.value.length) {
      var index = this.value.shift().assert(isIdentifier, 'identifier').plan(context).code()
      this.scope.declare(index)
    } else {
      var index = this.scope.declareShadow('index')
    }
    var ref = this.scope.declareShadow('ref'),
        len = this.scope.declareShadow('len')
    this.end()
    return Sequence(
      Infix('=', ref, iterable),
      Infix('=', len, Inline(ref, '.length')),
      Statement(Inline('for (', Infix('=', index, '0'), '; ', Infix('<', index, len), '; ++', index, ')'), body))
  }
})

special['forIn']


/********************************** Export ***********************************/

module.exports = special
