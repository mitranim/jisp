import * as a from '/Users/m/code/m/js/all.mjs'

export class CodePrinter extends a.Emp {
  compile(src) {return a.laxStr(src.compile())}
  compileDense(src) {return this.joinInf(src, ``)}
  compileSpaced(src) {return this.joinInf(src, ` `)}
  compileCommaSingleLine(src) {return this.joinInf(src, `, `)}
  compileCommaMultiLine(src) {return this.joinInf(src, `,\n`)}
  compileParensCommaMultiLine(src) {return this.wrapMulti(this.compileCommaMultiLine(src), `(`, `)`)}
  compileStatements(src) {return this.joinSuf(src, `;\n`)}
  compileBracesStatementsMultiLine(src) {return this.wrapMulti(this.compileStatements(src), `{`, `}`)}
  joinInf(src, sep) {return this.fold(src, this.addInf, sep)}
  joinSuf(src, suf) {return this.fold(src, this.addSuf, suf)}

  fold(src, fun, arg) {
    a.reqIter(src)
    a.reqFun(fun)

    let acc = ``
    for (src of src) {
      if (!Node.isMeaningful(src)) continue

      const val = a.reqStr(this.compile(src))
      if (!val) continue

      acc = a.reqStr(fun.call(this, acc, val, arg))
    }
    return acc
  }

  addInf(acc, val, sep) {
    a.reqStr(sep)
    return a.reqStr(acc) + (acc ? sep : ``) + a.reqStr(val)
  }

  addSuf(acc, val, suf) {
    return a.reqStr(acc) + a.reqStr(val) + a.reqStr(suf)
  }

  wrapMulti(src, pre, suf) {
    a.reqStr(src)
    a.reqStr(pre)
    a.reqStr(suf)
    return src ? (pre + `\n` + src + `\n` + suf) : (pre + suf)
  }
}
