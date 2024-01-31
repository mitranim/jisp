export {
  globals,
  comment,
  use,
  import,
  declare,
  export,
  const,
  let,
  if,
  when,
  do,
  void,
  func,
  fn,
  class,
  throw,
  new,
  typeof,
  oftype,
  await,
  instof,
  in,
  is,
  isNil,
  isSome,
  spread,
  list,                        list                        as ':',
  dict,                        dict                        as '::',
  get,                         get                         as '<-',
  getOpt,                      getOpt                      as '<-?',
  set,                         set                         as '->',
  delete,
  and,                         and                         as '&&',
  assignAnd,                   assignAnd                   as '&&=',
  or,                          or                          as '||',
  assignOr,                    assignOr                    as '||=',
  coalesce,                    coalesce                    as '??',
  assignCoalesce,              assignCoalesce              as '??=',
  not,                         not                         as '!',
  yes,                         yes                         as '!!',
  eq,                          eq                          as '===',
  neq,                         neq                         as '!==',
  gt,                          gt                          as '>',
  lt,                          lt                          as '<',
  gte,                         gte                         as '>=',
  lte,                         lte                         as '<=',
  add,                         add                         as '+',
  assignAdd,                   assignAdd                   as '+=',
  subtract,                    subtract                    as '-',
  assignSubtract,              assignSubtract              as '-=',
  divide,                      divide                      as '/',
  assignDivide,                assignDivide                as '/=',
  multiply,                    multiply                    as '*',
  assignMultiply,              assignMultiply              as '*=',
  exponentiate,                exponentiate                as '**',
  assignExponentiate,          assignExponentiate          as '**=',
  remainder,                   remainder                   as '%',
  assignRemainder,             assignRemainder             as '%=',
  bitNot,                      bitNot                      as '~',
  bitAnd,                      bitAnd                      as '&',
  assignBitAnd,                assignBitAnd                as '&=',
  bitOr,                       bitOr                       as '|',
  assignBitOr,                 assignBitOr                 as '|=',
  bitXor,                      bitXor                      as '^',
  assignBitXor,                assignBitXor                as '^=',
  bitShiftLeft,                bitShiftLeft                as '<<',
  assignBitShiftLeft,          assignBitShiftLeft          as '<<=',
  bitShiftRight,               bitShiftRight               as '>>',
  assignBitShiftRight,         assignBitShiftRight         as '>>=',
  bitShiftRightUnsigned,       bitShiftRightUnsigned       as '>>>',
  assignBitShiftRightUnsigned, assignBitShiftRightUnsigned as '>>>=',
  assignIncrement,             assignIncrement             as '++',
  assignDecrement,             assignDecrement             as '--',
  regexp,
  while,
  pipe,
  private,
} from './mac.mjs'
