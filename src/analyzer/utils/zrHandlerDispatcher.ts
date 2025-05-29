import {Handler} from "../semantic/common/handler";
import {TMaybeArray, TNullable} from "./zrCompilerTypes";

export class ZrHandlerDispatcher {
    private readonly topLevelHandler: Handler;

    public constructor(topLevelHandler: Handler) {
        this.topLevelHandler = topLevelHandler;
    }

    public runTaskTopDown<T>(predicate: (handler: Handler, upperResult: TNullable<T>) => TNullable<T>): TNullable<T> {
        return this._runTaskTopDownImpl(this.topLevelHandler, null, predicate);
    }

    public runTaskBottomUp<T>(predicate: (handler: Handler, lowerResult: TNullable<TMaybeArray<T>>) => TNullable<TMaybeArray<T>>): TNullable<TMaybeArray<T>> {
        return this._runTaskBottomUpImpl(this.topLevelHandler, predicate);
    }

    public runTaskAround<TTopDown, TBottomUp>(
        topDownPredicate: (handler: Handler, upperResult: TNullable<TTopDown>) => TNullable<TTopDown>,
        bottomUpPredicate: (handler: Handler, lowerResult: Array<TBottomUp>, selfTopDownResult: TNullable<TTopDown>) => TNullable<TMaybeArray<TBottomUp>>): TNullable<TMaybeArray<TBottomUp>> {
        return this._runTaskAroundImpl(this.topLevelHandler, null, topDownPredicate, bottomUpPredicate);
    }

    private _runTaskTopDownImpl<T>(handler: Handler, upperResult: TNullable<T>, predicate: (handler: Handler, upperResult: TNullable<T>) => TNullable<T>): TNullable<T> {
        const children = handler.children;
        const result = predicate(handler, upperResult);
        for (const child of children) {
            // broadcast to children the parent or upper result
            this._runTaskTopDownImpl(child, result ?? upperResult, predicate);
        }
        return result;
    }

    private _runTaskBottomUpImpl<T>(handler: Handler, predicate: (handler: Handler, lowerResult: TNullable<TMaybeArray<T>>) => TNullable<TMaybeArray<T>>): TNullable<TMaybeArray<T>> {
        const children = handler.children;
        const bottomUpResult = [];
        for (const child of children) {
            const result = this._runTaskBottomUpImpl(child, predicate);
            if (result instanceof Array) {
                bottomUpResult.push(...result);
            } else if (result) {
                bottomUpResult.push(result);
            }
        }
        // feedback to parent the children's result or lower result
        return predicate(handler, bottomUpResult) ?? bottomUpResult;
    }

    private _runTaskAroundImpl<TTopDown, TBottomUp>(handler: Handler, upperResult: TNullable<TTopDown>,
                                                    topDownPredicate: (handler: Handler, upperResult: TNullable<TTopDown>) => TNullable<TTopDown>,
                                                    bottomUpPredicate: (handler: Handler, lowerResult: Array<TBottomUp>, selfTopDownResult: TNullable<TTopDown>) => TNullable<TMaybeArray<TBottomUp>>
    ): TNullable<TMaybeArray<TBottomUp>> {
        const children = handler.children;
        const thisResult = topDownPredicate(handler, upperResult);
        const bottomUpResult = [];
        for (const child of children) {
            const result = this._runTaskAroundImpl(child, thisResult ?? upperResult, topDownPredicate, bottomUpPredicate);
            if (result instanceof Array) {
                bottomUpResult.push(...result);
            } else if (result) {
                bottomUpResult.push(result);
            }
        }
        return bottomUpPredicate(handler, bottomUpResult, thisResult) ?? bottomUpResult;
    }
}
