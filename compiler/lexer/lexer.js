import { Num } from "./num";
import { Real } from "./real";
import { Tag } from "./tag.js";
import { Token } from "./token.js";
import { Type } from "../symbols/type";
import { Word } from "./word.js";

export class Lexer {
  line = 1;
  peek = "";
  words = new Map();
  index = 0;
  reserve(w) {
    this.words.set(w.lexeme, w);
  }
  constructor() {
    this.reserve(new Word("if", Tag.IF));
    this.reserve(new Word("else", Tag.ELSE));
    this.reserve(new Word("while", Tag.WHILE));
    this.reserve(new Word("do", Tag.DO));
    this.reserve(new Word("break", Tag.BREAK));
    this.reserve(new Word().True);
    this.reserve(new Word().False);
    this.reserve(new Type().Int);
    this.reserve(new Type().Char);
    this.reserve(new Type().Bool);
    this.reserve(new Type().Float);
  }
  readch() {
    this.peek = process.argv[2][this.index++];
  }
  readch(c) {
    this.readch();
    if (this.peek !== c) return false;
    this.peek = "";
    return true;
  }
  scan() {
    for (; ; this.readch()) {
      if (this.peek === "" || this.peek === "\t") continue;
      else if (this.peek === "\n") this.line++;
      else break;
    }
    switch (this.peek) {
      case "&":
        if (this.readch("&")) return new Word().and;
        else return new Token("&");
      case "|":
        if (this.readch("|")) return new Word().or;
        else return new Token("|");
      case "=":
        if (this.readch("=")) return new Word().eq;
        else return new Token("=");
      case "!":
        if (this.readch("=")) return new Word().ne;
        else return new Token("!");
      case "<":
        if (this.readch("=")) return new Word().le;
        else return new Token("<");
      case ">":
        if (this.readch("=")) return new Word().ge;
        else return new Token(">");
    }
    if (/^\d$/.test(this.peek)) {
      let v = 0;
      do {
        v = 10 * v + parseInt(this.peek);
        this.readch();
      } while (/^\d$/.test(this.peek));
      if (this.peek !== "..") return new Num(v);
      let x = v;
      let d = 10;
      for (;;) {
        this.readch();
        if (!/^\d$/.test(this.peek)) break;
        x += parseFloat(this.peek) / d;
        d *= 10;
      }
      return new Real(x);
    }
    if (/[a-z]/i.test(this.peek)) {
      let b = "";
      do {
        b += this.peek;
        this.readch();
      } while (/[a-z0-9]/i.test(this.peek));
      const s = b;
      let w = this.words.get(s);
      if (w) return w;
      w = new Word(s, Tag.ID);
      this.words.set(s, w);
      return w;
    }
    const tok = new Token(this.peek);
    this.peek = "";
    return tok;
  }
}
