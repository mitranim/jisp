/*
TODO: when this is appended to a node list, splice this in.
Should be used only for splicing, not stored in the AST.
*/
export class NodeListFrag extends NodeList {
  static moduleUrl = import.meta.url
}
