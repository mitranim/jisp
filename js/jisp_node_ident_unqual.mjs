import * as a from '/Users/m/code/m/js/all.mjs'
import * as jni from './jisp_node_ident.mjs'

/*
Short for "identifier unqualified". Represents a name that occurs all by itself,
without a preceding access operator. Our tokenizer uses this to represent
unqualified idents, which allows us to cleanly differentiate them from other
subclasses of `Ident`, such as those that represent qualified idents.
*/
export class IdentUnqual extends jni.Ident {
  static regexp() {return this.regexpIdentUnqual()}
  static {this.setReprModuleUrl(import.meta.url)}
}
