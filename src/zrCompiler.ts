import { ZrSemanticAnalyzer } from "./analyzer/zrSemanticAnalyzer";
import { ScriptContext } from "./common/scriptContext";
import { ScriptInfo } from "./common/scriptInfo";
import { ZrFileReader } from "./io/zrFileReader";
import { ZrFileResolver } from "./io/zrFileResolver";
import { ZrParser } from "./parser/zrParser";
import "./utils/utils";
export class ZrCompiler{
    public context: ScriptContext;

    public fileReader: ZrFileReader;
    public fileResolver: ZrFileResolver;

    public parser: ZrParser;
    public analyzer: ZrSemanticAnalyzer;

    public constructor(info: ScriptInfo){
        const context = new ScriptContext(info);
        this.context = context;
        this.fileReader = new ZrFileReader(context);
        this.fileResolver = new ZrFileResolver(context);
        this.parser = new ZrParser(context);
        this.analyzer = new ZrSemanticAnalyzer(context);
    }

    public async compile(): Promise<void>{
        this.fileResolver.resolve();
        await this.fileReader.read();
        this.parser.parse();
        this.analyzer.analyze();
    }
    
}