export {Import       as import}  from './jisp_node_import.mjs'
export {Export       as export}  from './jisp_node_export.mjs'
export {Const        as const}   from './jisp_node_const.mjs'
export {Let          as let}     from './jisp_node_let.mjs'
export {Block        as do}      from './jisp_node_block.mjs'
export {Func         as func}    from './jisp_node_func.mjs'
export {Class        as class}   from './jisp_node_class.mjs'
export {If           as if}      from './jisp_node_if.mjs'
export {Throw        as throw}   from './jisp_node_throw.mjs'
export {New          as new}     from './jisp_node_new.mjs'
export {CommentMacro as comment} from './jisp_node_comment_macro.mjs'
export {Declare      as declare} from './jisp_node_declare.mjs'
export {Arr          as array}   from './jisp_node_arr.mjs'

/*
Redundancies. TODO choose one style and dedup.

  `eq`   <->  `ops.mjs`.`===`
  `neq`  <->  `ops.mjs`.`!==`
  `and`  <->  `ops.mjs`.`&&`
  `or`   <->  `ops.mjs`.`||`
*/
export {
  Equal      as eq,
  NotEqual   as neq,
  And        as and,
  Or         as or,
  In         as in,
  Typeof     as typeof,
  Instanceof as instanceof,
  Void       as void,
  Await      as await,
  IsNil      as isNil,
  IsSome     as isSome,
} from './jisp_keyword_exprs.mjs'
