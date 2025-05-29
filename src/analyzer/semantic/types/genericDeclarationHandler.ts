import {GenericDeclaration} from "../../../parser/generated/parser";
import {Handler} from "../common/handler";
import {ParameterType} from "./parameterHandler";

export type GenericDeclarationType = {
    type: "Generic",
    typeArguments: ParameterType[]
}

export class GenericDeclarationHandler extends Handler {
    public value: GenericDeclarationType;
    private typeArgumentsHandler: Handler[] = [];

    protected get _children() {
        return [
            ...this.typeArgumentsHandler
        ];
    }

    public _handle(node: GenericDeclaration) {
        super._handle(node);
        const typeArguments = node.params;
        this.typeArgumentsHandler.length = 0;
        for (const typeArgument of typeArguments) {
            const handler = Handler.handle(typeArgument, this.context);
            this.typeArgumentsHandler.push(handler);
        }
        this.value = {
            type: "Generic",
            typeArguments: this.typeArgumentsHandler.map(handler => handler?.value),
        };
    }
}

Handler.registerHandler("GenericDeclaration", GenericDeclarationHandler);
