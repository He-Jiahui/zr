import { ScriptContext } from "../common/scriptContext";
import path from "path";
export class ZrFileResolver{
    context: ScriptContext;
    public constructor(context: ScriptContext){
        this.context = context;
    }

    public resolve(): void{
        const compilingDirectory = this.context.compilingDirectory;
        const fileRelativePath = this.context.fileRelativePath;

        const fullPath = path.join(compilingDirectory, fileRelativePath);
        this.context.filePath = path.resolve(fullPath);
        this.context.fileName = path.basename(fullPath);

    }
}