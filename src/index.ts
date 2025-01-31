import { ScriptInfo } from "./common/scriptInfo";
import { ZrCompiler } from "./zrCompiler";
function main(){
    const info: ScriptInfo = {
        compilingDirectory: process.cwd(),
        fileRelativePath: process.argv[2],
        encoding: "utf-8"
    };
    const compiler = new ZrCompiler(info);
    compiler.compile();
    
}
main();
