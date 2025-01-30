import { parse } from './generated/parser';
import * as AST from '../types/ast';

export class ZLangParser {
  static parse(code: string): AST.Program {
    try {
      return parse(code, {
        grammarSource: "zr.peggy",
        startRule: "start",
        parser: {
            location: true
        }
      }) as AST.Program;
    } catch (err) {
        if (err instanceof Error) {
            if(err.location){
                const { line, column } = err.location.start;
                throw new Error(`[语法错误] 行 ${line} 列 ${column}: ${err.message}\n${err.stack}`);
            }
            throw new Error(`[语法错误] ${err.message}\n${err.stack}`);
        }
      throw new Error("Unknown parsing error");
    }
  }

  static parseExpression(code: string): AST.Expression {
    return parse(code, {
      startRule: "Expression"
    }) as AST.Expression;
  }
}