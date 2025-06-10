import {MemberAccess} from "../../../parser/generated/parser";
import {Handler} from "../common/handler";
import type {IdentifierType} from "../declarations/identifierHandler";
import {TExpression, TNullable} from "../../utils/zrCompilerTypes";
import {Keywords} from "../../../types/keywords";
import type {ExpressionType} from "./types";


export type MemberAccessType = {
    type: Keywords.MemberExpression,
    property: IdentifierType | ExpressionType,
    computed: boolean,
}

export class MemberAccessHandler extends Handler {
    public value: MemberAccessType;
    private propertyHandler: TNullable<Handler> = null;

    protected get _children() {
        return [
            this.propertyHandler
        ];
    }

    _handle(node: TExpression<MemberAccess, "MemberExpression">) {
        super._handle(node);
        const computed = node.computed;
        if (computed) {
            this.propertyHandler = Handler.handle(node.property, this.context);
        } else {
            this.propertyHandler = null;
        }

        this.value = {
            type: Keywords.MemberExpression,
            property: this.propertyHandler?.value,
            computed
        };
    }
}

Handler.registerHandler(Keywords.MemberExpression, MemberAccessHandler);
