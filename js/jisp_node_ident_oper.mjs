import * as a from '/Users/m/code/m/js/all.mjs'
import * as jni from './jisp_node_ident.mjs'

export class IdentOper extends jni.Ident {
  static regexp() {return /^[\^\~\!\@\%\&\*\?\/\|\:\=\+\-]+/}

  compile() {
    throw this.err(`unable to compile operator ${a.show(this)} with name ${a.show(this.optName())} to valid JS; operators are meant for compile-only use and should refer only to live values such as macros imported via "use"`)
  }
}
