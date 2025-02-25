import { EnumDeclaration } from "../../../../parser/generated/parser";
import type { EnumScope } from "../../../static/scope/enumScope";
import type { ModuleScope } from "../../../static/scope/moduleScope";
import type { EnumSymbol } from "../../../static/symbol/enumSymbol";
import { Handler } from "../../common/handler";
import type { AllType } from "../../types/types";
import type { IdentifierType } from "../identifierHandler";
import type { EnumMemberType } from "./memberHandler";

export type EnumType = {
    type: "Enum",
    name: IdentifierType,
    members: EnumMemberType[],
    baseType: AllType
}

export class EnumDeclarationHandler extends Handler{
    public value: EnumType;
    private baseTypeHandler: Handler | null = null;
    private membersHandler: Handler[] = [];
    private nameHandler: Handler | null = null;

    private _symbol: EnumSymbol | null = null;

    public _handle(node: EnumDeclaration) {
        super._handle(node);
        const name = node.name;
        this.nameHandler = Handler.handle(name, this.context);
        const members = node.members;
        const baseType = node.baseType;
        if(baseType){
            this.baseTypeHandler = Handler.handle(baseType, this.context);
        }else{
            this.baseTypeHandler = null;
        }
        this.membersHandler.length = 0;
        for(const member of members){
            const handler = Handler.handle(member, this.context);
            this.membersHandler.push(handler);
        }
        this.value = {
            type: "Enum",
            name: this.nameHandler?.value,
            members: this.membersHandler.map(handler=>handler?.value),
            baseType: this.baseTypeHandler?.value
        };
    }

    protected _collectDeclarations() {
        const enumName = this.value.name.name;
        const symbol = this.context.declare<EnumSymbol>(enumName, "Enum");

        const scope = this.pushScope<EnumScope>("Enum");
        scope.enumInfo = symbol;
        symbol.table = scope;
        for(const member of this.value.members){
            const handler = Handler.getHandler(member);
            scope.addMember(handler?.collectDeclarations());
        }
        this.popScope();
        this._symbol = symbol;
        return symbol;
    }
}

Handler.registerHandler("EnumDeclaration", EnumDeclarationHandler);