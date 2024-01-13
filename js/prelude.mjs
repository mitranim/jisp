export {
  Nil    as nil,
  Null   as null,
  No     as no,
  Ok     as ok,
  Nan    as nan,
  Inf    as inf,
  Global as global,
} from './jisp_predecl.mjs'

export {Import       as import}  from './jisp_node_import.mjs'
export {Export       as export}  from './jisp_node_export.mjs'
export {Const        as const}   from './jisp_node_const.mjs'
export {Let          as let}     from './jisp_node_let.mjs'
export {Block        as do}      from './jisp_node_block.mjs'
export {Func         as func}    from './jisp_node_func.mjs'
export {Class        as class}   from './jisp_node_class.mjs'
export {If           as if}      from './jisp_node_if.mjs'
export {Throw        as throw}   from './jisp_node_throw.mjs'
export {Ret          as ret}     from './jisp_node_ret.mjs'
export {New          as new}     from './jisp_node_new.mjs'
export {CommentMacro as comment} from './jisp_node_comment_macro.mjs'
export {Declare      as declare} from './jisp_node_declare.mjs'
export {List         as list}    from './jisp_node_list.mjs'
export {Dict         as dict}    from './jisp_node_dict.mjs'
export {Quote        as quote}   from './jisp_node_quoting.mjs'
export {Unquote      as unquote} from './jisp_node_quoting.mjs'

/*
Redundancies. TODO choose one style and dedup.

  `and`  <->  `ops.mjs`.`&&`
  `or`   <->  `ops.mjs`.`||`
  `not`  <->  `ops.mjs`.`!`
  `eq`   <->  `ops.mjs`.`===`
  `neq`  <->  `ops.mjs`.`!==`
*/
export {
  And        as and,
  Or         as or,
  Not        as not,
  Equal      as eq,
  NotEqual   as neq,
  In         as in,
  Typeof     as typeof,
  Instanceof as instanceof,
  Void       as void,
  Await      as await,
  IsNil      as isNil,
  IsSome     as isSome,
} from './jisp_keyword_exprs.mjs'
