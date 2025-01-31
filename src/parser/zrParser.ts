import { ScriptContext } from "../common/scriptContext";
import { ZrParserError } from "../errors/zrParserError";
import { ZrSyntaxError } from "../errors/zrSyntaxError";
import { PeggySyntaxError, Start, parse } from "./generated/parser";

export class ZrParser{
    private context: ScriptContext;
    private cachedAst: Start;
    public constructor(context: ScriptContext){
        this.context = context;
    }

    public parse(): void{
        try{
            const ast = parse(this.context.scriptText,{
                grammarSource: "zr.peggy",
                startRule: "start",
                parser: {
                    location: true
                },
                filename: this.context.fileName
            });
            this.cachedAst = ast;
            this.context.ast = ast;
        }catch (err){
            if(err instanceof Error){
                if(err instanceof PeggySyntaxError){
                    this.context.syntaxErrorRange = err.location;
                }
                new ZrSyntaxError(this.context, err.message).report();
            }
            new ZrParserError(this.context, err as any).report();
        }
    }
}