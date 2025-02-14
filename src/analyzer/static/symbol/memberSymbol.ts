import type { Access } from "../../../types/access";
import { VariableSymbol } from "./variableSymbol";

export class MemberSymbol extends VariableSymbol{
    public readonly type:string = "member";

    public accessibility: Access;
    public isStatic: boolean;

}