import { ModuleDeclaration } from "../../parser/generated/parser";
import { Handler } from "./common/handler";

export class ModuleDeclarationHandler extends Handler{
    private name: string = "";
    private nameHandler: Handler | null = null;
    public handle(node: ModuleDeclaration){
        super.handle(node);
        const name = node.name;
        if(typeof name === "string"){
            this.name = name;
        }else{
            const nameHandler = Handler.handle(name, this.context);
            this.nameHandler = nameHandler;
        }
    }
}

Handler.registerHandler("ModuleDeclaration", ModuleDeclarationHandler);