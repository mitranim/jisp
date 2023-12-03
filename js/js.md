Inconsistent/incorrect/questionable treatment of _some_ reserved words in variable declarations. Ignoring ES3 here, aiming at ES6+. All words were tested via `const <name> = undefined`.

The column "conditional", if true, indicates that the word is _sometimes_ reserved or has a special meaning. Most of these words _can_ be declared as identifiers in loose mode. Many of them are reserved in strict mode. For compatibility with loose mode, our syntax should treat such words as regular identifiers in declarations.

Words with "expected = ✅" are included only for completeness, are treated correctly, and require no changes.

I don't claim to be an authority, and could have made mistakes. Please double check me.

Related: #2142.

| Word              | Conditional | Current                             | Expected                        |
|-------------------|-------------|-------------------------------------|---------------------------------|
| arguments         | true        |  meta.binding.name variable         | ✅                              |
| async             | true        |  meta.binding.name variable         | ✅                              |
| await             | true        |  meta.binding.name variable         | ✅                              |
| case              |             | -meta.binding.name variable         | keyword                         |
| catch             |             |  keyword                            | ✅                              |
| class             |             |  keyword                            | ✅                              |
| const             |             |  keyword                            | ✅                              |
| continue          |             |  keyword                            | ✅                              |
| debugger          |             |  keyword                            | ✅                              |
| default           |             | -meta.binding.name variable         | keyword                         |
| delete            |             |  keyword                            | ✅                              |
| do                |             |  keyword                            | ✅                              |
| else              |             |  keyword                            | ✅                              |
| enum              |             | -meta.binding.name variable         | keyword                         |
| eval              | true        |  meta.binding.name support.function | meta.binding.name variable      |
| export            |             |  keyword                            | ✅                              |
| extends           |             | -meta.binding.name variable         | keyword                         |
| false             |             | -meta.binding.name constant         | ✅                              |
| finally           |             |  keyword                            | ✅                              |
| for               |             |  keyword                            | ✅                              |
| function          |             |  keyword                            | ✅                              |
| get               | true        |  meta.binding.name variable         | ✅                              |
| if                |             |  keyword                            | ✅                              |
| implements        | true        |  meta.binding.name variable         | ✅                              |
| import            |             |  keyword                            | ✅                              |
| in                |             |  keyword                            | ✅                              |
| instanceof        |             |  keyword                            | ✅                              |
| interface         | true        |  meta.binding.name variable         | ✅                              |
| let               | true        |  meta.binding.name variable         | ✅                              |
| new               |             |  keyword                            | ✅                              |
| null              |             | -meta.binding.name constant         | ✅                              |
| package           | true        |  meta.binding.name variable         | ✅                              |
| private           | true        |  meta.binding.name variable         | ✅                              |
| protected         | true        |  meta.binding.name variable         | ✅                              |
| public            | true        |  meta.binding.name variable         | ✅                              |
| return            |             |  keyword                            | ✅                              |
| set               |             |  meta.binding.name variable         | ✅                              |
| static            | true        |  meta.binding.name variable         | ✅                              |
| super             |             | -meta.binding.name variable         | keyword | constant.language     |
| switch            |             |  keyword                            | ✅                              |
| this              |             | -meta.binding.name variable         | keyword | constant.language     |
| throw             |             |  keyword                            | ✅                              |
| true              |             | -meta.binding.name constant         | ✅                              |
| try               |             |  keyword                            | ✅                              |
| typeof            |             |  keyword                            | ✅                              |
| undefined         |             |  meta.binding.name constant         | meta.binding.name variable      |
| var               |             |  keyword                            | ✅                              |
| void              |             |  keyword                            | ✅                              |
| while             |             |  keyword                            | ✅                              |
| with              |             |  keyword                            | ✅                              |
| yield             | true        |  keyword                            | meta.binding.name variable      |