import { ScriptContext } from "../common/scriptContext";
import fs from "fs";
export class ZrFileReader{
    context: ScriptContext;
    public constructor(context: ScriptContext){
        this.context = context;
    }

    public async read(): Promise<void>{
        const filePath = this.context.filePath;
        const encoding = this.context.encoding;
        const scriptText = await fs.promises.readFile(filePath, {encoding});
        this.context.scriptText = scriptText;
    }
}