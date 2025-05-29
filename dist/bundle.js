/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/analyzer/semantic/common/handler.ts":
/*!*************************************************!*\
  !*** ./src/analyzer/semantic/common/handler.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Handler = void 0;
const noHandlerError_1 = __webpack_require__(/*! ../../../errors/noHandlerError */ "./src/errors/noHandlerError.ts");
const scope_1 = __webpack_require__(/*! ../../static/scope/scope */ "./src/analyzer/static/scope/scope.ts");
const symbol_1 = __webpack_require__(/*! ../../static/symbol/symbol */ "./src/analyzer/static/symbol/symbol.ts");
class Handler {
    constructor(context) {
        this.context = context;
    }
    get children() {
        return this._children.filter(child => child !== null).map(child => child);
    }
    get _children() {
        return [];
    }
    static registerHandler(nodeType, handler) {
        Handler.handlers.set(nodeType, handler);
    }
    static handle(node, context) {
        const handler = Handler.handlers.get(node.type);
        if (!handler) {
            new noHandlerError_1.NoHandlerError(node.type, context).report();
            return null;
        }
        const h = new handler(context);
        h.handleInternal(node);
        Handler.semanticHandlerMap.set(h.value, h);
        return h;
    }
    static getHandler(semanticType) {
        if (!semanticType) {
            return null;
        }
        if (Handler.semanticHandlerMap.has(semanticType)) {
            return Handler.semanticHandlerMap.get(semanticType);
        }
        else {
            return null;
        }
    }
    handleInternal(node) {
        // clear previous value
        this.value = null;
        // set location
        const { location } = node;
        this.location = location;
        this.context.location = location;
        this.context.pushHandler(this);
        this._handle(node);
        this.context.popHandler();
    }
    createSymbolAndScope(parentScope) {
        return this._createSymbolAndScope(parentScope);
    }
    collectDeclarations(childrenSymbols, currentScope) {
        this.context.pushHandler(this);
        const declarationSymbols = this._collectDeclarations(childrenSymbols, currentScope);
        this.context.popHandler();
        return declarationSymbols;
    }
    // handles node
    _handle(node) {
    }
    _createSymbolAndScope(parentScope) {
        return null;
    }
    // collects
    _collectDeclarations(childrenSymbols, currentScope) {
        return null;
    }
    declareSymbol(symbolName, symbolType, parentScope) {
        const createdSymbol = symbol_1.Symbol.createSymbol(symbolName, symbolType, this, parentScope);
        this._symbol = createdSymbol;
        const createdScope = scope_1.Scope.createScope(symbolType, parentScope, createdSymbol);
        if (createdSymbol) {
            createdSymbol.childScope = createdScope;
        }
        return createdSymbol;
    }
}
exports.Handler = Handler;
Handler.handlers = new Map();
Handler.semanticHandlerMap = new Map();


/***/ }),

/***/ "./src/analyzer/semantic/common/index.ts":
/*!***********************************************!*\
  !*** ./src/analyzer/semantic/common/index.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
__webpack_require__(/*! ./handler */ "./src/analyzer/semantic/common/handler.ts");


/***/ }),

/***/ "./src/analyzer/semantic/declarations/class/classHandler.ts":
/*!******************************************************************!*\
  !*** ./src/analyzer/semantic/declarations/class/classHandler.ts ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ClassDeclarationHandler = void 0;
const handler_1 = __webpack_require__(/*! ../../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class ClassDeclarationHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.membersHandler = [];
        this.inheritsHandler = [];
        this.decoratorsHandler = [];
        this.genericHandler = null;
        this.nameHandler = null;
    }
    get _children() {
        return [
            this.nameHandler,
            ...this.inheritsHandler,
            ...this.decoratorsHandler,
            ...this.membersHandler
        ];
    }
    _handle(node) {
        var _a, _b;
        super._handle(node);
        const members = node.members;
        this.membersHandler.length = 0;
        this.inheritsHandler.length = 0;
        this.decoratorsHandler.length = 0;
        this.nameHandler = handler_1.Handler.handle(node.name, this.context);
        if (node.inherits) {
            for (const inherit of node.inherits) {
                const handler = handler_1.Handler.handle(inherit, this.context);
                this.inheritsHandler.push(handler);
            }
        }
        if (node.decorator) {
            for (const decorator of node.decorator) {
                const handler = handler_1.Handler.handle(decorator, this.context);
                this.decoratorsHandler.push(handler);
            }
        }
        if (node.generic) {
            this.genericHandler = handler_1.Handler.handle(node.generic, this.context);
        }
        else {
            this.genericHandler = null;
        }
        const fields = [];
        const methods = [];
        const metaFunctions = [];
        const properties = [];
        for (const member of members) {
            const handler = handler_1.Handler.handle(member, this.context);
            this.membersHandler.push(handler);
            const value = handler === null || handler === void 0 ? void 0 : handler.value;
            if (!value) {
                continue;
            }
            switch (value.type) {
                case "ClassField":
                    {
                        fields.push(value);
                    }
                    break;
                case "ClassMethod":
                    {
                        methods.push(value);
                    }
                    break;
                case "ClassMetaFunction":
                    {
                        metaFunctions.push(value);
                    }
                    break;
                case "ClassProperty":
                    {
                        properties.push(value);
                    }
                    break;
            }
        }
        this.value = {
            type: "Class",
            name: (_a = this.nameHandler) === null || _a === void 0 ? void 0 : _a.value,
            inherits: this.inheritsHandler.map(handler => handler === null || handler === void 0 ? void 0 : handler.value),
            decorators: this.decoratorsHandler.map(handler => handler === null || handler === void 0 ? void 0 : handler.value),
            generic: (_b = this.genericHandler) === null || _b === void 0 ? void 0 : _b.value,
            fields,
            methods,
            metaFunctions,
            properties,
        };
    }
    _createSymbolAndScope(parentScope) {
        const className = this.value.name.name;
        const symbol = this.declareSymbol(className, "Class", parentScope);
        // we can not decide super class
        return symbol;
    }
    _collectDeclarations(childrenSymbols, currentScope) {
        if (!currentScope) {
            return null;
        }
        const scope = currentScope;
        for (const child of childrenSymbols) {
            switch (child.type) {
                case "generic":
                    {
                        scope.addGeneric(child);
                    }
                    break;
                case "field":
                    {
                        scope.addField(child);
                    }
                    break;
                case "function":
                    {
                        scope.addMethod(child);
                    }
                    break;
                case "meta":
                    {
                        scope.addMetaFunction(child);
                    }
                    break;
                case "property":
                    {
                        scope.addProperty(child);
                    }
                    break;
            }
        }
        return currentScope.ownerSymbol;
    }
}
exports.ClassDeclarationHandler = ClassDeclarationHandler;
handler_1.Handler.registerHandler("ClassDeclaration", ClassDeclarationHandler);


/***/ }),

/***/ "./src/analyzer/semantic/declarations/class/fieldHandler.ts":
/*!******************************************************************!*\
  !*** ./src/analyzer/semantic/declarations/class/fieldHandler.ts ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FieldHandler = void 0;
const handler_1 = __webpack_require__(/*! ../../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class FieldHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.nameHandler = null;
        this.typeInfoHandler = null;
        this.initHandler = null;
        this.decoratorsHandlers = [];
    }
    get _children() {
        return [
            this.nameHandler,
            this.typeInfoHandler,
            this.initHandler,
            ...this.decoratorsHandlers
        ];
    }
    _handle(node) {
        var _a, _b, _c;
        super._handle(node);
        if (node.typeInfo) {
            const typeInfoHandler = handler_1.Handler.handle(node.typeInfo, this.context);
            this.typeInfoHandler = typeInfoHandler;
        }
        else {
            this.typeInfoHandler = null;
        }
        if (node.init) {
            const initHandler = handler_1.Handler.handle(node.init, this.context);
            this.initHandler = initHandler;
        }
        else {
            this.initHandler = null;
        }
        this.decoratorsHandlers.length = 0;
        if (node.decorator) {
            for (const decorator of node.decorator) {
                const decoratorHandler = handler_1.Handler.handle(decorator, this.context);
                this.decoratorsHandlers.push(decoratorHandler);
            }
        }
        this.nameHandler = handler_1.Handler.handle(node.name, this.context);
        this.value = {
            type: "ClassField",
            access: node.access,
            static: !!node.static,
            name: (_a = this.nameHandler) === null || _a === void 0 ? void 0 : _a.value,
            typeInfo: (_b = this.typeInfoHandler) === null || _b === void 0 ? void 0 : _b.value,
            init: (_c = this.initHandler) === null || _c === void 0 ? void 0 : _c.value,
            decorators: this.decoratorsHandlers.map(handler => handler === null || handler === void 0 ? void 0 : handler.value),
        };
    }
    _createSymbolAndScope(parentScope) {
        const name = this.value.name.name;
        const symbol = this.declareSymbol(name, "Field", parentScope);
        if (!symbol) {
            return null;
        }
        symbol.accessibility = this.value.access;
        symbol.isStatic = this.value.static;
        return symbol;
    }
}
exports.FieldHandler = FieldHandler;
handler_1.Handler.registerHandler("ClassField", FieldHandler);


/***/ }),

/***/ "./src/analyzer/semantic/declarations/class/index.ts":
/*!***********************************************************!*\
  !*** ./src/analyzer/semantic/declarations/class/index.ts ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
__webpack_require__(/*! ./fieldHandler */ "./src/analyzer/semantic/declarations/class/fieldHandler.ts");
__webpack_require__(/*! ./propertyHandler */ "./src/analyzer/semantic/declarations/class/propertyHandler.ts");
__webpack_require__(/*! ./methodHandler */ "./src/analyzer/semantic/declarations/class/methodHandler.ts");
__webpack_require__(/*! ./metaFunctionHandler */ "./src/analyzer/semantic/declarations/class/metaFunctionHandler.ts");
__webpack_require__(/*! ./classHandler */ "./src/analyzer/semantic/declarations/class/classHandler.ts");


/***/ }),

/***/ "./src/analyzer/semantic/declarations/class/metaFunctionHandler.ts":
/*!*************************************************************************!*\
  !*** ./src/analyzer/semantic/declarations/class/metaFunctionHandler.ts ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MetaFunctionHandler = void 0;
const handler_1 = __webpack_require__(/*! ../../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class MetaFunctionHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.metaHandler = null;
        this.parameterHandlers = [];
        this.argsHandler = null;
        this.bodyHandler = null;
        this.superHandlers = [];
    }
    get _children() {
        return [
            this.metaHandler,
            ...this.parameterHandlers,
            this.argsHandler,
            this.bodyHandler,
            ...this.superHandlers
        ];
    }
    _handle(node) {
        var _a, _b, _c;
        super._handle(node);
        if (node.meta) {
            const metaHandler = handler_1.Handler.handle(node.meta, this.context);
            this.metaHandler = metaHandler;
        }
        else {
            this.metaHandler = null;
        }
        this.superHandlers.length = 0;
        if (node.superArgs) {
            for (const superNode of node.superArgs) {
                const handler = handler_1.Handler.handle(superNode, this.context);
                this.superHandlers.push(handler);
            }
        }
        const parameters = node.params;
        const body = node.body;
        this.parameterHandlers.length = 0;
        for (const parameter of parameters) {
            const handler = handler_1.Handler.handle(parameter, this.context);
            this.parameterHandlers.push(handler);
        }
        if (node.args) {
            const argsHandler = handler_1.Handler.handle(node.args, this.context);
            this.argsHandler = argsHandler;
        }
        else {
            this.argsHandler = null;
        }
        if (body) {
            this.bodyHandler = handler_1.Handler.handle(body, this.context);
        }
        else {
            this.bodyHandler = null;
        }
        this.value = {
            type: "ClassMetaFunction",
            access: node.access,
            static: !!node.static,
            meta: (_a = this.metaHandler) === null || _a === void 0 ? void 0 : _a.value,
            super: this.superHandlers.map(handler => handler === null || handler === void 0 ? void 0 : handler.value),
            parameters: this.parameterHandlers.map(handler => handler === null || handler === void 0 ? void 0 : handler.value),
            args: (_b = this.argsHandler) === null || _b === void 0 ? void 0 : _b.value,
            body: (_c = this.bodyHandler) === null || _c === void 0 ? void 0 : _c.value,
        };
    }
    _createSymbolAndScope(parentScope) {
        const metaType = this.value.meta.name.name;
        const metaName = "@" + metaType;
        const symbol = this.declareSymbol(metaName, "Meta", parentScope);
        if (symbol) {
            symbol.metaType = metaType;
            symbol.accessibility = this.value.access;
            symbol.isStatic = this.value.static;
        }
        return symbol;
    }
    _collectDeclarations(childrenSymbols, currentScope) {
        if (!currentScope) {
            return null;
        }
        const scope = currentScope;
        for (const child of childrenSymbols) {
            switch (child.type) {
                case "parameter":
                    {
                        scope.addParameter(child);
                    }
                    break;
                case "block":
                    {
                        scope.setBody(child);
                    }
                    break;
            }
        }
        return currentScope.ownerSymbol;
    }
}
exports.MetaFunctionHandler = MetaFunctionHandler;
handler_1.Handler.registerHandler("ClassMetaFunction", MetaFunctionHandler);


/***/ }),

/***/ "./src/analyzer/semantic/declarations/class/methodHandler.ts":
/*!*******************************************************************!*\
  !*** ./src/analyzer/semantic/declarations/class/methodHandler.ts ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MethodHandler = void 0;
const handler_1 = __webpack_require__(/*! ../../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class MethodHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.nameHandler = null;
        this.decoratorHandlers = [];
        this.returnTypeHandler = null;
        this.parameterHandlers = [];
        this.argsHandler = null;
        this.genericHandler = null;
        this.bodyHandler = null;
    }
    get _children() {
        return [
            this.nameHandler,
            ...this.decoratorHandlers,
            this.returnTypeHandler,
            ...this.parameterHandlers,
            this.argsHandler,
            this.genericHandler,
            this.bodyHandler
        ];
    }
    _handle(node) {
        var _a, _b, _c, _d, _e;
        super._handle(node);
        const access = node.access;
        this.nameHandler = handler_1.Handler.handle(node.name, this.context);
        if (node.generic) {
            this.genericHandler = handler_1.Handler.handle(node.generic, this.context);
        }
        else {
            this.genericHandler = null;
        }
        if (node.returnType) {
            this.returnTypeHandler = handler_1.Handler.handle(node.returnType, this.context);
        }
        else {
            this.returnTypeHandler = null;
        }
        const parameters = node.params;
        const decorators = node.decorator;
        const body = node.body;
        this.parameterHandlers.length = 0;
        this.decoratorHandlers.length = 0;
        for (const parameter of parameters) {
            const handler = handler_1.Handler.handle(parameter, this.context);
            this.parameterHandlers.push(handler);
        }
        if (node.args) {
            this.argsHandler = handler_1.Handler.handle(node.args, this.context);
        }
        else {
            this.argsHandler = null;
        }
        for (const decorator of decorators) {
            const handler = handler_1.Handler.handle(decorator, this.context);
            this.decoratorHandlers.push(handler);
        }
        if (body) {
            this.bodyHandler = handler_1.Handler.handle(body, this.context);
        }
        else {
            this.bodyHandler = null;
        }
        this.value = {
            type: "ClassMethod",
            access: access,
            static: !!node.static,
            name: (_a = this.nameHandler) === null || _a === void 0 ? void 0 : _a.value,
            returnType: (_b = this.returnTypeHandler) === null || _b === void 0 ? void 0 : _b.value,
            parameters: this.parameterHandlers.map(handler => handler === null || handler === void 0 ? void 0 : handler.value),
            args: (_c = this.argsHandler) === null || _c === void 0 ? void 0 : _c.value,
            generic: (_d = this.genericHandler) === null || _d === void 0 ? void 0 : _d.value,
            decorators: this.decoratorHandlers.map(handler => handler === null || handler === void 0 ? void 0 : handler.value),
            body: (_e = this.bodyHandler) === null || _e === void 0 ? void 0 : _e.value
        };
    }
    _createSymbolAndScope(parentScope) {
        const funcName = this.value.name.name;
        const symbol = this.declareSymbol(funcName, "Function", parentScope);
        if (!symbol) {
            return null;
        }
        symbol.isStatic = this.value.static;
        symbol.accessibility = this.value.access;
        return symbol;
    }
    _collectDeclarations(childrenSymbols, currentScope) {
        if (!currentScope) {
            return null;
        }
        const scope = currentScope;
        for (const child of childrenSymbols) {
            switch (child.type) {
                case "generic":
                    {
                        scope.addGeneric(child);
                    }
                    break;
                case "parameter":
                    {
                        scope.addParameter(child);
                    }
                    break;
                case "block":
                    {
                        scope.setBody(child);
                    }
                    break;
            }
        }
        return scope.ownerSymbol;
    }
}
exports.MethodHandler = MethodHandler;
handler_1.Handler.registerHandler("ClassMethod", MethodHandler);


/***/ }),

/***/ "./src/analyzer/semantic/declarations/class/propertyHandler.ts":
/*!*********************************************************************!*\
  !*** ./src/analyzer/semantic/declarations/class/propertyHandler.ts ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PropertyHandler = void 0;
const handler_1 = __webpack_require__(/*! ../../common/handler */ "./src/analyzer/semantic/common/handler.ts");
const access_1 = __webpack_require__(/*! ../../../../types/access */ "./src/types/access.ts");
class PropertyHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.decoratorHandlers = [];
        this.targetTypeHandler = null;
        this.bodyHandler = null;
        this.nameHandler = null;
        this.paramHandler = null;
    }
    get _children() {
        return [
            this.nameHandler,
            this.targetTypeHandler,
            ...this.decoratorHandlers,
            this.paramHandler,
            this.bodyHandler
        ];
    }
    _handle(node) {
        var _a, _b, _c, _d;
        super._handle(node);
        const access = node.access;
        const modifier = node.modifier;
        const name = modifier.name;
        const kind = modifier.kind;
        this.nameHandler = handler_1.Handler.handle(name, this.context);
        if (modifier.targetType) {
            this.targetTypeHandler = handler_1.Handler.handle(modifier.targetType, this.context);
        }
        else {
            this.targetTypeHandler = null;
        }
        const decorators = node.decorator;
        const body = modifier.body;
        const param = modifier.param;
        if (param) {
            this.paramHandler = handler_1.Handler.handle(param, this.context);
        }
        else {
            this.paramHandler = null;
        }
        this.decoratorHandlers.length = 0;
        for (const decorator of decorators) {
            const handler = handler_1.Handler.handle(decorator, this.context);
            this.decoratorHandlers.push(handler);
        }
        if (body) {
            this.bodyHandler = handler_1.Handler.handle(body, this.context);
        }
        else {
            this.bodyHandler = null;
        }
        this.value = {
            type: "ClassProperty",
            access: access,
            static: !!node.static,
            name: (_a = this.nameHandler) === null || _a === void 0 ? void 0 : _a.value,
            param: (_b = this.paramHandler) === null || _b === void 0 ? void 0 : _b.value,
            propertyType: kind,
            targetType: (_c = this.targetTypeHandler) === null || _c === void 0 ? void 0 : _c.value,
            decorators: this.decoratorHandlers.map(handler => handler === null || handler === void 0 ? void 0 : handler.value),
            body: (_d = this.bodyHandler) === null || _d === void 0 ? void 0 : _d.value
        };
    }
    _createSymbolAndScope(parentScope) {
        const propertyName = this.value.name.name;
        const symbol = this.declareSymbol(propertyName, "Property", parentScope);
        if (!symbol) {
            return null;
        }
        symbol.accessibility = this.value.access;
        symbol.isStatic = this.value.static;
        const propertyType = this.value.propertyType;
        symbol.propertyType = propertyType;
        const isGetter = propertyType === access_1.PropertyType.GET;
        let functionSymbol;
        const scope = symbol.childScope;
        if (isGetter) {
            const getterSymbol = this.declareSymbol(propertyName + "$Get", "Function", symbol.childScope);
            scope.setGetter(getterSymbol);
            functionSymbol = getterSymbol;
        }
        else {
            const setterSymbol = this.declareSymbol(propertyName + "$Set", "Function", symbol.childScope);
            scope.setSetter(setterSymbol);
            functionSymbol = setterSymbol;
        }
        if (!functionSymbol) {
            return symbol;
        }
        if (!isGetter) {
            // add parameter
            const parameterSymbol = this.declareSymbol(this.value.param.name, "Parameter", functionSymbol.childScope);
            // TODO parameterSymbol type should be determined by the propertyType
            const functionScope = functionSymbol.childScope;
            if (functionScope) {
                functionScope.addParameter(parameterSymbol);
            }
        }
        else {
            // TODO: add return type for getter
        }
        return symbol;
    }
    _collectDeclarations(childrenSymbols, currentScope) {
        if (!currentScope) {
            return null;
        }
        const propertyType = this.value.propertyType;
        const isGetter = propertyType === access_1.PropertyType.GET;
        const scope = currentScope;
        const functionSymbol = isGetter ? scope.getterSymbol : scope.setterSymbol;
        if (!functionSymbol) {
            return null;
        }
        const functionScope = functionSymbol.childScope;
        if (!functionScope) {
            return null;
        }
        for (const child of childrenSymbols) {
            switch (child.type) {
                case "parameter":
                    {
                        functionScope.addParameter(child);
                    }
                    break;
                case "block":
                    {
                        functionScope.setBody(child);
                    }
                    break;
            }
        }
        return scope.ownerSymbol;
    }
}
exports.PropertyHandler = PropertyHandler;
handler_1.Handler.registerHandler("ClassProperty", PropertyHandler);


/***/ }),

/***/ "./src/analyzer/semantic/declarations/enum/enumHandler.ts":
/*!****************************************************************!*\
  !*** ./src/analyzer/semantic/declarations/enum/enumHandler.ts ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EnumDeclarationHandler = void 0;
const handler_1 = __webpack_require__(/*! ../../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class EnumDeclarationHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.baseTypeHandler = null;
        this.membersHandler = [];
        this.nameHandler = null;
    }
    get _children() {
        return [
            this.nameHandler,
            this.baseTypeHandler,
            ...this.membersHandler
        ];
    }
    _handle(node) {
        var _a, _b;
        super._handle(node);
        const name = node.name;
        this.nameHandler = handler_1.Handler.handle(name, this.context);
        const members = node.members;
        const baseType = node.baseType;
        if (baseType) {
            this.baseTypeHandler = handler_1.Handler.handle(baseType, this.context);
        }
        else {
            this.baseTypeHandler = null;
        }
        this.membersHandler.length = 0;
        for (const member of members) {
            const handler = handler_1.Handler.handle(member, this.context);
            this.membersHandler.push(handler);
        }
        this.value = {
            type: "Enum",
            name: (_a = this.nameHandler) === null || _a === void 0 ? void 0 : _a.value,
            members: this.membersHandler.map(handler => handler === null || handler === void 0 ? void 0 : handler.value),
            baseType: (_b = this.baseTypeHandler) === null || _b === void 0 ? void 0 : _b.value
        };
    }
    _createSymbolAndScope(parentScope) {
        const enumName = this.value.name.name;
        return this.declareSymbol(enumName, "Enum", parentScope);
    }
    _collectDeclarations(childrenSymbols, currentScope) {
        if (!currentScope) {
            return null;
        }
        const scope = currentScope;
        for (const child of childrenSymbols) {
            scope.addMember(child);
        }
        return scope.ownerSymbol;
    }
}
exports.EnumDeclarationHandler = EnumDeclarationHandler;
handler_1.Handler.registerHandler("EnumDeclaration", EnumDeclarationHandler);


/***/ }),

/***/ "./src/analyzer/semantic/declarations/enum/index.ts":
/*!**********************************************************!*\
  !*** ./src/analyzer/semantic/declarations/enum/index.ts ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
__webpack_require__(/*! ./memberHandler */ "./src/analyzer/semantic/declarations/enum/memberHandler.ts");
__webpack_require__(/*! ./enumHandler */ "./src/analyzer/semantic/declarations/enum/enumHandler.ts");


/***/ }),

/***/ "./src/analyzer/semantic/declarations/enum/memberHandler.ts":
/*!******************************************************************!*\
  !*** ./src/analyzer/semantic/declarations/enum/memberHandler.ts ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EnumMemberHandler = void 0;
const handler_1 = __webpack_require__(/*! ../../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class EnumMemberHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.nameHandler = null;
        this.valueHandler = null;
    }
    get _children() {
        return [
            this.nameHandler,
            this.valueHandler
        ];
    }
    _handle(node) {
        var _a, _b;
        super._handle(node);
        const name = node.name;
        this.nameHandler = handler_1.Handler.handle(name, this.context);
        if (node.value) {
            this.valueHandler = handler_1.Handler.handle(node.value, this.context);
        }
        else {
            this.valueHandler = null;
        }
        this.value = {
            type: "EnumMember",
            name: (_a = this.nameHandler) === null || _a === void 0 ? void 0 : _a.value,
            value: (_b = this.valueHandler) === null || _b === void 0 ? void 0 : _b.value,
        };
    }
    _createSymbolAndScope(parentScope) {
        const name = this.value.name.name;
        const symbol = this.declareSymbol(name, "Variable", parentScope);
        if (!symbol) {
            return null;
        }
        return symbol;
    }
}
exports.EnumMemberHandler = EnumMemberHandler;
handler_1.Handler.registerHandler("EnumMember", EnumMemberHandler);


/***/ }),

/***/ "./src/analyzer/semantic/declarations/function/functionHandler.ts":
/*!************************************************************************!*\
  !*** ./src/analyzer/semantic/declarations/function/functionHandler.ts ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FunctionHandler = void 0;
const access_1 = __webpack_require__(/*! ../../../../types/access */ "./src/types/access.ts");
const handler_1 = __webpack_require__(/*! ../../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class FunctionHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.nameHandler = null;
        this.decoratorHandlers = [];
        this.returnTypeHandler = null;
        this.parameterHandlers = [];
        this.argsHandler = null;
        this.genericHandler = null;
        this.bodyHandler = null;
    }
    get _children() {
        return [
            this.nameHandler,
            this.genericHandler,
            this.returnTypeHandler,
            ...this.parameterHandlers,
            this.argsHandler,
            ...this.decoratorHandlers,
            this.bodyHandler
        ];
    }
    _handle(node) {
        var _a, _b, _c, _d, _e;
        super._handle(node);
        this.nameHandler = handler_1.Handler.handle(node.name, this.context);
        if (node.generic) {
            this.genericHandler = handler_1.Handler.handle(node.generic, this.context);
        }
        else {
            this.genericHandler = null;
        }
        if (node.returnType) {
            this.returnTypeHandler = handler_1.Handler.handle(node.returnType, this.context);
        }
        else {
            this.returnTypeHandler = null;
        }
        const parameters = node.params;
        const decorators = node.decorator;
        const body = node.body;
        this.parameterHandlers.length = 0;
        this.decoratorHandlers.length = 0;
        for (const parameter of parameters) {
            const handler = handler_1.Handler.handle(parameter, this.context);
            this.parameterHandlers.push(handler);
        }
        if (node.args) {
            this.argsHandler = handler_1.Handler.handle(node.args, this.context);
        }
        else {
            this.argsHandler = null;
        }
        for (const decorator of decorators) {
            const handler = handler_1.Handler.handle(decorator, this.context);
            this.decoratorHandlers.push(handler);
        }
        if (body) {
            this.bodyHandler = handler_1.Handler.handle(body, this.context);
        }
        else {
            this.bodyHandler = null;
        }
        this.value = {
            type: "Function",
            name: (_a = this.nameHandler) === null || _a === void 0 ? void 0 : _a.value,
            returnType: (_b = this.returnTypeHandler) === null || _b === void 0 ? void 0 : _b.value,
            parameters: this.parameterHandlers.map(handler => handler === null || handler === void 0 ? void 0 : handler.value),
            args: (_c = this.argsHandler) === null || _c === void 0 ? void 0 : _c.value,
            generic: (_d = this.genericHandler) === null || _d === void 0 ? void 0 : _d.value,
            decorators: this.decoratorHandlers.map(handler => handler === null || handler === void 0 ? void 0 : handler.value),
            body: (_e = this.bodyHandler) === null || _e === void 0 ? void 0 : _e.value
        };
    }
    _createSymbolAndScope(parentScope) {
        const funcName = this.value.name.name;
        const symbol = this.declareSymbol(funcName, "Function", parentScope);
        if (!symbol) {
            return null;
        }
        symbol.accessibility = access_1.Access.PUBLIC;
        symbol.isStatic = true;
        return symbol;
    }
    _collectDeclarations(childrenSymbols, currentScope) {
        if (!currentScope) {
            return null;
        }
        const scope = currentScope;
        for (const child of childrenSymbols) {
            switch (child.type) {
                case "generic":
                    {
                        scope.addGeneric(child);
                    }
                    break;
                case "parameter":
                    {
                        scope.addParameter(child);
                    }
                    break;
                case "block":
                    {
                        scope.setBody(child);
                    }
                    break;
            }
        }
        return scope.ownerSymbol;
    }
}
exports.FunctionHandler = FunctionHandler;
handler_1.Handler.registerHandler("FunctionDeclaration", FunctionHandler);


/***/ }),

/***/ "./src/analyzer/semantic/declarations/function/index.ts":
/*!**************************************************************!*\
  !*** ./src/analyzer/semantic/declarations/function/index.ts ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
__webpack_require__(/*! ./functionHandler */ "./src/analyzer/semantic/declarations/function/functionHandler.ts");


/***/ }),

/***/ "./src/analyzer/semantic/declarations/identifierHandler.ts":
/*!*****************************************************************!*\
  !*** ./src/analyzer/semantic/declarations/identifierHandler.ts ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IdentifierHandler = void 0;
const handler_1 = __webpack_require__(/*! ../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class IdentifierHandler extends handler_1.Handler {
    _handle(node) {
        super._handle(node);
        this.value = {
            type: "Identifier",
            name: node.name
        };
    }
}
exports.IdentifierHandler = IdentifierHandler;
handler_1.Handler.registerHandler("Identifier", IdentifierHandler);


/***/ }),

/***/ "./src/analyzer/semantic/declarations/index.ts":
/*!*****************************************************!*\
  !*** ./src/analyzer/semantic/declarations/index.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
__webpack_require__(/*! ./identifierHandler */ "./src/analyzer/semantic/declarations/identifierHandler.ts");
__webpack_require__(/*! ./metaHandler */ "./src/analyzer/semantic/declarations/metaHandler.ts");
__webpack_require__(/*! ./struct/index */ "./src/analyzer/semantic/declarations/struct/index.ts");
__webpack_require__(/*! ./class/index */ "./src/analyzer/semantic/declarations/class/index.ts");
__webpack_require__(/*! ./interface/index */ "./src/analyzer/semantic/declarations/interface/index.ts");
__webpack_require__(/*! ./enum/index */ "./src/analyzer/semantic/declarations/enum/index.ts");
__webpack_require__(/*! ./variable/index */ "./src/analyzer/semantic/declarations/variable/index.ts");
__webpack_require__(/*! ./function/index */ "./src/analyzer/semantic/declarations/function/index.ts");


/***/ }),

/***/ "./src/analyzer/semantic/declarations/interface/fieldHandler.ts":
/*!**********************************************************************!*\
  !*** ./src/analyzer/semantic/declarations/interface/fieldHandler.ts ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InterfaceFieldDeclarationHandler = void 0;
const handler_1 = __webpack_require__(/*! ../../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class InterfaceFieldDeclarationHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.nameHandler = null;
        this.targetTypeHandler = null;
    }
    get _children() {
        return [
            this.nameHandler,
            this.targetTypeHandler
        ];
    }
    _handle(node) {
        var _a, _b;
        super._handle(node);
        this.nameHandler = handler_1.Handler.handle(node.name, this.context);
        const access = node.access;
        if (node.targetType) {
            this.targetTypeHandler = handler_1.Handler.handle(node.targetType, this.context);
        }
        else {
            this.targetTypeHandler = null;
        }
        this.value = {
            type: "InterfaceFieldDeclaration",
            name: (_a = this.nameHandler) === null || _a === void 0 ? void 0 : _a.value,
            access: access,
            targetType: (_b = this.targetTypeHandler) === null || _b === void 0 ? void 0 : _b.value,
        };
    }
}
exports.InterfaceFieldDeclarationHandler = InterfaceFieldDeclarationHandler;
handler_1.Handler.registerHandler("InterfaceFieldDeclaration", InterfaceFieldDeclarationHandler);


/***/ }),

/***/ "./src/analyzer/semantic/declarations/interface/index.ts":
/*!***************************************************************!*\
  !*** ./src/analyzer/semantic/declarations/interface/index.ts ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
__webpack_require__(/*! ./fieldHandler */ "./src/analyzer/semantic/declarations/interface/fieldHandler.ts");
__webpack_require__(/*! ./propertyHandler */ "./src/analyzer/semantic/declarations/interface/propertyHandler.ts");
__webpack_require__(/*! ./methodHandler */ "./src/analyzer/semantic/declarations/interface/methodHandler.ts");
__webpack_require__(/*! ./interfaceHandler */ "./src/analyzer/semantic/declarations/interface/interfaceHandler.ts");


/***/ }),

/***/ "./src/analyzer/semantic/declarations/interface/interfaceHandler.ts":
/*!**************************************************************************!*\
  !*** ./src/analyzer/semantic/declarations/interface/interfaceHandler.ts ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InterfaceDeclarationHandler = void 0;
const handler_1 = __webpack_require__(/*! ../../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class InterfaceDeclarationHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.membersHandler = [];
        this.inheritsHandler = [];
        this.genericHandler = null;
        this.nameHandler = null;
    }
    get _children() {
        return [
            this.nameHandler,
            ...this.inheritsHandler,
            this.genericHandler,
            ...this.membersHandler
        ];
    }
    _handle(node) {
        var _a, _b;
        super._handle(node);
        this.nameHandler = handler_1.Handler.handle(node.name, this.context);
        const members = node.members;
        this.membersHandler.length = 0;
        this.inheritsHandler.length = 0;
        if (node.inherits) {
            for (const inherit of node.inherits) {
                const handler = handler_1.Handler.handle(inherit, this.context);
                this.inheritsHandler.push(handler);
            }
        }
        if (node.generic) {
            this.genericHandler = handler_1.Handler.handle(node.generic, this.context);
        }
        else {
            this.genericHandler = null;
        }
        const fields = [];
        const methods = [];
        const properties = [];
        for (const member of members) {
            const handler = handler_1.Handler.handle(member, this.context);
            this.membersHandler.push(handler);
            const value = handler === null || handler === void 0 ? void 0 : handler.value;
            if (!value) {
                continue;
            }
            switch (value.type) {
                case "InterfaceFieldDeclaration":
                    {
                        fields.push(value);
                    }
                    break;
                case "InterfaceMethodSignature":
                    {
                        methods.push(value);
                    }
                    break;
                case "InterfacePropertySignature":
                    {
                        properties.push(value);
                    }
                    break;
            }
        }
        this.value = {
            type: "Interface",
            name: (_a = this.nameHandler) === null || _a === void 0 ? void 0 : _a.value,
            fields,
            methods,
            properties,
            inherits: this.inheritsHandler.map(handler => handler === null || handler === void 0 ? void 0 : handler.value),
            generic: (_b = this.genericHandler) === null || _b === void 0 ? void 0 : _b.value
        };
    }
    _createSymbolAndScope(parentScope) {
        const interfaceName = this.value.name.name;
        return this.declareSymbol(interfaceName, "Interface", parentScope);
    }
    _collectDeclarations(childrenSymbols, currentScope) {
        if (!currentScope) {
            return null;
        }
        const scope = currentScope;
        for (const child of childrenSymbols) {
            switch (child.type) {
                case "generic":
                    {
                        scope.addGeneric(child);
                    }
                    break;
                case "field":
                    {
                        scope.addField(child);
                    }
                    break;
                case "function":
                    {
                        scope.addMethod(child);
                    }
                    break;
                case "property":
                    {
                        scope.addProperty(child);
                    }
                    break;
            }
        }
        return scope.ownerSymbol;
    }
}
exports.InterfaceDeclarationHandler = InterfaceDeclarationHandler;
handler_1.Handler.registerHandler("InterfaceDeclaration", InterfaceDeclarationHandler);


/***/ }),

/***/ "./src/analyzer/semantic/declarations/interface/methodHandler.ts":
/*!***********************************************************************!*\
  !*** ./src/analyzer/semantic/declarations/interface/methodHandler.ts ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InterfaceMethodSignatureHandler = void 0;
const handler_1 = __webpack_require__(/*! ../../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class InterfaceMethodSignatureHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.returnTypeHandler = null;
        this.parameterHandlers = [];
        this.argsHandler = null;
        this.genericHandler = null;
        this.nameHandler = null;
    }
    get _children() {
        return [
            this.nameHandler,
            ...this.parameterHandlers,
            this.argsHandler,
            this.genericHandler,
            this.returnTypeHandler,
        ];
    }
    _handle(node) {
        var _a, _b, _c, _d;
        super._handle(node);
        const name = node.name;
        this.nameHandler = handler_1.Handler.handle(name, this.context);
        const access = node.access;
        if (node.generic) {
            this.genericHandler = handler_1.Handler.handle(node.generic, this.context);
        }
        else {
            this.genericHandler = null;
        }
        if (node.returnType) {
            this.returnTypeHandler = handler_1.Handler.handle(node.returnType, this.context);
        }
        else {
            this.returnTypeHandler = null;
        }
        const parameters = node.params;
        this.parameterHandlers.length = 0;
        for (const parameter of parameters) {
            const handler = handler_1.Handler.handle(parameter, this.context);
            this.parameterHandlers.push(handler);
        }
        if (node.args) {
            this.argsHandler = handler_1.Handler.handle(node.args, this.context);
        }
        else {
            this.argsHandler = null;
        }
        this.value = {
            type: "InterfaceMethodSignature",
            name: (_a = this.nameHandler) === null || _a === void 0 ? void 0 : _a.value,
            access: access,
            returnType: (_b = this.returnTypeHandler) === null || _b === void 0 ? void 0 : _b.value,
            parameters: this.parameterHandlers.map(handler => handler === null || handler === void 0 ? void 0 : handler.value),
            args: (_c = this.argsHandler) === null || _c === void 0 ? void 0 : _c.value,
            generic: (_d = this.genericHandler) === null || _d === void 0 ? void 0 : _d.value,
        };
    }
}
exports.InterfaceMethodSignatureHandler = InterfaceMethodSignatureHandler;
handler_1.Handler.registerHandler("InterfaceMethodSignature", InterfaceMethodSignatureHandler);


/***/ }),

/***/ "./src/analyzer/semantic/declarations/interface/propertyHandler.ts":
/*!*************************************************************************!*\
  !*** ./src/analyzer/semantic/declarations/interface/propertyHandler.ts ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InterfacePropertySignatureHandler = void 0;
const handler_1 = __webpack_require__(/*! ../../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class InterfacePropertySignatureHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.typeInfoHandler = null;
        this.nameHandler = null;
    }
    get _children() {
        return [
            this.nameHandler,
            this.typeInfoHandler
        ];
    }
    _handle(node) {
        var _a;
        super._handle(node);
        const name = node.name;
        const nameHandler = handler_1.Handler.handle(name, this.context);
        const access = node.access;
        const propertyType = node.propertyType;
        if (node.typeInfo) {
            this.typeInfoHandler = handler_1.Handler.handle(node.typeInfo, this.context);
        }
        else {
            this.typeInfoHandler = null;
        }
        this.value = {
            type: "InterfacePropertySignature",
            name: nameHandler === null || nameHandler === void 0 ? void 0 : nameHandler.value,
            access: access,
            typeInfo: (_a = this.typeInfoHandler) === null || _a === void 0 ? void 0 : _a.value,
            propertyType: propertyType,
        };
    }
}
exports.InterfacePropertySignatureHandler = InterfacePropertySignatureHandler;
handler_1.Handler.registerHandler("InterfacePropertySignature", InterfacePropertySignatureHandler);


/***/ }),

/***/ "./src/analyzer/semantic/declarations/metaHandler.ts":
/*!***********************************************************!*\
  !*** ./src/analyzer/semantic/declarations/metaHandler.ts ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MetaHandler = void 0;
const handler_1 = __webpack_require__(/*! ../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class MetaHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.nameHandler = null;
    }
    get _children() {
        return [
            this.nameHandler
        ];
    }
    _handle(node) {
        var _a;
        this.nameHandler = handler_1.Handler.handle(node.name, this.context);
        this.value = {
            type: "Meta",
            name: (_a = this.nameHandler) === null || _a === void 0 ? void 0 : _a.value
        };
    }
}
exports.MetaHandler = MetaHandler;
handler_1.Handler.registerHandler("Meta", MetaHandler);


/***/ }),

/***/ "./src/analyzer/semantic/declarations/struct/fieldHandler.ts":
/*!*******************************************************************!*\
  !*** ./src/analyzer/semantic/declarations/struct/fieldHandler.ts ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FieldHandler = void 0;
const handler_1 = __webpack_require__(/*! ../../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class FieldHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.nameHandler = null;
        this.typeInfoHandler = null;
        this.initHandler = null;
    }
    get _children() {
        return [
            this.nameHandler,
            this.typeInfoHandler,
            this.initHandler,
        ];
    }
    _handle(node) {
        var _a, _b, _c;
        super._handle(node);
        this.nameHandler = handler_1.Handler.handle(node.name, this.context);
        if (node.typeInfo) {
            const typeInfoHandler = handler_1.Handler.handle(node.typeInfo, this.context);
            this.typeInfoHandler = typeInfoHandler;
        }
        else {
            this.typeInfoHandler = null;
        }
        if (node.init) {
            const initHandler = handler_1.Handler.handle(node.init, this.context);
            this.initHandler = initHandler;
        }
        else {
            this.initHandler = null;
        }
        this.value = {
            type: "StructField",
            access: node.access,
            static: !!node.static,
            name: (_a = this.nameHandler) === null || _a === void 0 ? void 0 : _a.value,
            typeInfo: (_b = this.typeInfoHandler) === null || _b === void 0 ? void 0 : _b.value,
            init: (_c = this.initHandler) === null || _c === void 0 ? void 0 : _c.value,
        };
    }
}
exports.FieldHandler = FieldHandler;
handler_1.Handler.registerHandler("StructField", FieldHandler);


/***/ }),

/***/ "./src/analyzer/semantic/declarations/struct/index.ts":
/*!************************************************************!*\
  !*** ./src/analyzer/semantic/declarations/struct/index.ts ***!
  \************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
__webpack_require__(/*! ./fieldHandler */ "./src/analyzer/semantic/declarations/struct/fieldHandler.ts");
__webpack_require__(/*! ./methodHandler */ "./src/analyzer/semantic/declarations/struct/methodHandler.ts");
__webpack_require__(/*! ./metaFunctionHandler */ "./src/analyzer/semantic/declarations/struct/metaFunctionHandler.ts");
__webpack_require__(/*! ./structHandler */ "./src/analyzer/semantic/declarations/struct/structHandler.ts");


/***/ }),

/***/ "./src/analyzer/semantic/declarations/struct/metaFunctionHandler.ts":
/*!**************************************************************************!*\
  !*** ./src/analyzer/semantic/declarations/struct/metaFunctionHandler.ts ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MetaFunctionHandler = void 0;
const handler_1 = __webpack_require__(/*! ../../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class MetaFunctionHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.metaHandler = null;
        this.parameterHandlers = [];
        this.argsHandler = null;
        this.bodyHandler = null;
    }
    get _children() {
        return [
            this.metaHandler,
            ...this.parameterHandlers,
            this.argsHandler,
            this.bodyHandler
        ];
    }
    _handle(node) {
        var _a, _b, _c;
        super._handle(node);
        if (node.meta) {
            const metaHandler = handler_1.Handler.handle(node.meta, this.context);
            this.metaHandler = metaHandler;
        }
        else {
            this.metaHandler = null;
        }
        const parameters = node.params;
        const body = node.body;
        this.parameterHandlers.length = 0;
        for (const parameter of parameters) {
            const handler = handler_1.Handler.handle(parameter, this.context);
            this.parameterHandlers.push(handler);
        }
        if (body) {
            this.bodyHandler = handler_1.Handler.handle(body, this.context);
        }
        else {
            this.bodyHandler = null;
        }
        if (node.args) {
            const argsHandler = handler_1.Handler.handle(node.args, this.context);
            this.argsHandler = argsHandler;
        }
        else {
            this.argsHandler = null;
        }
        this.value = {
            type: "StructMetaFunction",
            access: node.access,
            static: !!node.static,
            meta: (_a = this.metaHandler) === null || _a === void 0 ? void 0 : _a.value,
            parameters: this.parameterHandlers.map(handler => handler === null || handler === void 0 ? void 0 : handler.value),
            args: (_b = this.argsHandler) === null || _b === void 0 ? void 0 : _b.value,
            body: (_c = this.bodyHandler) === null || _c === void 0 ? void 0 : _c.value,
        };
    }
}
exports.MetaFunctionHandler = MetaFunctionHandler;
handler_1.Handler.registerHandler("StructMetaFunction", MetaFunctionHandler);


/***/ }),

/***/ "./src/analyzer/semantic/declarations/struct/methodHandler.ts":
/*!********************************************************************!*\
  !*** ./src/analyzer/semantic/declarations/struct/methodHandler.ts ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MethodHandler = void 0;
const handler_1 = __webpack_require__(/*! ../../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class MethodHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.nameHandler = null;
        this.decoratorHandlers = [];
        this.returnTypeHandler = null;
        this.parameterHandlers = [];
        this.argsHandler = null;
        this.genericHandler = null;
        this.bodyHandler = null;
    }
    get _children() {
        return [
            this.nameHandler,
            ...this.parameterHandlers,
            this.argsHandler,
            this.genericHandler,
            this.returnTypeHandler,
            ...this.decoratorHandlers,
            this.bodyHandler
        ];
    }
    _handle(node) {
        var _a, _b, _c, _d, _e;
        super._handle(node);
        const access = node.access;
        this.nameHandler = handler_1.Handler.handle(node.name, this.context);
        if (node.generic) {
            this.genericHandler = handler_1.Handler.handle(node.generic, this.context);
        }
        else {
            this.genericHandler = null;
        }
        if (node.returnType) {
            this.returnTypeHandler = handler_1.Handler.handle(node.returnType, this.context);
        }
        else {
            this.returnTypeHandler = null;
        }
        const parameters = node.params;
        const decorators = node.decorator;
        const body = node.body;
        this.parameterHandlers.length = 0;
        this.decoratorHandlers.length = 0;
        for (const parameter of parameters) {
            const handler = handler_1.Handler.handle(parameter, this.context);
            this.parameterHandlers.push(handler);
        }
        if (node.args) {
            this.argsHandler = handler_1.Handler.handle(node.args, this.context);
        }
        else {
            this.argsHandler = null;
        }
        for (const decorator of decorators) {
            const handler = handler_1.Handler.handle(decorator, this.context);
            this.decoratorHandlers.push(handler);
        }
        if (body) {
            this.bodyHandler = handler_1.Handler.handle(body, this.context);
        }
        else {
            this.bodyHandler = null;
        }
        this.value = {
            type: "StructMethod",
            access: access,
            static: !!node.static,
            name: (_a = this.nameHandler) === null || _a === void 0 ? void 0 : _a.value,
            returnType: (_b = this.returnTypeHandler) === null || _b === void 0 ? void 0 : _b.value,
            parameters: this.parameterHandlers.map(handler => handler === null || handler === void 0 ? void 0 : handler.value),
            args: (_c = this.argsHandler) === null || _c === void 0 ? void 0 : _c.value,
            generic: (_d = this.genericHandler) === null || _d === void 0 ? void 0 : _d.value,
            decorators: this.decoratorHandlers.map(handler => handler === null || handler === void 0 ? void 0 : handler.value),
            body: (_e = this.bodyHandler) === null || _e === void 0 ? void 0 : _e.value
        };
    }
}
exports.MethodHandler = MethodHandler;
handler_1.Handler.registerHandler("StructMethod", MethodHandler);


/***/ }),

/***/ "./src/analyzer/semantic/declarations/struct/structHandler.ts":
/*!********************************************************************!*\
  !*** ./src/analyzer/semantic/declarations/struct/structHandler.ts ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StructDeclarationHandler = void 0;
const handler_1 = __webpack_require__(/*! ../../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class StructDeclarationHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.membersHandler = [];
        this.nameHandler = null;
    }
    get _children() {
        return [
            this.nameHandler,
            ...this.membersHandler
        ];
    }
    _handle(node) {
        var _a;
        super._handle(node);
        this.nameHandler = handler_1.Handler.handle(node.name, this.context);
        const members = node.members;
        this.membersHandler.length = 0;
        const fields = [];
        const methods = [];
        const metaFunctions = [];
        for (const member of members) {
            const handler = handler_1.Handler.handle(member, this.context);
            this.membersHandler.push(handler);
            const value = handler === null || handler === void 0 ? void 0 : handler.value;
            if (!value) {
                continue;
            }
            switch (value.type) {
                case "StructField":
                    {
                        fields.push(value);
                    }
                    break;
                case "StructMethod":
                    {
                        methods.push(value);
                    }
                    break;
                case "StructMetaFunction":
                    {
                        metaFunctions.push(value);
                    }
                    break;
            }
        }
        this.value = {
            type: "Struct",
            name: (_a = this.nameHandler) === null || _a === void 0 ? void 0 : _a.value,
            fields,
            methods,
            metaFunctions
        };
    }
    _createSymbolAndScope(parentScope) {
        const structName = this.value.name.name;
        const symbol = this.declareSymbol(structName, "Struct", parentScope);
        return symbol;
    }
    _collectDeclarations(childrenSymbols, currentScope) {
        if (!currentScope) {
            return null;
        }
        const scope = currentScope;
        for (const child of childrenSymbols) {
            switch (child.type) {
                case "field":
                    {
                        scope.addField(child);
                    }
                    break;
                case "function":
                    {
                        scope.addMethod(child);
                    }
                    break;
                case "meta":
                    {
                        scope.addMetaFunction(child);
                    }
                    break;
            }
        }
        return scope.ownerSymbol;
    }
}
exports.StructDeclarationHandler = StructDeclarationHandler;
handler_1.Handler.registerHandler("StructDeclaration", StructDeclarationHandler);


/***/ }),

/***/ "./src/analyzer/semantic/declarations/variable/destructuringHandler.ts":
/*!*****************************************************************************!*\
  !*** ./src/analyzer/semantic/declarations/variable/destructuringHandler.ts ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DestructuringArrayHandler = exports.DestructuringObjectHandler = void 0;
const handler_1 = __webpack_require__(/*! ../../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class DestructuringObjectHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.keyHandlers = [];
    }
    get _children() {
        return [
            ...this.keyHandlers
        ];
    }
    _handle(node) {
        super._handle(node);
        this.keyHandlers.length = 0;
        for (const key of node.keys) {
            const handler = handler_1.Handler.handle(key, this.context);
            this.keyHandlers.push(handler);
        }
        this.value = {
            type: "DestructuringObject",
            keys: this.keyHandlers.map(handler => handler.value)
        };
    }
}
exports.DestructuringObjectHandler = DestructuringObjectHandler;
handler_1.Handler.registerHandler("DestructuringObject", DestructuringObjectHandler);
class DestructuringArrayHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.keyHandlers = [];
    }
    _handle(node) {
        super._handle(node);
        this.keyHandlers.length = 0;
        for (const key of node.keys) {
            const handler = handler_1.Handler.handle(key, this.context);
            this.keyHandlers.push(handler);
        }
        this.value = {
            type: "DestructuringArray",
            keys: this.keyHandlers.map(handler => handler.value)
        };
    }
}
exports.DestructuringArrayHandler = DestructuringArrayHandler;
handler_1.Handler.registerHandler("DestructuringArray", DestructuringArrayHandler);


/***/ }),

/***/ "./src/analyzer/semantic/declarations/variable/index.ts":
/*!**************************************************************!*\
  !*** ./src/analyzer/semantic/declarations/variable/index.ts ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
__webpack_require__(/*! ./variableHandler */ "./src/analyzer/semantic/declarations/variable/variableHandler.ts");
__webpack_require__(/*! ./destructuringHandler */ "./src/analyzer/semantic/declarations/variable/destructuringHandler.ts");


/***/ }),

/***/ "./src/analyzer/semantic/declarations/variable/variableHandler.ts":
/*!************************************************************************!*\
  !*** ./src/analyzer/semantic/declarations/variable/variableHandler.ts ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VariableHandler = void 0;
const handler_1 = __webpack_require__(/*! ../../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class VariableHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.patternHandler = null;
        this.valueHandler = null;
        this.typeHandler = null;
    }
    get _children() {
        return [
            this.patternHandler,
            this.valueHandler,
            this.typeHandler
        ];
    }
    _handle(node) {
        var _a, _b, _c;
        this.patternHandler = handler_1.Handler.handle(node.pattern, this.context);
        this.valueHandler = handler_1.Handler.handle(node.value, this.context);
        if (node.typeInfo) {
            this.typeHandler = handler_1.Handler.handle(node.typeInfo, this.context);
        }
        else {
            this.typeHandler = null;
        }
        this.value = {
            type: "VariableDeclaration",
            pattern: (_a = this.patternHandler) === null || _a === void 0 ? void 0 : _a.value,
            value: (_b = this.valueHandler) === null || _b === void 0 ? void 0 : _b.value,
            typeInfo: (_c = this.typeHandler) === null || _c === void 0 ? void 0 : _c.value
        };
    }
    _createSymbolAndScope(parentScope) {
        const getDeclaration = (identifier) => {
            const symbol = this.declareSymbol(identifier.name, "Variable", parentScope);
            return symbol;
        };
        const collect = () => {
            switch (this.value.pattern.type) {
                case "Identifier":
                    return getDeclaration(this.value.pattern);
                case "DestructuringArray": {
                    return this.value.pattern.keys.map(key => {
                        return getDeclaration(key);
                    });
                }
                case "DestructuringObject": {
                    return this.value.pattern.keys.map(key => {
                        return getDeclaration(key);
                    });
                }
            }
        };
        const declaration = collect();
        if (declaration instanceof Array) {
            const symbol = this.declareSymbol("", "Variable", parentScope);
            if (!symbol) {
                return null;
            }
            for (const d of declaration) {
                if (!d) {
                    continue;
                }
                symbol.subSymbols.push(d);
            }
            return symbol;
        }
        return declaration;
    }
    _collectDeclarations(childrenSymbols, currentScope) {
        if (!currentScope) {
            return null;
        }
        return currentScope.ownerSymbol;
    }
}
exports.VariableHandler = VariableHandler;
handler_1.Handler.registerHandler("VariableDeclaration", VariableHandler);


/***/ }),

/***/ "./src/analyzer/semantic/expressions/arrayLiteralHandler.ts":
/*!******************************************************************!*\
  !*** ./src/analyzer/semantic/expressions/arrayLiteralHandler.ts ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ArrayLiteralHandler = void 0;
const handler_1 = __webpack_require__(/*! ../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class ArrayLiteralHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.elementsHandler = [];
    }
    get _children() {
        return [
            ...this.elementsHandler
        ];
    }
    _handle(node) {
        super._handle(node);
        this.elementsHandler.length = 0;
        for (const element of node.elements) {
            const handler = handler_1.Handler.handle(element, this.context);
            this.elementsHandler.push(handler);
        }
        this.value = {
            type: "ArrayLiteralExpression",
            elements: this.elementsHandler.map(handler => handler === null || handler === void 0 ? void 0 : handler.value)
        };
    }
}
exports.ArrayLiteralHandler = ArrayLiteralHandler;
handler_1.Handler.registerHandler("ArrayLiteral", ArrayLiteralHandler);


/***/ }),

/***/ "./src/analyzer/semantic/expressions/assignmentHandler.ts":
/*!****************************************************************!*\
  !*** ./src/analyzer/semantic/expressions/assignmentHandler.ts ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AssignmentHandler = void 0;
const handler_1 = __webpack_require__(/*! ../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class AssignmentHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.leftHandler = null;
        this.rightHandler = null;
    }
    get _children() {
        return [
            this.leftHandler,
            this.rightHandler
        ];
    }
    _handle(node) {
        var _a, _b;
        super._handle(node);
        this.leftHandler = handler_1.Handler.handle(node.left, this.context);
        this.rightHandler = handler_1.Handler.handle(node.right, this.context);
        this.value = {
            type: "AssignmentExpression",
            left: (_a = this.leftHandler) === null || _a === void 0 ? void 0 : _a.value,
            right: (_b = this.rightHandler) === null || _b === void 0 ? void 0 : _b.value,
            op: node.op
        };
    }
}
exports.AssignmentHandler = AssignmentHandler;
handler_1.Handler.registerHandler("Assignment", AssignmentHandler);


/***/ }),

/***/ "./src/analyzer/semantic/expressions/binaryHandler.ts":
/*!************************************************************!*\
  !*** ./src/analyzer/semantic/expressions/binaryHandler.ts ***!
  \************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BinaryHandler = void 0;
const handler_1 = __webpack_require__(/*! ../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class BinaryHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.leftHandler = null;
        this.rightHandler = null;
    }
    get _children() {
        return [
            this.leftHandler,
            this.rightHandler
        ];
    }
    _handle(node) {
        var _a, _b;
        super._handle(node);
        this.leftHandler = handler_1.Handler.handle(node.left, this.context);
        this.rightHandler = handler_1.Handler.handle(node.right, this.context);
        this.value = {
            type: "BinaryExpression",
            left: (_a = this.leftHandler) === null || _a === void 0 ? void 0 : _a.value,
            right: (_b = this.rightHandler) === null || _b === void 0 ? void 0 : _b.value,
            op: node.op
        };
    }
}
exports.BinaryHandler = BinaryHandler;
handler_1.Handler.registerHandler("Binary", BinaryHandler);


/***/ }),

/***/ "./src/analyzer/semantic/expressions/conditionalHandler.ts":
/*!*****************************************************************!*\
  !*** ./src/analyzer/semantic/expressions/conditionalHandler.ts ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ConditionalHandler = void 0;
const handler_1 = __webpack_require__(/*! ../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class ConditionalHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.conditionHandler = null;
        this.consequentHandler = null;
        this.alternateHandler = null;
    }
    get _children() {
        return [
            this.conditionHandler,
            this.consequentHandler,
            this.alternateHandler
        ];
    }
    _handle(node) {
        var _a, _b, _c;
        super._handle(node);
        this.conditionHandler = handler_1.Handler.handle(node.test, this.context);
        this.consequentHandler = handler_1.Handler.handle(node.consequent, this.context);
        this.alternateHandler = handler_1.Handler.handle(node.alternate, this.context);
        this.value = {
            type: "ConditionalExpression",
            condition: (_a = this.conditionHandler) === null || _a === void 0 ? void 0 : _a.value,
            consequent: (_b = this.consequentHandler) === null || _b === void 0 ? void 0 : _b.value,
            alternate: (_c = this.alternateHandler) === null || _c === void 0 ? void 0 : _c.value
        };
    }
}
exports.ConditionalHandler = ConditionalHandler;
handler_1.Handler.registerHandler("Conditional", ConditionalHandler);


/***/ }),

/***/ "./src/analyzer/semantic/expressions/decoratorHandler.ts":
/*!***************************************************************!*\
  !*** ./src/analyzer/semantic/expressions/decoratorHandler.ts ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DecoratorExpressionHandler = void 0;
const handler_1 = __webpack_require__(/*! ../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class DecoratorExpressionHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.exprHandler = null;
    }
    get _children() {
        return [
            this.exprHandler
        ];
    }
    _handle(node) {
        var _a;
        super._handle(node);
        this.exprHandler = handler_1.Handler.handle(node.expr, this.context);
        this.value = {
            type: 'DecoratorExpression',
            expr: (_a = this.exprHandler) === null || _a === void 0 ? void 0 : _a.value
        };
    }
}
exports.DecoratorExpressionHandler = DecoratorExpressionHandler;
handler_1.Handler.registerHandler("DecoratorExpression", DecoratorExpressionHandler);


/***/ }),

/***/ "./src/analyzer/semantic/expressions/forHandler.ts":
/*!*********************************************************!*\
  !*** ./src/analyzer/semantic/expressions/forHandler.ts ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ForeachLoopExpressionHandler = exports.ForLoopExpressionHandler = void 0;
const handler_1 = __webpack_require__(/*! ../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class ForLoopExpressionHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.initHandler = null;
        this.conditionHandler = null;
        this.stepHandler = null;
        this.blockHandler = null;
    }
    get _children() {
        return [
            this.initHandler,
            this.conditionHandler,
            this.stepHandler,
            this.blockHandler
        ];
    }
    _handle(node) {
        var _a, _b, _c;
        super._handle(node);
        if (node.init !== ";") {
            this.initHandler = handler_1.Handler.handle(node.init, this.context);
        }
        else {
            this.initHandler = null;
        }
        if (node.cond !== ";") {
            this.conditionHandler = handler_1.Handler.handle(node.cond, this.context);
        }
        else {
            this.conditionHandler = null;
        }
        if (node.step) {
            this.stepHandler = handler_1.Handler.handle(node.step, this.context);
        }
        else {
            this.stepHandler = null;
        }
        this.blockHandler = handler_1.Handler.handle(node.block, this.context);
        this.value = {
            type: "ForLoopExpression",
            isStatement: node.isStatement,
            init: (_a = this.initHandler) === null || _a === void 0 ? void 0 : _a.value,
            condition: (_b = this.conditionHandler) === null || _b === void 0 ? void 0 : _b.value,
            step: (_c = this.stepHandler) === null || _c === void 0 ? void 0 : _c.value,
            block: this.blockHandler.value
        };
    }
}
exports.ForLoopExpressionHandler = ForLoopExpressionHandler;
handler_1.Handler.registerHandler("ForLoop", ForLoopExpressionHandler);
class ForeachLoopExpressionHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.patternHandler = null;
        this.typeHandler = null;
        this.exprHandler = null;
        this.blockHandler = null;
    }
    get _children() {
        return [
            this.patternHandler,
            this.typeHandler,
            this.exprHandler,
            this.blockHandler
        ];
    }
    _handle(node) {
        var _a;
        super._handle(node);
        this.patternHandler = handler_1.Handler.handle(node.pattern, this.context);
        if (node.typeInfo) {
            this.typeHandler = handler_1.Handler.handle(node.typeInfo, this.context);
        }
        this.exprHandler = handler_1.Handler.handle(node.expr, this.context);
        this.blockHandler = handler_1.Handler.handle(node.block, this.context);
        this.value = {
            type: "ForeachLoopExpression",
            isStatement: node.isStatement,
            pattern: this.patternHandler.value,
            typeInfo: (_a = this.typeHandler) === null || _a === void 0 ? void 0 : _a.value,
            expr: this.exprHandler.value,
            block: this.blockHandler.value
        };
    }
}
exports.ForeachLoopExpressionHandler = ForeachLoopExpressionHandler;
handler_1.Handler.registerHandler("ForeachLoop", ForeachLoopExpressionHandler);


/***/ }),

/***/ "./src/analyzer/semantic/expressions/functionCallHandler.ts":
/*!******************************************************************!*\
  !*** ./src/analyzer/semantic/expressions/functionCallHandler.ts ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FunctionCallHandler = void 0;
const handler_1 = __webpack_require__(/*! ../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class FunctionCallHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.argsHandler = [];
    }
    get _children() {
        return [
            ...this.argsHandler
        ];
    }
    _handle(node) {
        super._handle(node);
        this.argsHandler.length = 0;
        if (node.args) {
            for (const arg of node.args) {
                const handler = handler_1.Handler.handle(arg, this.context);
                this.argsHandler.push(handler);
            }
        }
        this.value = {
            type: "FunctionCall",
            args: this.argsHandler.map(handler => handler === null || handler === void 0 ? void 0 : handler.value),
        };
    }
}
exports.FunctionCallHandler = FunctionCallHandler;
handler_1.Handler.registerHandler("FunctionCall", FunctionCallHandler);


/***/ }),

/***/ "./src/analyzer/semantic/expressions/ifHandler.ts":
/*!********************************************************!*\
  !*** ./src/analyzer/semantic/expressions/ifHandler.ts ***!
  \********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IfExpressionHandler = void 0;
const handler_1 = __webpack_require__(/*! ../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class IfExpressionHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.conditionHandler = null;
        this.thenHandler = null;
        this.elseHandler = null;
    }
    get _children() {
        return [
            this.conditionHandler,
            this.thenHandler,
            this.elseHandler
        ];
    }
    _handle(node) {
        var _a, _b, _c;
        super._handle(node);
        this.conditionHandler = handler_1.Handler.handle(node.condition, this.context);
        this.thenHandler = handler_1.Handler.handle(node.then, this.context);
        if (node.else) {
            this.elseHandler = handler_1.Handler.handle(node.else, this.context);
        }
        else {
            this.elseHandler = null;
        }
        this.value = {
            type: "IfExpression",
            isStatement: node.isStatement,
            condition: (_a = this.conditionHandler) === null || _a === void 0 ? void 0 : _a.value,
            then: (_b = this.thenHandler) === null || _b === void 0 ? void 0 : _b.value,
            else: (_c = this.elseHandler) === null || _c === void 0 ? void 0 : _c.value
        };
    }
}
exports.IfExpressionHandler = IfExpressionHandler;
handler_1.Handler.registerHandler("IfExpression", IfExpressionHandler);


/***/ }),

/***/ "./src/analyzer/semantic/expressions/index.ts":
/*!****************************************************!*\
  !*** ./src/analyzer/semantic/expressions/index.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
__webpack_require__(/*! ./ifHandler */ "./src/analyzer/semantic/expressions/ifHandler.ts");
__webpack_require__(/*! ./switchHandler */ "./src/analyzer/semantic/expressions/switchHandler.ts");
__webpack_require__(/*! ./forHandler */ "./src/analyzer/semantic/expressions/forHandler.ts");
__webpack_require__(/*! ./whileHandler */ "./src/analyzer/semantic/expressions/whileHandler.ts");
__webpack_require__(/*! ./lambdaHandler */ "./src/analyzer/semantic/expressions/lambdaHandler.ts");
__webpack_require__(/*! ./arrayLiteralHandler */ "./src/analyzer/semantic/expressions/arrayLiteralHandler.ts");
__webpack_require__(/*! ./objectLiteralHandler */ "./src/analyzer/semantic/expressions/objectLiteralHandler.ts");
__webpack_require__(/*! ./primaryHandler */ "./src/analyzer/semantic/expressions/primaryHandler.ts");
__webpack_require__(/*! ./memberAccessHandler */ "./src/analyzer/semantic/expressions/memberAccessHandler.ts");
__webpack_require__(/*! ./functionCallHandler */ "./src/analyzer/semantic/expressions/functionCallHandler.ts");
__webpack_require__(/*! ./literalHandler */ "./src/analyzer/semantic/expressions/literalHandler.ts");
__webpack_require__(/*! ./unaryHandler */ "./src/analyzer/semantic/expressions/unaryHandler.ts");
__webpack_require__(/*! ./binaryHandler */ "./src/analyzer/semantic/expressions/binaryHandler.ts");
__webpack_require__(/*! ./logicalHandler */ "./src/analyzer/semantic/expressions/logicalHandler.ts");
__webpack_require__(/*! ./conditionalHandler */ "./src/analyzer/semantic/expressions/conditionalHandler.ts");
__webpack_require__(/*! ./assignmentHandler */ "./src/analyzer/semantic/expressions/assignmentHandler.ts");
__webpack_require__(/*! ./decoratorHandler */ "./src/analyzer/semantic/expressions/decoratorHandler.ts");


/***/ }),

/***/ "./src/analyzer/semantic/expressions/lambdaHandler.ts":
/*!************************************************************!*\
  !*** ./src/analyzer/semantic/expressions/lambdaHandler.ts ***!
  \************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LambdaHandler = void 0;
const handler_1 = __webpack_require__(/*! ../common/handler */ "./src/analyzer/semantic/common/handler.ts");
const access_1 = __webpack_require__(/*! ../../../types/access */ "./src/types/access.ts");
class LambdaHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.paramsHandler = [];
        this.argsHandler = null;
        this.blockHandler = null;
    }
    get _children() {
        return [
            ...this.paramsHandler,
            this.argsHandler,
            this.blockHandler
        ];
    }
    _handle(node) {
        var _a, _b;
        super._handle(node);
        this.paramsHandler.length = 0;
        for (const param of node.params) {
            const handler = handler_1.Handler.handle(param, this.context);
            this.paramsHandler.push(handler);
        }
        if (node.args) {
            this.argsHandler = handler_1.Handler.handle(node.args, this.context);
        }
        else {
            this.argsHandler = null;
        }
        this.blockHandler = handler_1.Handler.handle(node.block, this.context);
        this.value = {
            type: 'LambdaExpression',
            params: this.paramsHandler.map(handler => handler === null || handler === void 0 ? void 0 : handler.value),
            args: (_a = this.argsHandler) === null || _a === void 0 ? void 0 : _a.value,
            blocks: (_b = this.blockHandler) === null || _b === void 0 ? void 0 : _b.value
        };
    }
    _createSymbolAndScope(parentScope) {
        const symbol = this.declareSymbol("$Lambda", "Function", parentScope);
        if (!symbol) {
            return null;
        }
        symbol.accessibility = access_1.Access.PUBLIC;
        symbol.isStatic = true;
        return symbol;
    }
    _collectDeclarations(childrenSymbols, currentScope) {
        if (!currentScope) {
            return null;
        }
        const scope = currentScope;
        for (const child of childrenSymbols) {
            switch (child.type) {
                case "parameter":
                    {
                        scope.addParameter(child);
                    }
                    break;
                case "block":
                    {
                        scope.setBody(child);
                    }
                    break;
            }
        }
        return scope.ownerSymbol;
    }
}
exports.LambdaHandler = LambdaHandler;
handler_1.Handler.registerHandler("LambdaExpression", LambdaHandler);


/***/ }),

/***/ "./src/analyzer/semantic/expressions/literalHandler.ts":
/*!*************************************************************!*\
  !*** ./src/analyzer/semantic/expressions/literalHandler.ts ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IdentifierLiteralHandler = exports.ValueLiteralHandler = void 0;
const handler_1 = __webpack_require__(/*! ../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class ValueLiteralHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.valueHandler = null;
    }
    get _children() {
        return [
            this.valueHandler
        ];
    }
    _handle(node) {
        var _a;
        super._handle(node);
        this.valueHandler = handler_1.Handler.handle(node.value, this.context);
        this.value = {
            type: "ValueLiteralExpression",
            value: (_a = this.valueHandler) === null || _a === void 0 ? void 0 : _a.value
        };
    }
}
exports.ValueLiteralHandler = ValueLiteralHandler;
handler_1.Handler.registerHandler("ValueLiteral", ValueLiteralHandler);
class IdentifierLiteralHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.identifierHandler = null;
    }
    _handle(node) {
        var _a;
        super._handle(node);
        this.identifierHandler = handler_1.Handler.handle(node.value, this.context);
        this.value = {
            type: "IdentifierLiteralExpression",
            value: (_a = this.identifierHandler) === null || _a === void 0 ? void 0 : _a.value
        };
    }
}
exports.IdentifierLiteralHandler = IdentifierLiteralHandler;
handler_1.Handler.registerHandler("IdentifierLiteral", IdentifierLiteralHandler);


/***/ }),

/***/ "./src/analyzer/semantic/expressions/logicalHandler.ts":
/*!*************************************************************!*\
  !*** ./src/analyzer/semantic/expressions/logicalHandler.ts ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LogicalHandler = void 0;
const handler_1 = __webpack_require__(/*! ../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class LogicalHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.leftHandler = null;
        this.rightHandler = null;
    }
    get _children() {
        return [
            this.leftHandler,
            this.rightHandler
        ];
    }
    _handle(node) {
        var _a, _b;
        super._handle(node);
        this.leftHandler = handler_1.Handler.handle(node.left, this.context);
        this.rightHandler = handler_1.Handler.handle(node.right, this.context);
        this.value = {
            type: "LogicalExpression",
            left: (_a = this.leftHandler) === null || _a === void 0 ? void 0 : _a.value,
            right: (_b = this.rightHandler) === null || _b === void 0 ? void 0 : _b.value,
            op: node.op
        };
    }
}
exports.LogicalHandler = LogicalHandler;
handler_1.Handler.registerHandler("Logical", LogicalHandler);


/***/ }),

/***/ "./src/analyzer/semantic/expressions/memberAccessHandler.ts":
/*!******************************************************************!*\
  !*** ./src/analyzer/semantic/expressions/memberAccessHandler.ts ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MemberAccessHandler = void 0;
const handler_1 = __webpack_require__(/*! ../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class MemberAccessHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.propertyHandler = null;
    }
    get _children() {
        return [
            this.propertyHandler
        ];
    }
    _handle(node) {
        var _a;
        super._handle(node);
        const computed = node.computed;
        if (computed) {
            this.propertyHandler = handler_1.Handler.handle(node.property, this.context);
        }
        else {
            this.propertyHandler = null;
        }
        this.value = {
            type: "MemberExpression",
            property: (_a = this.propertyHandler) === null || _a === void 0 ? void 0 : _a.value,
            computed,
        };
    }
}
exports.MemberAccessHandler = MemberAccessHandler;
handler_1.Handler.registerHandler("MemberExpression", MemberAccessHandler);


/***/ }),

/***/ "./src/analyzer/semantic/expressions/objectLiteralHandler.ts":
/*!*******************************************************************!*\
  !*** ./src/analyzer/semantic/expressions/objectLiteralHandler.ts ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.KeyValuePairHandler = exports.ObjectLiteralHandler = void 0;
const handler_1 = __webpack_require__(/*! ../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class ObjectLiteralHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.propertiesHandler = [];
    }
    _handle(node) {
        super._handle(node);
        this.propertiesHandler.length = 0;
        for (const property of node.properties) {
            const handler = handler_1.Handler.handle(property, this.context);
            this.propertiesHandler.push(handler);
        }
        this.value = {
            type: 'ObjectLiteralExpression',
            properties: this.propertiesHandler.map(handler => handler === null || handler === void 0 ? void 0 : handler.value)
        };
    }
}
exports.ObjectLiteralHandler = ObjectLiteralHandler;
handler_1.Handler.registerHandler("ObjectLiteral", ObjectLiteralHandler);
class KeyValuePairHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.keyHandler = null;
        this.valueHandler = null;
    }
    get _children() {
        return [
            this.keyHandler,
            this.valueHandler
        ];
    }
    _handle(node) {
        var _a, _b;
        super._handle(node);
        this.keyHandler = handler_1.Handler.handle(node.key, this.context);
        this.valueHandler = handler_1.Handler.handle(node.value, this.context);
        this.value = {
            type: 'KeyValuePairExpression',
            key: (_a = this.keyHandler) === null || _a === void 0 ? void 0 : _a.value,
            value: (_b = this.valueHandler) === null || _b === void 0 ? void 0 : _b.value
        };
    }
}
exports.KeyValuePairHandler = KeyValuePairHandler;
handler_1.Handler.registerHandler("KeyValuePair", KeyValuePairHandler);


/***/ }),

/***/ "./src/analyzer/semantic/expressions/primaryHandler.ts":
/*!*************************************************************!*\
  !*** ./src/analyzer/semantic/expressions/primaryHandler.ts ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PrimaryHandler = void 0;
const handler_1 = __webpack_require__(/*! ../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class PrimaryHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.propertyHandler = null;
        this.memberHandlers = [];
    }
    get _children() {
        return [
            this.propertyHandler,
            ...this.memberHandlers
        ];
    }
    _handle(node) {
        var _a;
        super._handle(node);
        this.memberHandlers.length = 0;
        this.propertyHandler = handler_1.Handler.handle(node.property, this.context);
        if (node.members) {
            for (const member of node.members) {
                const handler = handler_1.Handler.handle(member, this.context);
                this.memberHandlers.push(handler);
            }
        }
        this.value = {
            type: "PrimaryExpression",
            property: (_a = this.propertyHandler) === null || _a === void 0 ? void 0 : _a.value,
            members: this.memberHandlers.map(handler => handler === null || handler === void 0 ? void 0 : handler.value),
        };
    }
}
exports.PrimaryHandler = PrimaryHandler;
handler_1.Handler.registerHandler("PrimaryExpression", PrimaryHandler);


/***/ }),

/***/ "./src/analyzer/semantic/expressions/switchHandler.ts":
/*!************************************************************!*\
  !*** ./src/analyzer/semantic/expressions/switchHandler.ts ***!
  \************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SwitchDefaultHandler = exports.SwitchCaseHandler = exports.SwitchExpressionHandler = void 0;
const handler_1 = __webpack_require__(/*! ../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class SwitchExpressionHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.exprHandler = null;
        this.caseHandlers = [];
        this.defaultHandler = null;
    }
    get _children() {
        return [
            this.exprHandler,
            ...this.caseHandlers,
            this.defaultHandler
        ];
    }
    _handle(node) {
        var _a, _b;
        super._handle(node);
        this.caseHandlers.length = 0;
        this.exprHandler = handler_1.Handler.handle(node.expr, this.context);
        for (const $case of node.cases) {
            const handler = handler_1.Handler.handle($case, this.context);
            this.caseHandlers.push(handler);
        }
        if (node.default) {
            this.defaultHandler = handler_1.Handler.handle(node.default, this.context);
        }
        else {
            this.defaultHandler = null;
        }
        this.value = {
            type: "SwitchExpression",
            isStatement: node.isStatement,
            expr: (_a = this.exprHandler) === null || _a === void 0 ? void 0 : _a.value,
            cases: this.caseHandlers.map(handler => handler === null || handler === void 0 ? void 0 : handler.value),
            default: (_b = this.defaultHandler) === null || _b === void 0 ? void 0 : _b.value
        };
    }
}
exports.SwitchExpressionHandler = SwitchExpressionHandler;
handler_1.Handler.registerHandler("SwitchExpression", SwitchExpressionHandler);
class SwitchCaseHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.testHandler = null;
        this.blockHandler = null;
    }
    _handle(node) {
        super._handle(node);
        this.testHandler = handler_1.Handler.handle(node.value, this.context);
        this.blockHandler = handler_1.Handler.handle(node.block, this.context);
        this.value = {
            type: "SwitchCase",
            test: this.testHandler.value,
            block: this.blockHandler.value
        };
    }
}
exports.SwitchCaseHandler = SwitchCaseHandler;
handler_1.Handler.registerHandler("SwitchCase", SwitchCaseHandler);
class SwitchDefaultHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.blockHandler = null;
    }
    _handle(node) {
        var _a;
        super._handle(node);
        this.blockHandler = handler_1.Handler.handle(node.block, this.context);
        this.value = {
            type: "SwitchDefault",
            block: (_a = this.blockHandler) === null || _a === void 0 ? void 0 : _a.value
        };
    }
}
exports.SwitchDefaultHandler = SwitchDefaultHandler;
handler_1.Handler.registerHandler("SwitchDefault", SwitchDefaultHandler);


/***/ }),

/***/ "./src/analyzer/semantic/expressions/unaryHandler.ts":
/*!***********************************************************!*\
  !*** ./src/analyzer/semantic/expressions/unaryHandler.ts ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UnaryHandler = exports.UnaryOperatorHandler = void 0;
const handler_1 = __webpack_require__(/*! ../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class UnaryOperatorHandler extends handler_1.Handler {
    _handle(node) {
        super._handle(node);
        this.value = {
            type: "UnaryOperator",
            operator: node.operator
        };
    }
}
exports.UnaryOperatorHandler = UnaryOperatorHandler;
handler_1.Handler.registerHandler("UnaryOperator", UnaryOperatorHandler);
class UnaryHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.operatorHandler = null;
        this.argumentHandler = null;
    }
    get _children() {
        return [
            this.operatorHandler,
            this.argumentHandler
        ];
    }
    _handle(node) {
        var _a, _b;
        super._handle(node);
        this.operatorHandler = handler_1.Handler.handle(node.op, this.context);
        this.argumentHandler = handler_1.Handler.handle(node.argument, this.context);
        this.value = {
            type: "UnaryExpression",
            operator: (_a = this.operatorHandler) === null || _a === void 0 ? void 0 : _a.value,
            arguments: (_b = this.argumentHandler) === null || _b === void 0 ? void 0 : _b.value
        };
    }
}
exports.UnaryHandler = UnaryHandler;
handler_1.Handler.registerHandler("Unary", UnaryHandler);


/***/ }),

/***/ "./src/analyzer/semantic/expressions/whileHandler.ts":
/*!***********************************************************!*\
  !*** ./src/analyzer/semantic/expressions/whileHandler.ts ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WhileLoopExpressionHandler = void 0;
const handler_1 = __webpack_require__(/*! ../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class WhileLoopExpressionHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.conditionHandler = null;
        this.blockHandler = null;
    }
    get _children() {
        return [
            this.conditionHandler,
            this.blockHandler
        ];
    }
    _handle(node) {
        var _a, _b;
        super._handle(node);
        this.conditionHandler = handler_1.Handler.handle(node.cond, this.context);
        this.blockHandler = handler_1.Handler.handle(node.block, this.context);
        this.value = {
            type: "WhileLoopExpression",
            isStatement: node.isStatement,
            condition: (_a = this.conditionHandler) === null || _a === void 0 ? void 0 : _a.value,
            block: (_b = this.blockHandler) === null || _b === void 0 ? void 0 : _b.value
        };
    }
}
exports.WhileLoopExpressionHandler = WhileLoopExpressionHandler;
handler_1.Handler.registerHandler("WhileLoop", WhileLoopExpressionHandler);


/***/ }),

/***/ "./src/analyzer/semantic/index.ts":
/*!****************************************!*\
  !*** ./src/analyzer/semantic/index.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
__webpack_require__(/*! ./common/index */ "./src/analyzer/semantic/common/index.ts");
__webpack_require__(/*! ./literals/index */ "./src/analyzer/semantic/literals/index.ts");
__webpack_require__(/*! ./types/index */ "./src/analyzer/semantic/types/index.ts");
__webpack_require__(/*! ./statements/index */ "./src/analyzer/semantic/statements/index.ts");
__webpack_require__(/*! ./declarations/index */ "./src/analyzer/semantic/declarations/index.ts");
__webpack_require__(/*! ./expressions/index */ "./src/analyzer/semantic/expressions/index.ts");
__webpack_require__(/*! ./scriptHandler */ "./src/analyzer/semantic/scriptHandler.ts");
__webpack_require__(/*! ./moduleDeclarationHandler */ "./src/analyzer/semantic/moduleDeclarationHandler.ts");


/***/ }),

/***/ "./src/analyzer/semantic/literals/booleanHandler.ts":
/*!**********************************************************!*\
  !*** ./src/analyzer/semantic/literals/booleanHandler.ts ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BooleanHandler = void 0;
const handler_1 = __webpack_require__(/*! ../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class BooleanHandler extends handler_1.Handler {
    _handle(node) {
        super._handle(node);
        this.value = {
            type: "BooleanLiteral",
            value: node.value
        };
    }
}
exports.BooleanHandler = BooleanHandler;
handler_1.Handler.registerHandler("Boolean", BooleanHandler);


/***/ }),

/***/ "./src/analyzer/semantic/literals/charHandler.ts":
/*!*******************************************************!*\
  !*** ./src/analyzer/semantic/literals/charHandler.ts ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CharHandler = void 0;
const handler_1 = __webpack_require__(/*! ../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class CharHandler extends handler_1.Handler {
    _handle(node) {
        super._handle(node);
        this.value = {
            type: "CharLiteral",
            value: node.value
        };
    }
}
exports.CharHandler = CharHandler;
handler_1.Handler.registerHandler("Char", CharHandler);


/***/ }),

/***/ "./src/analyzer/semantic/literals/floatHandler.ts":
/*!********************************************************!*\
  !*** ./src/analyzer/semantic/literals/floatHandler.ts ***!
  \********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FloatHandler = void 0;
const handler_1 = __webpack_require__(/*! ../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class FloatHandler extends handler_1.Handler {
    _handle(node) {
        super._handle(node);
        this.value = {
            type: "FloatLiteral",
            value: node.value
        };
    }
}
exports.FloatHandler = FloatHandler;
handler_1.Handler.registerHandler("Float", FloatHandler);


/***/ }),

/***/ "./src/analyzer/semantic/literals/index.ts":
/*!*************************************************!*\
  !*** ./src/analyzer/semantic/literals/index.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
__webpack_require__(/*! ./booleanHandler */ "./src/analyzer/semantic/literals/booleanHandler.ts");
__webpack_require__(/*! ./stringHandler */ "./src/analyzer/semantic/literals/stringHandler.ts");
__webpack_require__(/*! ./charHandler */ "./src/analyzer/semantic/literals/charHandler.ts");
__webpack_require__(/*! ./floatHandler */ "./src/analyzer/semantic/literals/floatHandler.ts");
__webpack_require__(/*! ./integerHandler */ "./src/analyzer/semantic/literals/integerHandler.ts");
__webpack_require__(/*! ./nullHandler */ "./src/analyzer/semantic/literals/nullHandler.ts");


/***/ }),

/***/ "./src/analyzer/semantic/literals/integerHandler.ts":
/*!**********************************************************!*\
  !*** ./src/analyzer/semantic/literals/integerHandler.ts ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IntegerHandler = void 0;
const handler_1 = __webpack_require__(/*! ../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class IntegerHandler extends handler_1.Handler {
    _handle(node) {
        super._handle(node);
        this.value = {
            type: "IntegerLiteral",
            value: node.value
        };
    }
}
exports.IntegerHandler = IntegerHandler;
handler_1.Handler.registerHandler("Integer", IntegerHandler);


/***/ }),

/***/ "./src/analyzer/semantic/literals/nullHandler.ts":
/*!*******************************************************!*\
  !*** ./src/analyzer/semantic/literals/nullHandler.ts ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NullHandler = void 0;
const handler_1 = __webpack_require__(/*! ../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class NullHandler extends handler_1.Handler {
    _handle(node) {
        super._handle(node);
        // this.value = node.value;
        this.value = {
            type: "NullLiteral",
            value: null,
        };
    }
}
exports.NullHandler = NullHandler;
handler_1.Handler.registerHandler("Null", NullHandler);


/***/ }),

/***/ "./src/analyzer/semantic/literals/stringHandler.ts":
/*!*********************************************************!*\
  !*** ./src/analyzer/semantic/literals/stringHandler.ts ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StringHandler = void 0;
const handler_1 = __webpack_require__(/*! ../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class StringHandler extends handler_1.Handler {
    _handle(node) {
        super._handle(node);
        this.value = {
            type: "StringLiteral",
            value: node.value
        };
    }
}
exports.StringHandler = StringHandler;
handler_1.Handler.registerHandler("String", StringHandler);


/***/ }),

/***/ "./src/analyzer/semantic/moduleDeclarationHandler.ts":
/*!***********************************************************!*\
  !*** ./src/analyzer/semantic/moduleDeclarationHandler.ts ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ModuleDeclarationHandler = void 0;
const handler_1 = __webpack_require__(/*! ./common/handler */ "./src/analyzer/semantic/common/handler.ts");
class ModuleDeclarationHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.nameHandler = null;
    }
    get _children() {
        return [
            this.nameHandler
        ];
    }
    _handle(node) {
        var _a;
        super._handle(node);
        const name = node.name;
        this.nameHandler = handler_1.Handler.handle(name, this.context);
        this.value = {
            type: "ModuleDeclaration",
            name: (_a = this.nameHandler) === null || _a === void 0 ? void 0 : _a.value,
        };
    }
}
exports.ModuleDeclarationHandler = ModuleDeclarationHandler;
handler_1.Handler.registerHandler("ModuleDeclaration", ModuleDeclarationHandler);


/***/ }),

/***/ "./src/analyzer/semantic/scriptHandler.ts":
/*!************************************************!*\
  !*** ./src/analyzer/semantic/scriptHandler.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ScriptHandler = void 0;
const handler_1 = __webpack_require__(/*! ./common/handler */ "./src/analyzer/semantic/common/handler.ts");
class ScriptHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        // 脚本模块
        this.moduleHandler = null;
        this.statementHandlers = [];
    }
    get _children() {
        return [
            this.moduleHandler,
            ...this.statementHandlers
        ];
    }
    _handle(start) {
        var _a;
        super._handle(start);
        const moduleDeclaration = start.moduleName;
        if (start.moduleName) {
            this.moduleHandler = handler_1.Handler.handle(moduleDeclaration, this.context);
        }
        else {
            this.moduleHandler = null;
        }
        this.statementHandlers.length = 0;
        for (const statement of start.statements) {
            const handler = handler_1.Handler.handle(statement, this.context);
            this.statementHandlers.push(handler);
        }
        this.value = {
            type: "Script",
            module: (_a = this.moduleHandler) === null || _a === void 0 ? void 0 : _a.value,
            statements: this.statementHandlers.map(handler => handler === null || handler === void 0 ? void 0 : handler.value)
        };
    }
    _createSymbolAndScope(parentScope) {
        var _a;
        let moduleName = "module";
        const moduleNameContainer = (_a = this.value.module) === null || _a === void 0 ? void 0 : _a.name;
        if ((moduleNameContainer === null || moduleNameContainer === void 0 ? void 0 : moduleNameContainer.type) === "Identifier") {
            moduleName = moduleNameContainer.name;
        }
        else if ((moduleNameContainer === null || moduleNameContainer === void 0 ? void 0 : moduleNameContainer.type) === "StringLiteral") {
            moduleName = moduleNameContainer.value;
        }
        else {
            moduleName = this.context.fileName;
        }
        const symbol = this.declareSymbol(moduleName, "Module", parentScope);
        return symbol;
    }
    _collectDeclarations(childrenSymbols, currentScope) {
        if (!currentScope) {
            return null;
        }
        const scope = currentScope;
        // collect module statement declarations
        for (const child of childrenSymbols) {
            switch (child.type) {
                case "class":
                    {
                        scope.addClass(child);
                    }
                    break;
                case "struct":
                    {
                        scope.addStruct(child);
                    }
                    break;
                case "interface":
                    {
                        scope.addInterface(child);
                    }
                    break;
                case "enum":
                    {
                        scope.addEnum(child);
                    }
                    break;
                case "function":
                    {
                        scope.addFunction(child);
                    }
                    break;
                case "variable":
                    {
                        scope.addVariable(child);
                    }
                    break;
                default:
                    break;
            }
        }
        // TODO: debug only
        // prettyPrintSymbolTables(this._symbol);
        return currentScope.ownerSymbol;
    }
}
exports.ScriptHandler = ScriptHandler;
handler_1.Handler.registerHandler("Script", ScriptHandler);


/***/ }),

/***/ "./src/analyzer/semantic/statements/blockHandler.ts":
/*!**********************************************************!*\
  !*** ./src/analyzer/semantic/statements/blockHandler.ts ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BlockHandler = void 0;
const handler_1 = __webpack_require__(/*! ../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class BlockHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.bodyHandler = [];
    }
    get _children() {
        return [
            ...this.bodyHandler
        ];
    }
    _handle(node) {
        super._handle(node);
        this.bodyHandler.length = 0;
        for (const statement of node.body) {
            const handler = handler_1.Handler.handle(statement, this.context);
            this.bodyHandler.push(handler);
        }
        this.value = {
            type: "Block",
            isStatement: node.isStatement,
            body: this.bodyHandler.map(handler => handler === null || handler === void 0 ? void 0 : handler.value)
        };
    }
    _createSymbolAndScope(parentScope) {
        return this.declareSymbol("$Block", "Block", parentScope);
    }
    _collectDeclarations(childrenSymbols, currentScope) {
        if (!currentScope) {
            return null;
        }
        const scope = currentScope;
        for (const child of childrenSymbols) {
            // collect variables
            if (child.type === "variable") {
                scope.addVariable(child);
            }
            else {
                scope.addSubScope(child);
            }
        }
        return scope.ownerSymbol;
    }
}
exports.BlockHandler = BlockHandler;
handler_1.Handler.registerHandler("Block", BlockHandler);


/***/ }),

/***/ "./src/analyzer/semantic/statements/controls/breakContinueHandler.ts":
/*!***************************************************************************!*\
  !*** ./src/analyzer/semantic/statements/controls/breakContinueHandler.ts ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BreakContinueHandler = void 0;
const handler_1 = __webpack_require__(/*! ../../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class BreakContinueHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.exprHandler = null;
    }
    get _children() {
        return [
            this.exprHandler
        ];
    }
    _handle(node) {
        var _a;
        super._handle(node);
        if (node.expr) {
            this.exprHandler = handler_1.Handler.handle(node.expr, this.context);
        }
        else {
            this.exprHandler = null;
        }
        this.value = {
            type: "BreakContinueStatement",
            isContinue: !node.isBreak,
            expr: (_a = this.exprHandler) === null || _a === void 0 ? void 0 : _a.value
        };
    }
}
exports.BreakContinueHandler = BreakContinueHandler;
handler_1.Handler.registerHandler("BreakContinueStatement", BreakContinueHandler);


/***/ }),

/***/ "./src/analyzer/semantic/statements/controls/index.ts":
/*!************************************************************!*\
  !*** ./src/analyzer/semantic/statements/controls/index.ts ***!
  \************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
__webpack_require__(/*! ./returnHandler */ "./src/analyzer/semantic/statements/controls/returnHandler.ts");
__webpack_require__(/*! ./breakContinueHandler */ "./src/analyzer/semantic/statements/controls/breakContinueHandler.ts");
__webpack_require__(/*! ./outHandler */ "./src/analyzer/semantic/statements/controls/outHandler.ts");


/***/ }),

/***/ "./src/analyzer/semantic/statements/controls/outHandler.ts":
/*!*****************************************************************!*\
  !*** ./src/analyzer/semantic/statements/controls/outHandler.ts ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OutHandler = void 0;
const handler_1 = __webpack_require__(/*! ../../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class OutHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.exprHandler = null;
    }
    get _children() {
        return [
            this.exprHandler
        ];
    }
    _handle(node) {
        var _a;
        super._handle(node);
        if (node.expr) {
            this.exprHandler = handler_1.Handler.handle(node.expr, this.context);
        }
        else {
            this.exprHandler = null;
        }
        this.value = {
            type: "OutStatement",
            expr: (_a = this.exprHandler) === null || _a === void 0 ? void 0 : _a.value
        };
    }
}
exports.OutHandler = OutHandler;
handler_1.Handler.registerHandler("OutStatement", OutHandler);


/***/ }),

/***/ "./src/analyzer/semantic/statements/controls/returnHandler.ts":
/*!********************************************************************!*\
  !*** ./src/analyzer/semantic/statements/controls/returnHandler.ts ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ReturnStatementHandler = void 0;
const handler_1 = __webpack_require__(/*! ../../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class ReturnStatementHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.exprHandler = null;
    }
    get _children() {
        return [
            this.exprHandler
        ];
    }
    _handle(node) {
        var _a;
        super._handle(node);
        if (node.expr) {
            this.exprHandler = handler_1.Handler.handle(node.expr, this.context);
        }
        else {
            this.exprHandler = null;
        }
        this.value = {
            type: "ReturnStatement",
            expr: (_a = this.exprHandler) === null || _a === void 0 ? void 0 : _a.value
        };
    }
}
exports.ReturnStatementHandler = ReturnStatementHandler;
handler_1.Handler.registerHandler("ReturnStatement", ReturnStatementHandler);


/***/ }),

/***/ "./src/analyzer/semantic/statements/expressionHandler.ts":
/*!***************************************************************!*\
  !*** ./src/analyzer/semantic/statements/expressionHandler.ts ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ExpressionStatementHandler = void 0;
const handler_1 = __webpack_require__(/*! ../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class ExpressionStatementHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.exprHandler = null;
    }
    get _children() {
        return [
            this.exprHandler
        ];
    }
    _handle(node) {
        var _a;
        super._handle(node);
        this.exprHandler = handler_1.Handler.handle(node.expr, this.context);
        this.value = {
            type: 'ExpressionStatement',
            expr: (_a = this.exprHandler) === null || _a === void 0 ? void 0 : _a.value
        };
    }
}
exports.ExpressionStatementHandler = ExpressionStatementHandler;
handler_1.Handler.registerHandler("ExpressionStatement", ExpressionStatementHandler);


/***/ }),

/***/ "./src/analyzer/semantic/statements/index.ts":
/*!***************************************************!*\
  !*** ./src/analyzer/semantic/statements/index.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
__webpack_require__(/*! ./blockHandler */ "./src/analyzer/semantic/statements/blockHandler.ts");
__webpack_require__(/*! ./expressionHandler */ "./src/analyzer/semantic/statements/expressionHandler.ts");
__webpack_require__(/*! ./controls/index */ "./src/analyzer/semantic/statements/controls/index.ts");


/***/ }),

/***/ "./src/analyzer/semantic/types/genericDeclarationHandler.ts":
/*!******************************************************************!*\
  !*** ./src/analyzer/semantic/types/genericDeclarationHandler.ts ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GenericDeclarationHandler = void 0;
const handler_1 = __webpack_require__(/*! ../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class GenericDeclarationHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.typeArgumentsHandler = [];
    }
    get _children() {
        return [
            ...this.typeArgumentsHandler
        ];
    }
    _handle(node) {
        super._handle(node);
        const typeArguments = node.params;
        this.typeArgumentsHandler.length = 0;
        for (const typeArgument of typeArguments) {
            const handler = handler_1.Handler.handle(typeArgument, this.context);
            this.typeArgumentsHandler.push(handler);
        }
        this.value = {
            type: "Generic",
            typeArguments: this.typeArgumentsHandler.map(handler => handler === null || handler === void 0 ? void 0 : handler.value),
        };
    }
}
exports.GenericDeclarationHandler = GenericDeclarationHandler;
handler_1.Handler.registerHandler("GenericDeclaration", GenericDeclarationHandler);


/***/ }),

/***/ "./src/analyzer/semantic/types/genericHandler.ts":
/*!*******************************************************!*\
  !*** ./src/analyzer/semantic/types/genericHandler.ts ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GenericImplementHandler = void 0;
const handler_1 = __webpack_require__(/*! ../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class GenericImplementHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.typeArgumentsHandler = [];
    }
    get _children() {
        return [
            ...this.typeArgumentsHandler
        ];
    }
    _handle(node) {
        super._handle(node);
        const typeArguments = node.params;
        this.typeArgumentsHandler.length = 0;
        for (const typeArgument of typeArguments) {
            const handler = handler_1.Handler.handle(typeArgument, this.context);
            this.typeArgumentsHandler.push(handler);
        }
        this.value = {
            type: "Generic",
            typeArguments: this.typeArgumentsHandler.map(handler => handler === null || handler === void 0 ? void 0 : handler.value),
        };
    }
}
exports.GenericImplementHandler = GenericImplementHandler;
handler_1.Handler.registerHandler("GenericType", GenericImplementHandler);


/***/ }),

/***/ "./src/analyzer/semantic/types/index.ts":
/*!**********************************************!*\
  !*** ./src/analyzer/semantic/types/index.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
__webpack_require__(/*! ./types */ "./src/analyzer/semantic/types/types.ts");
__webpack_require__(/*! ./typeHandler */ "./src/analyzer/semantic/types/typeHandler.ts");
__webpack_require__(/*! ./tupleHandler */ "./src/analyzer/semantic/types/tupleHandler.ts");
__webpack_require__(/*! ./genericHandler */ "./src/analyzer/semantic/types/genericHandler.ts");
__webpack_require__(/*! ./parameterHandler */ "./src/analyzer/semantic/types/parameterHandler.ts");
__webpack_require__(/*! ./genericDeclarationHandler */ "./src/analyzer/semantic/types/genericDeclarationHandler.ts");


/***/ }),

/***/ "./src/analyzer/semantic/types/parameterHandler.ts":
/*!*********************************************************!*\
  !*** ./src/analyzer/semantic/types/parameterHandler.ts ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ParameterHandler = void 0;
const handler_1 = __webpack_require__(/*! ../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class ParameterHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.nameHandler = null;
        this.typeInfoHandler = null;
        this.defaultValueHandler = null;
    }
    get _children() {
        return [
            this.nameHandler,
            this.typeInfoHandler,
            this.defaultValueHandler
        ];
    }
    _handle(node) {
        var _a, _b, _c;
        super._handle(node);
        const name = node.name;
        this.nameHandler = handler_1.Handler.handle(name, this.context);
        const typeInfo = node.typeInfo;
        if (typeInfo) {
            this.typeInfoHandler = handler_1.Handler.handle(typeInfo, this.context);
        }
        else {
            this.typeInfoHandler = null;
        }
        if (node.defaultValue) {
            this.defaultValueHandler = handler_1.Handler.handle(node.defaultValue, this.context);
        }
        else {
            this.defaultValueHandler = null;
        }
        this.value = {
            type: "Parameter",
            name: (_a = this.nameHandler) === null || _a === void 0 ? void 0 : _a.value,
            typeInfo: (_b = this.typeInfoHandler) === null || _b === void 0 ? void 0 : _b.value,
            defaultValue: (_c = this.defaultValueHandler) === null || _c === void 0 ? void 0 : _c.value,
        };
    }
    _createSymbolAndScope(parentScope) {
        const name = this.value.name.name;
        return this.declareSymbol(name, "Parameter", parentScope);
    }
}
exports.ParameterHandler = ParameterHandler;
handler_1.Handler.registerHandler("Parameter", ParameterHandler);


/***/ }),

/***/ "./src/analyzer/semantic/types/tupleHandler.ts":
/*!*****************************************************!*\
  !*** ./src/analyzer/semantic/types/tupleHandler.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TupleImplementHandler = void 0;
const handler_1 = __webpack_require__(/*! ../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class TupleImplementHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.elementsHandler = [];
    }
    get _children() {
        return [
            ...this.elementsHandler
        ];
    }
    _handle(node) {
        super._handle(node);
        this.elementsHandler.length = 0;
        if (node.elements) {
            for (const element of node.elements) {
                const handler = handler_1.Handler.handle(element, this.context);
                this.elementsHandler.push(handler);
            }
        }
        this.value = {
            type: "Tuple",
            elements: this.elementsHandler.map(handler => handler === null || handler === void 0 ? void 0 : handler.value),
        };
    }
}
exports.TupleImplementHandler = TupleImplementHandler;
handler_1.Handler.registerHandler("TupleType", TupleImplementHandler);


/***/ }),

/***/ "./src/analyzer/semantic/types/typeHandler.ts":
/*!****************************************************!*\
  !*** ./src/analyzer/semantic/types/typeHandler.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TypeHandler = void 0;
const handler_1 = __webpack_require__(/*! ../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class TypeHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.nameHandler = null;
    }
    get _children() {
        return [
            this.nameHandler
        ];
    }
    _handle(node) {
        var _a;
        super._handle(node);
        this.nameHandler = handler_1.Handler.handle(node.name, this.context);
        this.value = {
            type: "Type",
            name: (_a = this.nameHandler) === null || _a === void 0 ? void 0 : _a.value,
            dimensions: node.dimensions
        };
    }
}
exports.TypeHandler = TypeHandler;
handler_1.Handler.registerHandler("Type", TypeHandler);


/***/ }),

/***/ "./src/analyzer/semantic/types/types.ts":
/*!**********************************************!*\
  !*** ./src/analyzer/semantic/types/types.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
__webpack_require__(/*! ./genericHandler */ "./src/analyzer/semantic/types/genericHandler.ts");
__webpack_require__(/*! ./tupleHandler */ "./src/analyzer/semantic/types/tupleHandler.ts");


/***/ }),

/***/ "./src/analyzer/static/index.ts":
/*!**************************************!*\
  !*** ./src/analyzer/static/index.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
__webpack_require__(/*! ./scope/index */ "./src/analyzer/static/scope/index.ts");
__webpack_require__(/*! ./type/index */ "./src/analyzer/static/type/index.ts");
__webpack_require__(/*! ./symbol/index */ "./src/analyzer/static/symbol/index.ts");


/***/ }),

/***/ "./src/analyzer/static/scope/blockScope.ts":
/*!*************************************************!*\
  !*** ./src/analyzer/static/scope/blockScope.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BlockScope = void 0;
const symbol_1 = __webpack_require__(/*! ../symbol/symbol */ "./src/analyzer/static/symbol/symbol.ts");
const scope_1 = __webpack_require__(/*! ./scope */ "./src/analyzer/static/scope/scope.ts");
class BlockScope extends scope_1.Scope {
    constructor() {
        super(...arguments);
        this.type = "BlockScope";
        this.variables = new symbol_1.SymbolTable();
        this.subScopeSymbols = new symbol_1.SymbolTable();
        this.symbolTableList = [this.variables, this.subScopeSymbols];
    }
    addVariable(variable) {
        const success = this.checkSymbolUnique(variable) && this.variables.addSymbol(variable);
        return success;
    }
    addSubScope(subScopes) {
        const success = this.subScopeSymbols.addSymbol(subScopes);
        return success;
    }
    _getSymbol(_symbol) {
        return this.variables.getSymbol(_symbol);
    }
}
exports.BlockScope = BlockScope;
scope_1.Scope.registerScope("Block", BlockScope);


/***/ }),

/***/ "./src/analyzer/static/scope/classScope.ts":
/*!*************************************************!*\
  !*** ./src/analyzer/static/scope/classScope.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ClassScope = void 0;
const access_1 = __webpack_require__(/*! ../../../types/access */ "./src/types/access.ts");
const symbol_1 = __webpack_require__(/*! ../symbol/symbol */ "./src/analyzer/static/symbol/symbol.ts");
const scope_1 = __webpack_require__(/*! ./scope */ "./src/analyzer/static/scope/scope.ts");
class ClassScope extends scope_1.Scope {
    constructor() {
        super(...arguments);
        this.type = "ClassScope";
        this.generics = new symbol_1.SymbolTable();
        this.fields = new symbol_1.SymbolTable();
        this.properties = new symbol_1.SymbolTable();
        this.methods = new symbol_1.SymbolTable();
        this.metaFunctions = new symbol_1.SymbolTable();
        this.symbolTableList = [this.generics, this.fields, this.properties, this.methods, this.metaFunctions];
    }
    addGeneric(generic) {
        const success = this.checkSymbolUnique(generic) && this.generics.addSymbol(generic);
        return success;
    }
    addField(field) {
        const success = this.checkSymbolUnique(field) && this.fields.addSymbol(field);
        return success;
    }
    addProperty(property) {
        return (0, symbol_1.checkSymbolOrSymbolArray)(property, (property) => {
            var _a, _b;
            const definedProperty = this.properties.getSymbol(property.name);
            if (definedProperty) {
                // check type of defined property
                if (definedProperty.propertyType === property.propertyType || definedProperty.propertyType === access_1.PropertyType.GET_SET) {
                    // TODO: throw error if they are the same type or if they are GET_SET
                    return false;
                }
                if (definedProperty.isStatic !== property.isStatic) {
                    // TODO: throw error if they are not the same type
                    return false;
                }
                // warning if they have different accessibility
                if (definedProperty.accessibility !== property.accessibility) {
                    // TODO: throw warning if they have different accessibility
                }
                // merge getter and setter body if they are not defined yet
                definedProperty.propertyType = access_1.PropertyType.GET_SET;
                const definedPropertyScope = definedProperty.childScope;
                const propertyScope = property.childScope;
                definedPropertyScope.getterSymbol = (_a = propertyScope.getterSymbol) !== null && _a !== void 0 ? _a : definedPropertyScope.getterSymbol;
                definedPropertyScope.setterSymbol = (_b = propertyScope.setterSymbol) !== null && _b !== void 0 ? _b : definedPropertyScope.setterSymbol;
                return true;
            }
            const success = this.checkSymbolUnique(property) && this.properties.addSymbol(property);
            return success;
        });
    }
    addMethod(method) {
        return (0, symbol_1.checkSymbolOrSymbolArray)(method, (method) => {
            if (method) {
                const definedMethod = this.methods.getSymbol(method.name);
                if (definedMethod) {
                    // now we are not able to check overloads signatures, just add into overload list
                    // it will be checked later when type is resolved
                    definedMethod.overloads.push(method);
                    return true;
                }
            }
            const success = this.checkSymbolUnique(method) && this.methods.addSymbol(method);
            return success;
        });
    }
    addMetaFunction(metaFunction) {
        return (0, symbol_1.checkSymbolOrSymbolArray)(metaFunction, (metaFunction) => {
            if (metaFunction) {
                const definedMetaFunction = this.metaFunctions.getSymbol(metaFunction.name);
                if (definedMetaFunction) {
                    definedMetaFunction.overloads.push(metaFunction);
                    return true;
                }
            }
            const success = this.metaFunctions.addSymbol(metaFunction);
            return success;
        });
    }
    _getSymbol(name) {
        const symbol = this.fields.getSymbol(name) || this.properties.getSymbol(name) || this.methods.getSymbol(name) || this.generics.getSymbol(name);
        return symbol;
    }
}
exports.ClassScope = ClassScope;
scope_1.Scope.registerScope("Class", ClassScope);


/***/ }),

/***/ "./src/analyzer/static/scope/enumScope.ts":
/*!************************************************!*\
  !*** ./src/analyzer/static/scope/enumScope.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EnumScope = void 0;
const symbol_1 = __webpack_require__(/*! ../symbol/symbol */ "./src/analyzer/static/symbol/symbol.ts");
const scope_1 = __webpack_require__(/*! ./scope */ "./src/analyzer/static/scope/scope.ts");
class EnumScope extends scope_1.Scope {
    constructor() {
        super(...arguments);
        this.type = "EnumScope";
        // 枚举类型
        this.enumMembers = new symbol_1.SymbolTable();
        this.symbolTableList = [this.enumMembers];
    }
    addMember(member) {
        return this.checkSymbolUnique(member) && this.enumMembers.addSymbol(member);
    }
    _getSymbol(_symbol) {
        return this.enumMembers.getSymbol(_symbol);
    }
}
exports.EnumScope = EnumScope;
scope_1.Scope.registerScope("Enum", EnumScope);


/***/ }),

/***/ "./src/analyzer/static/scope/functionScope.ts":
/*!****************************************************!*\
  !*** ./src/analyzer/static/scope/functionScope.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FunctionScope = void 0;
const symbol_1 = __webpack_require__(/*! ../symbol/symbol */ "./src/analyzer/static/symbol/symbol.ts");
const scope_1 = __webpack_require__(/*! ./scope */ "./src/analyzer/static/scope/scope.ts");
// 导出一个名为 FunctionScope 的类，该类继承自 Scope 类
class FunctionScope extends scope_1.Scope {
    constructor() {
        super(...arguments);
        this.type = "FunctionScope";
        this.body = null;
        this.generics = new symbol_1.SymbolTable();
        this.parameters = new symbol_1.SymbolTable();
        this.symbolTableList = [this.generics, this.parameters, () => this.body];
    }
    addGeneric(generic) {
        const success = this.checkSymbolUnique(generic) && this.generics.addSymbol(generic);
        return success;
    }
    addParameter(parameter) {
        const success = this.checkSymbolUnique(parameter) && this.parameters.addSymbol(parameter);
        return success;
    }
    setBody(body) {
        if (body instanceof Array) {
            this.body = body[0];
        }
        else {
            this.body = body !== null && body !== void 0 ? body : null;
        }
    }
    _getSymbol(_symbol) {
        return this.parameters.getSymbol(_symbol);
    }
}
exports.FunctionScope = FunctionScope;
scope_1.Scope.registerScope("Function", FunctionScope);


/***/ }),

/***/ "./src/analyzer/static/scope/index.ts":
/*!********************************************!*\
  !*** ./src/analyzer/static/scope/index.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
__webpack_require__(/*! ./scope */ "./src/analyzer/static/scope/scope.ts");
__webpack_require__(/*! ./blockScope */ "./src/analyzer/static/scope/blockScope.ts");
__webpack_require__(/*! ./functionScope */ "./src/analyzer/static/scope/functionScope.ts");
__webpack_require__(/*! ./propertyScope */ "./src/analyzer/static/scope/propertyScope.ts");
__webpack_require__(/*! ./enumScope */ "./src/analyzer/static/scope/enumScope.ts");
__webpack_require__(/*! ./classScope */ "./src/analyzer/static/scope/classScope.ts");
__webpack_require__(/*! ./interfaceScope */ "./src/analyzer/static/scope/interfaceScope.ts");
__webpack_require__(/*! ./structScope */ "./src/analyzer/static/scope/structScope.ts");
__webpack_require__(/*! ./moduleScope */ "./src/analyzer/static/scope/moduleScope.ts");


/***/ }),

/***/ "./src/analyzer/static/scope/interfaceScope.ts":
/*!*****************************************************!*\
  !*** ./src/analyzer/static/scope/interfaceScope.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InterfaceScope = void 0;
const symbol_1 = __webpack_require__(/*! ../symbol/symbol */ "./src/analyzer/static/symbol/symbol.ts");
const scope_1 = __webpack_require__(/*! ./scope */ "./src/analyzer/static/scope/scope.ts");
class InterfaceScope extends scope_1.Scope {
    constructor() {
        super(...arguments);
        this.type = "InterfaceScope";
        this.generics = new symbol_1.SymbolTable();
        this.fields = new symbol_1.SymbolTable();
        this.properties = new symbol_1.SymbolTable();
        this.methods = new symbol_1.SymbolTable();
        this.symbolTableList = [this.generics, this.fields, this.properties, this.methods];
    }
    addGeneric(generic) {
        const success = this.checkSymbolUnique(generic) && this.generics.addSymbol(generic);
        return success;
    }
    addField(field) {
        const success = this.checkSymbolUnique(field) && this.fields.addSymbol(field);
        return success;
    }
    addProperty(property) {
        const success = this.checkSymbolUnique(property) && this.properties.addSymbol(property);
        return success;
    }
    addMethod(method) {
        const success = this.checkSymbolUnique(method) && this.methods.addSymbol(method);
        return success;
    }
    _getSymbol(name) {
        const symbol = this.fields.getSymbol(name) || this.properties.getSymbol(name) || this.methods.getSymbol(name) || this.generics.getSymbol(name);
        return symbol;
    }
}
exports.InterfaceScope = InterfaceScope;
scope_1.Scope.registerScope("Interface", InterfaceScope);


/***/ }),

/***/ "./src/analyzer/static/scope/moduleScope.ts":
/*!**************************************************!*\
  !*** ./src/analyzer/static/scope/moduleScope.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ModuleScope = void 0;
const symbol_1 = __webpack_require__(/*! ../symbol/symbol */ "./src/analyzer/static/symbol/symbol.ts");
const scope_1 = __webpack_require__(/*! ./scope */ "./src/analyzer/static/scope/scope.ts");
class ModuleScope extends scope_1.Scope {
    constructor() {
        super(...arguments);
        this.type = "ModuleScope";
        this.functions = new symbol_1.SymbolTable();
        this.variables = new symbol_1.SymbolTable();
        this.classes = new symbol_1.SymbolTable();
        this.interfaces = new symbol_1.SymbolTable();
        this.structs = new symbol_1.SymbolTable();
        this.enums = new symbol_1.SymbolTable();
        this.symbolTableList = [this.functions, this.variables, this.classes, this.interfaces, this.structs, this.enums];
    }
    addFunction($function) {
        const success = this.checkSymbolUnique($function) && this.functions.addSymbol($function);
        return success;
    }
    addVariable(variable) {
        const success = this.checkSymbolUnique(variable) && this.variables.addSymbol(variable);
        return success;
    }
    addClass($class) {
        const success = this.checkSymbolUnique($class) && this.classes.addSymbol($class);
        return success;
    }
    addInterface($interface) {
        const success = this.checkSymbolUnique($interface) && this.interfaces.addSymbol($interface);
        return success;
    }
    addStruct($struct) {
        const success = this.checkSymbolUnique($struct) && this.structs.addSymbol($struct);
        return success;
    }
    addEnum($enum) {
        const success = this.checkSymbolUnique($enum) && this.enums.addSymbol($enum);
        return success;
    }
    _getSymbol(name) {
        const symbol = this.variables.getSymbol(name) || this.functions.getSymbol(name) || this.classes.getSymbol(name) || this.interfaces.getSymbol(name) || this.structs.getSymbol(name) || this.enums.getSymbol(name);
        return symbol;
    }
}
exports.ModuleScope = ModuleScope;
scope_1.Scope.registerScope("Module", ModuleScope);


/***/ }),

/***/ "./src/analyzer/static/scope/propertyScope.ts":
/*!****************************************************!*\
  !*** ./src/analyzer/static/scope/propertyScope.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PropertyScope = void 0;
const scope_1 = __webpack_require__(/*! ./scope */ "./src/analyzer/static/scope/scope.ts");
class PropertyScope extends scope_1.Scope {
    constructor() {
        super(...arguments);
        this.type = "PropertyScope";
        this.symbolTableList = [() => this.getterSymbol, () => this.setterSymbol];
    }
    setGetter(getter) {
        if (getter instanceof Array) {
            this.getterSymbol = getter[0];
        }
        else {
            this.getterSymbol = getter !== null && getter !== void 0 ? getter : null;
        }
    }
    setSetter(setter) {
        if (setter instanceof Array) {
            this.setterSymbol = setter[0];
        }
        else {
            this.setterSymbol = setter !== null && setter !== void 0 ? setter : null;
        }
    }
    _getSymbol(_symbol) {
        var _a;
        return (_a = (_symbol === "getter" ? this.getterSymbol : this.setterSymbol)) !== null && _a !== void 0 ? _a : undefined;
    }
}
exports.PropertyScope = PropertyScope;
scope_1.Scope.registerScope("Property", PropertyScope);


/***/ }),

/***/ "./src/analyzer/static/scope/scope.ts":
/*!********************************************!*\
  !*** ./src/analyzer/static/scope/scope.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Scope = void 0;
const symbol_1 = __webpack_require__(/*! ../symbol/symbol */ "./src/analyzer/static/symbol/symbol.ts");
class Scope {
    constructor(parentScope, ownerSymbol) {
        this.symbolTableList = [];
        this._parentScope = parentScope;
        this._ownerSymbol = ownerSymbol;
    }
    //
    get ownerSymbol() {
        return this._ownerSymbol;
    }
    static registerScope(scopeType, scope) {
        Scope.scopeMap.set(scopeType, scope);
    }
    static createScope(scopeType, parent, symbol) {
        const scope = Scope.scopeMap.get(scopeType);
        if (!scope) {
            return null;
        }
        return new scope(parent, symbol);
    }
    // 定义一个公共方法 getSymbol，用于获取符号对象
    getSymbol(symbol) {
        // 调用私有方法 _getSymbol，尝试获取符号对象
        const sym = this._getSymbol(symbol);
        // 如果获取到了符号对象，则直接返回该符号对象
        if (sym) {
            return sym;
        }
        // 如果当前对象没有父对象，则返回 null
        if (this._parentScope) {
            // 如果当前对象有父对象，则递归调用父对象的 getSymbol 方法，尝试从父对象中获取符号对象
            return this._parentScope.getSymbol(symbol);
        }
        // 如果当前对象及其父对象都没有找到符号对象，则返回 null
        return null;
    }
    checkSymbolUnique(symbol) {
        if (!symbol) {
            return false;
        }
        let symbolSet;
        if (symbol instanceof Array) {
            symbolSet = symbol;
        }
        else {
            symbolSet = [symbol];
        }
        let allSymbolUnique = true;
        for (const symbol of symbolSet) {
            for (const table of this.symbolTableList) {
                if (!table) {
                    continue;
                }
                if (table instanceof symbol_1.SymbolTable) {
                    const mayDuplicated = table.getSymbol(symbol.name);
                    if (mayDuplicated) {
                        (0, symbol_1.reportDuplicatedSymbol)(symbol, mayDuplicated);
                        allSymbolUnique = false;
                    }
                }
                else if (typeof (table) === "function") {
                    const realSymbol = table();
                    if (!realSymbol) {
                        continue;
                    }
                    if (realSymbol.name === symbol.name) {
                        (0, symbol_1.reportDuplicatedSymbol)(realSymbol, symbol);
                        allSymbolUnique = false;
                    }
                }
            }
        }
        return allSymbolUnique;
    }
    _getSymbol(_symbol) {
        return undefined;
    }
}
exports.Scope = Scope;
Scope.scopeMap = new Map();


/***/ }),

/***/ "./src/analyzer/static/scope/structScope.ts":
/*!**************************************************!*\
  !*** ./src/analyzer/static/scope/structScope.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StructScope = void 0;
const symbol_1 = __webpack_require__(/*! ../symbol/symbol */ "./src/analyzer/static/symbol/symbol.ts");
const scope_1 = __webpack_require__(/*! ./scope */ "./src/analyzer/static/scope/scope.ts");
class StructScope extends scope_1.Scope {
    constructor() {
        super(...arguments);
        this.type = "StructScope";
        this.generics = new symbol_1.SymbolTable();
        this.fields = new symbol_1.SymbolTable();
        this.methods = new symbol_1.SymbolTable();
        this.metaFunctions = new symbol_1.SymbolTable();
        this.symbolTableList = [this.generics, this.fields, this.methods];
    }
    addGeneric(generic) {
        const success = this.checkSymbolUnique(generic) && this.generics.addSymbol(generic);
        return success;
    }
    addField(field) {
        const success = this.checkSymbolUnique(field) && this.fields.addSymbol(field);
        return success;
    }
    addMethod(method) {
        const success = this.checkSymbolUnique(method) && this.methods.addSymbol(method);
        return success;
    }
    addMetaFunction(metaFunction) {
        const success = this.metaFunctions.addSymbol(metaFunction);
        return success;
    }
    _getSymbol(name) {
        const symbol = this.fields.getSymbol(name) || this.methods.getSymbol(name) || this.generics.getSymbol(name);
        return symbol;
    }
}
exports.StructScope = StructScope;
scope_1.Scope.registerScope("Struct", StructScope);


/***/ }),

/***/ "./src/analyzer/static/symbol/blockSymbol.ts":
/*!***************************************************!*\
  !*** ./src/analyzer/static/symbol/blockSymbol.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BlockSymbol = void 0;
const symbol_1 = __webpack_require__(/*! ./symbol */ "./src/analyzer/static/symbol/symbol.ts");
class BlockSymbol extends symbol_1.Symbol {
    constructor() {
        super(...arguments);
        this.type = "block";
    }
}
exports.BlockSymbol = BlockSymbol;
symbol_1.Symbol.registerSymbol("Block", BlockSymbol);


/***/ }),

/***/ "./src/analyzer/static/symbol/classSymbol.ts":
/*!***************************************************!*\
  !*** ./src/analyzer/static/symbol/classSymbol.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ClassSymbol = void 0;
const symbol_1 = __webpack_require__(/*! ./symbol */ "./src/analyzer/static/symbol/symbol.ts");
class ClassSymbol extends symbol_1.Symbol {
    constructor() {
        super(...arguments);
        this.type = "class";
        this.interfaces = [];
        this.decorators = [];
    }
}
exports.ClassSymbol = ClassSymbol;
symbol_1.Symbol.registerSymbol("Class", ClassSymbol);


/***/ }),

/***/ "./src/analyzer/static/symbol/enumSymbol.ts":
/*!**************************************************!*\
  !*** ./src/analyzer/static/symbol/enumSymbol.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EnumSymbol = void 0;
const symbol_1 = __webpack_require__(/*! ./symbol */ "./src/analyzer/static/symbol/symbol.ts");
class EnumSymbol extends symbol_1.Symbol {
    constructor() {
        super(...arguments);
        this.type = "enum";
    }
}
exports.EnumSymbol = EnumSymbol;
symbol_1.Symbol.registerSymbol("Enum", EnumSymbol);


/***/ }),

/***/ "./src/analyzer/static/symbol/fieldSymbol.ts":
/*!***************************************************!*\
  !*** ./src/analyzer/static/symbol/fieldSymbol.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FieldSymbol = void 0;
const variableSymbol_1 = __webpack_require__(/*! ./variableSymbol */ "./src/analyzer/static/symbol/variableSymbol.ts");
const symbol_1 = __webpack_require__(/*! ./symbol */ "./src/analyzer/static/symbol/symbol.ts");
class FieldSymbol extends variableSymbol_1.VariableSymbol {
    constructor() {
        super(...arguments);
        this.type = "field";
        // 函数装饰器
        this.decorators = [];
    }
}
exports.FieldSymbol = FieldSymbol;
symbol_1.Symbol.registerSymbol("Field", FieldSymbol);


/***/ }),

/***/ "./src/analyzer/static/symbol/functionSymbol.ts":
/*!******************************************************!*\
  !*** ./src/analyzer/static/symbol/functionSymbol.ts ***!
  \******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FunctionSymbol = void 0;
const symbol_1 = __webpack_require__(/*! ./symbol */ "./src/analyzer/static/symbol/symbol.ts");
class FunctionSymbol extends symbol_1.Symbol {
    constructor() {
        super(...arguments);
        this.type = "function";
        // 
        this.overloads = [];
        // 
        this.isStatic = false;
        // 
        this.decorators = [];
    }
}
exports.FunctionSymbol = FunctionSymbol;
symbol_1.Symbol.registerSymbol("Function", FunctionSymbol);


/***/ }),

/***/ "./src/analyzer/static/symbol/genericSymbol.ts":
/*!*****************************************************!*\
  !*** ./src/analyzer/static/symbol/genericSymbol.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GenericSymbol = void 0;
const fieldSymbol_1 = __webpack_require__(/*! ./fieldSymbol */ "./src/analyzer/static/symbol/fieldSymbol.ts");
const symbol_1 = __webpack_require__(/*! ./symbol */ "./src/analyzer/static/symbol/symbol.ts");
class GenericSymbol extends fieldSymbol_1.FieldSymbol {
    constructor() {
        super(...arguments);
        this.type = 'generic';
    }
}
exports.GenericSymbol = GenericSymbol;
symbol_1.Symbol.registerSymbol("Generic", GenericSymbol);


/***/ }),

/***/ "./src/analyzer/static/symbol/index.ts":
/*!*********************************************!*\
  !*** ./src/analyzer/static/symbol/index.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
__webpack_require__(/*! ./symbol */ "./src/analyzer/static/symbol/symbol.ts");
__webpack_require__(/*! ./variableSymbol */ "./src/analyzer/static/symbol/variableSymbol.ts");
__webpack_require__(/*! ./propertySymbol */ "./src/analyzer/static/symbol/propertySymbol.ts");
__webpack_require__(/*! ./blockSymbol */ "./src/analyzer/static/symbol/blockSymbol.ts");
__webpack_require__(/*! ./functionSymbol */ "./src/analyzer/static/symbol/functionSymbol.ts");
__webpack_require__(/*! ./parameterSymbol */ "./src/analyzer/static/symbol/parameterSymbol.ts");
__webpack_require__(/*! ./fieldSymbol */ "./src/analyzer/static/symbol/fieldSymbol.ts");
__webpack_require__(/*! ./genericSymbol */ "./src/analyzer/static/symbol/genericSymbol.ts");
__webpack_require__(/*! ./metaSymbol */ "./src/analyzer/static/symbol/metaSymbol.ts");
__webpack_require__(/*! ./classSymbol */ "./src/analyzer/static/symbol/classSymbol.ts");
__webpack_require__(/*! ./enumSymbol */ "./src/analyzer/static/symbol/enumSymbol.ts");
__webpack_require__(/*! ./structSymbol */ "./src/analyzer/static/symbol/structSymbol.ts");
__webpack_require__(/*! ./interfaceSymbol */ "./src/analyzer/static/symbol/interfaceSymbol.ts");
__webpack_require__(/*! ./moduleSymbol */ "./src/analyzer/static/symbol/moduleSymbol.ts");


/***/ }),

/***/ "./src/analyzer/static/symbol/interfaceSymbol.ts":
/*!*******************************************************!*\
  !*** ./src/analyzer/static/symbol/interfaceSymbol.ts ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InterfaceSymbol = void 0;
const symbol_1 = __webpack_require__(/*! ./symbol */ "./src/analyzer/static/symbol/symbol.ts");
class InterfaceSymbol extends symbol_1.Symbol {
    constructor() {
        super(...arguments);
        this.type = "interface";
        this.interfaces = [];
        this.decorators = [];
    }
}
exports.InterfaceSymbol = InterfaceSymbol;
symbol_1.Symbol.registerSymbol("Interface", InterfaceSymbol);


/***/ }),

/***/ "./src/analyzer/static/symbol/metaSymbol.ts":
/*!**************************************************!*\
  !*** ./src/analyzer/static/symbol/metaSymbol.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MetaSymbol = void 0;
const functionSymbol_1 = __webpack_require__(/*! ./functionSymbol */ "./src/analyzer/static/symbol/functionSymbol.ts");
const symbol_1 = __webpack_require__(/*! ./symbol */ "./src/analyzer/static/symbol/symbol.ts");
class MetaSymbol extends functionSymbol_1.FunctionSymbol {
    constructor() {
        super(...arguments);
        this.type = "meta";
        this.overloads = [];
    }
}
exports.MetaSymbol = MetaSymbol;
symbol_1.Symbol.registerSymbol("Meta", MetaSymbol);


/***/ }),

/***/ "./src/analyzer/static/symbol/moduleSymbol.ts":
/*!****************************************************!*\
  !*** ./src/analyzer/static/symbol/moduleSymbol.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ModuleSymbol = void 0;
const symbol_1 = __webpack_require__(/*! ./symbol */ "./src/analyzer/static/symbol/symbol.ts");
class ModuleSymbol extends symbol_1.Symbol {
    constructor() {
        super(...arguments);
        this.type = "module";
    }
}
exports.ModuleSymbol = ModuleSymbol;
symbol_1.Symbol.registerSymbol("Module", ModuleSymbol);


/***/ }),

/***/ "./src/analyzer/static/symbol/parameterSymbol.ts":
/*!*******************************************************!*\
  !*** ./src/analyzer/static/symbol/parameterSymbol.ts ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ParameterSymbol = void 0;
const variableSymbol_1 = __webpack_require__(/*! ./variableSymbol */ "./src/analyzer/static/symbol/variableSymbol.ts");
const symbol_1 = __webpack_require__(/*! ./symbol */ "./src/analyzer/static/symbol/symbol.ts");
class ParameterSymbol extends variableSymbol_1.VariableSymbol {
    constructor() {
        super(...arguments);
        this.type = "parameter";
    }
}
exports.ParameterSymbol = ParameterSymbol;
symbol_1.Symbol.registerSymbol("Parameter", ParameterSymbol);


/***/ }),

/***/ "./src/analyzer/static/symbol/propertySymbol.ts":
/*!******************************************************!*\
  !*** ./src/analyzer/static/symbol/propertySymbol.ts ***!
  \******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PropertySymbol = void 0;
const fieldSymbol_1 = __webpack_require__(/*! ./fieldSymbol */ "./src/analyzer/static/symbol/fieldSymbol.ts");
const symbol_1 = __webpack_require__(/*! ./symbol */ "./src/analyzer/static/symbol/symbol.ts");
class PropertySymbol extends fieldSymbol_1.FieldSymbol {
    constructor() {
        super(...arguments);
        this.type = 'property';
    }
}
exports.PropertySymbol = PropertySymbol;
symbol_1.Symbol.registerSymbol("Property", PropertySymbol);


/***/ }),

/***/ "./src/analyzer/static/symbol/structSymbol.ts":
/*!****************************************************!*\
  !*** ./src/analyzer/static/symbol/structSymbol.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StructSymbol = void 0;
const symbol_1 = __webpack_require__(/*! ./symbol */ "./src/analyzer/static/symbol/symbol.ts");
class StructSymbol extends symbol_1.Symbol {
    constructor() {
        super(...arguments);
        this.type = "struct";
    }
}
exports.StructSymbol = StructSymbol;
symbol_1.Symbol.registerSymbol("Struct", StructSymbol);


/***/ }),

/***/ "./src/analyzer/static/symbol/symbol.ts":
/*!**********************************************!*\
  !*** ./src/analyzer/static/symbol/symbol.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SymbolTable = exports.Symbol = void 0;
exports.checkSymbolOrSymbolArray = checkSymbolOrSymbolArray;
exports.reportDuplicatedSymbol = reportDuplicatedSymbol;
const duplicatedIdentifierError_1 = __webpack_require__(/*! ../../../errors/duplicatedIdentifierError */ "./src/errors/duplicatedIdentifierError.ts");
const zrInternalError_1 = __webpack_require__(/*! ../../../errors/zrInternalError */ "./src/errors/zrInternalError.ts");
class Symbol {
    constructor(name) {
        // if symbols has sub symbols, like destruction patterns symbol
        this.subSymbols = [];
        this.name = name;
    }
    static registerSymbol(symbolType, symbol) {
        Symbol.symbolMap.set(symbolType, symbol);
    }
    static createSymbol(symbolName, symbolType, handler, parentScope, location) {
        const symbolClass = Symbol.symbolMap.get(symbolType);
        if (!symbolClass) {
            return null;
        }
        const symbol = new symbolClass(symbolName);
        if (!symbol) {
            new zrInternalError_1.ZrInternalError(`Symbol ${symbolType} is not registered`, handler.context).report(); // TODO: throw
            return null;
        }
        symbol.location = location !== null && location !== void 0 ? location : handler.location;
        symbol.ownerScope = parentScope;
        symbol.context = handler.context;
        return symbol;
    }
}
exports.Symbol = Symbol;
Symbol.symbolMap = new Map();
function checkSymbolOrSymbolArray(symbolOrSymbolSet, predicate) {
    if (!symbolOrSymbolSet) {
        return true;
    }
    if (symbolOrSymbolSet instanceof Array) {
        let allCheckPass = true;
        for (const symbol of symbolOrSymbolSet) {
            allCheckPass && (allCheckPass = predicate(symbol));
        }
        return allCheckPass;
    }
    else {
        return predicate(symbolOrSymbolSet);
    }
}
class SymbolTable {
    constructor() {
        this.symbolTable = [];
    }
    addSymbol(symbol) {
        return checkSymbolOrSymbolArray(symbol, (symbol) => {
            if (symbol.type === "Function") {
                // TODO: Function Symbol We need to check its signature in type check round, it can be overloaded
                // so we pass the check here
                return true;
            }
            // variable destruction pattern can have multiple symbols with names, we should check all of them
            if (!symbol.name) {
                let finalResult = true;
                for (const subSymbol of symbol.subSymbols) {
                    const result = this.addSymbol(subSymbol);
                    finalResult = result && finalResult;
                }
                return finalResult;
            }
            // if the symbol is block symbol, we should add it to the symbol table without checking
            if (symbol.name === "$Block") {
                this.symbolTable.push(symbol);
                return true;
            }
            // if the symbol is lambda symbol, we should add it to the symbol table without checking
            if (symbol.name === "$Lambda") {
                this.symbolTable.push(symbol);
                return true;
            }
            const duplicatedCheckIndex = this.symbolTable.findIndex(s => s.name === symbol.name);
            if (duplicatedCheckIndex === -1) {
                this.symbolTable.push(symbol);
                return true;
            }
            else {
                const conflictSymbol = this.symbolTable[duplicatedCheckIndex];
                reportDuplicatedSymbol(symbol, conflictSymbol);
            }
            return true;
        });
    }
    // not for function symbol table
    getSymbol(name) {
        // TODO: if this symbol table is not for function
        return this.symbolTable.find(s => s.name === name);
    }
    // for function symbol table
    getSymbols(name) {
        // TODO: if this symbol table is for function
        return this.symbolTable.filter(s => s.name === name);
    }
}
exports.SymbolTable = SymbolTable;
function reportDuplicatedSymbol(triggerSymbol, conflictSymbol) {
    // TODO: check duplicated identifier
    // before throw error, we should set the location of the symbol to the duplicated symbol
    triggerSymbol.context.location = triggerSymbol.location;
    new duplicatedIdentifierError_1.DuplicatedIdentifierError(triggerSymbol.name, triggerSymbol.context, conflictSymbol.location).report();
}


/***/ }),

/***/ "./src/analyzer/static/symbol/variableSymbol.ts":
/*!******************************************************!*\
  !*** ./src/analyzer/static/symbol/variableSymbol.ts ***!
  \******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VariableSymbol = void 0;
const symbol_1 = __webpack_require__(/*! ./symbol */ "./src/analyzer/static/symbol/symbol.ts");
class VariableSymbol extends symbol_1.Symbol {
    constructor() {
        super(...arguments);
        this.type = "variable";
    }
}
exports.VariableSymbol = VariableSymbol;
symbol_1.Symbol.registerSymbol("Variable", VariableSymbol);


/***/ }),

/***/ "./src/analyzer/static/type/index.ts":
/*!*******************************************!*\
  !*** ./src/analyzer/static/type/index.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
__webpack_require__(/*! ./type */ "./src/analyzer/static/type/type.ts");


/***/ }),

/***/ "./src/analyzer/static/type/type.ts":
/*!******************************************!*\
  !*** ./src/analyzer/static/type/type.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TypeReference = void 0;
class TypeReference {
}
exports.TypeReference = TypeReference;


/***/ }),

/***/ "./src/analyzer/utils/zrHandlerDispatcher.ts":
/*!***************************************************!*\
  !*** ./src/analyzer/utils/zrHandlerDispatcher.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ZrHandlerDispatcher = void 0;
class ZrHandlerDispatcher {
    constructor(topLevelHandler) {
        this.topLevelHandler = topLevelHandler;
    }
    runTaskTopDown(predicate) {
        return this._runTaskTopDownImpl(this.topLevelHandler, null, predicate);
    }
    runTaskBottomUp(predicate) {
        return this._runTaskBottomUpImpl(this.topLevelHandler, predicate);
    }
    runTaskAround(topDownPredicate, bottomUpPredicate) {
        return this._runTaskAroundImpl(this.topLevelHandler, null, topDownPredicate, bottomUpPredicate);
    }
    _runTaskTopDownImpl(handler, upperResult, predicate) {
        const children = handler.children;
        const result = predicate(handler, upperResult);
        for (const child of children) {
            // broadcast to children the parent or upper result
            this._runTaskTopDownImpl(child, result !== null && result !== void 0 ? result : upperResult, predicate);
        }
        return result;
    }
    _runTaskBottomUpImpl(handler, predicate) {
        var _a;
        const children = handler.children;
        const bottomUpResult = [];
        for (const child of children) {
            const result = this._runTaskBottomUpImpl(child, predicate);
            if (result instanceof Array) {
                bottomUpResult.push(...result);
            }
            else if (result) {
                bottomUpResult.push(result);
            }
        }
        // feedback to parent the children's result or lower result
        return (_a = predicate(handler, bottomUpResult)) !== null && _a !== void 0 ? _a : bottomUpResult;
    }
    _runTaskAroundImpl(handler, upperResult, topDownPredicate, bottomUpPredicate) {
        var _a;
        const children = handler.children;
        const thisResult = topDownPredicate(handler, upperResult);
        const bottomUpResult = [];
        for (const child of children) {
            const result = this._runTaskAroundImpl(child, thisResult !== null && thisResult !== void 0 ? thisResult : upperResult, topDownPredicate, bottomUpPredicate);
            if (result instanceof Array) {
                bottomUpResult.push(...result);
            }
            else if (result) {
                bottomUpResult.push(result);
            }
        }
        return (_a = bottomUpPredicate(handler, bottomUpResult, thisResult)) !== null && _a !== void 0 ? _a : bottomUpResult;
    }
}
exports.ZrHandlerDispatcher = ZrHandlerDispatcher;


/***/ }),

/***/ "./src/analyzer/zrSemanticAnalyzer.ts":
/*!********************************************!*\
  !*** ./src/analyzer/zrSemanticAnalyzer.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ZrSemanticAnalyzer = void 0;
const handler_1 = __webpack_require__(/*! ./semantic/common/handler */ "./src/analyzer/semantic/common/handler.ts");
__webpack_require__(/*! ./semantic/index */ "./src/analyzer/semantic/index.ts");
__webpack_require__(/*! ./static/index */ "./src/analyzer/static/index.ts");
const zrHandlerDispatcher_1 = __webpack_require__(/*! ./utils/zrHandlerDispatcher */ "./src/analyzer/utils/zrHandlerDispatcher.ts");
const prettyPrint_1 = __webpack_require__(/*! ../utils/prettyPrint */ "./src/utils/prettyPrint.ts");
class ZrSemanticAnalyzer {
    constructor(context) {
        this.context = context;
    }
    analyze() {
        this.scriptHandler = handler_1.Handler.handle(this.context.ast, this.context);
        this.handlerDispatcher = new zrHandlerDispatcher_1.ZrHandlerDispatcher(this.scriptHandler);
        // create symbol and scope
        const topSymbol = this.handlerDispatcher.runTaskAround((handler, upperResult) => {
            var _a, _b;
            return (_b = handler.createSymbolAndScope((_a = upperResult === null || upperResult === void 0 ? void 0 : upperResult.childScope) !== null && _a !== void 0 ? _a : null)) !== null && _b !== void 0 ? _b : null;
        }, (handler, lowerResult, selfTopDownResult) => {
            var _a, _b;
            return (_b = handler.collectDeclarations(lowerResult, (_a = selfTopDownResult === null || selfTopDownResult === void 0 ? void 0 : selfTopDownResult.childScope) !== null && _a !== void 0 ? _a : null)) !== null && _b !== void 0 ? _b : selfTopDownResult;
        });
        (0, prettyPrint_1.prettyPrintSymbolTables)(topSymbol);
    }
}
exports.ZrSemanticAnalyzer = ZrSemanticAnalyzer;


/***/ }),

/***/ "./src/common/scriptContext.ts":
/*!*************************************!*\
  !*** ./src/common/scriptContext.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ScriptContext = void 0;
class ScriptContext {
    constructor(info) {
        this.encoding = "utf-8";
        this._scopeStack = [];
        this._handlerStack = [];
        this.compilingDirectory = info.compilingDirectory;
        this.fileRelativePath = info.fileRelativePath;
        this.encoding = info.encoding;
    }
    pushHandler(currentHandler) {
        this._handlerStack.push(currentHandler);
    }
    popHandler() {
        return this._handlerStack.pop();
    }
}
exports.ScriptContext = ScriptContext;


/***/ }),

/***/ "./src/configurations/zrErrorCode.ts":
/*!*******************************************!*\
  !*** ./src/configurations/zrErrorCode.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ZrErrorCode = void 0;
var ZrErrorCode;
(function (ZrErrorCode) {
    ZrErrorCode[ZrErrorCode["UnknownError"] = 4096] = "UnknownError";
    ZrErrorCode[ZrErrorCode["ParserError"] = 8193] = "ParserError";
    ZrErrorCode[ZrErrorCode["SyntaxError"] = 8194] = "SyntaxError";
    ZrErrorCode[ZrErrorCode["SemanticError"] = 12288] = "SemanticError";
    ZrErrorCode[ZrErrorCode["NoHandler"] = 12289] = "NoHandler";
    ZrErrorCode[ZrErrorCode["DuplicatedIdentifier"] = 12290] = "DuplicatedIdentifier";
})(ZrErrorCode || (exports.ZrErrorCode = ZrErrorCode = {}));


/***/ }),

/***/ "./src/errors/duplicatedIdentifierError.ts":
/*!*************************************************!*\
  !*** ./src/errors/duplicatedIdentifierError.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DuplicatedIdentifierError = void 0;
const zrErrorCode_1 = __webpack_require__(/*! ../configurations/zrErrorCode */ "./src/configurations/zrErrorCode.ts");
const zrSemanticError_1 = __webpack_require__(/*! ./zrSemanticError */ "./src/errors/zrSemanticError.ts");
class DuplicatedIdentifierError extends zrSemanticError_1.ZrSemanticError {
    get isFault() {
        return false;
    }
    constructor(identifier, context, duplicatedAt) {
        super(zrErrorCode_1.ZrErrorCode.DuplicatedIdentifier, context);
        if (duplicatedAt) {
            const start = `${duplicatedAt.start.line}:${duplicatedAt.start.column}`;
            const end = `${duplicatedAt.end.line}:${duplicatedAt.end.column}`;
            this.message = i("duplicatedIdentifierError", { identifier, start, end });
        }
        else {
            this.message = i("duplicatedIdentifierError", { identifier, start: "?", end: "?" });
        }
    }
}
exports.DuplicatedIdentifierError = DuplicatedIdentifierError;


/***/ }),

/***/ "./src/errors/noHandlerError.ts":
/*!**************************************!*\
  !*** ./src/errors/noHandlerError.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NoHandlerError = void 0;
const zrErrorCode_1 = __webpack_require__(/*! ../configurations/zrErrorCode */ "./src/configurations/zrErrorCode.ts");
const zrSemanticError_1 = __webpack_require__(/*! ./zrSemanticError */ "./src/errors/zrSemanticError.ts");
class NoHandlerError extends zrSemanticError_1.ZrSemanticError {
    get isFault() {
        return false;
    }
    constructor(handleType, context) {
        super(zrErrorCode_1.ZrErrorCode.NoHandler, context);
        this.message = i(`noHandlerError`, { type: handleType });
    }
}
exports.NoHandlerError = NoHandlerError;


/***/ }),

/***/ "./src/errors/zrError.ts":
/*!*******************************!*\
  !*** ./src/errors/zrError.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ZrError = void 0;
const logger_1 = __webpack_require__(/*! ../utils/logger */ "./src/utils/logger.ts");
class ZrError extends Error {
    get isFault() {
        return false;
    }
    constructor(errCode, fileName, location) {
        super();
        this.errCode = errCode;
        this.location = location;
        this.fileName = fileName;
    }
    report() {
        var _a, _b, _c, _d, _e, _f;
        if (this.location) {
            this.message = i("commonError", {
                errCode: this.errCode.toFixed(),
                message: this.message,
                file: this.fileName,
                line: (_c = (_b = (_a = this.location) === null || _a === void 0 ? void 0 : _a.start) === null || _b === void 0 ? void 0 : _b.line) === null || _c === void 0 ? void 0 : _c.toFixed(),
                column: (_f = (_e = (_d = this.location) === null || _d === void 0 ? void 0 : _d.start) === null || _e === void 0 ? void 0 : _e.column) === null || _f === void 0 ? void 0 : _f.toFixed()
            });
        }
        else {
            this.message = i("commonError2", {
                errCode: this.errCode.toFixed(),
                message: this.message,
                file: this.fileName
            });
        }
        if (this.isFault) {
            throw this;
        }
        logger_1.Logger.error(this.message);
    }
}
exports.ZrError = ZrError;


/***/ }),

/***/ "./src/errors/zrInternalError.ts":
/*!***************************************!*\
  !*** ./src/errors/zrInternalError.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ZrInternalError = void 0;
const zrErrorCode_1 = __webpack_require__(/*! ../configurations/zrErrorCode */ "./src/configurations/zrErrorCode.ts");
const zrSemanticError_1 = __webpack_require__(/*! ./zrSemanticError */ "./src/errors/zrSemanticError.ts");
class ZrInternalError extends zrSemanticError_1.ZrSemanticError {
    get isFault() {
        return false;
    }
    constructor(message, context) {
        super(zrErrorCode_1.ZrErrorCode.NoHandler, context);
        this.message = i(`internalError`, { message });
    }
}
exports.ZrInternalError = ZrInternalError;


/***/ }),

/***/ "./src/errors/zrParserError.ts":
/*!*************************************!*\
  !*** ./src/errors/zrParserError.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ZrParserError = void 0;
const zrErrorCode_1 = __webpack_require__(/*! ../configurations/zrErrorCode */ "./src/configurations/zrErrorCode.ts");
const zrError_1 = __webpack_require__(/*! ./zrError */ "./src/errors/zrError.ts");
class ZrParserError extends zrError_1.ZrError {
    get isFault() {
        return true;
    }
    constructor(context, message) {
        super(zrErrorCode_1.ZrErrorCode.ParserError, context.fileName);
        this.message = i("parserError", {
            message
        });
    }
}
exports.ZrParserError = ZrParserError;


/***/ }),

/***/ "./src/errors/zrSemanticError.ts":
/*!***************************************!*\
  !*** ./src/errors/zrSemanticError.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ZrSemanticError = void 0;
const zrError_1 = __webpack_require__(/*! ./zrError */ "./src/errors/zrError.ts");
class ZrSemanticError extends zrError_1.ZrError {
    constructor(errCode, context) {
        super(errCode, context.fileName, context.location);
        this.errCode = errCode;
    }
}
exports.ZrSemanticError = ZrSemanticError;


/***/ }),

/***/ "./src/errors/zrSyntaxError.ts":
/*!*************************************!*\
  !*** ./src/errors/zrSyntaxError.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ZrSyntaxError = void 0;
const zrErrorCode_1 = __webpack_require__(/*! ../configurations/zrErrorCode */ "./src/configurations/zrErrorCode.ts");
const zrError_1 = __webpack_require__(/*! ./zrError */ "./src/errors/zrError.ts");
class ZrSyntaxError extends zrError_1.ZrError {
    get isFault() {
        return true;
    }
    constructor(context, message) {
        const range = context.syntaxErrorRange;
        const location = context.syntaxErrorRange;
        super(zrErrorCode_1.ZrErrorCode.SyntaxError, context.filePath, location);
        if (range) {
            this.message = i("syntaxError", {
                fromLine: range.start.line.toFixed(),
                fromColumn: range.start.column.toFixed(),
                toLine: range.end.line.toFixed(),
                toColumn: range.end.column.toFixed(),
                message: message
            });
        }
        else {
            this.message = i("syntaxError2", {
                message: message
            });
        }
    }
}
exports.ZrSyntaxError = ZrSyntaxError;


/***/ }),

/***/ "./src/io/zrFileReader.ts":
/*!********************************!*\
  !*** ./src/io/zrFileReader.ts ***!
  \********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ZrFileReader = void 0;
const fs_1 = __importDefault(__webpack_require__(/*! fs */ "fs"));
class ZrFileReader {
    constructor(context) {
        this.context = context;
    }
    read() {
        return __awaiter(this, void 0, void 0, function* () {
            const filePath = this.context.filePath;
            const encoding = this.context.encoding;
            const scriptText = yield fs_1.default.promises.readFile(filePath, { encoding });
            this.context.scriptText = scriptText;
        });
    }
}
exports.ZrFileReader = ZrFileReader;


/***/ }),

/***/ "./src/io/zrFileResolver.ts":
/*!**********************************!*\
  !*** ./src/io/zrFileResolver.ts ***!
  \**********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ZrFileResolver = void 0;
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
class ZrFileResolver {
    constructor(context) {
        this.context = context;
    }
    resolve() {
        const compilingDirectory = this.context.compilingDirectory;
        const fileRelativePath = this.context.fileRelativePath;
        const fullPath = path_1.default.join(compilingDirectory, fileRelativePath);
        this.context.filePath = path_1.default.resolve(fullPath);
        this.context.fileName = path_1.default.basename(fullPath);
    }
}
exports.ZrFileResolver = ZrFileResolver;


/***/ }),

/***/ "./src/parser/generated/parser.ts":
/*!****************************************!*\
  !*** ./src/parser/generated/parser.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, exports) => {


/* eslint-disable */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PeggySyntaxError = exports.parse = void 0;
const peggyParser = // Generated by Peggy 3.0.2.
 
//
// https://peggyjs.org/
// @ts-ignore
(function () {
    // @ts-ignore
    "use strict";
    // @ts-ignore
    function peg$subclass(child, parent) {
        // @ts-ignore
        function C() { this.constructor = child; }
        // @ts-ignore
        C.prototype = parent.prototype;
        // @ts-ignore
        child.prototype = new C();
    }
    // @ts-ignore
    function peg$SyntaxError(message, expected, found, location) {
        // @ts-ignore
        var self = Error.call(this, message);
        // istanbul ignore next Check is a necessary evil to support older environments
        // @ts-ignore
        if (Object.setPrototypeOf) {
            // @ts-ignore
            Object.setPrototypeOf(self, peg$SyntaxError.prototype);
        }
        // @ts-ignore
        self.expected = expected;
        // @ts-ignore
        self.found = found;
        // @ts-ignore
        self.location = location;
        // @ts-ignore
        self.name = "SyntaxError";
        // @ts-ignore
        return self;
    }
    // @ts-ignore
    peg$subclass(peg$SyntaxError, Error);
    // @ts-ignore
    function peg$padEnd(str, targetLength, padString) {
        // @ts-ignore
        padString = padString || " ";
        // @ts-ignore
        if (str.length > targetLength) {
            return str;
        }
        // @ts-ignore
        targetLength -= str.length;
        // @ts-ignore
        padString += padString.repeat(targetLength);
        // @ts-ignore
        return str + padString.slice(0, targetLength);
    }
    // @ts-ignore
    peg$SyntaxError.prototype.format = function (sources) {
        // @ts-ignore
        var str = "Error: " + this.message;
        // @ts-ignore
        if (this.location) {
            // @ts-ignore
            var src = null;
            // @ts-ignore
            var k;
            // @ts-ignore
            for (k = 0; k < sources.length; k++) {
                // @ts-ignore
                if (sources[k].source === this.location.source) {
                    // @ts-ignore
                    src = sources[k].text.split(/\r\n|\n|\r/g);
                    // @ts-ignore
                    break;
                }
            }
            // @ts-ignore
            var s = this.location.start;
            // @ts-ignore
            var offset_s = (this.location.source && (typeof this.location.source.offset === "function"))
                // @ts-ignore
                ? this.location.source.offset(s)
                // @ts-ignore
                : s;
            // @ts-ignore
            var loc = this.location.source + ":" + offset_s.line + ":" + offset_s.column;
            // @ts-ignore
            if (src) {
                // @ts-ignore
                var e = this.location.end;
                // @ts-ignore
                var filler = peg$padEnd("", offset_s.line.toString().length, ' ');
                // @ts-ignore
                var line = src[s.line - 1];
                // @ts-ignore
                var last = s.line === e.line ? e.column : line.length + 1;
                // @ts-ignore
                var hatLen = (last - s.column) || 1;
                // @ts-ignore
                str += "\n --> " + loc + "\n"
                    // @ts-ignore
                    + filler + " |\n"
                    // @ts-ignore
                    + offset_s.line + " | " + line + "\n"
                    // @ts-ignore
                    + filler + " | " + peg$padEnd("", s.column - 1, ' ')
                    // @ts-ignore
                    + peg$padEnd("", hatLen, "^");
                // @ts-ignore
            }
            else {
                // @ts-ignore
                str += "\n at " + loc;
            }
        }
        // @ts-ignore
        return str;
    };
    // @ts-ignore
    peg$SyntaxError.buildMessage = function (expected, found) {
        // @ts-ignore
        var DESCRIBE_EXPECTATION_FNS = {
            // @ts-ignore
            literal: function (expectation) {
                // @ts-ignore
                return "\"" + literalEscape(expectation.text) + "\"";
            },
            // @ts-ignore
            class: function (expectation) {
                // @ts-ignore
                var escapedParts = expectation.parts.map(function (part) {
                    // @ts-ignore
                    return Array.isArray(part)
                        // @ts-ignore
                        ? classEscape(part[0]) + "-" + classEscape(part[1])
                        // @ts-ignore
                        : classEscape(part);
                });
                // @ts-ignore
                return "[" + (expectation.inverted ? "^" : "") + escapedParts.join("") + "]";
            },
            // @ts-ignore
            any: function () {
                // @ts-ignore
                return "any character";
            },
            // @ts-ignore
            end: function () {
                // @ts-ignore
                return "end of input";
            },
            // @ts-ignore
            other: function (expectation) {
                // @ts-ignore
                return expectation.description;
            }
        };
        // @ts-ignore
        function hex(ch) {
            // @ts-ignore
            return ch.charCodeAt(0).toString(16).toUpperCase();
        }
        // @ts-ignore
        function literalEscape(s) {
            // @ts-ignore
            return s
                // @ts-ignore
                .replace(/\\/g, "\\\\")
                // @ts-ignore
                .replace(/"/g, "\\\"")
                // @ts-ignore
                .replace(/\0/g, "\\0")
                // @ts-ignore
                .replace(/\t/g, "\\t")
                // @ts-ignore
                .replace(/\n/g, "\\n")
                // @ts-ignore
                .replace(/\r/g, "\\r")
                // @ts-ignore
                .replace(/[\x00-\x0F]/g, function (ch) { return "\\x0" + hex(ch); })
                // @ts-ignore
                .replace(/[\x10-\x1F\x7F-\x9F]/g, function (ch) { return "\\x" + hex(ch); });
        }
        // @ts-ignore
        function classEscape(s) {
            // @ts-ignore
            return s
                // @ts-ignore
                .replace(/\\/g, "\\\\")
                // @ts-ignore
                .replace(/\]/g, "\\]")
                // @ts-ignore
                .replace(/\^/g, "\\^")
                // @ts-ignore
                .replace(/-/g, "\\-")
                // @ts-ignore
                .replace(/\0/g, "\\0")
                // @ts-ignore
                .replace(/\t/g, "\\t")
                // @ts-ignore
                .replace(/\n/g, "\\n")
                // @ts-ignore
                .replace(/\r/g, "\\r")
                // @ts-ignore
                .replace(/[\x00-\x0F]/g, function (ch) { return "\\x0" + hex(ch); })
                // @ts-ignore
                .replace(/[\x10-\x1F\x7F-\x9F]/g, function (ch) { return "\\x" + hex(ch); });
        }
        // @ts-ignore
        function describeExpectation(expectation) {
            // @ts-ignore
            return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
        }
        // @ts-ignore
        function describeExpected(expected) {
            // @ts-ignore
            var descriptions = expected.map(describeExpectation);
            // @ts-ignore
            var i, j;
            // @ts-ignore
            descriptions.sort();
            // @ts-ignore
            if (descriptions.length > 0) {
                // @ts-ignore
                for (i = 1, j = 1; i < descriptions.length; i++) {
                    // @ts-ignore
                    if (descriptions[i - 1] !== descriptions[i]) {
                        // @ts-ignore
                        descriptions[j] = descriptions[i];
                        // @ts-ignore
                        j++;
                    }
                }
                // @ts-ignore
                descriptions.length = j;
            }
            // @ts-ignore
            switch (descriptions.length) {
                // @ts-ignore
                case 1:
                    // @ts-ignore
                    return descriptions[0];
                // @ts-ignore
                case 2:
                    // @ts-ignore
                    return descriptions[0] + " or " + descriptions[1];
                // @ts-ignore
                default:
                    // @ts-ignore
                    return descriptions.slice(0, -1).join(", ")
                        // @ts-ignore
                        + ", or "
                        // @ts-ignore
                        + descriptions[descriptions.length - 1];
            }
        }
        // @ts-ignore
        function describeFound(found) {
            // @ts-ignore
            return found ? "\"" + literalEscape(found) + "\"" : "end of input";
        }
        // @ts-ignore
        return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
    };
    // @ts-ignore
    function peg$parse(input, options) {
        // @ts-ignore
        options = options !== undefined ? options : {};
        // @ts-ignore
        var peg$FAILED = {};
        // @ts-ignore
        var peg$source = options.grammarSource;
        // @ts-ignore
        var peg$startRuleFunctions = { start: peg$parsestart };
        // @ts-ignore
        var peg$startRuleFunction = peg$parsestart;
        // @ts-ignore
        var peg$c0 = "module";
        var peg$c1 = "struct";
        var peg$c2 = "class";
        var peg$c3 = "interface";
        var peg$c4 = "enum";
        var peg$c5 = "var";
        var peg$c6 = "pub";
        var peg$c7 = "pri";
        var peg$c8 = "pro";
        var peg$c9 = "if";
        var peg$c10 = "else";
        var peg$c11 = "switch";
        var peg$c12 = "while";
        var peg$c13 = "for";
        var peg$c14 = "break";
        var peg$c15 = "continue";
        var peg$c16 = "return";
        var peg$c17 = "super";
        var peg$c18 = "new";
        var peg$c19 = "set";
        var peg$c20 = "get";
        var peg$c21 = "static";
        var peg$c22 = "in";
        var peg$c23 = "out";
        var peg$c24 = "...";
        var peg$c25 = "?";
        var peg$c26 = ":";
        var peg$c27 = ";";
        var peg$c28 = ",";
        var peg$c29 = ".";
        var peg$c30 = "~";
        var peg$c31 = "@";
        var peg$c32 = "#";
        var peg$c33 = "$";
        var peg$c34 = "(";
        var peg$c35 = ")";
        var peg$c36 = "{";
        var peg$c37 = "}";
        var peg$c38 = "[";
        var peg$c39 = "]";
        var peg$c40 = "=";
        var peg$c41 = "+=";
        var peg$c42 = "-=";
        var peg$c43 = "*=";
        var peg$c44 = "/=";
        var peg$c45 = "%=";
        var peg$c46 = "==";
        var peg$c47 = "!=";
        var peg$c48 = "!";
        var peg$c49 = "<";
        var peg$c50 = "<=";
        var peg$c51 = ">";
        var peg$c52 = ">=";
        var peg$c53 = "+";
        var peg$c54 = "-";
        var peg$c55 = "*";
        var peg$c56 = "/";
        var peg$c57 = "%";
        var peg$c58 = "&&";
        var peg$c59 = "||";
        var peg$c60 = "=>";
        var peg$c61 = "true";
        var peg$c62 = "false";
        var peg$c63 = "0x";
        var peg$c64 = "0";
        var peg$c65 = "'";
        var peg$c66 = "\"";
        var peg$c67 = "null";
        var peg$c68 = "//";
        var peg$c69 = "/*";
        var peg$c70 = "*/";
        var peg$r0 = /^[A-Za-z_]/;
        var peg$r1 = /^[A-Za-z0-9_]/;
        var peg$r2 = /^[1-9]/;
        var peg$r3 = /^[0-9]/;
        var peg$r4 = /^[0-9a-fA-F]/;
        var peg$r5 = /^[0-7]/;
        var peg$r6 = /^["\n\r"]/;
        var peg$r7 = /^[eE]/;
        var peg$r8 = /^[+\-]/;
        var peg$r9 = /^[\n\r]/;
        var peg$r10 = /^[ \t\n\r]/;
        var peg$e0 = peg$classExpectation([["A", "Z"], ["a", "z"], "_"], false, false);
        var peg$e1 = peg$classExpectation([["A", "Z"], ["a", "z"], ["0", "9"], "_"], false, false);
        var peg$e2 = peg$literalExpectation("module", false);
        var peg$e3 = peg$literalExpectation("struct", false);
        var peg$e4 = peg$literalExpectation("class", false);
        var peg$e5 = peg$literalExpectation("interface", false);
        var peg$e6 = peg$literalExpectation("enum", false);
        var peg$e7 = peg$literalExpectation("var", false);
        var peg$e8 = peg$literalExpectation("pub", false);
        var peg$e9 = peg$literalExpectation("pri", false);
        var peg$e10 = peg$literalExpectation("pro", false);
        var peg$e11 = peg$literalExpectation("if", false);
        var peg$e12 = peg$literalExpectation("else", false);
        var peg$e13 = peg$literalExpectation("switch", false);
        var peg$e14 = peg$literalExpectation("while", false);
        var peg$e15 = peg$literalExpectation("for", false);
        var peg$e16 = peg$literalExpectation("break", false);
        var peg$e17 = peg$literalExpectation("continue", false);
        var peg$e18 = peg$literalExpectation("return", false);
        var peg$e19 = peg$literalExpectation("super", false);
        var peg$e20 = peg$literalExpectation("new", false);
        var peg$e21 = peg$literalExpectation("set", false);
        var peg$e22 = peg$literalExpectation("get", false);
        var peg$e23 = peg$literalExpectation("static", false);
        var peg$e24 = peg$literalExpectation("in", false);
        var peg$e25 = peg$literalExpectation("out", false);
        var peg$e26 = peg$literalExpectation("...", false);
        var peg$e27 = peg$literalExpectation("?", false);
        var peg$e28 = peg$literalExpectation(":", false);
        var peg$e29 = peg$literalExpectation(";", false);
        var peg$e30 = peg$literalExpectation(",", false);
        var peg$e31 = peg$literalExpectation(".", false);
        var peg$e32 = peg$literalExpectation("~", false);
        var peg$e33 = peg$literalExpectation("@", false);
        var peg$e34 = peg$literalExpectation("#", false);
        var peg$e35 = peg$literalExpectation("$", false);
        var peg$e36 = peg$literalExpectation("(", false);
        var peg$e37 = peg$literalExpectation(")", false);
        var peg$e38 = peg$literalExpectation("{", false);
        var peg$e39 = peg$literalExpectation("}", false);
        var peg$e40 = peg$literalExpectation("[", false);
        var peg$e41 = peg$literalExpectation("]", false);
        var peg$e42 = peg$literalExpectation("=", false);
        var peg$e43 = peg$literalExpectation("+=", false);
        var peg$e44 = peg$literalExpectation("-=", false);
        var peg$e45 = peg$literalExpectation("*=", false);
        var peg$e46 = peg$literalExpectation("/=", false);
        var peg$e47 = peg$literalExpectation("%=", false);
        var peg$e48 = peg$literalExpectation("==", false);
        var peg$e49 = peg$literalExpectation("!=", false);
        var peg$e50 = peg$literalExpectation("!", false);
        var peg$e51 = peg$literalExpectation("<", false);
        var peg$e52 = peg$literalExpectation("<=", false);
        var peg$e53 = peg$literalExpectation(">", false);
        var peg$e54 = peg$literalExpectation(">=", false);
        var peg$e55 = peg$literalExpectation("+", false);
        var peg$e56 = peg$literalExpectation("-", false);
        var peg$e57 = peg$literalExpectation("*", false);
        var peg$e58 = peg$literalExpectation("/", false);
        var peg$e59 = peg$literalExpectation("%", false);
        var peg$e60 = peg$literalExpectation("&&", false);
        var peg$e61 = peg$literalExpectation("||", false);
        var peg$e62 = peg$literalExpectation("=>", false);
        var peg$e63 = peg$literalExpectation("true", false);
        var peg$e64 = peg$literalExpectation("false", false);
        var peg$e65 = peg$classExpectation([["1", "9"]], false, false);
        var peg$e66 = peg$classExpectation([["0", "9"]], false, false);
        var peg$e67 = peg$literalExpectation("0x", false);
        var peg$e68 = peg$classExpectation([["0", "9"], ["a", "f"], ["A", "F"]], false, false);
        var peg$e69 = peg$literalExpectation("0", false);
        var peg$e70 = peg$classExpectation([["0", "7"]], false, false);
        var peg$e71 = peg$literalExpectation("'", false);
        var peg$e72 = peg$classExpectation(["\"", "\n", "\r", "\""], false, false);
        var peg$e73 = peg$anyExpectation();
        var peg$e74 = peg$literalExpectation("\"", false);
        var peg$e75 = peg$literalExpectation("null", false);
        var peg$e76 = peg$classExpectation(["e", "E"], false, false);
        var peg$e77 = peg$classExpectation(["+", "-"], false, false);
        var peg$e78 = peg$literalExpectation("//", false);
        var peg$e79 = peg$classExpectation(["\n", "\r"], false, false);
        var peg$e80 = peg$literalExpectation("/*", false);
        var peg$e81 = peg$literalExpectation("*/", false);
        var peg$e82 = peg$classExpectation([" ", "\t", "\n", "\r"], false, false);
        // @ts-ignore
        var peg$f0 = function (moduleName, statements) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "Script",
                // @ts-ignore
                moduleName,
                // @ts-ignore
                statements: statements ? statements.map(s => s[0]) : [],
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f1 = function (name) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "ModuleDeclaration",
                // @ts-ignore
                name,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f2 = function (name, generic, members) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "StructDeclaration",
                // @ts-ignore
                name,
                // @ts-ignore
                members,
                // @ts-ignore
                generic,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f3 = function (dec) {
            // @ts-ignore
            return dec;
        }; // @ts-ignore
        var peg$f4 = function (access, staticSymbol, meta, params, args, body) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "StructMetaFunction",
                // @ts-ignore
                static: staticSymbol,
                // @ts-ignore
                meta,
                // @ts-ignore
                params: params || [],
                // @ts-ignore
                args: args ? args[4] : null,
                // @ts-ignore
                body,
                // @ts-ignore
                access,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f5 = function (access, staticSymbol, meta, args, body) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "StructMetaFunction",
                // @ts-ignore
                static: staticSymbol,
                // @ts-ignore
                meta,
                // @ts-ignore
                params: [],
                // @ts-ignore
                args,
                // @ts-ignore
                body,
                // @ts-ignore
                access,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f6 = function (access, staticSymbol, name, typePart, initPart) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "StructField",
                // @ts-ignore
                access,
                // @ts-ignore
                static: staticSymbol,
                // @ts-ignore
                name,
                // @ts-ignore
                typeInfo: typePart ? typePart[2] : null,
                // @ts-ignore
                init: initPart ? initPart[2] : null,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f7 = function (decorator, access, staticSymbol, name, generic, params, args, returnPart, body) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "StructMethod",
                // @ts-ignore
                decorator,
                // @ts-ignore
                access: access,
                // @ts-ignore
                static: staticSymbol,
                // @ts-ignore
                generic,
                // @ts-ignore
                name,
                // @ts-ignore
                params: params || [],
                // @ts-ignore
                args: args ? args[4] : null,
                // @ts-ignore
                returnType: returnPart ? returnPart[2] : null,
                // @ts-ignore
                body: body,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f8 = function (decorator, access, staticSymbol, name, generic, args, returnPart, body) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "StructMethod",
                // @ts-ignore
                decorator,
                // @ts-ignore
                access: access,
                // @ts-ignore
                static: staticSymbol,
                // @ts-ignore
                generic,
                // @ts-ignore
                name,
                // @ts-ignore
                params: [],
                // @ts-ignore
                args,
                // @ts-ignore
                returnType: returnPart ? returnPart[2] : null,
                // @ts-ignore
                body: body,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f9 = function (decorator, name, generic, superPart, members) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "ClassDeclaration",
                // @ts-ignore
                name,
                // @ts-ignore
                inherits: superPart ? superPart[1] : [],
                // @ts-ignore
                members,
                // @ts-ignore
                decorator,
                // @ts-ignore
                generic,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f10 = function (dec) {
            // @ts-ignore
            return dec;
        }; // @ts-ignore
        var peg$f11 = function (access, staticSymbol, meta, params, args, argsPart, body) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "ClassMetaFunction",
                // @ts-ignore
                meta,
                // @ts-ignore
                static: staticSymbol,
                // @ts-ignore
                params: params || [],
                // @ts-ignore
                args: args ? args[4] : null,
                // @ts-ignore
                superArgs: argsPart ? argsPart[2] : [],
                // @ts-ignore
                body: body,
                // @ts-ignore
                access,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f12 = function (access, staticSymbol, meta, args, argsPart, body) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "ClassMetaFunction",
                // @ts-ignore
                meta,
                // @ts-ignore
                static: staticSymbol,
                // @ts-ignore
                params: [],
                // @ts-ignore
                args,
                // @ts-ignore
                superArgs: argsPart ? argsPart[2] : [],
                // @ts-ignore
                body: body,
                // @ts-ignore
                access,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f13 = function (decorator, access, staticSymbol, name, typePart, initPart) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "ClassField",
                // @ts-ignore
                decorator,
                // @ts-ignore
                access: access,
                // @ts-ignore
                static: staticSymbol,
                // @ts-ignore
                name,
                // @ts-ignore
                typeInfo: typePart ? typePart[2] : null,
                // @ts-ignore
                init: initPart ? initPart[2] : null,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f14 = function (decorator, access, staticSymbol, name, generic, params, args, returnPart, body) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "ClassMethod",
                // @ts-ignore
                decorator,
                // @ts-ignore
                generic,
                // @ts-ignore
                access: access,
                // @ts-ignore
                static: staticSymbol,
                // @ts-ignore
                name,
                // @ts-ignore
                params: params || [],
                // @ts-ignore
                args: args ? args[4] : null,
                // @ts-ignore
                returnType: returnPart ? returnPart[2] : null,
                // @ts-ignore
                body,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f15 = function (decorator, access, staticSymbol, name, generic, args, returnPart, body) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "ClassMethod",
                // @ts-ignore
                decorator,
                // @ts-ignore
                generic,
                // @ts-ignore
                access: access,
                // @ts-ignore
                static: staticSymbol,
                // @ts-ignore
                name,
                // @ts-ignore
                params: [],
                // @ts-ignore
                args,
                // @ts-ignore
                returnType: returnPart ? returnPart[2] : null,
                // @ts-ignore
                body,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f16 = function (decorator, access, staticSymbol, modifier) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "ClassProperty",
                // @ts-ignore
                access,
                // @ts-ignore
                static: staticSymbol,
                // @ts-ignore
                modifier,
                // @ts-ignore
                decorator,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f17 = function (name, returnPart, body) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "Property",
                // @ts-ignore
                kind: "get",
                // @ts-ignore
                name,
                // @ts-ignore
                targetType: returnPart ? returnPart[2] : null,
                // @ts-ignore
                param: null,
                // @ts-ignore
                body,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f18 = function (name, param, paramTypePart, body) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "Property",
                // @ts-ignore
                kind: "set",
                // @ts-ignore
                name,
                // @ts-ignore
                param,
                // @ts-ignore
                targetType: paramTypePart ? paramTypePart[2] : null,
                // @ts-ignore
                body,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f19 = function (name, generic, extendsPart, members) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "InterfaceDeclaration",
                // @ts-ignore
                name,
                // @ts-ignore
                members,
                // @ts-ignore
                generic,
                // @ts-ignore
                inherits: extendsPart ? extendsPart[2] : [],
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f20 = function (dec) {
            // @ts-ignore
            return dec;
        }; // @ts-ignore
        var peg$f21 = function (access, name, generic, params, args, returnPart) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "InterfaceMethodSignature",
                // @ts-ignore
                name,
                // @ts-ignore
                params: params || [],
                // @ts-ignore
                args: args ? args[4] : null,
                // @ts-ignore
                returnType: returnPart ? returnPart[2] : null,
                // @ts-ignore
                access,
                // @ts-ignore
                generic,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f22 = function (access, name, generic, args, returnPart) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "InterfaceMethodSignature",
                // @ts-ignore
                name,
                // @ts-ignore
                params: [],
                // @ts-ignore
                args,
                // @ts-ignore
                returnType: returnPart ? returnPart[2] : null,
                // @ts-ignore
                access,
                // @ts-ignore
                generic,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f23 = function (access, propertyType, name, typePart) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "InterfacePropertySignature",
                // @ts-ignore
                name,
                // @ts-ignore
                typeInfo: typePart ? typePart[2] : null,
                // @ts-ignore
                access: access,
                // @ts-ignore
                propertyType,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f24 = function () {
            return "get_set";
        }; // @ts-ignore
        var peg$f25 = function () {
            return "get_set";
        }; // @ts-ignore
        var peg$f26 = function () {
            return "get";
        }; // @ts-ignore
        var peg$f27 = function () {
            return "set";
        }; // @ts-ignore
        var peg$f28 = function (access, name, typePart) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "InterfaceFieldDeclaration",
                // @ts-ignore
                name,
                // @ts-ignore
                targetType: typePart ? typePart[3] : null,
                // @ts-ignore
                access,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f29 = function (name, baseTypePart, members) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "EnumDeclaration",
                // @ts-ignore
                name,
                // @ts-ignore
                baseType: baseTypePart ? baseTypePart[2] : null,
                // @ts-ignore
                members,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f30 = function (key, valuePart) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "EnumMember",
                // @ts-ignore
                name: key,
                // @ts-ignore
                value: valuePart ? valuePart[2] : null,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f31 = function (params) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "GenericDeclaration",
                // @ts-ignore
                params,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f32 = function (dec) {
            // Block 本身也是语句（如 if 的 then 块） 
            // @ts-ignore
            return dec;
        }; // @ts-ignore
        var peg$f33 = function (expr) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "ExpressionStatement",
                // @ts-ignore
                expr,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f34 = function (pattern, typePart, value) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "VariableDeclaration",
                // @ts-ignore
                pattern,
                // @ts-ignore
                value,
                // @ts-ignore
                typeInfo: typePart ? typePart[3] : null,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f35 = function (expr) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "ReturnStatement",
                // @ts-ignore
                expr,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f36 = function (ctrl, expr) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "BreakContinueStatement",
                // @ts-ignore
                isBreak: ctrl === "break",
                // @ts-ignore
                expr,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f37 = function (expr) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "OutStatement",
                // @ts-ignore
                expr,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f38 = function (expr) {
            // @ts-ignore
            expr.isStatement = true;
            // @ts-ignore
            return expr;
        }; // @ts-ignore
        var peg$f39 = function (expr) {
            // @ts-ignore
            expr.isStatement = true;
            // @ts-ignore
            return expr;
        }; // @ts-ignore
        var peg$f40 = function (value, block) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "SwitchCase",
                // @ts-ignore
                value,
                // @ts-ignore
                block,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f41 = function (block) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "SwitchDefault",
                // @ts-ignore
                block,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f42 = function (expr) {
            // @ts-ignore
            expr.isStatement = true;
            // @ts-ignore
            return expr;
        }; // @ts-ignore
        var peg$f43 = function (cond, block) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "WhileLoop",
                // @ts-ignore
                isStatement: false,
                // @ts-ignore
                cond,
                // @ts-ignore
                block,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f44 = function (init, cond, step, block) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "ForLoop",
                // @ts-ignore
                isStatement: false,
                // @ts-ignore
                init,
                // @ts-ignore
                cond,
                // @ts-ignore
                step,
                // @ts-ignore
                block,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f45 = function (pattern, typePart, expr, block) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "ForeachLoop",
                // @ts-ignore
                pattern,
                // @ts-ignore
                isStatement: false,
                // @ts-ignore
                typeInfo: typePart ? typePart[3] : null,
                // @ts-ignore
                expr,
                // @ts-ignore
                block,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f46 = function (statements) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "Block",
                // @ts-ignore
                isStatement: true,
                // @ts-ignore
                body: statements.filter(s => s !== null), // 过滤空白和注释
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f47 = function (exp) {
            // @ts-ignore
            return exp;
        }; // @ts-ignore
        var peg$f48 = function (left, op, right) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "Assignment",
                // @ts-ignore
                op,
                // @ts-ignore
                left,
                // @ts-ignore
                right,
                // @ts-ignore
                location: location(),
            };
        }; // @ts-ignore
        var peg$f49 = function (test, consequent, alternate) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "Conditional",
                // @ts-ignore
                test,
                // @ts-ignore
                consequent,
                // @ts-ignore
                alternate,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f50 = function (left, parts) {
            // @ts-ignore
            return parts.reduce((acc, [, , , right]) => ({
                // @ts-ignore
                type: "Logical",
                // @ts-ignore
                op: "||",
                // @ts-ignore
                left: acc,
                // @ts-ignore
                right,
                // @ts-ignore
                location: location()
                // @ts-ignore
            }), left);
        }; // @ts-ignore
        var peg$f51 = function (left, parts) {
            // @ts-ignore
            return parts.reduce((acc, [, , , right]) => ({
                // @ts-ignore
                type: "Logical",
                // @ts-ignore
                op: "&&",
                // @ts-ignore
                left: acc,
                // @ts-ignore
                right,
                // @ts-ignore
                location: location()
                // @ts-ignore
            }), left);
        }; // @ts-ignore
        var peg$f52 = function (left, parts) {
            // @ts-ignore
            return parts.reduce((acc, [, op, , right]) => ({
                // @ts-ignore
                type: "Binary",
                // @ts-ignore
                op,
                // @ts-ignore
                left: acc,
                // @ts-ignore
                right,
                // @ts-ignore
                location: location()
                // @ts-ignore
            }), left);
        }; // @ts-ignore
        var peg$f53 = function (left, parts) {
            // @ts-ignore
            return parts.reduce((acc, [, op, , right]) => ({
                // @ts-ignore
                type: "Binary",
                // @ts-ignore
                op,
                // @ts-ignore
                left: acc,
                // @ts-ignore
                right,
                // @ts-ignore
                location: location()
                // @ts-ignore
            }), left);
        }; // @ts-ignore
        var peg$f54 = function (left, parts) {
            // @ts-ignore
            return parts.reduce((acc, [, op, , right]) => ({
                // @ts-ignore
                type: "Binary",
                // @ts-ignore
                op,
                // @ts-ignore
                left: acc,
                // @ts-ignore
                right,
                // @ts-ignore
                location: location()
                // @ts-ignore
            }), left);
        }; // @ts-ignore
        var peg$f55 = function (left, parts) {
            // @ts-ignore
            return parts.reduce((acc, [, op, , right]) => ({
                // @ts-ignore
                type: "Binary",
                // @ts-ignore
                op,
                // @ts-ignore
                left: acc,
                // @ts-ignore
                right,
                // @ts-ignore
                location: location()
                // @ts-ignore
            }), left);
        }; // @ts-ignore
        var peg$f56 = function (op, argument) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "Unary",
                // @ts-ignore
                op,
                // @ts-ignore
                argument,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f57 = function (property, members) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "PrimaryExpression",
                // @ts-ignore
                property,
                // @ts-ignore
                members,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f58 = function (property) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "MemberExpression",
                // @ts-ignore
                property,
                // @ts-ignore
                computed: false,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f59 = function (property) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "MemberExpression",
                // @ts-ignore
                property,
                // @ts-ignore
                computed: true,
                // @ts-ignore
                location: location(),
            };
        }; // @ts-ignore
        var peg$f60 = function (args) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "FunctionCall",
                // @ts-ignore
                args: args || [],
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f61 = function (value) {
            return { type: "ValueLiteral", value, location: location() };
        }; // @ts-ignore
        var peg$f62 = function (value) {
            return { type: "IdentifierLiteral", value, location: location() };
        }; // @ts-ignore
        var peg$f63 = function (expr) {
            return expr;
        }; // @ts-ignore
        var peg$f64 = function (block) {
            // @ts-ignore
            block.isStatement = false;
            // @ts-ignore
            return block;
        }; // @ts-ignore
        var peg$f65 = function (elements) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: 'ArrayLiteral',
                // @ts-ignore
                elements: elements ? ([elements[0], ...(elements[1] ? elements[1].map(v => v[3]) : [])]) : [],
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f66 = function (pairs) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "ObjectLiteral",
                // @ts-ignore
                properties: pairs ? [pairs[0], ...(pairs[1] ? pairs[1].map(v => v[3]) : [])] : [],
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f67 = function (key, value) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "KeyValuePair",
                // @ts-ignore
                key,
                // @ts-ignore
                value,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f68 = function (expr) {
            return expr;
        }; // @ts-ignore
        var peg$f69 = function (params, args, block) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "LambdaExpression",
                // @ts-ignore
                params: params || [],
                // @ts-ignore
                args: args ? args[4] : null,
                // @ts-ignore
                block,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f70 = function (args, block) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "LambdaExpression",
                // @ts-ignore
                params: [],
                // @ts-ignore
                args,
                // @ts-ignore
                block,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f71 = function (condition, thenExpr, elseExpr) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "IfExpression",
                // @ts-ignore
                isStatement: false,
                // @ts-ignore
                condition,
                // @ts-ignore
                then: thenExpr,
                // @ts-ignore
                else: elseExpr ? elseExpr[3] : null,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f72 = function (expr, cases, defaultCase) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "SwitchExpression",
                // @ts-ignore
                isStatement: false,
                // @ts-ignore
                expr,
                // @ts-ignore
                cases: cases ? cases : [],
                // @ts-ignore
                default: defaultCase,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f73 = function () {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "UnaryOperator",
                // @ts-ignore
                operator: text(),
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f74 = function (decorator, name, generic, params, args, returnPart, body) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "FunctionDeclaration",
                // @ts-ignore
                name,
                // @ts-ignore
                params: params || [],
                // @ts-ignore
                args: args ? args[4] : null,
                // @ts-ignore
                generic,
                // @ts-ignore
                decorator,
                // @ts-ignore
                returnType: returnPart ? returnPart[2] : null,
                // @ts-ignore
                body,
                // @ts-ignore
                location: location
            };
        }; // @ts-ignore
        var peg$f75 = function (decorator, name, generic, args, returnPart, body) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "FunctionDeclaration",
                // @ts-ignore
                name,
                // @ts-ignore
                params: [],
                // @ts-ignore
                args,
                // @ts-ignore
                generic,
                // @ts-ignore
                decorator,
                // @ts-ignore
                returnType: returnPart ? returnPart[2] : null,
                // @ts-ignore
                body,
                // @ts-ignore
                location: location
            };
        }; // @ts-ignore
        var peg$f76 = function (name, dimensions) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "Type",
                // @ts-ignore
                name,
                // @ts-ignore
                dimensions: dimensions.length,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f77 = function (name, params) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "GenericType",
                // @ts-ignore
                name,
                // @ts-ignore
                params,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f78 = function (types) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "TupleType",
                // @ts-ignore
                elements: types,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f79 = function (name, typePart, defaultValuePart) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "Parameter",
                // @ts-ignore
                name,
                // @ts-ignore
                typeInfo: typePart ? typePart[2] : null,
                // @ts-ignore
                defaultValue: defaultValuePart ? defaultValuePart[2] : null,
                // @ts-ignore
                location: location(),
            };
        }; // @ts-ignore
        var peg$f80 = function (head, tail) {
            // @ts-ignore
            return [head].concat(tail.map(t => t[2]));
        }; // @ts-ignore
        var peg$f81 = function (head, tail) {
            // @ts-ignore
            return [head].concat(tail.map(t => t[2]));
        }; // @ts-ignore
        var peg$f82 = function (head, tail) {
            // @ts-ignore
            return [head].concat(tail.map(t => t[2]));
        }; // @ts-ignore
        var peg$f83 = function (name) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "Meta",
                // @ts-ignore
                name,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f84 = function (expr) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "DecoratorExpression",
                // @ts-ignore
                expr,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f85 = function (keys) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "DestructuringObject",
                // @ts-ignore
                keys,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f86 = function (keys) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "DestructuringArray",
                // @ts-ignore
                keys,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f87 = function (head, tail) {
            // @ts-ignore
            return [head].concat(tail.map(t => t[2]));
        }; // @ts-ignore
        var peg$f88 = function () {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "Identifier",
                // @ts-ignore
                name: text(),
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f89 = function () {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "Boolean",
                // @ts-ignore
                value: text() == "true",
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f90 = function () {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "Integer",
                // @ts-ignore
                value: parseInt(text(), 10),
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f91 = function () {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "Integer",
                // @ts-ignore
                value: parseInt(text(), 16),
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f92 = function () {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "Integer",
                // @ts-ignore
                value: parseInt(text(), 8),
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f93 = function (ch) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "Char",
                // @ts-ignore
                value: ch ? ch[1] : '',
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f94 = function (str) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "String",
                // @ts-ignore
                value: str ? str.map(v => v[1]).join('') : '',
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f95 = function () {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "Null",
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f96 = function () {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "Float",
                // @ts-ignore
                value: parseFloat(text()),
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f97 = function () {
            // @ts-ignore
            return undefined;
        };
        // @ts-ignore
        var peg$currPos = 0;
        // @ts-ignore
        var peg$savedPos = 0;
        // @ts-ignore
        var peg$posDetailsCache = [{ line: 1, column: 1 }];
        // @ts-ignore
        var peg$maxFailPos = 0;
        // @ts-ignore
        var peg$maxFailExpected = [];
        // @ts-ignore
        var peg$silentFails = 0;
        // @ts-ignore
        var peg$result;
        // @ts-ignore
        if ("startRule" in options) {
            // @ts-ignore
            if (!(options.startRule in peg$startRuleFunctions)) {
                // @ts-ignore
                throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
            }
            // @ts-ignore
            peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
        }
        // @ts-ignore
        function text() {
            // @ts-ignore
            return input.substring(peg$savedPos, peg$currPos);
        }
        // @ts-ignore
        function offset() {
            // @ts-ignore
            return peg$savedPos;
        }
        // @ts-ignore
        function range() {
            // @ts-ignore
            return {
                // @ts-ignore
                source: peg$source,
                // @ts-ignore
                start: peg$savedPos,
                // @ts-ignore
                end: peg$currPos
            };
        }
        // @ts-ignore
        function location() {
            // @ts-ignore
            return peg$computeLocation(peg$savedPos, peg$currPos);
        }
        // @ts-ignore
        function expected(description, location) {
            // @ts-ignore
            location = location !== undefined
                // @ts-ignore
                ? location
                // @ts-ignore
                : peg$computeLocation(peg$savedPos, peg$currPos);
            // @ts-ignore
            throw peg$buildStructuredError(
            // @ts-ignore
            [peg$otherExpectation(description)], 
            // @ts-ignore
            input.substring(peg$savedPos, peg$currPos), 
            // @ts-ignore
            location);
        }
        // @ts-ignore
        function error(message, location) {
            // @ts-ignore
            location = location !== undefined
                // @ts-ignore
                ? location
                // @ts-ignore
                : peg$computeLocation(peg$savedPos, peg$currPos);
            // @ts-ignore
            throw peg$buildSimpleError(message, location);
        }
        // @ts-ignore
        function peg$literalExpectation(text, ignoreCase) {
            // @ts-ignore
            return { type: "literal", text: text, ignoreCase: ignoreCase };
        }
        // @ts-ignore
        function peg$classExpectation(parts, inverted, ignoreCase) {
            // @ts-ignore
            return { type: "class", parts: parts, inverted: inverted, ignoreCase: ignoreCase };
        }
        // @ts-ignore
        function peg$anyExpectation() {
            // @ts-ignore
            return { type: "any" };
        }
        // @ts-ignore
        function peg$endExpectation() {
            // @ts-ignore
            return { type: "end" };
        }
        // @ts-ignore
        function peg$otherExpectation(description) {
            // @ts-ignore
            return { type: "other", description: description };
        }
        // @ts-ignore
        function peg$computePosDetails(pos) {
            // @ts-ignore
            var details = peg$posDetailsCache[pos];
            // @ts-ignore
            var p;
            // @ts-ignore
            if (details) {
                // @ts-ignore
                return details;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                p = pos - 1;
                // @ts-ignore
                while (!peg$posDetailsCache[p]) {
                    // @ts-ignore
                    p--;
                }
                // @ts-ignore
                details = peg$posDetailsCache[p];
                // @ts-ignore
                details = {
                    // @ts-ignore
                    line: details.line,
                    // @ts-ignore
                    column: details.column
                };
                // @ts-ignore
                while (p < pos) {
                    // @ts-ignore
                    if (input.charCodeAt(p) === 10) {
                        // @ts-ignore
                        details.line++;
                        // @ts-ignore
                        details.column = 1;
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        details.column++;
                    }
                    // @ts-ignore
                    p++;
                }
                // @ts-ignore
                peg$posDetailsCache[pos] = details;
                // @ts-ignore
                return details;
            }
        }
        // @ts-ignore
        function peg$computeLocation(startPos, endPos, offset) {
            // @ts-ignore
            var startPosDetails = peg$computePosDetails(startPos);
            // @ts-ignore
            var endPosDetails = peg$computePosDetails(endPos);
            // @ts-ignore
            var res = {
                // @ts-ignore
                source: peg$source,
                // @ts-ignore
                start: {
                    // @ts-ignore
                    offset: startPos,
                    // @ts-ignore
                    line: startPosDetails.line,
                    // @ts-ignore
                    column: startPosDetails.column
                },
                // @ts-ignore
                end: {
                    // @ts-ignore
                    offset: endPos,
                    // @ts-ignore
                    line: endPosDetails.line,
                    // @ts-ignore
                    column: endPosDetails.column
                }
            };
            // @ts-ignore
            if (offset && peg$source && (typeof peg$source.offset === "function")) {
                // @ts-ignore
                res.start = peg$source.offset(res.start);
                // @ts-ignore
                res.end = peg$source.offset(res.end);
            }
            // @ts-ignore
            return res;
        }
        // @ts-ignore
        function peg$fail(expected) {
            // @ts-ignore
            if (peg$currPos < peg$maxFailPos) {
                return;
            }
            // @ts-ignore
            if (peg$currPos > peg$maxFailPos) {
                // @ts-ignore
                peg$maxFailPos = peg$currPos;
                // @ts-ignore
                peg$maxFailExpected = [];
            }
            // @ts-ignore
            peg$maxFailExpected.push(expected);
        }
        // @ts-ignore
        function peg$buildSimpleError(message, location) {
            // @ts-ignore
            return new peg$SyntaxError(message, null, null, location);
        }
        // @ts-ignore
        function peg$buildStructuredError(expected, found, location) {
            // @ts-ignore
            return new peg$SyntaxError(
            // @ts-ignore
            peg$SyntaxError.buildMessage(expected, found), 
            // @ts-ignore
            expected, 
            // @ts-ignore
            found, 
            // @ts-ignore
            location);
        }
        // @ts-ignore
        function peg$parsestart() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parse_();
            // @ts-ignore
            s2 = peg$parseModuleDeclaration();
            // @ts-ignore
            if (s2 === peg$FAILED) {
                // @ts-ignore
                s2 = null;
            }
            // @ts-ignore
            s3 = peg$parse_();
            // @ts-ignore
            s4 = [];
            // @ts-ignore
            s5 = peg$currPos;
            // @ts-ignore
            s6 = peg$parseTopLevelStatement();
            // @ts-ignore
            if (s6 !== peg$FAILED) {
                // @ts-ignore
                s7 = peg$parse_();
                // @ts-ignore
                s6 = [s6, s7];
                // @ts-ignore
                s5 = s6;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s5;
                // @ts-ignore
                s5 = peg$FAILED;
            }
            // @ts-ignore
            while (s5 !== peg$FAILED) {
                // @ts-ignore
                s4.push(s5);
                // @ts-ignore
                s5 = peg$currPos;
                // @ts-ignore
                s6 = peg$parseTopLevelStatement();
                // @ts-ignore
                if (s6 !== peg$FAILED) {
                    // @ts-ignore
                    s7 = peg$parse_();
                    // @ts-ignore
                    s6 = [s6, s7];
                    // @ts-ignore
                    s5 = s6;
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s5;
                    // @ts-ignore
                    s5 = peg$FAILED;
                }
            }
            // @ts-ignore
            peg$savedPos = s0;
            // @ts-ignore
            s0 = peg$f0(s2, s4);
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseTopLevelStatement() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            s0 = peg$parseStructDeclaration();
            // @ts-ignore
            if (s0 === peg$FAILED) {
                // @ts-ignore
                s0 = peg$parseClassDeclaration();
                // @ts-ignore
                if (s0 === peg$FAILED) {
                    // @ts-ignore
                    s0 = peg$parseEnumDeclaration();
                    // @ts-ignore
                    if (s0 === peg$FAILED) {
                        // @ts-ignore
                        s0 = peg$parseInterfaceDeclaration();
                        // @ts-ignore
                        if (s0 === peg$FAILED) {
                            // @ts-ignore
                            s0 = peg$parseVariableDeclaration();
                            // @ts-ignore
                            if (s0 === peg$FAILED) {
                                // @ts-ignore
                                s0 = peg$parseFunctionDeclaration();
                                // @ts-ignore
                                if (s0 === peg$FAILED) {
                                    // @ts-ignore
                                    s0 = peg$parseExpressionStatement();
                                }
                            }
                        }
                    }
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseModuleDeclaration() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseMODULE();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = peg$parseIDENTIFIER();
                // @ts-ignore
                if (s3 === peg$FAILED) {
                    // @ts-ignore
                    s3 = peg$parseSTRING();
                }
                // @ts-ignore
                if (s3 !== peg$FAILED) {
                    // @ts-ignore
                    s4 = peg$parse_();
                    // @ts-ignore
                    s5 = peg$parseSEMICOLON();
                    // @ts-ignore
                    if (s5 !== peg$FAILED) {
                        // @ts-ignore
                        peg$savedPos = s0;
                        // @ts-ignore
                        s0 = peg$f1(s3);
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseStructDeclaration() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseSTRUCT();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = peg$parseIDENTIFIER();
                // @ts-ignore
                if (s3 !== peg$FAILED) {
                    // @ts-ignore
                    s4 = peg$parse_();
                    // @ts-ignore
                    s5 = peg$parseGenericDeclaration();
                    // @ts-ignore
                    if (s5 === peg$FAILED) {
                        // @ts-ignore
                        s5 = null;
                    }
                    // @ts-ignore
                    s6 = peg$parse_();
                    // @ts-ignore
                    s7 = peg$parseLBRACE();
                    // @ts-ignore
                    if (s7 !== peg$FAILED) {
                        // @ts-ignore
                        s8 = peg$parse_();
                        // @ts-ignore
                        s9 = [];
                        // @ts-ignore
                        s10 = peg$parseStructMember();
                        // @ts-ignore
                        while (s10 !== peg$FAILED) {
                            // @ts-ignore
                            s9.push(s10);
                            // @ts-ignore
                            s10 = peg$parseStructMember();
                        }
                        // @ts-ignore
                        s10 = peg$parse_();
                        // @ts-ignore
                        s11 = peg$parseRBRACE();
                        // @ts-ignore
                        if (s11 !== peg$FAILED) {
                            // @ts-ignore
                            peg$savedPos = s0;
                            // @ts-ignore
                            s0 = peg$f2(s3, s5, s9);
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s0;
                            // @ts-ignore
                            s0 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseStructMember() {
            // @ts-ignore
            var s0, s1, s2, s3;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parse_();
            // @ts-ignore
            s2 = peg$parseStructField();
            // @ts-ignore
            if (s2 === peg$FAILED) {
                // @ts-ignore
                s2 = peg$parseStructMethod();
                // @ts-ignore
                if (s2 === peg$FAILED) {
                    // @ts-ignore
                    s2 = peg$parseStructMetaFunction();
                }
            }
            // @ts-ignore
            if (s2 !== peg$FAILED) {
                // @ts-ignore
                s3 = peg$parse_();
                // @ts-ignore
                peg$savedPos = s0;
                // @ts-ignore
                s0 = peg$f3(s2);
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseStructMetaFunction() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15, s16, s17;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseAccessModifier();
            // @ts-ignore
            if (s1 === peg$FAILED) {
                // @ts-ignore
                s1 = null;
            }
            // @ts-ignore
            s2 = peg$parse_();
            // @ts-ignore
            s3 = peg$parseSTATIC();
            // @ts-ignore
            if (s3 === peg$FAILED) {
                // @ts-ignore
                s3 = null;
            }
            // @ts-ignore
            s4 = peg$parse_();
            // @ts-ignore
            s5 = peg$parseMetaIdentifier();
            // @ts-ignore
            if (s5 !== peg$FAILED) {
                // @ts-ignore
                s6 = peg$parse_();
                // @ts-ignore
                s7 = peg$parseLPAREN();
                // @ts-ignore
                if (s7 !== peg$FAILED) {
                    // @ts-ignore
                    s8 = peg$parse_();
                    // @ts-ignore
                    s9 = peg$parseParameterList();
                    // @ts-ignore
                    if (s9 === peg$FAILED) {
                        // @ts-ignore
                        s9 = null;
                    }
                    // @ts-ignore
                    s10 = peg$parse_();
                    // @ts-ignore
                    s11 = peg$currPos;
                    // @ts-ignore
                    s12 = peg$parseCOMMA();
                    // @ts-ignore
                    if (s12 !== peg$FAILED) {
                        // @ts-ignore
                        s13 = peg$parse_();
                        // @ts-ignore
                        s14 = peg$parsePARAMS();
                        // @ts-ignore
                        if (s14 !== peg$FAILED) {
                            // @ts-ignore
                            s15 = peg$parse_();
                            // @ts-ignore
                            s16 = peg$parseParameter();
                            // @ts-ignore
                            if (s16 !== peg$FAILED) {
                                // @ts-ignore
                                s17 = peg$parse_();
                                // @ts-ignore
                                s12 = [s12, s13, s14, s15, s16, s17];
                                // @ts-ignore
                                s11 = s12;
                                // @ts-ignore
                            }
                            else {
                                // @ts-ignore
                                peg$currPos = s11;
                                // @ts-ignore
                                s11 = peg$FAILED;
                            }
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s11;
                            // @ts-ignore
                            s11 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s11;
                        // @ts-ignore
                        s11 = peg$FAILED;
                    }
                    // @ts-ignore
                    if (s11 === peg$FAILED) {
                        // @ts-ignore
                        s11 = null;
                    }
                    // @ts-ignore
                    s12 = peg$parse_();
                    // @ts-ignore
                    s13 = peg$parseRPAREN();
                    // @ts-ignore
                    if (s13 !== peg$FAILED) {
                        // @ts-ignore
                        s14 = peg$parse_();
                        // @ts-ignore
                        s15 = peg$parseBlock();
                        // @ts-ignore
                        if (s15 !== peg$FAILED) {
                            // @ts-ignore
                            peg$savedPos = s0;
                            // @ts-ignore
                            s0 = peg$f4(s1, s3, s5, s9, s11, s15);
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s0;
                            // @ts-ignore
                            s0 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            if (s0 === peg$FAILED) {
                // @ts-ignore
                s0 = peg$currPos;
                // @ts-ignore
                s1 = peg$parseAccessModifier();
                // @ts-ignore
                if (s1 === peg$FAILED) {
                    // @ts-ignore
                    s1 = null;
                }
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = peg$parseSTATIC();
                // @ts-ignore
                if (s3 === peg$FAILED) {
                    // @ts-ignore
                    s3 = null;
                }
                // @ts-ignore
                s4 = peg$parse_();
                // @ts-ignore
                s5 = peg$parseMetaIdentifier();
                // @ts-ignore
                if (s5 !== peg$FAILED) {
                    // @ts-ignore
                    s6 = peg$parse_();
                    // @ts-ignore
                    s7 = peg$parseLPAREN();
                    // @ts-ignore
                    if (s7 !== peg$FAILED) {
                        // @ts-ignore
                        s8 = peg$parse_();
                        // @ts-ignore
                        s9 = peg$parsePARAMS();
                        // @ts-ignore
                        if (s9 !== peg$FAILED) {
                            // @ts-ignore
                            s10 = peg$parse_();
                            // @ts-ignore
                            s11 = peg$parseParameter();
                            // @ts-ignore
                            if (s11 !== peg$FAILED) {
                                // @ts-ignore
                                s12 = peg$parse_();
                                // @ts-ignore
                                s13 = peg$parseRPAREN();
                                // @ts-ignore
                                if (s13 !== peg$FAILED) {
                                    // @ts-ignore
                                    s14 = peg$parse_();
                                    // @ts-ignore
                                    s15 = peg$parseBlock();
                                    // @ts-ignore
                                    if (s15 !== peg$FAILED) {
                                        // @ts-ignore
                                        peg$savedPos = s0;
                                        // @ts-ignore
                                        s0 = peg$f5(s1, s3, s5, s11, s15);
                                        // @ts-ignore
                                    }
                                    else {
                                        // @ts-ignore
                                        peg$currPos = s0;
                                        // @ts-ignore
                                        s0 = peg$FAILED;
                                    }
                                    // @ts-ignore
                                }
                                else {
                                    // @ts-ignore
                                    peg$currPos = s0;
                                    // @ts-ignore
                                    s0 = peg$FAILED;
                                }
                                // @ts-ignore
                            }
                            else {
                                // @ts-ignore
                                peg$currPos = s0;
                                // @ts-ignore
                                s0 = peg$FAILED;
                            }
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s0;
                            // @ts-ignore
                            s0 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseStructField() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseAccessModifier();
            // @ts-ignore
            if (s1 === peg$FAILED) {
                // @ts-ignore
                s1 = null;
            }
            // @ts-ignore
            s2 = peg$parse_();
            // @ts-ignore
            s3 = peg$parseSTATIC();
            // @ts-ignore
            if (s3 === peg$FAILED) {
                // @ts-ignore
                s3 = null;
            }
            // @ts-ignore
            s4 = peg$parse_();
            // @ts-ignore
            s5 = peg$parseVAR();
            // @ts-ignore
            if (s5 !== peg$FAILED) {
                // @ts-ignore
                s6 = peg$parse_();
                // @ts-ignore
                s7 = peg$parseIDENTIFIER();
                // @ts-ignore
                if (s7 !== peg$FAILED) {
                    // @ts-ignore
                    s8 = peg$parse_();
                    // @ts-ignore
                    s9 = peg$currPos;
                    // @ts-ignore
                    s10 = peg$parseCOLON();
                    // @ts-ignore
                    if (s10 !== peg$FAILED) {
                        // @ts-ignore
                        s11 = peg$parse_();
                        // @ts-ignore
                        s12 = peg$parseType();
                        // @ts-ignore
                        if (s12 !== peg$FAILED) {
                            // @ts-ignore
                            s10 = [s10, s11, s12];
                            // @ts-ignore
                            s9 = s10;
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s9;
                            // @ts-ignore
                            s9 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s9;
                        // @ts-ignore
                        s9 = peg$FAILED;
                    }
                    // @ts-ignore
                    if (s9 === peg$FAILED) {
                        // @ts-ignore
                        s9 = null;
                    }
                    // @ts-ignore
                    s10 = peg$parse_();
                    // @ts-ignore
                    s11 = peg$currPos;
                    // @ts-ignore
                    s12 = peg$parseEQUALS();
                    // @ts-ignore
                    if (s12 !== peg$FAILED) {
                        // @ts-ignore
                        s13 = peg$parse_();
                        // @ts-ignore
                        s14 = peg$parseExpression();
                        // @ts-ignore
                        if (s14 !== peg$FAILED) {
                            // @ts-ignore
                            s12 = [s12, s13, s14];
                            // @ts-ignore
                            s11 = s12;
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s11;
                            // @ts-ignore
                            s11 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s11;
                        // @ts-ignore
                        s11 = peg$FAILED;
                    }
                    // @ts-ignore
                    if (s11 === peg$FAILED) {
                        // @ts-ignore
                        s11 = null;
                    }
                    // @ts-ignore
                    s12 = peg$parse_();
                    // @ts-ignore
                    s13 = peg$parseSEMICOLON();
                    // @ts-ignore
                    if (s13 !== peg$FAILED) {
                        // @ts-ignore
                        peg$savedPos = s0;
                        // @ts-ignore
                        s0 = peg$f6(s1, s3, s7, s9, s11);
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseStructMethod() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15, s16, s17, s18, s19, s20, s21, s22;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = [];
            // @ts-ignore
            s2 = peg$parseDecoratorExpression();
            // @ts-ignore
            while (s2 !== peg$FAILED) {
                // @ts-ignore
                s1.push(s2);
                // @ts-ignore
                s2 = peg$parseDecoratorExpression();
            }
            // @ts-ignore
            s2 = peg$parse_();
            // @ts-ignore
            s3 = peg$parseAccessModifier();
            // @ts-ignore
            if (s3 === peg$FAILED) {
                // @ts-ignore
                s3 = null;
            }
            // @ts-ignore
            s4 = peg$parse_();
            // @ts-ignore
            s5 = peg$parseSTATIC();
            // @ts-ignore
            if (s5 === peg$FAILED) {
                // @ts-ignore
                s5 = null;
            }
            // @ts-ignore
            s6 = peg$parse_();
            // @ts-ignore
            s7 = peg$parseIDENTIFIER();
            // @ts-ignore
            if (s7 !== peg$FAILED) {
                // @ts-ignore
                s8 = peg$parse_();
                // @ts-ignore
                s9 = peg$parseGenericDeclaration();
                // @ts-ignore
                if (s9 === peg$FAILED) {
                    // @ts-ignore
                    s9 = null;
                }
                // @ts-ignore
                s10 = peg$parse_();
                // @ts-ignore
                s11 = peg$parseLPAREN();
                // @ts-ignore
                if (s11 !== peg$FAILED) {
                    // @ts-ignore
                    s12 = peg$parse_();
                    // @ts-ignore
                    s13 = peg$parseParameterList();
                    // @ts-ignore
                    if (s13 === peg$FAILED) {
                        // @ts-ignore
                        s13 = null;
                    }
                    // @ts-ignore
                    s14 = peg$parse_();
                    // @ts-ignore
                    s15 = peg$currPos;
                    // @ts-ignore
                    s16 = peg$parseCOMMA();
                    // @ts-ignore
                    if (s16 !== peg$FAILED) {
                        // @ts-ignore
                        s17 = peg$parse_();
                        // @ts-ignore
                        s18 = peg$parsePARAMS();
                        // @ts-ignore
                        if (s18 !== peg$FAILED) {
                            // @ts-ignore
                            s19 = peg$parse_();
                            // @ts-ignore
                            s20 = peg$parseParameter();
                            // @ts-ignore
                            if (s20 !== peg$FAILED) {
                                // @ts-ignore
                                s21 = peg$parse_();
                                // @ts-ignore
                                s16 = [s16, s17, s18, s19, s20, s21];
                                // @ts-ignore
                                s15 = s16;
                                // @ts-ignore
                            }
                            else {
                                // @ts-ignore
                                peg$currPos = s15;
                                // @ts-ignore
                                s15 = peg$FAILED;
                            }
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s15;
                            // @ts-ignore
                            s15 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s15;
                        // @ts-ignore
                        s15 = peg$FAILED;
                    }
                    // @ts-ignore
                    if (s15 === peg$FAILED) {
                        // @ts-ignore
                        s15 = null;
                    }
                    // @ts-ignore
                    s16 = peg$parse_();
                    // @ts-ignore
                    s17 = peg$parseRPAREN();
                    // @ts-ignore
                    if (s17 !== peg$FAILED) {
                        // @ts-ignore
                        s18 = peg$parse_();
                        // @ts-ignore
                        s19 = peg$currPos;
                        // @ts-ignore
                        s20 = peg$parseCOLON();
                        // @ts-ignore
                        if (s20 !== peg$FAILED) {
                            // @ts-ignore
                            s21 = peg$parse_();
                            // @ts-ignore
                            s22 = peg$parseType();
                            // @ts-ignore
                            if (s22 !== peg$FAILED) {
                                // @ts-ignore
                                s20 = [s20, s21, s22];
                                // @ts-ignore
                                s19 = s20;
                                // @ts-ignore
                            }
                            else {
                                // @ts-ignore
                                peg$currPos = s19;
                                // @ts-ignore
                                s19 = peg$FAILED;
                            }
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s19;
                            // @ts-ignore
                            s19 = peg$FAILED;
                        }
                        // @ts-ignore
                        if (s19 === peg$FAILED) {
                            // @ts-ignore
                            s19 = null;
                        }
                        // @ts-ignore
                        s20 = peg$parse_();
                        // @ts-ignore
                        s21 = peg$parseBlock();
                        // @ts-ignore
                        if (s21 !== peg$FAILED) {
                            // @ts-ignore
                            peg$savedPos = s0;
                            // @ts-ignore
                            s0 = peg$f7(s1, s3, s5, s7, s9, s13, s15, s19, s21);
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s0;
                            // @ts-ignore
                            s0 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            if (s0 === peg$FAILED) {
                // @ts-ignore
                s0 = peg$currPos;
                // @ts-ignore
                s1 = [];
                // @ts-ignore
                s2 = peg$parseDecoratorExpression();
                // @ts-ignore
                while (s2 !== peg$FAILED) {
                    // @ts-ignore
                    s1.push(s2);
                    // @ts-ignore
                    s2 = peg$parseDecoratorExpression();
                }
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = peg$parseAccessModifier();
                // @ts-ignore
                if (s3 === peg$FAILED) {
                    // @ts-ignore
                    s3 = null;
                }
                // @ts-ignore
                s4 = peg$parse_();
                // @ts-ignore
                s5 = peg$parseSTATIC();
                // @ts-ignore
                if (s5 === peg$FAILED) {
                    // @ts-ignore
                    s5 = null;
                }
                // @ts-ignore
                s6 = peg$parse_();
                // @ts-ignore
                s7 = peg$parseIDENTIFIER();
                // @ts-ignore
                if (s7 !== peg$FAILED) {
                    // @ts-ignore
                    s8 = peg$parse_();
                    // @ts-ignore
                    s9 = peg$parseGenericDeclaration();
                    // @ts-ignore
                    if (s9 === peg$FAILED) {
                        // @ts-ignore
                        s9 = null;
                    }
                    // @ts-ignore
                    s10 = peg$parse_();
                    // @ts-ignore
                    s11 = peg$parseLPAREN();
                    // @ts-ignore
                    if (s11 !== peg$FAILED) {
                        // @ts-ignore
                        s12 = peg$parse_();
                        // @ts-ignore
                        s13 = peg$parsePARAMS();
                        // @ts-ignore
                        if (s13 !== peg$FAILED) {
                            // @ts-ignore
                            s14 = peg$parse_();
                            // @ts-ignore
                            s15 = peg$parseParameter();
                            // @ts-ignore
                            if (s15 !== peg$FAILED) {
                                // @ts-ignore
                                s16 = peg$parse_();
                                // @ts-ignore
                                s17 = peg$parseRPAREN();
                                // @ts-ignore
                                if (s17 !== peg$FAILED) {
                                    // @ts-ignore
                                    s18 = peg$parse_();
                                    // @ts-ignore
                                    s19 = peg$currPos;
                                    // @ts-ignore
                                    s20 = peg$parseCOLON();
                                    // @ts-ignore
                                    if (s20 !== peg$FAILED) {
                                        // @ts-ignore
                                        s21 = peg$parse_();
                                        // @ts-ignore
                                        s22 = peg$parseType();
                                        // @ts-ignore
                                        if (s22 !== peg$FAILED) {
                                            // @ts-ignore
                                            s20 = [s20, s21, s22];
                                            // @ts-ignore
                                            s19 = s20;
                                            // @ts-ignore
                                        }
                                        else {
                                            // @ts-ignore
                                            peg$currPos = s19;
                                            // @ts-ignore
                                            s19 = peg$FAILED;
                                        }
                                        // @ts-ignore
                                    }
                                    else {
                                        // @ts-ignore
                                        peg$currPos = s19;
                                        // @ts-ignore
                                        s19 = peg$FAILED;
                                    }
                                    // @ts-ignore
                                    if (s19 === peg$FAILED) {
                                        // @ts-ignore
                                        s19 = null;
                                    }
                                    // @ts-ignore
                                    s20 = peg$parse_();
                                    // @ts-ignore
                                    s21 = peg$parseBlock();
                                    // @ts-ignore
                                    if (s21 !== peg$FAILED) {
                                        // @ts-ignore
                                        peg$savedPos = s0;
                                        // @ts-ignore
                                        s0 = peg$f8(s1, s3, s5, s7, s9, s15, s19, s21);
                                        // @ts-ignore
                                    }
                                    else {
                                        // @ts-ignore
                                        peg$currPos = s0;
                                        // @ts-ignore
                                        s0 = peg$FAILED;
                                    }
                                    // @ts-ignore
                                }
                                else {
                                    // @ts-ignore
                                    peg$currPos = s0;
                                    // @ts-ignore
                                    s0 = peg$FAILED;
                                }
                                // @ts-ignore
                            }
                            else {
                                // @ts-ignore
                                peg$currPos = s0;
                                // @ts-ignore
                                s0 = peg$FAILED;
                            }
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s0;
                            // @ts-ignore
                            s0 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseClassDeclaration() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = [];
            // @ts-ignore
            s2 = peg$parseDecoratorExpression();
            // @ts-ignore
            while (s2 !== peg$FAILED) {
                // @ts-ignore
                s1.push(s2);
                // @ts-ignore
                s2 = peg$parseDecoratorExpression();
            }
            // @ts-ignore
            s2 = peg$parseCLASS();
            // @ts-ignore
            if (s2 !== peg$FAILED) {
                // @ts-ignore
                s3 = peg$parse_();
                // @ts-ignore
                s4 = peg$parseIDENTIFIER();
                // @ts-ignore
                if (s4 !== peg$FAILED) {
                    // @ts-ignore
                    s5 = peg$parse_();
                    // @ts-ignore
                    s6 = peg$parseGenericDeclaration();
                    // @ts-ignore
                    if (s6 === peg$FAILED) {
                        // @ts-ignore
                        s6 = null;
                    }
                    // @ts-ignore
                    s7 = peg$parse_();
                    // @ts-ignore
                    s8 = peg$currPos;
                    // @ts-ignore
                    s9 = peg$parseCOLON();
                    // @ts-ignore
                    if (s9 !== peg$FAILED) {
                        // @ts-ignore
                        s10 = peg$parse_();
                        // @ts-ignore
                        s11 = peg$parseTypeList();
                        // @ts-ignore
                        if (s11 !== peg$FAILED) {
                            // @ts-ignore
                            s12 = peg$parse_();
                            // @ts-ignore
                            s9 = [s9, s10, s11, s12];
                            // @ts-ignore
                            s8 = s9;
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s8;
                            // @ts-ignore
                            s8 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s8;
                        // @ts-ignore
                        s8 = peg$FAILED;
                    }
                    // @ts-ignore
                    if (s8 === peg$FAILED) {
                        // @ts-ignore
                        s8 = null;
                    }
                    // @ts-ignore
                    s9 = peg$parseLBRACE();
                    // @ts-ignore
                    if (s9 !== peg$FAILED) {
                        // @ts-ignore
                        s10 = peg$parse_();
                        // @ts-ignore
                        s11 = [];
                        // @ts-ignore
                        s12 = peg$parseClassMember();
                        // @ts-ignore
                        while (s12 !== peg$FAILED) {
                            // @ts-ignore
                            s11.push(s12);
                            // @ts-ignore
                            s12 = peg$parseClassMember();
                        }
                        // @ts-ignore
                        s12 = peg$parse_();
                        // @ts-ignore
                        s13 = peg$parseRBRACE();
                        // @ts-ignore
                        if (s13 !== peg$FAILED) {
                            // @ts-ignore
                            peg$savedPos = s0;
                            // @ts-ignore
                            s0 = peg$f9(s1, s4, s6, s8, s11);
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s0;
                            // @ts-ignore
                            s0 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseClassMember() {
            // @ts-ignore
            var s0, s1, s2, s3;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parse_();
            // @ts-ignore
            s2 = peg$parseMethod();
            // @ts-ignore
            if (s2 === peg$FAILED) {
                // @ts-ignore
                s2 = peg$parseProperty();
                // @ts-ignore
                if (s2 === peg$FAILED) {
                    // @ts-ignore
                    s2 = peg$parseMetaFunction();
                    // @ts-ignore
                    if (s2 === peg$FAILED) {
                        // @ts-ignore
                        s2 = peg$parseField();
                    }
                }
            }
            // @ts-ignore
            if (s2 !== peg$FAILED) {
                // @ts-ignore
                s3 = peg$parse_();
                // @ts-ignore
                peg$savedPos = s0;
                // @ts-ignore
                s0 = peg$f10(s2);
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseMetaFunction() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15, s16, s17, s18, s19, s20, s21, s22, s23;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseAccessModifier();
            // @ts-ignore
            if (s1 === peg$FAILED) {
                // @ts-ignore
                s1 = null;
            }
            // @ts-ignore
            s2 = peg$parse_();
            // @ts-ignore
            s3 = peg$parseSTATIC();
            // @ts-ignore
            if (s3 === peg$FAILED) {
                // @ts-ignore
                s3 = null;
            }
            // @ts-ignore
            s4 = peg$parse_();
            // @ts-ignore
            s5 = peg$parseMetaIdentifier();
            // @ts-ignore
            if (s5 !== peg$FAILED) {
                // @ts-ignore
                s6 = peg$parse_();
                // @ts-ignore
                s7 = peg$parseLPAREN();
                // @ts-ignore
                if (s7 !== peg$FAILED) {
                    // @ts-ignore
                    s8 = peg$parse_();
                    // @ts-ignore
                    s9 = peg$parseParameterList();
                    // @ts-ignore
                    if (s9 === peg$FAILED) {
                        // @ts-ignore
                        s9 = null;
                    }
                    // @ts-ignore
                    s10 = peg$parse_();
                    // @ts-ignore
                    s11 = peg$currPos;
                    // @ts-ignore
                    s12 = peg$parseCOMMA();
                    // @ts-ignore
                    if (s12 !== peg$FAILED) {
                        // @ts-ignore
                        s13 = peg$parse_();
                        // @ts-ignore
                        s14 = peg$parsePARAMS();
                        // @ts-ignore
                        if (s14 !== peg$FAILED) {
                            // @ts-ignore
                            s15 = peg$parse_();
                            // @ts-ignore
                            s16 = peg$parseParameter();
                            // @ts-ignore
                            if (s16 !== peg$FAILED) {
                                // @ts-ignore
                                s17 = peg$parse_();
                                // @ts-ignore
                                s12 = [s12, s13, s14, s15, s16, s17];
                                // @ts-ignore
                                s11 = s12;
                                // @ts-ignore
                            }
                            else {
                                // @ts-ignore
                                peg$currPos = s11;
                                // @ts-ignore
                                s11 = peg$FAILED;
                            }
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s11;
                            // @ts-ignore
                            s11 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s11;
                        // @ts-ignore
                        s11 = peg$FAILED;
                    }
                    // @ts-ignore
                    if (s11 === peg$FAILED) {
                        // @ts-ignore
                        s11 = null;
                    }
                    // @ts-ignore
                    s12 = peg$parse_();
                    // @ts-ignore
                    s13 = peg$parseRPAREN();
                    // @ts-ignore
                    if (s13 !== peg$FAILED) {
                        // @ts-ignore
                        s14 = peg$parse_();
                        // @ts-ignore
                        s15 = peg$currPos;
                        // @ts-ignore
                        s16 = peg$parse_();
                        // @ts-ignore
                        s17 = peg$parseSUPER();
                        // @ts-ignore
                        if (s17 !== peg$FAILED) {
                            // @ts-ignore
                            s18 = peg$parse_();
                            // @ts-ignore
                            s19 = peg$parseLPAREN();
                            // @ts-ignore
                            if (s19 !== peg$FAILED) {
                                // @ts-ignore
                                s20 = peg$parse_();
                                // @ts-ignore
                                s21 = peg$parseArgumentList();
                                // @ts-ignore
                                if (s21 === peg$FAILED) {
                                    // @ts-ignore
                                    s21 = null;
                                }
                                // @ts-ignore
                                s22 = peg$parse_();
                                // @ts-ignore
                                s23 = peg$parseRPAREN();
                                // @ts-ignore
                                if (s23 !== peg$FAILED) {
                                    // @ts-ignore
                                    s16 = [s16, s17, s18, s19, s20, s21, s22, s23];
                                    // @ts-ignore
                                    s15 = s16;
                                    // @ts-ignore
                                }
                                else {
                                    // @ts-ignore
                                    peg$currPos = s15;
                                    // @ts-ignore
                                    s15 = peg$FAILED;
                                }
                                // @ts-ignore
                            }
                            else {
                                // @ts-ignore
                                peg$currPos = s15;
                                // @ts-ignore
                                s15 = peg$FAILED;
                            }
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s15;
                            // @ts-ignore
                            s15 = peg$FAILED;
                        }
                        // @ts-ignore
                        if (s15 === peg$FAILED) {
                            // @ts-ignore
                            s15 = null;
                        }
                        // @ts-ignore
                        s16 = peg$parse_();
                        // @ts-ignore
                        s17 = peg$parseBlock();
                        // @ts-ignore
                        if (s17 !== peg$FAILED) {
                            // @ts-ignore
                            peg$savedPos = s0;
                            // @ts-ignore
                            s0 = peg$f11(s1, s3, s5, s9, s11, s15, s17);
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s0;
                            // @ts-ignore
                            s0 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            if (s0 === peg$FAILED) {
                // @ts-ignore
                s0 = peg$currPos;
                // @ts-ignore
                s1 = peg$parseAccessModifier();
                // @ts-ignore
                if (s1 === peg$FAILED) {
                    // @ts-ignore
                    s1 = null;
                }
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = peg$parseSTATIC();
                // @ts-ignore
                if (s3 === peg$FAILED) {
                    // @ts-ignore
                    s3 = null;
                }
                // @ts-ignore
                s4 = peg$parse_();
                // @ts-ignore
                s5 = peg$parseMetaIdentifier();
                // @ts-ignore
                if (s5 !== peg$FAILED) {
                    // @ts-ignore
                    s6 = peg$parse_();
                    // @ts-ignore
                    s7 = peg$parseLPAREN();
                    // @ts-ignore
                    if (s7 !== peg$FAILED) {
                        // @ts-ignore
                        s8 = peg$parse_();
                        // @ts-ignore
                        s9 = peg$parsePARAMS();
                        // @ts-ignore
                        if (s9 !== peg$FAILED) {
                            // @ts-ignore
                            s10 = peg$parse_();
                            // @ts-ignore
                            s11 = peg$parseParameter();
                            // @ts-ignore
                            if (s11 !== peg$FAILED) {
                                // @ts-ignore
                                s12 = peg$parse_();
                                // @ts-ignore
                                s13 = peg$parseRPAREN();
                                // @ts-ignore
                                if (s13 !== peg$FAILED) {
                                    // @ts-ignore
                                    s14 = peg$parse_();
                                    // @ts-ignore
                                    s15 = peg$currPos;
                                    // @ts-ignore
                                    s16 = peg$parse_();
                                    // @ts-ignore
                                    s17 = peg$parseSUPER();
                                    // @ts-ignore
                                    if (s17 !== peg$FAILED) {
                                        // @ts-ignore
                                        s18 = peg$parse_();
                                        // @ts-ignore
                                        s19 = peg$parseLPAREN();
                                        // @ts-ignore
                                        if (s19 !== peg$FAILED) {
                                            // @ts-ignore
                                            s20 = peg$parse_();
                                            // @ts-ignore
                                            s21 = peg$parseArgumentList();
                                            // @ts-ignore
                                            if (s21 === peg$FAILED) {
                                                // @ts-ignore
                                                s21 = null;
                                            }
                                            // @ts-ignore
                                            s22 = peg$parse_();
                                            // @ts-ignore
                                            s23 = peg$parseRPAREN();
                                            // @ts-ignore
                                            if (s23 !== peg$FAILED) {
                                                // @ts-ignore
                                                s16 = [s16, s17, s18, s19, s20, s21, s22, s23];
                                                // @ts-ignore
                                                s15 = s16;
                                                // @ts-ignore
                                            }
                                            else {
                                                // @ts-ignore
                                                peg$currPos = s15;
                                                // @ts-ignore
                                                s15 = peg$FAILED;
                                            }
                                            // @ts-ignore
                                        }
                                        else {
                                            // @ts-ignore
                                            peg$currPos = s15;
                                            // @ts-ignore
                                            s15 = peg$FAILED;
                                        }
                                        // @ts-ignore
                                    }
                                    else {
                                        // @ts-ignore
                                        peg$currPos = s15;
                                        // @ts-ignore
                                        s15 = peg$FAILED;
                                    }
                                    // @ts-ignore
                                    if (s15 === peg$FAILED) {
                                        // @ts-ignore
                                        s15 = null;
                                    }
                                    // @ts-ignore
                                    s16 = peg$parse_();
                                    // @ts-ignore
                                    s17 = peg$parseBlock();
                                    // @ts-ignore
                                    if (s17 !== peg$FAILED) {
                                        // @ts-ignore
                                        peg$savedPos = s0;
                                        // @ts-ignore
                                        s0 = peg$f12(s1, s3, s5, s11, s15, s17);
                                        // @ts-ignore
                                    }
                                    else {
                                        // @ts-ignore
                                        peg$currPos = s0;
                                        // @ts-ignore
                                        s0 = peg$FAILED;
                                    }
                                    // @ts-ignore
                                }
                                else {
                                    // @ts-ignore
                                    peg$currPos = s0;
                                    // @ts-ignore
                                    s0 = peg$FAILED;
                                }
                                // @ts-ignore
                            }
                            else {
                                // @ts-ignore
                                peg$currPos = s0;
                                // @ts-ignore
                                s0 = peg$FAILED;
                            }
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s0;
                            // @ts-ignore
                            s0 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseField() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15, s16;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = [];
            // @ts-ignore
            s2 = peg$parseDecoratorExpression();
            // @ts-ignore
            while (s2 !== peg$FAILED) {
                // @ts-ignore
                s1.push(s2);
                // @ts-ignore
                s2 = peg$parseDecoratorExpression();
            }
            // @ts-ignore
            s2 = peg$parse_();
            // @ts-ignore
            s3 = peg$parseAccessModifier();
            // @ts-ignore
            if (s3 === peg$FAILED) {
                // @ts-ignore
                s3 = null;
            }
            // @ts-ignore
            s4 = peg$parse_();
            // @ts-ignore
            s5 = peg$parseSTATIC();
            // @ts-ignore
            if (s5 === peg$FAILED) {
                // @ts-ignore
                s5 = null;
            }
            // @ts-ignore
            s6 = peg$parse_();
            // @ts-ignore
            s7 = peg$parseVAR();
            // @ts-ignore
            if (s7 !== peg$FAILED) {
                // @ts-ignore
                s8 = peg$parse_();
                // @ts-ignore
                s9 = peg$parseIDENTIFIER();
                // @ts-ignore
                if (s9 !== peg$FAILED) {
                    // @ts-ignore
                    s10 = peg$parse_();
                    // @ts-ignore
                    s11 = peg$currPos;
                    // @ts-ignore
                    s12 = peg$parseCOLON();
                    // @ts-ignore
                    if (s12 !== peg$FAILED) {
                        // @ts-ignore
                        s13 = peg$parse_();
                        // @ts-ignore
                        s14 = peg$parseType();
                        // @ts-ignore
                        if (s14 !== peg$FAILED) {
                            // @ts-ignore
                            s12 = [s12, s13, s14];
                            // @ts-ignore
                            s11 = s12;
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s11;
                            // @ts-ignore
                            s11 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s11;
                        // @ts-ignore
                        s11 = peg$FAILED;
                    }
                    // @ts-ignore
                    if (s11 === peg$FAILED) {
                        // @ts-ignore
                        s11 = null;
                    }
                    // @ts-ignore
                    s12 = peg$parse_();
                    // @ts-ignore
                    s13 = peg$currPos;
                    // @ts-ignore
                    s14 = peg$parseEQUALS();
                    // @ts-ignore
                    if (s14 !== peg$FAILED) {
                        // @ts-ignore
                        s15 = peg$parse_();
                        // @ts-ignore
                        s16 = peg$parseExpression();
                        // @ts-ignore
                        if (s16 !== peg$FAILED) {
                            // @ts-ignore
                            s14 = [s14, s15, s16];
                            // @ts-ignore
                            s13 = s14;
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s13;
                            // @ts-ignore
                            s13 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s13;
                        // @ts-ignore
                        s13 = peg$FAILED;
                    }
                    // @ts-ignore
                    if (s13 === peg$FAILED) {
                        // @ts-ignore
                        s13 = null;
                    }
                    // @ts-ignore
                    s14 = peg$parse_();
                    // @ts-ignore
                    s15 = peg$parseSEMICOLON();
                    // @ts-ignore
                    if (s15 !== peg$FAILED) {
                        // @ts-ignore
                        peg$savedPos = s0;
                        // @ts-ignore
                        s0 = peg$f13(s1, s3, s5, s9, s11, s13);
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseMethod() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15, s16, s17, s18, s19, s20, s21, s22;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = [];
            // @ts-ignore
            s2 = peg$parseDecoratorExpression();
            // @ts-ignore
            while (s2 !== peg$FAILED) {
                // @ts-ignore
                s1.push(s2);
                // @ts-ignore
                s2 = peg$parseDecoratorExpression();
            }
            // @ts-ignore
            s2 = peg$parse_();
            // @ts-ignore
            s3 = peg$parseAccessModifier();
            // @ts-ignore
            if (s3 === peg$FAILED) {
                // @ts-ignore
                s3 = null;
            }
            // @ts-ignore
            s4 = peg$parse_();
            // @ts-ignore
            s5 = peg$parseSTATIC();
            // @ts-ignore
            if (s5 === peg$FAILED) {
                // @ts-ignore
                s5 = null;
            }
            // @ts-ignore
            s6 = peg$parse_();
            // @ts-ignore
            s7 = peg$parseIDENTIFIER();
            // @ts-ignore
            if (s7 !== peg$FAILED) {
                // @ts-ignore
                s8 = peg$parse_();
                // @ts-ignore
                s9 = peg$parseGenericDeclaration();
                // @ts-ignore
                if (s9 === peg$FAILED) {
                    // @ts-ignore
                    s9 = null;
                }
                // @ts-ignore
                s10 = peg$parse_();
                // @ts-ignore
                s11 = peg$parseLPAREN();
                // @ts-ignore
                if (s11 !== peg$FAILED) {
                    // @ts-ignore
                    s12 = peg$parse_();
                    // @ts-ignore
                    s13 = peg$parseParameterList();
                    // @ts-ignore
                    if (s13 === peg$FAILED) {
                        // @ts-ignore
                        s13 = null;
                    }
                    // @ts-ignore
                    s14 = peg$parse_();
                    // @ts-ignore
                    s15 = peg$currPos;
                    // @ts-ignore
                    s16 = peg$parseCOMMA();
                    // @ts-ignore
                    if (s16 !== peg$FAILED) {
                        // @ts-ignore
                        s17 = peg$parse_();
                        // @ts-ignore
                        s18 = peg$parsePARAMS();
                        // @ts-ignore
                        if (s18 !== peg$FAILED) {
                            // @ts-ignore
                            s19 = peg$parse_();
                            // @ts-ignore
                            s20 = peg$parseParameter();
                            // @ts-ignore
                            if (s20 !== peg$FAILED) {
                                // @ts-ignore
                                s21 = peg$parse_();
                                // @ts-ignore
                                s16 = [s16, s17, s18, s19, s20, s21];
                                // @ts-ignore
                                s15 = s16;
                                // @ts-ignore
                            }
                            else {
                                // @ts-ignore
                                peg$currPos = s15;
                                // @ts-ignore
                                s15 = peg$FAILED;
                            }
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s15;
                            // @ts-ignore
                            s15 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s15;
                        // @ts-ignore
                        s15 = peg$FAILED;
                    }
                    // @ts-ignore
                    if (s15 === peg$FAILED) {
                        // @ts-ignore
                        s15 = null;
                    }
                    // @ts-ignore
                    s16 = peg$parse_();
                    // @ts-ignore
                    s17 = peg$parseRPAREN();
                    // @ts-ignore
                    if (s17 !== peg$FAILED) {
                        // @ts-ignore
                        s18 = peg$parse_();
                        // @ts-ignore
                        s19 = peg$currPos;
                        // @ts-ignore
                        s20 = peg$parseCOLON();
                        // @ts-ignore
                        if (s20 !== peg$FAILED) {
                            // @ts-ignore
                            s21 = peg$parse_();
                            // @ts-ignore
                            s22 = peg$parseType();
                            // @ts-ignore
                            if (s22 !== peg$FAILED) {
                                // @ts-ignore
                                s20 = [s20, s21, s22];
                                // @ts-ignore
                                s19 = s20;
                                // @ts-ignore
                            }
                            else {
                                // @ts-ignore
                                peg$currPos = s19;
                                // @ts-ignore
                                s19 = peg$FAILED;
                            }
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s19;
                            // @ts-ignore
                            s19 = peg$FAILED;
                        }
                        // @ts-ignore
                        if (s19 === peg$FAILED) {
                            // @ts-ignore
                            s19 = null;
                        }
                        // @ts-ignore
                        s20 = peg$parse_();
                        // @ts-ignore
                        s21 = peg$parseBlock();
                        // @ts-ignore
                        if (s21 !== peg$FAILED) {
                            // @ts-ignore
                            peg$savedPos = s0;
                            // @ts-ignore
                            s0 = peg$f14(s1, s3, s5, s7, s9, s13, s15, s19, s21);
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s0;
                            // @ts-ignore
                            s0 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            if (s0 === peg$FAILED) {
                // @ts-ignore
                s0 = peg$currPos;
                // @ts-ignore
                s1 = [];
                // @ts-ignore
                s2 = peg$parseDecoratorExpression();
                // @ts-ignore
                while (s2 !== peg$FAILED) {
                    // @ts-ignore
                    s1.push(s2);
                    // @ts-ignore
                    s2 = peg$parseDecoratorExpression();
                }
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = peg$parseAccessModifier();
                // @ts-ignore
                if (s3 === peg$FAILED) {
                    // @ts-ignore
                    s3 = null;
                }
                // @ts-ignore
                s4 = peg$parse_();
                // @ts-ignore
                s5 = peg$parseSTATIC();
                // @ts-ignore
                if (s5 === peg$FAILED) {
                    // @ts-ignore
                    s5 = null;
                }
                // @ts-ignore
                s6 = peg$parse_();
                // @ts-ignore
                s7 = peg$parseIDENTIFIER();
                // @ts-ignore
                if (s7 !== peg$FAILED) {
                    // @ts-ignore
                    s8 = peg$parse_();
                    // @ts-ignore
                    s9 = peg$parseGenericDeclaration();
                    // @ts-ignore
                    if (s9 === peg$FAILED) {
                        // @ts-ignore
                        s9 = null;
                    }
                    // @ts-ignore
                    s10 = peg$parse_();
                    // @ts-ignore
                    s11 = peg$parseLPAREN();
                    // @ts-ignore
                    if (s11 !== peg$FAILED) {
                        // @ts-ignore
                        s12 = peg$parse_();
                        // @ts-ignore
                        s13 = peg$parsePARAMS();
                        // @ts-ignore
                        if (s13 !== peg$FAILED) {
                            // @ts-ignore
                            s14 = peg$parse_();
                            // @ts-ignore
                            s15 = peg$parseParameter();
                            // @ts-ignore
                            if (s15 !== peg$FAILED) {
                                // @ts-ignore
                                s16 = peg$parse_();
                                // @ts-ignore
                                s17 = peg$parseRPAREN();
                                // @ts-ignore
                                if (s17 !== peg$FAILED) {
                                    // @ts-ignore
                                    s18 = peg$parse_();
                                    // @ts-ignore
                                    s19 = peg$currPos;
                                    // @ts-ignore
                                    s20 = peg$parseCOLON();
                                    // @ts-ignore
                                    if (s20 !== peg$FAILED) {
                                        // @ts-ignore
                                        s21 = peg$parse_();
                                        // @ts-ignore
                                        s22 = peg$parseType();
                                        // @ts-ignore
                                        if (s22 !== peg$FAILED) {
                                            // @ts-ignore
                                            s20 = [s20, s21, s22];
                                            // @ts-ignore
                                            s19 = s20;
                                            // @ts-ignore
                                        }
                                        else {
                                            // @ts-ignore
                                            peg$currPos = s19;
                                            // @ts-ignore
                                            s19 = peg$FAILED;
                                        }
                                        // @ts-ignore
                                    }
                                    else {
                                        // @ts-ignore
                                        peg$currPos = s19;
                                        // @ts-ignore
                                        s19 = peg$FAILED;
                                    }
                                    // @ts-ignore
                                    if (s19 === peg$FAILED) {
                                        // @ts-ignore
                                        s19 = null;
                                    }
                                    // @ts-ignore
                                    s20 = peg$parse_();
                                    // @ts-ignore
                                    s21 = peg$parseBlock();
                                    // @ts-ignore
                                    if (s21 !== peg$FAILED) {
                                        // @ts-ignore
                                        peg$savedPos = s0;
                                        // @ts-ignore
                                        s0 = peg$f15(s1, s3, s5, s7, s9, s15, s19, s21);
                                        // @ts-ignore
                                    }
                                    else {
                                        // @ts-ignore
                                        peg$currPos = s0;
                                        // @ts-ignore
                                        s0 = peg$FAILED;
                                    }
                                    // @ts-ignore
                                }
                                else {
                                    // @ts-ignore
                                    peg$currPos = s0;
                                    // @ts-ignore
                                    s0 = peg$FAILED;
                                }
                                // @ts-ignore
                            }
                            else {
                                // @ts-ignore
                                peg$currPos = s0;
                                // @ts-ignore
                                s0 = peg$FAILED;
                            }
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s0;
                            // @ts-ignore
                            s0 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseProperty() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = [];
            // @ts-ignore
            s2 = peg$parseDecoratorExpression();
            // @ts-ignore
            while (s2 !== peg$FAILED) {
                // @ts-ignore
                s1.push(s2);
                // @ts-ignore
                s2 = peg$parseDecoratorExpression();
            }
            // @ts-ignore
            s2 = peg$parseAccessModifier();
            // @ts-ignore
            if (s2 === peg$FAILED) {
                // @ts-ignore
                s2 = null;
            }
            // @ts-ignore
            s3 = peg$parse_();
            // @ts-ignore
            s4 = peg$parseSTATIC();
            // @ts-ignore
            if (s4 === peg$FAILED) {
                // @ts-ignore
                s4 = null;
            }
            // @ts-ignore
            s5 = peg$parse_();
            // @ts-ignore
            s6 = peg$parseGetProperty();
            // @ts-ignore
            if (s6 === peg$FAILED) {
                // @ts-ignore
                s6 = peg$parseSetProperty();
            }
            // @ts-ignore
            if (s6 !== peg$FAILED) {
                // @ts-ignore
                peg$savedPos = s0;
                // @ts-ignore
                s0 = peg$f16(s1, s2, s4, s6);
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseGetProperty() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7, s8;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseGET();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = peg$parseIDENTIFIER();
                // @ts-ignore
                if (s3 !== peg$FAILED) {
                    // @ts-ignore
                    s4 = peg$parse_();
                    // @ts-ignore
                    s5 = peg$currPos;
                    // @ts-ignore
                    s6 = peg$parseCOLON();
                    // @ts-ignore
                    if (s6 !== peg$FAILED) {
                        // @ts-ignore
                        s7 = peg$parse_();
                        // @ts-ignore
                        s8 = peg$parseType();
                        // @ts-ignore
                        if (s8 !== peg$FAILED) {
                            // @ts-ignore
                            s6 = [s6, s7, s8];
                            // @ts-ignore
                            s5 = s6;
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s5;
                            // @ts-ignore
                            s5 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s5;
                        // @ts-ignore
                        s5 = peg$FAILED;
                    }
                    // @ts-ignore
                    if (s5 === peg$FAILED) {
                        // @ts-ignore
                        s5 = null;
                    }
                    // @ts-ignore
                    s6 = peg$parse_();
                    // @ts-ignore
                    s7 = peg$parseBlock();
                    // @ts-ignore
                    if (s7 !== peg$FAILED) {
                        // @ts-ignore
                        peg$savedPos = s0;
                        // @ts-ignore
                        s0 = peg$f17(s3, s5, s7);
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseSetProperty() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseSET();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = peg$parseIDENTIFIER();
                // @ts-ignore
                if (s3 !== peg$FAILED) {
                    // @ts-ignore
                    s4 = peg$parse_();
                    // @ts-ignore
                    s5 = peg$parseLPAREN();
                    // @ts-ignore
                    if (s5 !== peg$FAILED) {
                        // @ts-ignore
                        s6 = peg$parseIDENTIFIER();
                        // @ts-ignore
                        if (s6 !== peg$FAILED) {
                            // @ts-ignore
                            s7 = peg$parse_();
                            // @ts-ignore
                            s8 = peg$currPos;
                            // @ts-ignore
                            s9 = peg$parseCOLON();
                            // @ts-ignore
                            if (s9 !== peg$FAILED) {
                                // @ts-ignore
                                s10 = peg$parse_();
                                // @ts-ignore
                                s11 = peg$parseType();
                                // @ts-ignore
                                if (s11 !== peg$FAILED) {
                                    // @ts-ignore
                                    s12 = peg$parse_();
                                    // @ts-ignore
                                    s9 = [s9, s10, s11, s12];
                                    // @ts-ignore
                                    s8 = s9;
                                    // @ts-ignore
                                }
                                else {
                                    // @ts-ignore
                                    peg$currPos = s8;
                                    // @ts-ignore
                                    s8 = peg$FAILED;
                                }
                                // @ts-ignore
                            }
                            else {
                                // @ts-ignore
                                peg$currPos = s8;
                                // @ts-ignore
                                s8 = peg$FAILED;
                            }
                            // @ts-ignore
                            if (s8 === peg$FAILED) {
                                // @ts-ignore
                                s8 = null;
                            }
                            // @ts-ignore
                            s9 = peg$parseRPAREN();
                            // @ts-ignore
                            if (s9 !== peg$FAILED) {
                                // @ts-ignore
                                s10 = peg$parse_();
                                // @ts-ignore
                                s11 = peg$parseBlock();
                                // @ts-ignore
                                if (s11 !== peg$FAILED) {
                                    // @ts-ignore
                                    peg$savedPos = s0;
                                    // @ts-ignore
                                    s0 = peg$f18(s3, s6, s8, s11);
                                    // @ts-ignore
                                }
                                else {
                                    // @ts-ignore
                                    peg$currPos = s0;
                                    // @ts-ignore
                                    s0 = peg$FAILED;
                                }
                                // @ts-ignore
                            }
                            else {
                                // @ts-ignore
                                peg$currPos = s0;
                                // @ts-ignore
                                s0 = peg$FAILED;
                            }
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s0;
                            // @ts-ignore
                            s0 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseInterfaceDeclaration() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseINTERFACE();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = peg$parseIDENTIFIER();
                // @ts-ignore
                if (s3 !== peg$FAILED) {
                    // @ts-ignore
                    s4 = peg$parse_();
                    // @ts-ignore
                    s5 = peg$parseGenericDeclaration();
                    // @ts-ignore
                    if (s5 === peg$FAILED) {
                        // @ts-ignore
                        s5 = null;
                    }
                    // @ts-ignore
                    s6 = peg$parse_();
                    // @ts-ignore
                    s7 = peg$currPos;
                    // @ts-ignore
                    s8 = peg$parseCOLON();
                    // @ts-ignore
                    if (s8 !== peg$FAILED) {
                        // @ts-ignore
                        s9 = peg$parse_();
                        // @ts-ignore
                        s10 = peg$parseTypeList();
                        // @ts-ignore
                        if (s10 !== peg$FAILED) {
                            // @ts-ignore
                            s8 = [s8, s9, s10];
                            // @ts-ignore
                            s7 = s8;
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s7;
                            // @ts-ignore
                            s7 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s7;
                        // @ts-ignore
                        s7 = peg$FAILED;
                    }
                    // @ts-ignore
                    if (s7 === peg$FAILED) {
                        // @ts-ignore
                        s7 = null;
                    }
                    // @ts-ignore
                    s8 = peg$parse_();
                    // @ts-ignore
                    s9 = peg$parseLBRACE();
                    // @ts-ignore
                    if (s9 !== peg$FAILED) {
                        // @ts-ignore
                        s10 = peg$parse_();
                        // @ts-ignore
                        s11 = [];
                        // @ts-ignore
                        s12 = peg$parseInterfaceMember();
                        // @ts-ignore
                        while (s12 !== peg$FAILED) {
                            // @ts-ignore
                            s11.push(s12);
                            // @ts-ignore
                            s12 = peg$parseInterfaceMember();
                        }
                        // @ts-ignore
                        s12 = peg$parse_();
                        // @ts-ignore
                        s13 = peg$parseRBRACE();
                        // @ts-ignore
                        if (s13 !== peg$FAILED) {
                            // @ts-ignore
                            peg$savedPos = s0;
                            // @ts-ignore
                            s0 = peg$f19(s3, s5, s7, s11);
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s0;
                            // @ts-ignore
                            s0 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseInterfaceMember() {
            // @ts-ignore
            var s0, s1, s2, s3;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parse_();
            // @ts-ignore
            s2 = peg$parseInterfaceMethodSignature();
            // @ts-ignore
            if (s2 === peg$FAILED) {
                // @ts-ignore
                s2 = peg$parseInterfacePropertySignature();
                // @ts-ignore
                if (s2 === peg$FAILED) {
                    // @ts-ignore
                    s2 = peg$parseInterfaceFieldDeclaration();
                }
            }
            // @ts-ignore
            if (s2 !== peg$FAILED) {
                // @ts-ignore
                s3 = peg$parse_();
                // @ts-ignore
                peg$savedPos = s0;
                // @ts-ignore
                s0 = peg$f20(s2);
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseInterfaceMethodSignature() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15, s16, s17, s18;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseAccessModifier();
            // @ts-ignore
            if (s1 === peg$FAILED) {
                // @ts-ignore
                s1 = null;
            }
            // @ts-ignore
            s2 = peg$parse_();
            // @ts-ignore
            s3 = peg$parseIDENTIFIER();
            // @ts-ignore
            if (s3 !== peg$FAILED) {
                // @ts-ignore
                s4 = peg$parse_();
                // @ts-ignore
                s5 = peg$parseGenericDeclaration();
                // @ts-ignore
                if (s5 === peg$FAILED) {
                    // @ts-ignore
                    s5 = null;
                }
                // @ts-ignore
                s6 = peg$parse_();
                // @ts-ignore
                s7 = peg$parseLPAREN();
                // @ts-ignore
                if (s7 !== peg$FAILED) {
                    // @ts-ignore
                    s8 = peg$parse_();
                    // @ts-ignore
                    s9 = peg$parseParameterList();
                    // @ts-ignore
                    if (s9 === peg$FAILED) {
                        // @ts-ignore
                        s9 = null;
                    }
                    // @ts-ignore
                    s10 = peg$parse_();
                    // @ts-ignore
                    s11 = peg$currPos;
                    // @ts-ignore
                    s12 = peg$parseCOMMA();
                    // @ts-ignore
                    if (s12 !== peg$FAILED) {
                        // @ts-ignore
                        s13 = peg$parse_();
                        // @ts-ignore
                        s14 = peg$parsePARAMS();
                        // @ts-ignore
                        if (s14 !== peg$FAILED) {
                            // @ts-ignore
                            s15 = peg$parse_();
                            // @ts-ignore
                            s16 = peg$parseParameter();
                            // @ts-ignore
                            if (s16 !== peg$FAILED) {
                                // @ts-ignore
                                s17 = peg$parse_();
                                // @ts-ignore
                                s12 = [s12, s13, s14, s15, s16, s17];
                                // @ts-ignore
                                s11 = s12;
                                // @ts-ignore
                            }
                            else {
                                // @ts-ignore
                                peg$currPos = s11;
                                // @ts-ignore
                                s11 = peg$FAILED;
                            }
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s11;
                            // @ts-ignore
                            s11 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s11;
                        // @ts-ignore
                        s11 = peg$FAILED;
                    }
                    // @ts-ignore
                    if (s11 === peg$FAILED) {
                        // @ts-ignore
                        s11 = null;
                    }
                    // @ts-ignore
                    s12 = peg$parse_();
                    // @ts-ignore
                    s13 = peg$parseRPAREN();
                    // @ts-ignore
                    if (s13 !== peg$FAILED) {
                        // @ts-ignore
                        s14 = peg$parse_();
                        // @ts-ignore
                        s15 = peg$currPos;
                        // @ts-ignore
                        s16 = peg$parseCOLON();
                        // @ts-ignore
                        if (s16 !== peg$FAILED) {
                            // @ts-ignore
                            s17 = peg$parse_();
                            // @ts-ignore
                            s18 = peg$parseType();
                            // @ts-ignore
                            if (s18 !== peg$FAILED) {
                                // @ts-ignore
                                s16 = [s16, s17, s18];
                                // @ts-ignore
                                s15 = s16;
                                // @ts-ignore
                            }
                            else {
                                // @ts-ignore
                                peg$currPos = s15;
                                // @ts-ignore
                                s15 = peg$FAILED;
                            }
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s15;
                            // @ts-ignore
                            s15 = peg$FAILED;
                        }
                        // @ts-ignore
                        if (s15 === peg$FAILED) {
                            // @ts-ignore
                            s15 = null;
                        }
                        // @ts-ignore
                        s16 = peg$parse_();
                        // @ts-ignore
                        s17 = peg$parseSEMICOLON();
                        // @ts-ignore
                        if (s17 !== peg$FAILED) {
                            // @ts-ignore
                            peg$savedPos = s0;
                            // @ts-ignore
                            s0 = peg$f21(s1, s3, s5, s9, s11, s15);
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s0;
                            // @ts-ignore
                            s0 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            if (s0 === peg$FAILED) {
                // @ts-ignore
                s0 = peg$currPos;
                // @ts-ignore
                s1 = peg$parseAccessModifier();
                // @ts-ignore
                if (s1 === peg$FAILED) {
                    // @ts-ignore
                    s1 = null;
                }
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = peg$parseIDENTIFIER();
                // @ts-ignore
                if (s3 !== peg$FAILED) {
                    // @ts-ignore
                    s4 = peg$parse_();
                    // @ts-ignore
                    s5 = peg$parseGenericDeclaration();
                    // @ts-ignore
                    if (s5 === peg$FAILED) {
                        // @ts-ignore
                        s5 = null;
                    }
                    // @ts-ignore
                    s6 = peg$parse_();
                    // @ts-ignore
                    s7 = peg$parseLPAREN();
                    // @ts-ignore
                    if (s7 !== peg$FAILED) {
                        // @ts-ignore
                        s8 = peg$parse_();
                        // @ts-ignore
                        s9 = peg$parsePARAMS();
                        // @ts-ignore
                        if (s9 !== peg$FAILED) {
                            // @ts-ignore
                            s10 = peg$parse_();
                            // @ts-ignore
                            s11 = peg$parseParameter();
                            // @ts-ignore
                            if (s11 !== peg$FAILED) {
                                // @ts-ignore
                                s12 = peg$parse_();
                                // @ts-ignore
                                s13 = peg$parseRPAREN();
                                // @ts-ignore
                                if (s13 !== peg$FAILED) {
                                    // @ts-ignore
                                    s14 = peg$parse_();
                                    // @ts-ignore
                                    s15 = peg$currPos;
                                    // @ts-ignore
                                    s16 = peg$parseCOLON();
                                    // @ts-ignore
                                    if (s16 !== peg$FAILED) {
                                        // @ts-ignore
                                        s17 = peg$parse_();
                                        // @ts-ignore
                                        s18 = peg$parseType();
                                        // @ts-ignore
                                        if (s18 !== peg$FAILED) {
                                            // @ts-ignore
                                            s16 = [s16, s17, s18];
                                            // @ts-ignore
                                            s15 = s16;
                                            // @ts-ignore
                                        }
                                        else {
                                            // @ts-ignore
                                            peg$currPos = s15;
                                            // @ts-ignore
                                            s15 = peg$FAILED;
                                        }
                                        // @ts-ignore
                                    }
                                    else {
                                        // @ts-ignore
                                        peg$currPos = s15;
                                        // @ts-ignore
                                        s15 = peg$FAILED;
                                    }
                                    // @ts-ignore
                                    if (s15 === peg$FAILED) {
                                        // @ts-ignore
                                        s15 = null;
                                    }
                                    // @ts-ignore
                                    s16 = peg$parse_();
                                    // @ts-ignore
                                    s17 = peg$parseSEMICOLON();
                                    // @ts-ignore
                                    if (s17 !== peg$FAILED) {
                                        // @ts-ignore
                                        peg$savedPos = s0;
                                        // @ts-ignore
                                        s0 = peg$f22(s1, s3, s5, s11, s15);
                                        // @ts-ignore
                                    }
                                    else {
                                        // @ts-ignore
                                        peg$currPos = s0;
                                        // @ts-ignore
                                        s0 = peg$FAILED;
                                    }
                                    // @ts-ignore
                                }
                                else {
                                    // @ts-ignore
                                    peg$currPos = s0;
                                    // @ts-ignore
                                    s0 = peg$FAILED;
                                }
                                // @ts-ignore
                            }
                            else {
                                // @ts-ignore
                                peg$currPos = s0;
                                // @ts-ignore
                                s0 = peg$FAILED;
                            }
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s0;
                            // @ts-ignore
                            s0 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseInterfacePropertySignature() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseAccessModifier();
            // @ts-ignore
            if (s1 === peg$FAILED) {
                // @ts-ignore
                s1 = null;
            }
            // @ts-ignore
            s2 = peg$parse_();
            // @ts-ignore
            s3 = peg$parseGetSetModifier();
            // @ts-ignore
            if (s3 === peg$FAILED) {
                // @ts-ignore
                s3 = null;
            }
            // @ts-ignore
            s4 = peg$parse_();
            // @ts-ignore
            s5 = peg$parseIDENTIFIER();
            // @ts-ignore
            if (s5 !== peg$FAILED) {
                // @ts-ignore
                s6 = peg$parse_();
                // @ts-ignore
                s7 = peg$currPos;
                // @ts-ignore
                s8 = peg$parseCOLON();
                // @ts-ignore
                if (s8 !== peg$FAILED) {
                    // @ts-ignore
                    s9 = peg$parse_();
                    // @ts-ignore
                    s10 = peg$parseType();
                    // @ts-ignore
                    if (s10 !== peg$FAILED) {
                        // @ts-ignore
                        s8 = [s8, s9, s10];
                        // @ts-ignore
                        s7 = s8;
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s7;
                        // @ts-ignore
                        s7 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s7;
                    // @ts-ignore
                    s7 = peg$FAILED;
                }
                // @ts-ignore
                if (s7 === peg$FAILED) {
                    // @ts-ignore
                    s7 = null;
                }
                // @ts-ignore
                s8 = peg$parse_();
                // @ts-ignore
                s9 = peg$parseSEMICOLON();
                // @ts-ignore
                if (s9 !== peg$FAILED) {
                    // @ts-ignore
                    peg$savedPos = s0;
                    // @ts-ignore
                    s0 = peg$f23(s1, s3, s5, s7);
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseGetSetModifier() {
            // @ts-ignore
            var s0, s1, s2, s3;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseGET();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = peg$parseSET();
                // @ts-ignore
                if (s3 !== peg$FAILED) {
                    // @ts-ignore
                    peg$savedPos = s0;
                    // @ts-ignore
                    s0 = peg$f24();
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            if (s0 === peg$FAILED) {
                // @ts-ignore
                s0 = peg$currPos;
                // @ts-ignore
                s1 = peg$parseSET();
                // @ts-ignore
                if (s1 !== peg$FAILED) {
                    // @ts-ignore
                    s2 = peg$parse_();
                    // @ts-ignore
                    s3 = peg$parseGET();
                    // @ts-ignore
                    if (s3 !== peg$FAILED) {
                        // @ts-ignore
                        peg$savedPos = s0;
                        // @ts-ignore
                        s0 = peg$f25();
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
                if (s0 === peg$FAILED) {
                    // @ts-ignore
                    s0 = peg$currPos;
                    // @ts-ignore
                    s1 = peg$parseGET();
                    // @ts-ignore
                    if (s1 !== peg$FAILED) {
                        // @ts-ignore
                        peg$savedPos = s0;
                        // @ts-ignore
                        s1 = peg$f26();
                    }
                    // @ts-ignore
                    s0 = s1;
                    // @ts-ignore
                    if (s0 === peg$FAILED) {
                        // @ts-ignore
                        s0 = peg$currPos;
                        // @ts-ignore
                        s1 = peg$parseSET();
                        // @ts-ignore
                        if (s1 !== peg$FAILED) {
                            // @ts-ignore
                            peg$savedPos = s0;
                            // @ts-ignore
                            s1 = peg$f27();
                        }
                        // @ts-ignore
                        s0 = s1;
                    }
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseInterfaceFieldDeclaration() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseAccessModifier();
            // @ts-ignore
            if (s1 === peg$FAILED) {
                // @ts-ignore
                s1 = null;
            }
            // @ts-ignore
            s2 = peg$parse_();
            // @ts-ignore
            s3 = peg$parseVAR();
            // @ts-ignore
            if (s3 !== peg$FAILED) {
                // @ts-ignore
                s4 = peg$parse_();
                // @ts-ignore
                s5 = peg$parseIDENTIFIER();
                // @ts-ignore
                if (s5 !== peg$FAILED) {
                    // @ts-ignore
                    s6 = peg$currPos;
                    // @ts-ignore
                    s7 = peg$parse_();
                    // @ts-ignore
                    s8 = peg$parseCOLON();
                    // @ts-ignore
                    if (s8 !== peg$FAILED) {
                        // @ts-ignore
                        s9 = peg$parse_();
                        // @ts-ignore
                        s10 = peg$parseType();
                        // @ts-ignore
                        if (s10 !== peg$FAILED) {
                            // @ts-ignore
                            s7 = [s7, s8, s9, s10];
                            // @ts-ignore
                            s6 = s7;
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s6;
                            // @ts-ignore
                            s6 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s6;
                        // @ts-ignore
                        s6 = peg$FAILED;
                    }
                    // @ts-ignore
                    if (s6 === peg$FAILED) {
                        // @ts-ignore
                        s6 = null;
                    }
                    // @ts-ignore
                    s7 = peg$parse_();
                    // @ts-ignore
                    s8 = peg$parseSEMICOLON();
                    // @ts-ignore
                    if (s8 !== peg$FAILED) {
                        // @ts-ignore
                        peg$savedPos = s0;
                        // @ts-ignore
                        s0 = peg$f28(s1, s5, s6);
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseEnumDeclaration() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseENUM();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = peg$parseIDENTIFIER();
                // @ts-ignore
                if (s3 !== peg$FAILED) {
                    // @ts-ignore
                    s4 = peg$parse_();
                    // @ts-ignore
                    s5 = peg$currPos;
                    // @ts-ignore
                    s6 = peg$parseCOLON();
                    // @ts-ignore
                    if (s6 !== peg$FAILED) {
                        // @ts-ignore
                        s7 = peg$parse_();
                        // @ts-ignore
                        s8 = peg$parseType();
                        // @ts-ignore
                        if (s8 !== peg$FAILED) {
                            // @ts-ignore
                            s6 = [s6, s7, s8];
                            // @ts-ignore
                            s5 = s6;
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s5;
                            // @ts-ignore
                            s5 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s5;
                        // @ts-ignore
                        s5 = peg$FAILED;
                    }
                    // @ts-ignore
                    if (s5 === peg$FAILED) {
                        // @ts-ignore
                        s5 = null;
                    }
                    // @ts-ignore
                    s6 = peg$parse_();
                    // @ts-ignore
                    s7 = peg$parseLBRACE();
                    // @ts-ignore
                    if (s7 !== peg$FAILED) {
                        // @ts-ignore
                        s8 = peg$parse_();
                        // @ts-ignore
                        s9 = [];
                        // @ts-ignore
                        s10 = peg$parseEnumMember();
                        // @ts-ignore
                        if (s10 !== peg$FAILED) {
                            // @ts-ignore
                            while (s10 !== peg$FAILED) {
                                // @ts-ignore
                                s9.push(s10);
                                // @ts-ignore
                                s10 = peg$parseEnumMember();
                            }
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            s9 = peg$FAILED;
                        }
                        // @ts-ignore
                        if (s9 !== peg$FAILED) {
                            // @ts-ignore
                            s10 = peg$parse_();
                            // @ts-ignore
                            s11 = peg$parseRBRACE();
                            // @ts-ignore
                            if (s11 !== peg$FAILED) {
                                // @ts-ignore
                                peg$savedPos = s0;
                                // @ts-ignore
                                s0 = peg$f29(s3, s5, s9);
                                // @ts-ignore
                            }
                            else {
                                // @ts-ignore
                                peg$currPos = s0;
                                // @ts-ignore
                                s0 = peg$FAILED;
                            }
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s0;
                            // @ts-ignore
                            s0 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseEnumMember() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parse_();
            // @ts-ignore
            s2 = peg$parseIDENTIFIER();
            // @ts-ignore
            if (s2 !== peg$FAILED) {
                // @ts-ignore
                s3 = peg$parse_();
                // @ts-ignore
                s4 = peg$currPos;
                // @ts-ignore
                s5 = peg$parseEQUALS();
                // @ts-ignore
                if (s5 !== peg$FAILED) {
                    // @ts-ignore
                    s6 = peg$parse_();
                    // @ts-ignore
                    s7 = peg$parseExpression();
                    // @ts-ignore
                    if (s7 !== peg$FAILED) {
                        // @ts-ignore
                        s5 = [s5, s6, s7];
                        // @ts-ignore
                        s4 = s5;
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s4;
                        // @ts-ignore
                        s4 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s4;
                    // @ts-ignore
                    s4 = peg$FAILED;
                }
                // @ts-ignore
                if (s4 === peg$FAILED) {
                    // @ts-ignore
                    s4 = null;
                }
                // @ts-ignore
                s5 = peg$parse_();
                // @ts-ignore
                s6 = peg$parseCOMMA();
                // @ts-ignore
                if (s6 === peg$FAILED) {
                    // @ts-ignore
                    s6 = peg$parseSEMICOLON();
                }
                // @ts-ignore
                if (s6 === peg$FAILED) {
                    // @ts-ignore
                    s6 = null;
                }
                // @ts-ignore
                s7 = peg$parse_();
                // @ts-ignore
                peg$savedPos = s0;
                // @ts-ignore
                s0 = peg$f30(s2, s4);
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseGenericDeclaration() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseLESS_THAN();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = [];
                // @ts-ignore
                s4 = peg$parseParameter();
                // @ts-ignore
                if (s4 !== peg$FAILED) {
                    // @ts-ignore
                    while (s4 !== peg$FAILED) {
                        // @ts-ignore
                        s3.push(s4);
                        // @ts-ignore
                        s4 = peg$parseParameter();
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    s3 = peg$FAILED;
                }
                // @ts-ignore
                if (s3 !== peg$FAILED) {
                    // @ts-ignore
                    s4 = peg$parse_();
                    // @ts-ignore
                    s5 = peg$parseGREATER_THAN();
                    // @ts-ignore
                    if (s5 !== peg$FAILED) {
                        // @ts-ignore
                        s6 = peg$parse_();
                        // @ts-ignore
                        peg$savedPos = s0;
                        // @ts-ignore
                        s0 = peg$f31(s3);
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseStatement() {
            // @ts-ignore
            var s0, s1, s2, s3;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parse_();
            // @ts-ignore
            s2 = peg$parseControlStatement();
            // @ts-ignore
            if (s2 === peg$FAILED) {
                // @ts-ignore
                s2 = peg$parseVariableDeclaration();
                // @ts-ignore
                if (s2 === peg$FAILED) {
                    // @ts-ignore
                    s2 = peg$parseExpressionStatement();
                    // @ts-ignore
                    if (s2 === peg$FAILED) {
                        // @ts-ignore
                        s2 = peg$parseReturnStatement();
                        // @ts-ignore
                        if (s2 === peg$FAILED) {
                            // @ts-ignore
                            s2 = peg$parseBreakContinueStatement();
                            // @ts-ignore
                            if (s2 === peg$FAILED) {
                                // @ts-ignore
                                s2 = peg$parseOutStatement();
                                // @ts-ignore
                                if (s2 === peg$FAILED) {
                                    // @ts-ignore
                                    s2 = peg$parseBlock();
                                }
                            }
                        }
                    }
                }
            }
            // @ts-ignore
            if (s2 !== peg$FAILED) {
                // @ts-ignore
                s3 = peg$parse_();
                // @ts-ignore
                peg$savedPos = s0;
                // @ts-ignore
                s0 = peg$f32(s2);
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseExpressionStatement() {
            // @ts-ignore
            var s0, s1, s2, s3;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseExpression();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = peg$parseSEMICOLON();
                // @ts-ignore
                if (s3 !== peg$FAILED) {
                    // @ts-ignore
                    peg$savedPos = s0;
                    // @ts-ignore
                    s0 = peg$f33(s1);
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseVariableDeclaration() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseVAR();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = peg$parseDestructuringPattern();
                // @ts-ignore
                if (s3 === peg$FAILED) {
                    // @ts-ignore
                    s3 = peg$parseDestructuringArrayPattern();
                    // @ts-ignore
                    if (s3 === peg$FAILED) {
                        // @ts-ignore
                        s3 = peg$parseIDENTIFIER();
                    }
                }
                // @ts-ignore
                if (s3 !== peg$FAILED) {
                    // @ts-ignore
                    s4 = peg$currPos;
                    // @ts-ignore
                    s5 = peg$parseCOLON();
                    // @ts-ignore
                    if (s5 !== peg$FAILED) {
                        // @ts-ignore
                        s6 = peg$parse_();
                        // @ts-ignore
                        s7 = peg$parseType();
                        // @ts-ignore
                        if (s7 !== peg$FAILED) {
                            // @ts-ignore
                            s5 = [s5, s6, s7];
                            // @ts-ignore
                            s4 = s5;
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s4;
                            // @ts-ignore
                            s4 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s4;
                        // @ts-ignore
                        s4 = peg$FAILED;
                    }
                    // @ts-ignore
                    if (s4 === peg$FAILED) {
                        // @ts-ignore
                        s4 = null;
                    }
                    // @ts-ignore
                    s5 = peg$parse_();
                    // @ts-ignore
                    s6 = peg$parseEQUALS();
                    // @ts-ignore
                    if (s6 !== peg$FAILED) {
                        // @ts-ignore
                        s7 = peg$parse_();
                        // @ts-ignore
                        s8 = peg$parseExpression();
                        // @ts-ignore
                        if (s8 !== peg$FAILED) {
                            // @ts-ignore
                            s9 = peg$parse_();
                            // @ts-ignore
                            s10 = peg$parseSEMICOLON();
                            // @ts-ignore
                            if (s10 !== peg$FAILED) {
                                // @ts-ignore
                                peg$savedPos = s0;
                                // @ts-ignore
                                s0 = peg$f34(s3, s4, s8);
                                // @ts-ignore
                            }
                            else {
                                // @ts-ignore
                                peg$currPos = s0;
                                // @ts-ignore
                                s0 = peg$FAILED;
                            }
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s0;
                            // @ts-ignore
                            s0 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseControlStatement() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            s0 = peg$parseIfStatement();
            // @ts-ignore
            if (s0 === peg$FAILED) {
                // @ts-ignore
                s0 = peg$parseSwitchStatement();
                // @ts-ignore
                if (s0 === peg$FAILED) {
                    // @ts-ignore
                    s0 = peg$parseLoopStatement();
                    // @ts-ignore
                    if (s0 === peg$FAILED) {
                        // @ts-ignore
                        s0 = peg$parseReturnStatement();
                        // @ts-ignore
                        if (s0 === peg$FAILED) {
                            // @ts-ignore
                            s0 = peg$parseBreakContinueStatement();
                        }
                    }
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseReturnStatement() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseRETURN();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = peg$parseExpression();
                // @ts-ignore
                if (s3 === peg$FAILED) {
                    // @ts-ignore
                    s3 = null;
                }
                // @ts-ignore
                s4 = peg$parse_();
                // @ts-ignore
                s5 = peg$parseSEMICOLON();
                // @ts-ignore
                if (s5 !== peg$FAILED) {
                    // @ts-ignore
                    peg$savedPos = s0;
                    // @ts-ignore
                    s0 = peg$f35(s3);
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseBreakContinueStatement() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseBREAK();
            // @ts-ignore
            if (s1 === peg$FAILED) {
                // @ts-ignore
                s1 = peg$parseCONTINUE();
            }
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = peg$parseExpression();
                // @ts-ignore
                if (s3 === peg$FAILED) {
                    // @ts-ignore
                    s3 = null;
                }
                // @ts-ignore
                s4 = peg$parse_();
                // @ts-ignore
                s5 = peg$parseSEMICOLON();
                // @ts-ignore
                if (s5 !== peg$FAILED) {
                    // @ts-ignore
                    peg$savedPos = s0;
                    // @ts-ignore
                    s0 = peg$f36(s1, s3);
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseOutStatement() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseOUT();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = peg$parseExpression();
                // @ts-ignore
                if (s3 !== peg$FAILED) {
                    // @ts-ignore
                    s4 = peg$parse_();
                    // @ts-ignore
                    s5 = peg$parseSEMICOLON();
                    // @ts-ignore
                    if (s5 !== peg$FAILED) {
                        // @ts-ignore
                        peg$savedPos = s0;
                        // @ts-ignore
                        s0 = peg$f37(s3);
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseIfStatement() {
            // @ts-ignore
            var s0, s1;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseIfExpression();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                peg$savedPos = s0;
                // @ts-ignore
                s1 = peg$f38(s1);
            }
            // @ts-ignore
            s0 = s1;
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseSwitchStatement() {
            // @ts-ignore
            var s0, s1;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseSwitchExpression();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                peg$savedPos = s0;
                // @ts-ignore
                s1 = peg$f39(s1);
            }
            // @ts-ignore
            s0 = s1;
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseSwitchCase() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parse_();
            // @ts-ignore
            s2 = peg$parseLPAREN();
            // @ts-ignore
            if (s2 !== peg$FAILED) {
                // @ts-ignore
                s3 = peg$parse_();
                // @ts-ignore
                s4 = peg$parseExpression();
                // @ts-ignore
                if (s4 !== peg$FAILED) {
                    // @ts-ignore
                    s5 = peg$parse_();
                    // @ts-ignore
                    s6 = peg$parseRPAREN();
                    // @ts-ignore
                    if (s6 !== peg$FAILED) {
                        // @ts-ignore
                        s7 = peg$parse_();
                        // @ts-ignore
                        s8 = peg$parseBlock();
                        // @ts-ignore
                        if (s8 !== peg$FAILED) {
                            // @ts-ignore
                            s9 = peg$parse_();
                            // @ts-ignore
                            peg$savedPos = s0;
                            // @ts-ignore
                            s0 = peg$f40(s4, s8);
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s0;
                            // @ts-ignore
                            s0 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseSwitchDefault() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parse_();
            // @ts-ignore
            s2 = peg$parseLPAREN();
            // @ts-ignore
            if (s2 !== peg$FAILED) {
                // @ts-ignore
                s3 = peg$parse_();
                // @ts-ignore
                s4 = peg$parseRPAREN();
                // @ts-ignore
                if (s4 !== peg$FAILED) {
                    // @ts-ignore
                    s5 = peg$parse_();
                    // @ts-ignore
                    s6 = peg$parseBlock();
                    // @ts-ignore
                    if (s6 !== peg$FAILED) {
                        // @ts-ignore
                        s7 = peg$parse_();
                        // @ts-ignore
                        peg$savedPos = s0;
                        // @ts-ignore
                        s0 = peg$f41(s6);
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseLoopStatement() {
            // @ts-ignore
            var s0, s1;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseLoopExpression();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                peg$savedPos = s0;
                // @ts-ignore
                s1 = peg$f42(s1);
            }
            // @ts-ignore
            s0 = s1;
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseLoopExpression() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            s0 = peg$parseWhileLoop();
            // @ts-ignore
            if (s0 === peg$FAILED) {
                // @ts-ignore
                s0 = peg$parseForeachLoop();
                // @ts-ignore
                if (s0 === peg$FAILED) {
                    // @ts-ignore
                    s0 = peg$parseForLoop();
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseWhileLoop() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseWHILE();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = peg$parseLPAREN();
                // @ts-ignore
                if (s3 !== peg$FAILED) {
                    // @ts-ignore
                    s4 = peg$parse_();
                    // @ts-ignore
                    s5 = peg$parseExpression();
                    // @ts-ignore
                    if (s5 !== peg$FAILED) {
                        // @ts-ignore
                        s6 = peg$parse_();
                        // @ts-ignore
                        s7 = peg$parseRPAREN();
                        // @ts-ignore
                        if (s7 !== peg$FAILED) {
                            // @ts-ignore
                            s8 = peg$parse_();
                            // @ts-ignore
                            s9 = peg$parseBlock();
                            // @ts-ignore
                            if (s9 !== peg$FAILED) {
                                // @ts-ignore
                                peg$savedPos = s0;
                                // @ts-ignore
                                s0 = peg$f43(s5, s9);
                                // @ts-ignore
                            }
                            else {
                                // @ts-ignore
                                peg$currPos = s0;
                                // @ts-ignore
                                s0 = peg$FAILED;
                            }
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s0;
                            // @ts-ignore
                            s0 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseForLoop() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseFOR();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = peg$parseLPAREN();
                // @ts-ignore
                if (s3 !== peg$FAILED) {
                    // @ts-ignore
                    s4 = peg$parse_();
                    // @ts-ignore
                    s5 = peg$parseVariableDeclaration();
                    // @ts-ignore
                    if (s5 === peg$FAILED) {
                        // @ts-ignore
                        s5 = peg$parseSEMICOLON();
                    }
                    // @ts-ignore
                    if (s5 !== peg$FAILED) {
                        // @ts-ignore
                        s6 = peg$parse_();
                        // @ts-ignore
                        s7 = peg$parseExpressionStatement();
                        // @ts-ignore
                        if (s7 === peg$FAILED) {
                            // @ts-ignore
                            s7 = peg$parseSEMICOLON();
                        }
                        // @ts-ignore
                        if (s7 !== peg$FAILED) {
                            // @ts-ignore
                            s8 = peg$parse_();
                            // @ts-ignore
                            s9 = peg$parseExpression();
                            // @ts-ignore
                            if (s9 === peg$FAILED) {
                                // @ts-ignore
                                s9 = null;
                            }
                            // @ts-ignore
                            s10 = peg$parse_();
                            // @ts-ignore
                            s11 = peg$parseRPAREN();
                            // @ts-ignore
                            if (s11 !== peg$FAILED) {
                                // @ts-ignore
                                s12 = peg$parse_();
                                // @ts-ignore
                                s13 = peg$parseBlock();
                                // @ts-ignore
                                if (s13 !== peg$FAILED) {
                                    // @ts-ignore
                                    peg$savedPos = s0;
                                    // @ts-ignore
                                    s0 = peg$f44(s5, s7, s9, s13);
                                    // @ts-ignore
                                }
                                else {
                                    // @ts-ignore
                                    peg$currPos = s0;
                                    // @ts-ignore
                                    s0 = peg$FAILED;
                                }
                                // @ts-ignore
                            }
                            else {
                                // @ts-ignore
                                peg$currPos = s0;
                                // @ts-ignore
                                s0 = peg$FAILED;
                            }
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s0;
                            // @ts-ignore
                            s0 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseForeachLoop() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseFOR();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = peg$parseLPAREN();
                // @ts-ignore
                if (s3 !== peg$FAILED) {
                    // @ts-ignore
                    s4 = peg$parse_();
                    // @ts-ignore
                    s5 = peg$parseVAR();
                    // @ts-ignore
                    if (s5 !== peg$FAILED) {
                        // @ts-ignore
                        s6 = peg$parse_();
                        // @ts-ignore
                        s7 = peg$parseDestructuringPattern();
                        // @ts-ignore
                        if (s7 === peg$FAILED) {
                            // @ts-ignore
                            s7 = peg$parseDestructuringArrayPattern();
                            // @ts-ignore
                            if (s7 === peg$FAILED) {
                                // @ts-ignore
                                s7 = peg$parseIDENTIFIER();
                            }
                        }
                        // @ts-ignore
                        if (s7 !== peg$FAILED) {
                            // @ts-ignore
                            s8 = peg$currPos;
                            // @ts-ignore
                            s9 = peg$parseCOLON();
                            // @ts-ignore
                            if (s9 !== peg$FAILED) {
                                // @ts-ignore
                                s10 = peg$parse_();
                                // @ts-ignore
                                s11 = peg$parseType();
                                // @ts-ignore
                                if (s11 !== peg$FAILED) {
                                    // @ts-ignore
                                    s9 = [s9, s10, s11];
                                    // @ts-ignore
                                    s8 = s9;
                                    // @ts-ignore
                                }
                                else {
                                    // @ts-ignore
                                    peg$currPos = s8;
                                    // @ts-ignore
                                    s8 = peg$FAILED;
                                }
                                // @ts-ignore
                            }
                            else {
                                // @ts-ignore
                                peg$currPos = s8;
                                // @ts-ignore
                                s8 = peg$FAILED;
                            }
                            // @ts-ignore
                            if (s8 === peg$FAILED) {
                                // @ts-ignore
                                s8 = null;
                            }
                            // @ts-ignore
                            s9 = peg$parse_();
                            // @ts-ignore
                            s10 = peg$parseIN();
                            // @ts-ignore
                            if (s10 !== peg$FAILED) {
                                // @ts-ignore
                                s11 = peg$parse_();
                                // @ts-ignore
                                s12 = peg$parseExpression();
                                // @ts-ignore
                                if (s12 !== peg$FAILED) {
                                    // @ts-ignore
                                    s13 = peg$parseRPAREN();
                                    // @ts-ignore
                                    if (s13 !== peg$FAILED) {
                                        // @ts-ignore
                                        s14 = peg$parse_();
                                        // @ts-ignore
                                        s15 = peg$parseBlock();
                                        // @ts-ignore
                                        if (s15 !== peg$FAILED) {
                                            // @ts-ignore
                                            peg$savedPos = s0;
                                            // @ts-ignore
                                            s0 = peg$f45(s7, s8, s12, s15);
                                            // @ts-ignore
                                        }
                                        else {
                                            // @ts-ignore
                                            peg$currPos = s0;
                                            // @ts-ignore
                                            s0 = peg$FAILED;
                                        }
                                        // @ts-ignore
                                    }
                                    else {
                                        // @ts-ignore
                                        peg$currPos = s0;
                                        // @ts-ignore
                                        s0 = peg$FAILED;
                                    }
                                    // @ts-ignore
                                }
                                else {
                                    // @ts-ignore
                                    peg$currPos = s0;
                                    // @ts-ignore
                                    s0 = peg$FAILED;
                                }
                                // @ts-ignore
                            }
                            else {
                                // @ts-ignore
                                peg$currPos = s0;
                                // @ts-ignore
                                s0 = peg$FAILED;
                            }
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s0;
                            // @ts-ignore
                            s0 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseBlock() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseLBRACE();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = [];
                // @ts-ignore
                s4 = peg$parseStatement();
                // @ts-ignore
                while (s4 !== peg$FAILED) {
                    // @ts-ignore
                    s3.push(s4);
                    // @ts-ignore
                    s4 = peg$parseStatement();
                }
                // @ts-ignore
                s4 = peg$parse_();
                // @ts-ignore
                s5 = peg$parseRBRACE();
                // @ts-ignore
                if (s5 !== peg$FAILED) {
                    // @ts-ignore
                    peg$savedPos = s0;
                    // @ts-ignore
                    s0 = peg$f46(s3);
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseExpression() {
            // @ts-ignore
            var s0, s1, s2, s3;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parse_();
            // @ts-ignore
            s2 = peg$parseAssignmentExpression();
            // @ts-ignore
            if (s2 !== peg$FAILED) {
                // @ts-ignore
                s3 = peg$parse_();
                // @ts-ignore
                peg$savedPos = s0;
                // @ts-ignore
                s0 = peg$f47(s2);
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseAssignmentExpression() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseConditionalExpression();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = peg$parseAssignmentOperator();
                // @ts-ignore
                if (s3 !== peg$FAILED) {
                    // @ts-ignore
                    s4 = peg$parse_();
                    // @ts-ignore
                    s5 = peg$parseAssignmentExpression();
                    // @ts-ignore
                    if (s5 !== peg$FAILED) {
                        // @ts-ignore
                        peg$savedPos = s0;
                        // @ts-ignore
                        s0 = peg$f48(s1, s3, s5);
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            if (s0 === peg$FAILED) {
                // @ts-ignore
                s0 = peg$parseConditionalExpression();
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseConditionalExpression() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseLogicalOrExpression();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = peg$parseQUESTIONMARK();
                // @ts-ignore
                if (s3 !== peg$FAILED) {
                    // @ts-ignore
                    s4 = peg$parse_();
                    // @ts-ignore
                    s5 = peg$parseExpression();
                    // @ts-ignore
                    if (s5 !== peg$FAILED) {
                        // @ts-ignore
                        s6 = peg$parse_();
                        // @ts-ignore
                        s7 = peg$parseCOLON();
                        // @ts-ignore
                        if (s7 !== peg$FAILED) {
                            // @ts-ignore
                            s8 = peg$parse_();
                            // @ts-ignore
                            s9 = peg$parseConditionalExpression();
                            // @ts-ignore
                            if (s9 !== peg$FAILED) {
                                // @ts-ignore
                                peg$savedPos = s0;
                                // @ts-ignore
                                s0 = peg$f49(s1, s5, s9);
                                // @ts-ignore
                            }
                            else {
                                // @ts-ignore
                                peg$currPos = s0;
                                // @ts-ignore
                                s0 = peg$FAILED;
                            }
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s0;
                            // @ts-ignore
                            s0 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            if (s0 === peg$FAILED) {
                // @ts-ignore
                s0 = peg$parseLogicalOrExpression();
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseLogicalOrExpression() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseLogicalAndExpression();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = [];
                // @ts-ignore
                s3 = peg$currPos;
                // @ts-ignore
                s4 = peg$parse_();
                // @ts-ignore
                s5 = peg$parsePIPE_PIPE();
                // @ts-ignore
                if (s5 !== peg$FAILED) {
                    // @ts-ignore
                    s6 = peg$parse_();
                    // @ts-ignore
                    s7 = peg$parseLogicalAndExpression();
                    // @ts-ignore
                    if (s7 !== peg$FAILED) {
                        // @ts-ignore
                        s4 = [s4, s5, s6, s7];
                        // @ts-ignore
                        s3 = s4;
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s3;
                        // @ts-ignore
                        s3 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s3;
                    // @ts-ignore
                    s3 = peg$FAILED;
                }
                // @ts-ignore
                while (s3 !== peg$FAILED) {
                    // @ts-ignore
                    s2.push(s3);
                    // @ts-ignore
                    s3 = peg$currPos;
                    // @ts-ignore
                    s4 = peg$parse_();
                    // @ts-ignore
                    s5 = peg$parsePIPE_PIPE();
                    // @ts-ignore
                    if (s5 !== peg$FAILED) {
                        // @ts-ignore
                        s6 = peg$parse_();
                        // @ts-ignore
                        s7 = peg$parseLogicalAndExpression();
                        // @ts-ignore
                        if (s7 !== peg$FAILED) {
                            // @ts-ignore
                            s4 = [s4, s5, s6, s7];
                            // @ts-ignore
                            s3 = s4;
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s3;
                            // @ts-ignore
                            s3 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s3;
                        // @ts-ignore
                        s3 = peg$FAILED;
                    }
                }
                // @ts-ignore
                peg$savedPos = s0;
                // @ts-ignore
                s0 = peg$f50(s1, s2);
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseLogicalAndExpression() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseEqualityExpression();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = [];
                // @ts-ignore
                s3 = peg$currPos;
                // @ts-ignore
                s4 = peg$parse_();
                // @ts-ignore
                s5 = peg$parseAMPERSAND_AMPERSAND();
                // @ts-ignore
                if (s5 !== peg$FAILED) {
                    // @ts-ignore
                    s6 = peg$parse_();
                    // @ts-ignore
                    s7 = peg$parseEqualityExpression();
                    // @ts-ignore
                    if (s7 !== peg$FAILED) {
                        // @ts-ignore
                        s4 = [s4, s5, s6, s7];
                        // @ts-ignore
                        s3 = s4;
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s3;
                        // @ts-ignore
                        s3 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s3;
                    // @ts-ignore
                    s3 = peg$FAILED;
                }
                // @ts-ignore
                while (s3 !== peg$FAILED) {
                    // @ts-ignore
                    s2.push(s3);
                    // @ts-ignore
                    s3 = peg$currPos;
                    // @ts-ignore
                    s4 = peg$parse_();
                    // @ts-ignore
                    s5 = peg$parseAMPERSAND_AMPERSAND();
                    // @ts-ignore
                    if (s5 !== peg$FAILED) {
                        // @ts-ignore
                        s6 = peg$parse_();
                        // @ts-ignore
                        s7 = peg$parseEqualityExpression();
                        // @ts-ignore
                        if (s7 !== peg$FAILED) {
                            // @ts-ignore
                            s4 = [s4, s5, s6, s7];
                            // @ts-ignore
                            s3 = s4;
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s3;
                            // @ts-ignore
                            s3 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s3;
                        // @ts-ignore
                        s3 = peg$FAILED;
                    }
                }
                // @ts-ignore
                peg$savedPos = s0;
                // @ts-ignore
                s0 = peg$f51(s1, s2);
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseEqualityExpression() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseRelationalExpression();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = [];
                // @ts-ignore
                s3 = peg$currPos;
                // @ts-ignore
                s4 = peg$parse_();
                // @ts-ignore
                s5 = peg$parseEqualityOperator();
                // @ts-ignore
                if (s5 !== peg$FAILED) {
                    // @ts-ignore
                    s6 = peg$parse_();
                    // @ts-ignore
                    s7 = peg$parseRelationalExpression();
                    // @ts-ignore
                    if (s7 !== peg$FAILED) {
                        // @ts-ignore
                        s4 = [s4, s5, s6, s7];
                        // @ts-ignore
                        s3 = s4;
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s3;
                        // @ts-ignore
                        s3 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s3;
                    // @ts-ignore
                    s3 = peg$FAILED;
                }
                // @ts-ignore
                while (s3 !== peg$FAILED) {
                    // @ts-ignore
                    s2.push(s3);
                    // @ts-ignore
                    s3 = peg$currPos;
                    // @ts-ignore
                    s4 = peg$parse_();
                    // @ts-ignore
                    s5 = peg$parseEqualityOperator();
                    // @ts-ignore
                    if (s5 !== peg$FAILED) {
                        // @ts-ignore
                        s6 = peg$parse_();
                        // @ts-ignore
                        s7 = peg$parseRelationalExpression();
                        // @ts-ignore
                        if (s7 !== peg$FAILED) {
                            // @ts-ignore
                            s4 = [s4, s5, s6, s7];
                            // @ts-ignore
                            s3 = s4;
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s3;
                            // @ts-ignore
                            s3 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s3;
                        // @ts-ignore
                        s3 = peg$FAILED;
                    }
                }
                // @ts-ignore
                peg$savedPos = s0;
                // @ts-ignore
                s0 = peg$f52(s1, s2);
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseRelationalExpression() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseAdditiveExpression();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = [];
                // @ts-ignore
                s3 = peg$currPos;
                // @ts-ignore
                s4 = peg$parse_();
                // @ts-ignore
                s5 = peg$parseRelationalOperator();
                // @ts-ignore
                if (s5 !== peg$FAILED) {
                    // @ts-ignore
                    s6 = peg$parse_();
                    // @ts-ignore
                    s7 = peg$parseAdditiveExpression();
                    // @ts-ignore
                    if (s7 !== peg$FAILED) {
                        // @ts-ignore
                        s4 = [s4, s5, s6, s7];
                        // @ts-ignore
                        s3 = s4;
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s3;
                        // @ts-ignore
                        s3 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s3;
                    // @ts-ignore
                    s3 = peg$FAILED;
                }
                // @ts-ignore
                while (s3 !== peg$FAILED) {
                    // @ts-ignore
                    s2.push(s3);
                    // @ts-ignore
                    s3 = peg$currPos;
                    // @ts-ignore
                    s4 = peg$parse_();
                    // @ts-ignore
                    s5 = peg$parseRelationalOperator();
                    // @ts-ignore
                    if (s5 !== peg$FAILED) {
                        // @ts-ignore
                        s6 = peg$parse_();
                        // @ts-ignore
                        s7 = peg$parseAdditiveExpression();
                        // @ts-ignore
                        if (s7 !== peg$FAILED) {
                            // @ts-ignore
                            s4 = [s4, s5, s6, s7];
                            // @ts-ignore
                            s3 = s4;
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s3;
                            // @ts-ignore
                            s3 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s3;
                        // @ts-ignore
                        s3 = peg$FAILED;
                    }
                }
                // @ts-ignore
                peg$savedPos = s0;
                // @ts-ignore
                s0 = peg$f53(s1, s2);
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseAdditiveExpression() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseMultiplicativeExpression();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = [];
                // @ts-ignore
                s3 = peg$currPos;
                // @ts-ignore
                s4 = peg$parse_();
                // @ts-ignore
                s5 = peg$parseAdditiveOperator();
                // @ts-ignore
                if (s5 !== peg$FAILED) {
                    // @ts-ignore
                    s6 = peg$parse_();
                    // @ts-ignore
                    s7 = peg$parseMultiplicativeExpression();
                    // @ts-ignore
                    if (s7 !== peg$FAILED) {
                        // @ts-ignore
                        s4 = [s4, s5, s6, s7];
                        // @ts-ignore
                        s3 = s4;
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s3;
                        // @ts-ignore
                        s3 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s3;
                    // @ts-ignore
                    s3 = peg$FAILED;
                }
                // @ts-ignore
                while (s3 !== peg$FAILED) {
                    // @ts-ignore
                    s2.push(s3);
                    // @ts-ignore
                    s3 = peg$currPos;
                    // @ts-ignore
                    s4 = peg$parse_();
                    // @ts-ignore
                    s5 = peg$parseAdditiveOperator();
                    // @ts-ignore
                    if (s5 !== peg$FAILED) {
                        // @ts-ignore
                        s6 = peg$parse_();
                        // @ts-ignore
                        s7 = peg$parseMultiplicativeExpression();
                        // @ts-ignore
                        if (s7 !== peg$FAILED) {
                            // @ts-ignore
                            s4 = [s4, s5, s6, s7];
                            // @ts-ignore
                            s3 = s4;
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s3;
                            // @ts-ignore
                            s3 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s3;
                        // @ts-ignore
                        s3 = peg$FAILED;
                    }
                }
                // @ts-ignore
                peg$savedPos = s0;
                // @ts-ignore
                s0 = peg$f54(s1, s2);
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseMultiplicativeExpression() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseUnaryExpression();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = [];
                // @ts-ignore
                s3 = peg$currPos;
                // @ts-ignore
                s4 = peg$parse_();
                // @ts-ignore
                s5 = peg$parseMultiplicativeOperator();
                // @ts-ignore
                if (s5 !== peg$FAILED) {
                    // @ts-ignore
                    s6 = peg$parse_();
                    // @ts-ignore
                    s7 = peg$parseUnaryExpression();
                    // @ts-ignore
                    if (s7 !== peg$FAILED) {
                        // @ts-ignore
                        s4 = [s4, s5, s6, s7];
                        // @ts-ignore
                        s3 = s4;
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s3;
                        // @ts-ignore
                        s3 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s3;
                    // @ts-ignore
                    s3 = peg$FAILED;
                }
                // @ts-ignore
                while (s3 !== peg$FAILED) {
                    // @ts-ignore
                    s2.push(s3);
                    // @ts-ignore
                    s3 = peg$currPos;
                    // @ts-ignore
                    s4 = peg$parse_();
                    // @ts-ignore
                    s5 = peg$parseMultiplicativeOperator();
                    // @ts-ignore
                    if (s5 !== peg$FAILED) {
                        // @ts-ignore
                        s6 = peg$parse_();
                        // @ts-ignore
                        s7 = peg$parseUnaryExpression();
                        // @ts-ignore
                        if (s7 !== peg$FAILED) {
                            // @ts-ignore
                            s4 = [s4, s5, s6, s7];
                            // @ts-ignore
                            s3 = s4;
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s3;
                            // @ts-ignore
                            s3 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s3;
                        // @ts-ignore
                        s3 = peg$FAILED;
                    }
                }
                // @ts-ignore
                peg$savedPos = s0;
                // @ts-ignore
                s0 = peg$f55(s1, s2);
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseUnaryExpression() {
            // @ts-ignore
            var s0, s1, s2, s3, s4;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseUnaryOperator();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = peg$parseUnaryExpression();
                // @ts-ignore
                if (s3 !== peg$FAILED) {
                    // @ts-ignore
                    peg$savedPos = s0;
                    // @ts-ignore
                    s0 = peg$f56(s1, s3);
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            if (s0 === peg$FAILED) {
                // @ts-ignore
                s0 = peg$currPos;
                // @ts-ignore
                s1 = peg$parsePrimaryExpression();
                // @ts-ignore
                if (s1 !== peg$FAILED) {
                    // @ts-ignore
                    s2 = peg$parse_();
                    // @ts-ignore
                    s3 = [];
                    // @ts-ignore
                    s4 = peg$parseMemberAccess();
                    // @ts-ignore
                    while (s4 !== peg$FAILED) {
                        // @ts-ignore
                        s3.push(s4);
                        // @ts-ignore
                        s4 = peg$parseMemberAccess();
                    }
                    // @ts-ignore
                    peg$savedPos = s0;
                    // @ts-ignore
                    s0 = peg$f57(s1, s3);
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseMemberAccess() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseDOT();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = peg$parseIDENTIFIER();
                // @ts-ignore
                if (s3 !== peg$FAILED) {
                    // @ts-ignore
                    s4 = peg$parse_();
                    // @ts-ignore
                    peg$savedPos = s0;
                    // @ts-ignore
                    s0 = peg$f58(s3);
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            if (s0 === peg$FAILED) {
                // @ts-ignore
                s0 = peg$currPos;
                // @ts-ignore
                s1 = peg$parseLBRACKET();
                // @ts-ignore
                if (s1 !== peg$FAILED) {
                    // @ts-ignore
                    s2 = peg$parse_();
                    // @ts-ignore
                    s3 = peg$parseExpression();
                    // @ts-ignore
                    if (s3 !== peg$FAILED) {
                        // @ts-ignore
                        s4 = peg$parse_();
                        // @ts-ignore
                        s5 = peg$parseRBRACKET();
                        // @ts-ignore
                        if (s5 !== peg$FAILED) {
                            // @ts-ignore
                            s6 = peg$parse_();
                            // @ts-ignore
                            peg$savedPos = s0;
                            // @ts-ignore
                            s0 = peg$f59(s3);
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s0;
                            // @ts-ignore
                            s0 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
                if (s0 === peg$FAILED) {
                    // @ts-ignore
                    s0 = peg$currPos;
                    // @ts-ignore
                    s1 = peg$parseLPAREN();
                    // @ts-ignore
                    if (s1 !== peg$FAILED) {
                        // @ts-ignore
                        s2 = peg$parse_();
                        // @ts-ignore
                        s3 = peg$parseArgumentList();
                        // @ts-ignore
                        if (s3 === peg$FAILED) {
                            // @ts-ignore
                            s3 = null;
                        }
                        // @ts-ignore
                        s4 = peg$parse_();
                        // @ts-ignore
                        s5 = peg$parseRPAREN();
                        // @ts-ignore
                        if (s5 !== peg$FAILED) {
                            // @ts-ignore
                            s6 = peg$parse_();
                            // @ts-ignore
                            peg$savedPos = s0;
                            // @ts-ignore
                            s0 = peg$f60(s3);
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s0;
                            // @ts-ignore
                            s0 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parsePrimaryExpression() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseLiteral();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                peg$savedPos = s0;
                // @ts-ignore
                s1 = peg$f61(s1);
            }
            // @ts-ignore
            s0 = s1;
            // @ts-ignore
            if (s0 === peg$FAILED) {
                // @ts-ignore
                s0 = peg$parseObjectLiteral();
                // @ts-ignore
                if (s0 === peg$FAILED) {
                    // @ts-ignore
                    s0 = peg$parseArrayLiteral();
                    // @ts-ignore
                    if (s0 === peg$FAILED) {
                        // @ts-ignore
                        s0 = peg$parseLambdaExpression();
                        // @ts-ignore
                        if (s0 === peg$FAILED) {
                            // @ts-ignore
                            s0 = peg$parseIfExpression();
                            // @ts-ignore
                            if (s0 === peg$FAILED) {
                                // @ts-ignore
                                s0 = peg$parseSwitchExpression();
                                // @ts-ignore
                                if (s0 === peg$FAILED) {
                                    // @ts-ignore
                                    s0 = peg$parseLoopExpression();
                                    // @ts-ignore
                                    if (s0 === peg$FAILED) {
                                        // @ts-ignore
                                        s0 = peg$currPos;
                                        // @ts-ignore
                                        s1 = peg$parseIDENTIFIER();
                                        // @ts-ignore
                                        if (s1 !== peg$FAILED) {
                                            // @ts-ignore
                                            peg$savedPos = s0;
                                            // @ts-ignore
                                            s1 = peg$f62(s1);
                                        }
                                        // @ts-ignore
                                        s0 = s1;
                                        // @ts-ignore
                                        if (s0 === peg$FAILED) {
                                            // @ts-ignore
                                            s0 = peg$currPos;
                                            // @ts-ignore
                                            s1 = peg$parseLPAREN();
                                            // @ts-ignore
                                            if (s1 !== peg$FAILED) {
                                                // @ts-ignore
                                                s2 = peg$parse_();
                                                // @ts-ignore
                                                s3 = peg$parseExpression();
                                                // @ts-ignore
                                                if (s3 !== peg$FAILED) {
                                                    // @ts-ignore
                                                    s4 = peg$parse_();
                                                    // @ts-ignore
                                                    s5 = peg$parseRPAREN();
                                                    // @ts-ignore
                                                    if (s5 !== peg$FAILED) {
                                                        // @ts-ignore
                                                        peg$savedPos = s0;
                                                        // @ts-ignore
                                                        s0 = peg$f63(s3);
                                                        // @ts-ignore
                                                    }
                                                    else {
                                                        // @ts-ignore
                                                        peg$currPos = s0;
                                                        // @ts-ignore
                                                        s0 = peg$FAILED;
                                                    }
                                                    // @ts-ignore
                                                }
                                                else {
                                                    // @ts-ignore
                                                    peg$currPos = s0;
                                                    // @ts-ignore
                                                    s0 = peg$FAILED;
                                                }
                                                // @ts-ignore
                                            }
                                            else {
                                                // @ts-ignore
                                                peg$currPos = s0;
                                                // @ts-ignore
                                                s0 = peg$FAILED;
                                            }
                                            // @ts-ignore
                                            if (s0 === peg$FAILED) {
                                                // @ts-ignore
                                                s0 = peg$currPos;
                                                // @ts-ignore
                                                s1 = peg$parseLBRACE();
                                                // @ts-ignore
                                                if (s1 !== peg$FAILED) {
                                                    // @ts-ignore
                                                    s2 = peg$parse_();
                                                    // @ts-ignore
                                                    s3 = peg$parseBlock();
                                                    // @ts-ignore
                                                    if (s3 !== peg$FAILED) {
                                                        // @ts-ignore
                                                        s4 = peg$parse_();
                                                        // @ts-ignore
                                                        s5 = peg$parseRBRACE();
                                                        // @ts-ignore
                                                        if (s5 !== peg$FAILED) {
                                                            // @ts-ignore
                                                            peg$savedPos = s0;
                                                            // @ts-ignore
                                                            s0 = peg$f64(s3);
                                                            // @ts-ignore
                                                        }
                                                        else {
                                                            // @ts-ignore
                                                            peg$currPos = s0;
                                                            // @ts-ignore
                                                            s0 = peg$FAILED;
                                                        }
                                                        // @ts-ignore
                                                    }
                                                    else {
                                                        // @ts-ignore
                                                        peg$currPos = s0;
                                                        // @ts-ignore
                                                        s0 = peg$FAILED;
                                                    }
                                                    // @ts-ignore
                                                }
                                                else {
                                                    // @ts-ignore
                                                    peg$currPos = s0;
                                                    // @ts-ignore
                                                    s0 = peg$FAILED;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseArrayLiteral() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseLBRACKET();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = peg$currPos;
                // @ts-ignore
                s4 = peg$parseExpression();
                // @ts-ignore
                if (s4 !== peg$FAILED) {
                    // @ts-ignore
                    s5 = [];
                    // @ts-ignore
                    s6 = peg$currPos;
                    // @ts-ignore
                    s7 = peg$parse_();
                    // @ts-ignore
                    s8 = peg$parseCOMMA();
                    // @ts-ignore
                    if (s8 === peg$FAILED) {
                        // @ts-ignore
                        s8 = peg$parseSEMICOLON();
                    }
                    // @ts-ignore
                    if (s8 !== peg$FAILED) {
                        // @ts-ignore
                        s9 = peg$parse_();
                        // @ts-ignore
                        s10 = peg$parseExpression();
                        // @ts-ignore
                        if (s10 !== peg$FAILED) {
                            // @ts-ignore
                            s7 = [s7, s8, s9, s10];
                            // @ts-ignore
                            s6 = s7;
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s6;
                            // @ts-ignore
                            s6 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s6;
                        // @ts-ignore
                        s6 = peg$FAILED;
                    }
                    // @ts-ignore
                    while (s6 !== peg$FAILED) {
                        // @ts-ignore
                        s5.push(s6);
                        // @ts-ignore
                        s6 = peg$currPos;
                        // @ts-ignore
                        s7 = peg$parse_();
                        // @ts-ignore
                        s8 = peg$parseCOMMA();
                        // @ts-ignore
                        if (s8 === peg$FAILED) {
                            // @ts-ignore
                            s8 = peg$parseSEMICOLON();
                        }
                        // @ts-ignore
                        if (s8 !== peg$FAILED) {
                            // @ts-ignore
                            s9 = peg$parse_();
                            // @ts-ignore
                            s10 = peg$parseExpression();
                            // @ts-ignore
                            if (s10 !== peg$FAILED) {
                                // @ts-ignore
                                s7 = [s7, s8, s9, s10];
                                // @ts-ignore
                                s6 = s7;
                                // @ts-ignore
                            }
                            else {
                                // @ts-ignore
                                peg$currPos = s6;
                                // @ts-ignore
                                s6 = peg$FAILED;
                            }
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s6;
                            // @ts-ignore
                            s6 = peg$FAILED;
                        }
                    }
                    // @ts-ignore
                    s6 = peg$parse_();
                    // @ts-ignore
                    s7 = peg$parseCOMMA();
                    // @ts-ignore
                    if (s7 === peg$FAILED) {
                        // @ts-ignore
                        s7 = peg$parseSEMICOLON();
                    }
                    // @ts-ignore
                    if (s7 === peg$FAILED) {
                        // @ts-ignore
                        s7 = null;
                    }
                    // @ts-ignore
                    s4 = [s4, s5, s6, s7];
                    // @ts-ignore
                    s3 = s4;
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s3;
                    // @ts-ignore
                    s3 = peg$FAILED;
                }
                // @ts-ignore
                if (s3 === peg$FAILED) {
                    // @ts-ignore
                    s3 = null;
                }
                // @ts-ignore
                s4 = peg$parse_();
                // @ts-ignore
                s5 = peg$parseRBRACKET();
                // @ts-ignore
                if (s5 !== peg$FAILED) {
                    // @ts-ignore
                    peg$savedPos = s0;
                    // @ts-ignore
                    s0 = peg$f65(s3);
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseObjectLiteral() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseLBRACE();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = peg$currPos;
                // @ts-ignore
                s4 = peg$parseKeyValuePair();
                // @ts-ignore
                if (s4 !== peg$FAILED) {
                    // @ts-ignore
                    s5 = [];
                    // @ts-ignore
                    s6 = peg$currPos;
                    // @ts-ignore
                    s7 = peg$parse_();
                    // @ts-ignore
                    s8 = peg$parseCOMMA();
                    // @ts-ignore
                    if (s8 === peg$FAILED) {
                        // @ts-ignore
                        s8 = peg$parseSEMICOLON();
                    }
                    // @ts-ignore
                    if (s8 === peg$FAILED) {
                        // @ts-ignore
                        s8 = null;
                    }
                    // @ts-ignore
                    s9 = peg$parse_();
                    // @ts-ignore
                    s10 = peg$parseKeyValuePair();
                    // @ts-ignore
                    if (s10 !== peg$FAILED) {
                        // @ts-ignore
                        s7 = [s7, s8, s9, s10];
                        // @ts-ignore
                        s6 = s7;
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s6;
                        // @ts-ignore
                        s6 = peg$FAILED;
                    }
                    // @ts-ignore
                    while (s6 !== peg$FAILED) {
                        // @ts-ignore
                        s5.push(s6);
                        // @ts-ignore
                        s6 = peg$currPos;
                        // @ts-ignore
                        s7 = peg$parse_();
                        // @ts-ignore
                        s8 = peg$parseCOMMA();
                        // @ts-ignore
                        if (s8 === peg$FAILED) {
                            // @ts-ignore
                            s8 = peg$parseSEMICOLON();
                        }
                        // @ts-ignore
                        if (s8 === peg$FAILED) {
                            // @ts-ignore
                            s8 = null;
                        }
                        // @ts-ignore
                        s9 = peg$parse_();
                        // @ts-ignore
                        s10 = peg$parseKeyValuePair();
                        // @ts-ignore
                        if (s10 !== peg$FAILED) {
                            // @ts-ignore
                            s7 = [s7, s8, s9, s10];
                            // @ts-ignore
                            s6 = s7;
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s6;
                            // @ts-ignore
                            s6 = peg$FAILED;
                        }
                    }
                    // @ts-ignore
                    s6 = peg$parse_();
                    // @ts-ignore
                    s7 = peg$parseCOMMA();
                    // @ts-ignore
                    if (s7 === peg$FAILED) {
                        // @ts-ignore
                        s7 = peg$parseSEMICOLON();
                    }
                    // @ts-ignore
                    if (s7 === peg$FAILED) {
                        // @ts-ignore
                        s7 = null;
                    }
                    // @ts-ignore
                    s4 = [s4, s5, s6, s7];
                    // @ts-ignore
                    s3 = s4;
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s3;
                    // @ts-ignore
                    s3 = peg$FAILED;
                }
                // @ts-ignore
                if (s3 === peg$FAILED) {
                    // @ts-ignore
                    s3 = null;
                }
                // @ts-ignore
                s4 = peg$parse_();
                // @ts-ignore
                s5 = peg$parseRBRACE();
                // @ts-ignore
                if (s5 !== peg$FAILED) {
                    // @ts-ignore
                    peg$savedPos = s0;
                    // @ts-ignore
                    s0 = peg$f66(s3);
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseKeyValuePair() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseSTRING();
            // @ts-ignore
            if (s1 === peg$FAILED) {
                // @ts-ignore
                s1 = peg$parseComputedKey();
                // @ts-ignore
                if (s1 === peg$FAILED) {
                    // @ts-ignore
                    s1 = peg$parseIDENTIFIER();
                }
            }
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = peg$parseCOLON();
                // @ts-ignore
                if (s3 !== peg$FAILED) {
                    // @ts-ignore
                    s4 = peg$parse_();
                    // @ts-ignore
                    s5 = peg$parseExpression();
                    // @ts-ignore
                    if (s5 !== peg$FAILED) {
                        // @ts-ignore
                        peg$savedPos = s0;
                        // @ts-ignore
                        s0 = peg$f67(s1, s5);
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseComputedKey() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseLBRACKET();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = peg$parseExpression();
                // @ts-ignore
                if (s3 !== peg$FAILED) {
                    // @ts-ignore
                    s4 = peg$parse_();
                    // @ts-ignore
                    s5 = peg$parseRBRACKET();
                    // @ts-ignore
                    if (s5 !== peg$FAILED) {
                        // @ts-ignore
                        peg$savedPos = s0;
                        // @ts-ignore
                        s0 = peg$f68(s3);
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseLambdaExpression() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseLPAREN();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = peg$parseParameterList();
                // @ts-ignore
                if (s3 === peg$FAILED) {
                    // @ts-ignore
                    s3 = null;
                }
                // @ts-ignore
                s4 = peg$parse_();
                // @ts-ignore
                s5 = peg$currPos;
                // @ts-ignore
                s6 = peg$parseCOMMA();
                // @ts-ignore
                if (s6 !== peg$FAILED) {
                    // @ts-ignore
                    s7 = peg$parse_();
                    // @ts-ignore
                    s8 = peg$parsePARAMS();
                    // @ts-ignore
                    if (s8 !== peg$FAILED) {
                        // @ts-ignore
                        s9 = peg$parse_();
                        // @ts-ignore
                        s10 = peg$parseParameter();
                        // @ts-ignore
                        if (s10 !== peg$FAILED) {
                            // @ts-ignore
                            s11 = peg$parse_();
                            // @ts-ignore
                            s6 = [s6, s7, s8, s9, s10, s11];
                            // @ts-ignore
                            s5 = s6;
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s5;
                            // @ts-ignore
                            s5 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s5;
                        // @ts-ignore
                        s5 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s5;
                    // @ts-ignore
                    s5 = peg$FAILED;
                }
                // @ts-ignore
                if (s5 === peg$FAILED) {
                    // @ts-ignore
                    s5 = null;
                }
                // @ts-ignore
                s6 = peg$parse_();
                // @ts-ignore
                s7 = peg$parseRPAREN();
                // @ts-ignore
                if (s7 !== peg$FAILED) {
                    // @ts-ignore
                    s8 = peg$parse_();
                    // @ts-ignore
                    s9 = peg$parseRIGHT_ARROW();
                    // @ts-ignore
                    if (s9 !== peg$FAILED) {
                        // @ts-ignore
                        s10 = peg$parse_();
                        // @ts-ignore
                        s11 = peg$parseBlock();
                        // @ts-ignore
                        if (s11 !== peg$FAILED) {
                            // @ts-ignore
                            s12 = peg$parse_();
                            // @ts-ignore
                            peg$savedPos = s0;
                            // @ts-ignore
                            s0 = peg$f69(s3, s5, s11);
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s0;
                            // @ts-ignore
                            s0 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            if (s0 === peg$FAILED) {
                // @ts-ignore
                s0 = peg$currPos;
                // @ts-ignore
                s1 = peg$parseLPAREN();
                // @ts-ignore
                if (s1 !== peg$FAILED) {
                    // @ts-ignore
                    s2 = peg$parse_();
                    // @ts-ignore
                    s3 = peg$parsePARAMS();
                    // @ts-ignore
                    if (s3 !== peg$FAILED) {
                        // @ts-ignore
                        s4 = peg$parse_();
                        // @ts-ignore
                        s5 = peg$parseParameter();
                        // @ts-ignore
                        if (s5 !== peg$FAILED) {
                            // @ts-ignore
                            s6 = peg$parse_();
                            // @ts-ignore
                            s7 = peg$parseRPAREN();
                            // @ts-ignore
                            if (s7 !== peg$FAILED) {
                                // @ts-ignore
                                s8 = peg$parse_();
                                // @ts-ignore
                                s9 = peg$parseRIGHT_ARROW();
                                // @ts-ignore
                                if (s9 !== peg$FAILED) {
                                    // @ts-ignore
                                    s10 = peg$parse_();
                                    // @ts-ignore
                                    s11 = peg$parseBlock();
                                    // @ts-ignore
                                    if (s11 !== peg$FAILED) {
                                        // @ts-ignore
                                        s12 = peg$parse_();
                                        // @ts-ignore
                                        peg$savedPos = s0;
                                        // @ts-ignore
                                        s0 = peg$f70(s5, s11);
                                        // @ts-ignore
                                    }
                                    else {
                                        // @ts-ignore
                                        peg$currPos = s0;
                                        // @ts-ignore
                                        s0 = peg$FAILED;
                                    }
                                    // @ts-ignore
                                }
                                else {
                                    // @ts-ignore
                                    peg$currPos = s0;
                                    // @ts-ignore
                                    s0 = peg$FAILED;
                                }
                                // @ts-ignore
                            }
                            else {
                                // @ts-ignore
                                peg$currPos = s0;
                                // @ts-ignore
                                s0 = peg$FAILED;
                            }
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s0;
                            // @ts-ignore
                            s0 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseIfExpression() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseIF();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = peg$parseLPAREN();
                // @ts-ignore
                if (s3 !== peg$FAILED) {
                    // @ts-ignore
                    s4 = peg$parse_();
                    // @ts-ignore
                    s5 = peg$parseExpression();
                    // @ts-ignore
                    if (s5 !== peg$FAILED) {
                        // @ts-ignore
                        s6 = peg$parse_();
                        // @ts-ignore
                        s7 = peg$parseRPAREN();
                        // @ts-ignore
                        if (s7 !== peg$FAILED) {
                            // @ts-ignore
                            s8 = peg$parse_();
                            // @ts-ignore
                            s9 = peg$parseBlock();
                            // @ts-ignore
                            if (s9 !== peg$FAILED) {
                                // @ts-ignore
                                s10 = peg$currPos;
                                // @ts-ignore
                                s11 = peg$parse_();
                                // @ts-ignore
                                s12 = peg$parseELSE();
                                // @ts-ignore
                                if (s12 !== peg$FAILED) {
                                    // @ts-ignore
                                    s13 = peg$parse_();
                                    // @ts-ignore
                                    s14 = peg$parseBlock();
                                    // @ts-ignore
                                    if (s14 === peg$FAILED) {
                                        // @ts-ignore
                                        s14 = peg$parseIfExpression();
                                    }
                                    // @ts-ignore
                                    if (s14 !== peg$FAILED) {
                                        // @ts-ignore
                                        s11 = [s11, s12, s13, s14];
                                        // @ts-ignore
                                        s10 = s11;
                                        // @ts-ignore
                                    }
                                    else {
                                        // @ts-ignore
                                        peg$currPos = s10;
                                        // @ts-ignore
                                        s10 = peg$FAILED;
                                    }
                                    // @ts-ignore
                                }
                                else {
                                    // @ts-ignore
                                    peg$currPos = s10;
                                    // @ts-ignore
                                    s10 = peg$FAILED;
                                }
                                // @ts-ignore
                                if (s10 === peg$FAILED) {
                                    // @ts-ignore
                                    s10 = null;
                                }
                                // @ts-ignore
                                peg$savedPos = s0;
                                // @ts-ignore
                                s0 = peg$f71(s5, s9, s10);
                                // @ts-ignore
                            }
                            else {
                                // @ts-ignore
                                peg$currPos = s0;
                                // @ts-ignore
                                s0 = peg$FAILED;
                            }
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s0;
                            // @ts-ignore
                            s0 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseSwitchExpression() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseSWITCH();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = peg$parseLPAREN();
                // @ts-ignore
                if (s3 !== peg$FAILED) {
                    // @ts-ignore
                    s4 = peg$parse_();
                    // @ts-ignore
                    s5 = peg$parseExpression();
                    // @ts-ignore
                    if (s5 !== peg$FAILED) {
                        // @ts-ignore
                        s6 = peg$parse_();
                        // @ts-ignore
                        s7 = peg$parseRPAREN();
                        // @ts-ignore
                        if (s7 !== peg$FAILED) {
                            // @ts-ignore
                            s8 = peg$parse_();
                            // @ts-ignore
                            s9 = peg$parseLBRACE();
                            // @ts-ignore
                            if (s9 !== peg$FAILED) {
                                // @ts-ignore
                                s10 = peg$parse_();
                                // @ts-ignore
                                s11 = [];
                                // @ts-ignore
                                s12 = peg$parseSwitchCase();
                                // @ts-ignore
                                while (s12 !== peg$FAILED) {
                                    // @ts-ignore
                                    s11.push(s12);
                                    // @ts-ignore
                                    s12 = peg$parseSwitchCase();
                                }
                                // @ts-ignore
                                s12 = peg$parseSwitchDefault();
                                // @ts-ignore
                                if (s12 === peg$FAILED) {
                                    // @ts-ignore
                                    s12 = null;
                                }
                                // @ts-ignore
                                s13 = peg$parse_();
                                // @ts-ignore
                                s14 = peg$parseRBRACE();
                                // @ts-ignore
                                if (s14 !== peg$FAILED) {
                                    // @ts-ignore
                                    peg$savedPos = s0;
                                    // @ts-ignore
                                    s0 = peg$f72(s5, s11, s12);
                                    // @ts-ignore
                                }
                                else {
                                    // @ts-ignore
                                    peg$currPos = s0;
                                    // @ts-ignore
                                    s0 = peg$FAILED;
                                }
                                // @ts-ignore
                            }
                            else {
                                // @ts-ignore
                                peg$currPos = s0;
                                // @ts-ignore
                                s0 = peg$FAILED;
                            }
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s0;
                            // @ts-ignore
                            s0 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseAssignmentOperator() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            s0 = peg$parseEQUALS();
            // @ts-ignore
            if (s0 === peg$FAILED) {
                // @ts-ignore
                s0 = peg$parsePLUS_EQUALS();
                // @ts-ignore
                if (s0 === peg$FAILED) {
                    // @ts-ignore
                    s0 = peg$parseMINUS_EQUALS();
                    // @ts-ignore
                    if (s0 === peg$FAILED) {
                        // @ts-ignore
                        s0 = peg$parseSTAR_EQUALS();
                        // @ts-ignore
                        if (s0 === peg$FAILED) {
                            // @ts-ignore
                            s0 = peg$parseSLASH_EQUALS();
                            // @ts-ignore
                            if (s0 === peg$FAILED) {
                                // @ts-ignore
                                s0 = peg$parsePERCENT_EQUALS();
                            }
                        }
                    }
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseEqualityOperator() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            s0 = peg$parseDOUBLE_EQUALS();
            // @ts-ignore
            if (s0 === peg$FAILED) {
                // @ts-ignore
                s0 = peg$parseBANG_EQUALS();
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseRelationalOperator() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            s0 = peg$parseLESS_THAN_EQUALS();
            // @ts-ignore
            if (s0 === peg$FAILED) {
                // @ts-ignore
                s0 = peg$parseGREATER_THAN_EQUALS();
                // @ts-ignore
                if (s0 === peg$FAILED) {
                    // @ts-ignore
                    s0 = peg$parseLESS_THAN();
                    // @ts-ignore
                    if (s0 === peg$FAILED) {
                        // @ts-ignore
                        s0 = peg$parseGREATER_THAN();
                    }
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseAdditiveOperator() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            s0 = peg$parsePLUS();
            // @ts-ignore
            if (s0 === peg$FAILED) {
                // @ts-ignore
                s0 = peg$parseMINUS();
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseMultiplicativeOperator() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            s0 = peg$parseSTAR();
            // @ts-ignore
            if (s0 === peg$FAILED) {
                // @ts-ignore
                s0 = peg$parseSLASH();
                // @ts-ignore
                if (s0 === peg$FAILED) {
                    // @ts-ignore
                    s0 = peg$parsePERCENT();
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseUnaryOperator() {
            // @ts-ignore
            var s0, s1;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseBANG();
            // @ts-ignore
            if (s1 === peg$FAILED) {
                // @ts-ignore
                s1 = peg$parseTILDE();
                // @ts-ignore
                if (s1 === peg$FAILED) {
                    // @ts-ignore
                    s1 = peg$parsePLUS();
                    // @ts-ignore
                    if (s1 === peg$FAILED) {
                        // @ts-ignore
                        s1 = peg$parseMINUS();
                        // @ts-ignore
                        if (s1 === peg$FAILED) {
                            // @ts-ignore
                            s1 = peg$parseDOLLAR();
                            // @ts-ignore
                            if (s1 === peg$FAILED) {
                                // @ts-ignore
                                s1 = peg$parseNEW();
                            }
                        }
                    }
                }
            }
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                peg$savedPos = s0;
                // @ts-ignore
                s1 = peg$f73();
            }
            // @ts-ignore
            s0 = s1;
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseFunctionDeclaration() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15, s16, s17, s18, s19;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parse_();
            // @ts-ignore
            s2 = [];
            // @ts-ignore
            s3 = peg$parseDecoratorExpression();
            // @ts-ignore
            while (s3 !== peg$FAILED) {
                // @ts-ignore
                s2.push(s3);
                // @ts-ignore
                s3 = peg$parseDecoratorExpression();
            }
            // @ts-ignore
            s3 = peg$parse_();
            // @ts-ignore
            s4 = peg$parseIDENTIFIER();
            // @ts-ignore
            if (s4 !== peg$FAILED) {
                // @ts-ignore
                s5 = peg$parse_();
                // @ts-ignore
                s6 = peg$parseGenericDeclaration();
                // @ts-ignore
                if (s6 === peg$FAILED) {
                    // @ts-ignore
                    s6 = null;
                }
                // @ts-ignore
                s7 = peg$parse_();
                // @ts-ignore
                s8 = peg$parseLPAREN();
                // @ts-ignore
                if (s8 !== peg$FAILED) {
                    // @ts-ignore
                    s9 = peg$parse_();
                    // @ts-ignore
                    s10 = peg$parseParameterList();
                    // @ts-ignore
                    if (s10 === peg$FAILED) {
                        // @ts-ignore
                        s10 = null;
                    }
                    // @ts-ignore
                    s11 = peg$parse_();
                    // @ts-ignore
                    s12 = peg$currPos;
                    // @ts-ignore
                    s13 = peg$parseCOMMA();
                    // @ts-ignore
                    if (s13 !== peg$FAILED) {
                        // @ts-ignore
                        s14 = peg$parse_();
                        // @ts-ignore
                        s15 = peg$parsePARAMS();
                        // @ts-ignore
                        if (s15 !== peg$FAILED) {
                            // @ts-ignore
                            s16 = peg$parse_();
                            // @ts-ignore
                            s17 = peg$parseParameter();
                            // @ts-ignore
                            if (s17 !== peg$FAILED) {
                                // @ts-ignore
                                s18 = peg$parse_();
                                // @ts-ignore
                                s13 = [s13, s14, s15, s16, s17, s18];
                                // @ts-ignore
                                s12 = s13;
                                // @ts-ignore
                            }
                            else {
                                // @ts-ignore
                                peg$currPos = s12;
                                // @ts-ignore
                                s12 = peg$FAILED;
                            }
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s12;
                            // @ts-ignore
                            s12 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s12;
                        // @ts-ignore
                        s12 = peg$FAILED;
                    }
                    // @ts-ignore
                    if (s12 === peg$FAILED) {
                        // @ts-ignore
                        s12 = null;
                    }
                    // @ts-ignore
                    s13 = peg$parse_();
                    // @ts-ignore
                    s14 = peg$parseRPAREN();
                    // @ts-ignore
                    if (s14 !== peg$FAILED) {
                        // @ts-ignore
                        s15 = peg$parse_();
                        // @ts-ignore
                        s16 = peg$currPos;
                        // @ts-ignore
                        s17 = peg$parseCOLON();
                        // @ts-ignore
                        if (s17 !== peg$FAILED) {
                            // @ts-ignore
                            s18 = peg$parse_();
                            // @ts-ignore
                            s19 = peg$parseType();
                            // @ts-ignore
                            if (s19 !== peg$FAILED) {
                                // @ts-ignore
                                s17 = [s17, s18, s19];
                                // @ts-ignore
                                s16 = s17;
                                // @ts-ignore
                            }
                            else {
                                // @ts-ignore
                                peg$currPos = s16;
                                // @ts-ignore
                                s16 = peg$FAILED;
                            }
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s16;
                            // @ts-ignore
                            s16 = peg$FAILED;
                        }
                        // @ts-ignore
                        if (s16 === peg$FAILED) {
                            // @ts-ignore
                            s16 = null;
                        }
                        // @ts-ignore
                        s17 = peg$parse_();
                        // @ts-ignore
                        s18 = peg$parseBlock();
                        // @ts-ignore
                        if (s18 !== peg$FAILED) {
                            // @ts-ignore
                            peg$savedPos = s0;
                            // @ts-ignore
                            s0 = peg$f74(s2, s4, s6, s10, s12, s16, s18);
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s0;
                            // @ts-ignore
                            s0 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            if (s0 === peg$FAILED) {
                // @ts-ignore
                s0 = peg$currPos;
                // @ts-ignore
                s1 = peg$parse_();
                // @ts-ignore
                s2 = [];
                // @ts-ignore
                s3 = peg$parseDecoratorExpression();
                // @ts-ignore
                while (s3 !== peg$FAILED) {
                    // @ts-ignore
                    s2.push(s3);
                    // @ts-ignore
                    s3 = peg$parseDecoratorExpression();
                }
                // @ts-ignore
                s3 = peg$parse_();
                // @ts-ignore
                s4 = peg$parseIDENTIFIER();
                // @ts-ignore
                if (s4 !== peg$FAILED) {
                    // @ts-ignore
                    s5 = peg$parse_();
                    // @ts-ignore
                    s6 = peg$parseGenericDeclaration();
                    // @ts-ignore
                    if (s6 === peg$FAILED) {
                        // @ts-ignore
                        s6 = null;
                    }
                    // @ts-ignore
                    s7 = peg$parse_();
                    // @ts-ignore
                    s8 = peg$parseLPAREN();
                    // @ts-ignore
                    if (s8 !== peg$FAILED) {
                        // @ts-ignore
                        s9 = peg$parse_();
                        // @ts-ignore
                        s10 = peg$parsePARAMS();
                        // @ts-ignore
                        if (s10 !== peg$FAILED) {
                            // @ts-ignore
                            s11 = peg$parse_();
                            // @ts-ignore
                            s12 = peg$parseParameter();
                            // @ts-ignore
                            if (s12 !== peg$FAILED) {
                                // @ts-ignore
                                s13 = peg$parse_();
                                // @ts-ignore
                                s14 = peg$parseRPAREN();
                                // @ts-ignore
                                if (s14 !== peg$FAILED) {
                                    // @ts-ignore
                                    s15 = peg$parse_();
                                    // @ts-ignore
                                    s16 = peg$currPos;
                                    // @ts-ignore
                                    s17 = peg$parseCOLON();
                                    // @ts-ignore
                                    if (s17 !== peg$FAILED) {
                                        // @ts-ignore
                                        s18 = peg$parse_();
                                        // @ts-ignore
                                        s19 = peg$parseType();
                                        // @ts-ignore
                                        if (s19 !== peg$FAILED) {
                                            // @ts-ignore
                                            s17 = [s17, s18, s19];
                                            // @ts-ignore
                                            s16 = s17;
                                            // @ts-ignore
                                        }
                                        else {
                                            // @ts-ignore
                                            peg$currPos = s16;
                                            // @ts-ignore
                                            s16 = peg$FAILED;
                                        }
                                        // @ts-ignore
                                    }
                                    else {
                                        // @ts-ignore
                                        peg$currPos = s16;
                                        // @ts-ignore
                                        s16 = peg$FAILED;
                                    }
                                    // @ts-ignore
                                    if (s16 === peg$FAILED) {
                                        // @ts-ignore
                                        s16 = null;
                                    }
                                    // @ts-ignore
                                    s17 = peg$parse_();
                                    // @ts-ignore
                                    s18 = peg$parseBlock();
                                    // @ts-ignore
                                    if (s18 !== peg$FAILED) {
                                        // @ts-ignore
                                        peg$savedPos = s0;
                                        // @ts-ignore
                                        s0 = peg$f75(s2, s4, s6, s12, s16, s18);
                                        // @ts-ignore
                                    }
                                    else {
                                        // @ts-ignore
                                        peg$currPos = s0;
                                        // @ts-ignore
                                        s0 = peg$FAILED;
                                    }
                                    // @ts-ignore
                                }
                                else {
                                    // @ts-ignore
                                    peg$currPos = s0;
                                    // @ts-ignore
                                    s0 = peg$FAILED;
                                }
                                // @ts-ignore
                            }
                            else {
                                // @ts-ignore
                                peg$currPos = s0;
                                // @ts-ignore
                                s0 = peg$FAILED;
                            }
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s0;
                            // @ts-ignore
                            s0 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseAccessModifier() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            s0 = peg$parsePUB();
            // @ts-ignore
            if (s0 === peg$FAILED) {
                // @ts-ignore
                s0 = peg$parsePRI();
                // @ts-ignore
                if (s0 === peg$FAILED) {
                    // @ts-ignore
                    s0 = peg$parsePRO();
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseType() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseGenericType();
            // @ts-ignore
            if (s1 === peg$FAILED) {
                // @ts-ignore
                s1 = peg$parseTupleType();
                // @ts-ignore
                if (s1 === peg$FAILED) {
                    // @ts-ignore
                    s1 = peg$parseIDENTIFIER();
                }
            }
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = [];
                // @ts-ignore
                s4 = peg$currPos;
                // @ts-ignore
                s5 = peg$parseLBRACKET();
                // @ts-ignore
                if (s5 !== peg$FAILED) {
                    // @ts-ignore
                    s6 = peg$parseRBRACKET();
                    // @ts-ignore
                    if (s6 !== peg$FAILED) {
                        // @ts-ignore
                        s5 = [s5, s6];
                        // @ts-ignore
                        s4 = s5;
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s4;
                        // @ts-ignore
                        s4 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s4;
                    // @ts-ignore
                    s4 = peg$FAILED;
                }
                // @ts-ignore
                while (s4 !== peg$FAILED) {
                    // @ts-ignore
                    s3.push(s4);
                    // @ts-ignore
                    s4 = peg$currPos;
                    // @ts-ignore
                    s5 = peg$parseLBRACKET();
                    // @ts-ignore
                    if (s5 !== peg$FAILED) {
                        // @ts-ignore
                        s6 = peg$parseRBRACKET();
                        // @ts-ignore
                        if (s6 !== peg$FAILED) {
                            // @ts-ignore
                            s5 = [s5, s6];
                            // @ts-ignore
                            s4 = s5;
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s4;
                            // @ts-ignore
                            s4 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s4;
                        // @ts-ignore
                        s4 = peg$FAILED;
                    }
                }
                // @ts-ignore
                peg$savedPos = s0;
                // @ts-ignore
                s0 = peg$f76(s1, s3);
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseGenericType() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7, s8;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseIDENTIFIER();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = peg$parseLESS_THAN();
                // @ts-ignore
                if (s3 !== peg$FAILED) {
                    // @ts-ignore
                    s4 = peg$parse_();
                    // @ts-ignore
                    s5 = peg$parseTypeList();
                    // @ts-ignore
                    if (s5 !== peg$FAILED) {
                        // @ts-ignore
                        s6 = peg$parse_();
                        // @ts-ignore
                        s7 = peg$parseGREATER_THAN();
                        // @ts-ignore
                        if (s7 !== peg$FAILED) {
                            // @ts-ignore
                            s8 = peg$parse_();
                            // @ts-ignore
                            peg$savedPos = s0;
                            // @ts-ignore
                            s0 = peg$f77(s1, s5);
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s0;
                            // @ts-ignore
                            s0 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseTupleType() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseLBRACKET();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = peg$parseTypeList();
                // @ts-ignore
                if (s3 !== peg$FAILED) {
                    // @ts-ignore
                    s4 = peg$parse_();
                    // @ts-ignore
                    s5 = peg$parseRBRACKET();
                    // @ts-ignore
                    if (s5 !== peg$FAILED) {
                        // @ts-ignore
                        s6 = peg$parse_();
                        // @ts-ignore
                        peg$savedPos = s0;
                        // @ts-ignore
                        s0 = peg$f78(s3);
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseParameter() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7, s8;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseIDENTIFIER();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = peg$currPos;
                // @ts-ignore
                s4 = peg$parseCOLON();
                // @ts-ignore
                if (s4 !== peg$FAILED) {
                    // @ts-ignore
                    s5 = peg$parse_();
                    // @ts-ignore
                    s6 = peg$parseType();
                    // @ts-ignore
                    if (s6 !== peg$FAILED) {
                        // @ts-ignore
                        s4 = [s4, s5, s6];
                        // @ts-ignore
                        s3 = s4;
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s3;
                        // @ts-ignore
                        s3 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s3;
                    // @ts-ignore
                    s3 = peg$FAILED;
                }
                // @ts-ignore
                if (s3 === peg$FAILED) {
                    // @ts-ignore
                    s3 = null;
                }
                // @ts-ignore
                s4 = peg$parse_();
                // @ts-ignore
                s5 = peg$currPos;
                // @ts-ignore
                s6 = peg$parseEQUALS();
                // @ts-ignore
                if (s6 !== peg$FAILED) {
                    // @ts-ignore
                    s7 = peg$parse_();
                    // @ts-ignore
                    s8 = peg$parseExpression();
                    // @ts-ignore
                    if (s8 !== peg$FAILED) {
                        // @ts-ignore
                        s6 = [s6, s7, s8];
                        // @ts-ignore
                        s5 = s6;
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s5;
                        // @ts-ignore
                        s5 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s5;
                    // @ts-ignore
                    s5 = peg$FAILED;
                }
                // @ts-ignore
                if (s5 === peg$FAILED) {
                    // @ts-ignore
                    s5 = null;
                }
                // @ts-ignore
                peg$savedPos = s0;
                // @ts-ignore
                s0 = peg$f79(s1, s3, s5);
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseParameterList() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7, s8;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseParameter();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = [];
                // @ts-ignore
                s4 = peg$currPos;
                // @ts-ignore
                s5 = peg$parseCOMMA();
                // @ts-ignore
                if (s5 !== peg$FAILED) {
                    // @ts-ignore
                    s6 = peg$parse_();
                    // @ts-ignore
                    s7 = peg$parseParameter();
                    // @ts-ignore
                    if (s7 !== peg$FAILED) {
                        // @ts-ignore
                        s8 = peg$parse_();
                        // @ts-ignore
                        s5 = [s5, s6, s7, s8];
                        // @ts-ignore
                        s4 = s5;
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s4;
                        // @ts-ignore
                        s4 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s4;
                    // @ts-ignore
                    s4 = peg$FAILED;
                }
                // @ts-ignore
                while (s4 !== peg$FAILED) {
                    // @ts-ignore
                    s3.push(s4);
                    // @ts-ignore
                    s4 = peg$currPos;
                    // @ts-ignore
                    s5 = peg$parseCOMMA();
                    // @ts-ignore
                    if (s5 !== peg$FAILED) {
                        // @ts-ignore
                        s6 = peg$parse_();
                        // @ts-ignore
                        s7 = peg$parseParameter();
                        // @ts-ignore
                        if (s7 !== peg$FAILED) {
                            // @ts-ignore
                            s8 = peg$parse_();
                            // @ts-ignore
                            s5 = [s5, s6, s7, s8];
                            // @ts-ignore
                            s4 = s5;
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s4;
                            // @ts-ignore
                            s4 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s4;
                        // @ts-ignore
                        s4 = peg$FAILED;
                    }
                }
                // @ts-ignore
                peg$savedPos = s0;
                // @ts-ignore
                s0 = peg$f80(s1, s3);
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseArgumentList() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7, s8;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseExpression();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = [];
                // @ts-ignore
                s4 = peg$currPos;
                // @ts-ignore
                s5 = peg$parseCOMMA();
                // @ts-ignore
                if (s5 !== peg$FAILED) {
                    // @ts-ignore
                    s6 = peg$parse_();
                    // @ts-ignore
                    s7 = peg$parseExpression();
                    // @ts-ignore
                    if (s7 !== peg$FAILED) {
                        // @ts-ignore
                        s8 = peg$parse_();
                        // @ts-ignore
                        s5 = [s5, s6, s7, s8];
                        // @ts-ignore
                        s4 = s5;
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s4;
                        // @ts-ignore
                        s4 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s4;
                    // @ts-ignore
                    s4 = peg$FAILED;
                }
                // @ts-ignore
                while (s4 !== peg$FAILED) {
                    // @ts-ignore
                    s3.push(s4);
                    // @ts-ignore
                    s4 = peg$currPos;
                    // @ts-ignore
                    s5 = peg$parseCOMMA();
                    // @ts-ignore
                    if (s5 !== peg$FAILED) {
                        // @ts-ignore
                        s6 = peg$parse_();
                        // @ts-ignore
                        s7 = peg$parseExpression();
                        // @ts-ignore
                        if (s7 !== peg$FAILED) {
                            // @ts-ignore
                            s8 = peg$parse_();
                            // @ts-ignore
                            s5 = [s5, s6, s7, s8];
                            // @ts-ignore
                            s4 = s5;
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s4;
                            // @ts-ignore
                            s4 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s4;
                        // @ts-ignore
                        s4 = peg$FAILED;
                    }
                }
                // @ts-ignore
                peg$savedPos = s0;
                // @ts-ignore
                s0 = peg$f81(s1, s3);
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseTypeList() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7, s8;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseType();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = [];
                // @ts-ignore
                s4 = peg$currPos;
                // @ts-ignore
                s5 = peg$parseCOMMA();
                // @ts-ignore
                if (s5 !== peg$FAILED) {
                    // @ts-ignore
                    s6 = peg$parse_();
                    // @ts-ignore
                    s7 = peg$parseType();
                    // @ts-ignore
                    if (s7 !== peg$FAILED) {
                        // @ts-ignore
                        s8 = peg$parse_();
                        // @ts-ignore
                        s5 = [s5, s6, s7, s8];
                        // @ts-ignore
                        s4 = s5;
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s4;
                        // @ts-ignore
                        s4 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s4;
                    // @ts-ignore
                    s4 = peg$FAILED;
                }
                // @ts-ignore
                while (s4 !== peg$FAILED) {
                    // @ts-ignore
                    s3.push(s4);
                    // @ts-ignore
                    s4 = peg$currPos;
                    // @ts-ignore
                    s5 = peg$parseCOMMA();
                    // @ts-ignore
                    if (s5 !== peg$FAILED) {
                        // @ts-ignore
                        s6 = peg$parse_();
                        // @ts-ignore
                        s7 = peg$parseType();
                        // @ts-ignore
                        if (s7 !== peg$FAILED) {
                            // @ts-ignore
                            s8 = peg$parse_();
                            // @ts-ignore
                            s5 = [s5, s6, s7, s8];
                            // @ts-ignore
                            s4 = s5;
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s4;
                            // @ts-ignore
                            s4 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s4;
                        // @ts-ignore
                        s4 = peg$FAILED;
                    }
                }
                // @ts-ignore
                peg$savedPos = s0;
                // @ts-ignore
                s0 = peg$f82(s1, s3);
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseMetaIdentifier() {
            // @ts-ignore
            var s0, s1, s2, s3, s4;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseAT();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = peg$parseIDENTIFIER();
                // @ts-ignore
                if (s3 !== peg$FAILED) {
                    // @ts-ignore
                    s4 = peg$parse_();
                    // @ts-ignore
                    peg$savedPos = s0;
                    // @ts-ignore
                    s0 = peg$f83(s3);
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseDecoratorExpression() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseSHARP();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = peg$parseExpression();
                // @ts-ignore
                if (s3 !== peg$FAILED) {
                    // @ts-ignore
                    s4 = peg$parse_();
                    // @ts-ignore
                    s5 = peg$parseSHARP();
                    // @ts-ignore
                    if (s5 !== peg$FAILED) {
                        // @ts-ignore
                        s6 = peg$parse_();
                        // @ts-ignore
                        peg$savedPos = s0;
                        // @ts-ignore
                        s0 = peg$f84(s3);
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseDestructuringPattern() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseLBRACE();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = peg$parseIdentifierList();
                // @ts-ignore
                if (s3 !== peg$FAILED) {
                    // @ts-ignore
                    s4 = peg$parse_();
                    // @ts-ignore
                    s5 = peg$parseRBRACE();
                    // @ts-ignore
                    if (s5 !== peg$FAILED) {
                        // @ts-ignore
                        s6 = peg$parse_();
                        // @ts-ignore
                        peg$savedPos = s0;
                        // @ts-ignore
                        s0 = peg$f85(s3);
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseDestructuringArrayPattern() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseLBRACKET();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = peg$parseIdentifierList();
                // @ts-ignore
                if (s3 !== peg$FAILED) {
                    // @ts-ignore
                    s4 = peg$parse_();
                    // @ts-ignore
                    s5 = peg$parseLBRACKET();
                    // @ts-ignore
                    if (s5 !== peg$FAILED) {
                        // @ts-ignore
                        s6 = peg$parse_();
                        // @ts-ignore
                        peg$savedPos = s0;
                        // @ts-ignore
                        s0 = peg$f86(s3);
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseIdentifierList() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7, s8;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseIDENTIFIER();
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = peg$parse_();
                // @ts-ignore
                s3 = [];
                // @ts-ignore
                s4 = peg$currPos;
                // @ts-ignore
                s5 = peg$parseCOMMA();
                // @ts-ignore
                if (s5 !== peg$FAILED) {
                    // @ts-ignore
                    s6 = peg$parse_();
                    // @ts-ignore
                    s7 = peg$parseIDENTIFIER();
                    // @ts-ignore
                    if (s7 !== peg$FAILED) {
                        // @ts-ignore
                        s8 = peg$parse_();
                        // @ts-ignore
                        s5 = [s5, s6, s7, s8];
                        // @ts-ignore
                        s4 = s5;
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s4;
                        // @ts-ignore
                        s4 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s4;
                    // @ts-ignore
                    s4 = peg$FAILED;
                }
                // @ts-ignore
                while (s4 !== peg$FAILED) {
                    // @ts-ignore
                    s3.push(s4);
                    // @ts-ignore
                    s4 = peg$currPos;
                    // @ts-ignore
                    s5 = peg$parseCOMMA();
                    // @ts-ignore
                    if (s5 !== peg$FAILED) {
                        // @ts-ignore
                        s6 = peg$parse_();
                        // @ts-ignore
                        s7 = peg$parseIDENTIFIER();
                        // @ts-ignore
                        if (s7 !== peg$FAILED) {
                            // @ts-ignore
                            s8 = peg$parse_();
                            // @ts-ignore
                            s5 = [s5, s6, s7, s8];
                            // @ts-ignore
                            s4 = s5;
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s4;
                            // @ts-ignore
                            s4 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s4;
                        // @ts-ignore
                        s4 = peg$FAILED;
                    }
                }
                // @ts-ignore
                peg$savedPos = s0;
                // @ts-ignore
                s0 = peg$f87(s1, s3);
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseIDENTIFIER() {
            // @ts-ignore
            var s0, s1, s2, s3;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            if (peg$r0.test(input.charAt(peg$currPos))) {
                // @ts-ignore
                s1 = input.charAt(peg$currPos);
                // @ts-ignore
                peg$currPos++;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s1 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e0);
                }
            }
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = [];
                // @ts-ignore
                if (peg$r1.test(input.charAt(peg$currPos))) {
                    // @ts-ignore
                    s3 = input.charAt(peg$currPos);
                    // @ts-ignore
                    peg$currPos++;
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    s3 = peg$FAILED;
                    // @ts-ignore
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e1);
                    }
                }
                // @ts-ignore
                while (s3 !== peg$FAILED) {
                    // @ts-ignore
                    s2.push(s3);
                    // @ts-ignore
                    if (peg$r1.test(input.charAt(peg$currPos))) {
                        // @ts-ignore
                        s3 = input.charAt(peg$currPos);
                        // @ts-ignore
                        peg$currPos++;
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        s3 = peg$FAILED;
                        // @ts-ignore
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e1);
                        }
                    }
                }
                // @ts-ignore
                peg$savedPos = s0;
                // @ts-ignore
                s0 = peg$f88();
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseMODULE() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 6) === peg$c0) {
                // @ts-ignore
                s0 = peg$c0;
                // @ts-ignore
                peg$currPos += 6;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e2);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseSTRUCT() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 6) === peg$c1) {
                // @ts-ignore
                s0 = peg$c1;
                // @ts-ignore
                peg$currPos += 6;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e3);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseCLASS() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 5) === peg$c2) {
                // @ts-ignore
                s0 = peg$c2;
                // @ts-ignore
                peg$currPos += 5;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e4);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseINTERFACE() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 9) === peg$c3) {
                // @ts-ignore
                s0 = peg$c3;
                // @ts-ignore
                peg$currPos += 9;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e5);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseENUM() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 4) === peg$c4) {
                // @ts-ignore
                s0 = peg$c4;
                // @ts-ignore
                peg$currPos += 4;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e6);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseVAR() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 3) === peg$c5) {
                // @ts-ignore
                s0 = peg$c5;
                // @ts-ignore
                peg$currPos += 3;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e7);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parsePUB() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 3) === peg$c6) {
                // @ts-ignore
                s0 = peg$c6;
                // @ts-ignore
                peg$currPos += 3;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e8);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parsePRI() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 3) === peg$c7) {
                // @ts-ignore
                s0 = peg$c7;
                // @ts-ignore
                peg$currPos += 3;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e9);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parsePRO() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 3) === peg$c8) {
                // @ts-ignore
                s0 = peg$c8;
                // @ts-ignore
                peg$currPos += 3;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e10);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseIF() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 2) === peg$c9) {
                // @ts-ignore
                s0 = peg$c9;
                // @ts-ignore
                peg$currPos += 2;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e11);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseELSE() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 4) === peg$c10) {
                // @ts-ignore
                s0 = peg$c10;
                // @ts-ignore
                peg$currPos += 4;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e12);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseSWITCH() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 6) === peg$c11) {
                // @ts-ignore
                s0 = peg$c11;
                // @ts-ignore
                peg$currPos += 6;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e13);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseWHILE() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 5) === peg$c12) {
                // @ts-ignore
                s0 = peg$c12;
                // @ts-ignore
                peg$currPos += 5;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e14);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseFOR() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 3) === peg$c13) {
                // @ts-ignore
                s0 = peg$c13;
                // @ts-ignore
                peg$currPos += 3;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e15);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseBREAK() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 5) === peg$c14) {
                // @ts-ignore
                s0 = peg$c14;
                // @ts-ignore
                peg$currPos += 5;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e16);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseCONTINUE() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 8) === peg$c15) {
                // @ts-ignore
                s0 = peg$c15;
                // @ts-ignore
                peg$currPos += 8;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e17);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseRETURN() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 6) === peg$c16) {
                // @ts-ignore
                s0 = peg$c16;
                // @ts-ignore
                peg$currPos += 6;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e18);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseSUPER() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 5) === peg$c17) {
                // @ts-ignore
                s0 = peg$c17;
                // @ts-ignore
                peg$currPos += 5;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e19);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseNEW() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 3) === peg$c18) {
                // @ts-ignore
                s0 = peg$c18;
                // @ts-ignore
                peg$currPos += 3;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e20);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseSET() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 3) === peg$c19) {
                // @ts-ignore
                s0 = peg$c19;
                // @ts-ignore
                peg$currPos += 3;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e21);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseGET() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 3) === peg$c20) {
                // @ts-ignore
                s0 = peg$c20;
                // @ts-ignore
                peg$currPos += 3;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e22);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseSTATIC() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 6) === peg$c21) {
                // @ts-ignore
                s0 = peg$c21;
                // @ts-ignore
                peg$currPos += 6;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e23);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseIN() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 2) === peg$c22) {
                // @ts-ignore
                s0 = peg$c22;
                // @ts-ignore
                peg$currPos += 2;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e24);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseOUT() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 3) === peg$c23) {
                // @ts-ignore
                s0 = peg$c23;
                // @ts-ignore
                peg$currPos += 3;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e25);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parsePARAMS() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 3) === peg$c24) {
                // @ts-ignore
                s0 = peg$c24;
                // @ts-ignore
                peg$currPos += 3;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e26);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseQUESTIONMARK() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 63) {
                // @ts-ignore
                s0 = peg$c25;
                // @ts-ignore
                peg$currPos++;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e27);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseCOLON() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 58) {
                // @ts-ignore
                s0 = peg$c26;
                // @ts-ignore
                peg$currPos++;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e28);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseSEMICOLON() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 59) {
                // @ts-ignore
                s0 = peg$c27;
                // @ts-ignore
                peg$currPos++;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e29);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseCOMMA() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 44) {
                // @ts-ignore
                s0 = peg$c28;
                // @ts-ignore
                peg$currPos++;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e30);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseDOT() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 46) {
                // @ts-ignore
                s0 = peg$c29;
                // @ts-ignore
                peg$currPos++;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e31);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseTILDE() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 126) {
                // @ts-ignore
                s0 = peg$c30;
                // @ts-ignore
                peg$currPos++;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e32);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseAT() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 64) {
                // @ts-ignore
                s0 = peg$c31;
                // @ts-ignore
                peg$currPos++;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e33);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseSHARP() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 35) {
                // @ts-ignore
                s0 = peg$c32;
                // @ts-ignore
                peg$currPos++;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e34);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseDOLLAR() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 36) {
                // @ts-ignore
                s0 = peg$c33;
                // @ts-ignore
                peg$currPos++;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e35);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseLPAREN() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 40) {
                // @ts-ignore
                s0 = peg$c34;
                // @ts-ignore
                peg$currPos++;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e36);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseRPAREN() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 41) {
                // @ts-ignore
                s0 = peg$c35;
                // @ts-ignore
                peg$currPos++;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e37);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseLBRACE() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 123) {
                // @ts-ignore
                s0 = peg$c36;
                // @ts-ignore
                peg$currPos++;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e38);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseRBRACE() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 125) {
                // @ts-ignore
                s0 = peg$c37;
                // @ts-ignore
                peg$currPos++;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e39);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseLBRACKET() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 91) {
                // @ts-ignore
                s0 = peg$c38;
                // @ts-ignore
                peg$currPos++;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e40);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseRBRACKET() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 93) {
                // @ts-ignore
                s0 = peg$c39;
                // @ts-ignore
                peg$currPos++;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e41);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseEQUALS() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 61) {
                // @ts-ignore
                s0 = peg$c40;
                // @ts-ignore
                peg$currPos++;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e42);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parsePLUS_EQUALS() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 2) === peg$c41) {
                // @ts-ignore
                s0 = peg$c41;
                // @ts-ignore
                peg$currPos += 2;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e43);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseMINUS_EQUALS() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 2) === peg$c42) {
                // @ts-ignore
                s0 = peg$c42;
                // @ts-ignore
                peg$currPos += 2;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e44);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseSTAR_EQUALS() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 2) === peg$c43) {
                // @ts-ignore
                s0 = peg$c43;
                // @ts-ignore
                peg$currPos += 2;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e45);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseSLASH_EQUALS() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 2) === peg$c44) {
                // @ts-ignore
                s0 = peg$c44;
                // @ts-ignore
                peg$currPos += 2;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e46);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parsePERCENT_EQUALS() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 2) === peg$c45) {
                // @ts-ignore
                s0 = peg$c45;
                // @ts-ignore
                peg$currPos += 2;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e47);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseDOUBLE_EQUALS() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 2) === peg$c46) {
                // @ts-ignore
                s0 = peg$c46;
                // @ts-ignore
                peg$currPos += 2;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e48);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseBANG_EQUALS() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 2) === peg$c47) {
                // @ts-ignore
                s0 = peg$c47;
                // @ts-ignore
                peg$currPos += 2;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e49);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseBANG() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 33) {
                // @ts-ignore
                s0 = peg$c48;
                // @ts-ignore
                peg$currPos++;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e50);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseLESS_THAN() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 60) {
                // @ts-ignore
                s0 = peg$c49;
                // @ts-ignore
                peg$currPos++;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e51);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseLESS_THAN_EQUALS() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 2) === peg$c50) {
                // @ts-ignore
                s0 = peg$c50;
                // @ts-ignore
                peg$currPos += 2;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e52);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseGREATER_THAN() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 62) {
                // @ts-ignore
                s0 = peg$c51;
                // @ts-ignore
                peg$currPos++;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e53);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseGREATER_THAN_EQUALS() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 2) === peg$c52) {
                // @ts-ignore
                s0 = peg$c52;
                // @ts-ignore
                peg$currPos += 2;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e54);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parsePLUS() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 43) {
                // @ts-ignore
                s0 = peg$c53;
                // @ts-ignore
                peg$currPos++;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e55);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseMINUS() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 45) {
                // @ts-ignore
                s0 = peg$c54;
                // @ts-ignore
                peg$currPos++;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e56);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseSTAR() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 42) {
                // @ts-ignore
                s0 = peg$c55;
                // @ts-ignore
                peg$currPos++;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e57);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseSLASH() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 47) {
                // @ts-ignore
                s0 = peg$c56;
                // @ts-ignore
                peg$currPos++;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e58);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parsePERCENT() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 37) {
                // @ts-ignore
                s0 = peg$c57;
                // @ts-ignore
                peg$currPos++;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e59);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseAMPERSAND_AMPERSAND() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 2) === peg$c58) {
                // @ts-ignore
                s0 = peg$c58;
                // @ts-ignore
                peg$currPos += 2;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e60);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parsePIPE_PIPE() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 2) === peg$c59) {
                // @ts-ignore
                s0 = peg$c59;
                // @ts-ignore
                peg$currPos += 2;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e61);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseRIGHT_ARROW() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 2) === peg$c60) {
                // @ts-ignore
                s0 = peg$c60;
                // @ts-ignore
                peg$currPos += 2;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e62);
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseLiteral() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            s0 = peg$parseBOOLEAN();
            // @ts-ignore
            if (s0 === peg$FAILED) {
                // @ts-ignore
                s0 = peg$parseFLOAT();
                // @ts-ignore
                if (s0 === peg$FAILED) {
                    // @ts-ignore
                    s0 = peg$parseHEXADECIMAL();
                    // @ts-ignore
                    if (s0 === peg$FAILED) {
                        // @ts-ignore
                        s0 = peg$parseOCTAL();
                        // @ts-ignore
                        if (s0 === peg$FAILED) {
                            // @ts-ignore
                            s0 = peg$parseDECIMAL();
                            // @ts-ignore
                            if (s0 === peg$FAILED) {
                                // @ts-ignore
                                s0 = peg$parseSTRING();
                                // @ts-ignore
                                if (s0 === peg$FAILED) {
                                    // @ts-ignore
                                    s0 = peg$parseCHAR();
                                    // @ts-ignore
                                    if (s0 === peg$FAILED) {
                                        // @ts-ignore
                                        s0 = peg$parseVALUENULL();
                                    }
                                }
                            }
                        }
                    }
                }
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseBOOLEAN() {
            // @ts-ignore
            var s0, s1;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            if (input.substr(peg$currPos, 4) === peg$c61) {
                // @ts-ignore
                s1 = peg$c61;
                // @ts-ignore
                peg$currPos += 4;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s1 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e63);
                }
            }
            // @ts-ignore
            if (s1 === peg$FAILED) {
                // @ts-ignore
                if (input.substr(peg$currPos, 5) === peg$c62) {
                    // @ts-ignore
                    s1 = peg$c62;
                    // @ts-ignore
                    peg$currPos += 5;
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    s1 = peg$FAILED;
                    // @ts-ignore
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e64);
                    }
                }
            }
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                peg$savedPos = s0;
                // @ts-ignore
                s1 = peg$f89();
            }
            // @ts-ignore
            s0 = s1;
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseDECIMAL() {
            // @ts-ignore
            var s0, s1, s2, s3;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            if (peg$r2.test(input.charAt(peg$currPos))) {
                // @ts-ignore
                s1 = input.charAt(peg$currPos);
                // @ts-ignore
                peg$currPos++;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s1 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e65);
                }
            }
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = [];
                // @ts-ignore
                if (peg$r3.test(input.charAt(peg$currPos))) {
                    // @ts-ignore
                    s3 = input.charAt(peg$currPos);
                    // @ts-ignore
                    peg$currPos++;
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    s3 = peg$FAILED;
                    // @ts-ignore
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e66);
                    }
                }
                // @ts-ignore
                while (s3 !== peg$FAILED) {
                    // @ts-ignore
                    s2.push(s3);
                    // @ts-ignore
                    if (peg$r3.test(input.charAt(peg$currPos))) {
                        // @ts-ignore
                        s3 = input.charAt(peg$currPos);
                        // @ts-ignore
                        peg$currPos++;
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        s3 = peg$FAILED;
                        // @ts-ignore
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e66);
                        }
                    }
                }
                // @ts-ignore
                peg$savedPos = s0;
                // @ts-ignore
                s0 = peg$f90();
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseHEXADECIMAL() {
            // @ts-ignore
            var s0, s1, s2, s3;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            if (input.substr(peg$currPos, 2) === peg$c63) {
                // @ts-ignore
                s1 = peg$c63;
                // @ts-ignore
                peg$currPos += 2;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s1 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e67);
                }
            }
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = [];
                // @ts-ignore
                if (peg$r4.test(input.charAt(peg$currPos))) {
                    // @ts-ignore
                    s3 = input.charAt(peg$currPos);
                    // @ts-ignore
                    peg$currPos++;
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    s3 = peg$FAILED;
                    // @ts-ignore
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e68);
                    }
                }
                // @ts-ignore
                if (s3 !== peg$FAILED) {
                    // @ts-ignore
                    while (s3 !== peg$FAILED) {
                        // @ts-ignore
                        s2.push(s3);
                        // @ts-ignore
                        if (peg$r4.test(input.charAt(peg$currPos))) {
                            // @ts-ignore
                            s3 = input.charAt(peg$currPos);
                            // @ts-ignore
                            peg$currPos++;
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            s3 = peg$FAILED;
                            // @ts-ignore
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e68);
                            }
                        }
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    s2 = peg$FAILED;
                }
                // @ts-ignore
                if (s2 !== peg$FAILED) {
                    // @ts-ignore
                    peg$savedPos = s0;
                    // @ts-ignore
                    s0 = peg$f91();
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseOCTAL() {
            // @ts-ignore
            var s0, s1, s2, s3;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 48) {
                // @ts-ignore
                s1 = peg$c64;
                // @ts-ignore
                peg$currPos++;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s1 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e69);
                }
            }
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = [];
                // @ts-ignore
                if (peg$r5.test(input.charAt(peg$currPos))) {
                    // @ts-ignore
                    s3 = input.charAt(peg$currPos);
                    // @ts-ignore
                    peg$currPos++;
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    s3 = peg$FAILED;
                    // @ts-ignore
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e70);
                    }
                }
                // @ts-ignore
                while (s3 !== peg$FAILED) {
                    // @ts-ignore
                    s2.push(s3);
                    // @ts-ignore
                    if (peg$r5.test(input.charAt(peg$currPos))) {
                        // @ts-ignore
                        s3 = input.charAt(peg$currPos);
                        // @ts-ignore
                        peg$currPos++;
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        s3 = peg$FAILED;
                        // @ts-ignore
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e70);
                        }
                    }
                }
                // @ts-ignore
                peg$savedPos = s0;
                // @ts-ignore
                s0 = peg$f92();
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseCHAR() {
            // @ts-ignore
            var s0, s1, s2, s3, s4;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 39) {
                // @ts-ignore
                s1 = peg$c65;
                // @ts-ignore
                peg$currPos++;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s1 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e71);
                }
            }
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = peg$currPos;
                // @ts-ignore
                s3 = peg$currPos;
                // @ts-ignore
                peg$silentFails++;
                // @ts-ignore
                if (peg$r6.test(input.charAt(peg$currPos))) {
                    // @ts-ignore
                    s4 = input.charAt(peg$currPos);
                    // @ts-ignore
                    peg$currPos++;
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    s4 = peg$FAILED;
                    // @ts-ignore
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e72);
                    }
                }
                // @ts-ignore
                peg$silentFails--;
                // @ts-ignore
                if (s4 === peg$FAILED) {
                    // @ts-ignore
                    s3 = undefined;
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s3;
                    // @ts-ignore
                    s3 = peg$FAILED;
                }
                // @ts-ignore
                if (s3 !== peg$FAILED) {
                    // @ts-ignore
                    if (input.length > peg$currPos) {
                        // @ts-ignore
                        s4 = input.charAt(peg$currPos);
                        // @ts-ignore
                        peg$currPos++;
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        s4 = peg$FAILED;
                        // @ts-ignore
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e73);
                        }
                    }
                    // @ts-ignore
                    if (s4 !== peg$FAILED) {
                        // @ts-ignore
                        s3 = [s3, s4];
                        // @ts-ignore
                        s2 = s3;
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s2;
                        // @ts-ignore
                        s2 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s2;
                    // @ts-ignore
                    s2 = peg$FAILED;
                }
                // @ts-ignore
                if (s2 !== peg$FAILED) {
                    // @ts-ignore
                    if (input.charCodeAt(peg$currPos) === 39) {
                        // @ts-ignore
                        s3 = peg$c65;
                        // @ts-ignore
                        peg$currPos++;
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        s3 = peg$FAILED;
                        // @ts-ignore
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e71);
                        }
                    }
                    // @ts-ignore
                    if (s3 !== peg$FAILED) {
                        // @ts-ignore
                        peg$savedPos = s0;
                        // @ts-ignore
                        s0 = peg$f93(s2);
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s0;
                        // @ts-ignore
                        s0 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseSTRING() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 34) {
                // @ts-ignore
                s1 = peg$c66;
                // @ts-ignore
                peg$currPos++;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s1 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e74);
                }
            }
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = [];
                // @ts-ignore
                s3 = peg$currPos;
                // @ts-ignore
                s4 = peg$currPos;
                // @ts-ignore
                peg$silentFails++;
                // @ts-ignore
                if (peg$r6.test(input.charAt(peg$currPos))) {
                    // @ts-ignore
                    s5 = input.charAt(peg$currPos);
                    // @ts-ignore
                    peg$currPos++;
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    s5 = peg$FAILED;
                    // @ts-ignore
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e72);
                    }
                }
                // @ts-ignore
                peg$silentFails--;
                // @ts-ignore
                if (s5 === peg$FAILED) {
                    // @ts-ignore
                    s4 = undefined;
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s4;
                    // @ts-ignore
                    s4 = peg$FAILED;
                }
                // @ts-ignore
                if (s4 !== peg$FAILED) {
                    // @ts-ignore
                    if (input.length > peg$currPos) {
                        // @ts-ignore
                        s5 = input.charAt(peg$currPos);
                        // @ts-ignore
                        peg$currPos++;
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        s5 = peg$FAILED;
                        // @ts-ignore
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e73);
                        }
                    }
                    // @ts-ignore
                    if (s5 !== peg$FAILED) {
                        // @ts-ignore
                        s4 = [s4, s5];
                        // @ts-ignore
                        s3 = s4;
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s3;
                        // @ts-ignore
                        s3 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s3;
                    // @ts-ignore
                    s3 = peg$FAILED;
                }
                // @ts-ignore
                while (s3 !== peg$FAILED) {
                    // @ts-ignore
                    s2.push(s3);
                    // @ts-ignore
                    s3 = peg$currPos;
                    // @ts-ignore
                    s4 = peg$currPos;
                    // @ts-ignore
                    peg$silentFails++;
                    // @ts-ignore
                    if (peg$r6.test(input.charAt(peg$currPos))) {
                        // @ts-ignore
                        s5 = input.charAt(peg$currPos);
                        // @ts-ignore
                        peg$currPos++;
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        s5 = peg$FAILED;
                        // @ts-ignore
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e72);
                        }
                    }
                    // @ts-ignore
                    peg$silentFails--;
                    // @ts-ignore
                    if (s5 === peg$FAILED) {
                        // @ts-ignore
                        s4 = undefined;
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s4;
                        // @ts-ignore
                        s4 = peg$FAILED;
                    }
                    // @ts-ignore
                    if (s4 !== peg$FAILED) {
                        // @ts-ignore
                        if (input.length > peg$currPos) {
                            // @ts-ignore
                            s5 = input.charAt(peg$currPos);
                            // @ts-ignore
                            peg$currPos++;
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            s5 = peg$FAILED;
                            // @ts-ignore
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e73);
                            }
                        }
                        // @ts-ignore
                        if (s5 !== peg$FAILED) {
                            // @ts-ignore
                            s4 = [s4, s5];
                            // @ts-ignore
                            s3 = s4;
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s3;
                            // @ts-ignore
                            s3 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s3;
                        // @ts-ignore
                        s3 = peg$FAILED;
                    }
                }
                // @ts-ignore
                if (input.charCodeAt(peg$currPos) === 34) {
                    // @ts-ignore
                    s3 = peg$c66;
                    // @ts-ignore
                    peg$currPos++;
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    s3 = peg$FAILED;
                    // @ts-ignore
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e74);
                    }
                }
                // @ts-ignore
                if (s3 !== peg$FAILED) {
                    // @ts-ignore
                    peg$savedPos = s0;
                    // @ts-ignore
                    s0 = peg$f94(s2);
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseVALUENULL() {
            // @ts-ignore
            var s0, s1;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            if (input.substr(peg$currPos, 4) === peg$c67) {
                // @ts-ignore
                s1 = peg$c67;
                // @ts-ignore
                peg$currPos += 4;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s1 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e75);
                }
            }
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                peg$savedPos = s0;
                // @ts-ignore
                s1 = peg$f95();
            }
            // @ts-ignore
            s0 = s1;
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseFLOAT() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$currPos;
            // @ts-ignore
            s2 = [];
            // @ts-ignore
            if (peg$r3.test(input.charAt(peg$currPos))) {
                // @ts-ignore
                s3 = input.charAt(peg$currPos);
                // @ts-ignore
                peg$currPos++;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s3 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e66);
                }
            }
            // @ts-ignore
            if (s3 !== peg$FAILED) {
                // @ts-ignore
                while (s3 !== peg$FAILED) {
                    // @ts-ignore
                    s2.push(s3);
                    // @ts-ignore
                    if (peg$r3.test(input.charAt(peg$currPos))) {
                        // @ts-ignore
                        s3 = input.charAt(peg$currPos);
                        // @ts-ignore
                        peg$currPos++;
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        s3 = peg$FAILED;
                        // @ts-ignore
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e66);
                        }
                    }
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s2 = peg$FAILED;
            }
            // @ts-ignore
            if (s2 !== peg$FAILED) {
                // @ts-ignore
                if (input.charCodeAt(peg$currPos) === 46) {
                    // @ts-ignore
                    s3 = peg$c29;
                    // @ts-ignore
                    peg$currPos++;
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    s3 = peg$FAILED;
                    // @ts-ignore
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e31);
                    }
                }
                // @ts-ignore
                if (s3 !== peg$FAILED) {
                    // @ts-ignore
                    s4 = [];
                    // @ts-ignore
                    if (peg$r3.test(input.charAt(peg$currPos))) {
                        // @ts-ignore
                        s5 = input.charAt(peg$currPos);
                        // @ts-ignore
                        peg$currPos++;
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        s5 = peg$FAILED;
                        // @ts-ignore
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e66);
                        }
                    }
                    // @ts-ignore
                    while (s5 !== peg$FAILED) {
                        // @ts-ignore
                        s4.push(s5);
                        // @ts-ignore
                        if (peg$r3.test(input.charAt(peg$currPos))) {
                            // @ts-ignore
                            s5 = input.charAt(peg$currPos);
                            // @ts-ignore
                            peg$currPos++;
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            s5 = peg$FAILED;
                            // @ts-ignore
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e66);
                            }
                        }
                    }
                    // @ts-ignore
                    s2 = [s2, s3, s4];
                    // @ts-ignore
                    s1 = s2;
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s1;
                    // @ts-ignore
                    s1 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s1;
                // @ts-ignore
                s1 = peg$FAILED;
            }
            // @ts-ignore
            if (s1 === peg$FAILED) {
                // @ts-ignore
                s1 = peg$currPos;
                // @ts-ignore
                if (input.charCodeAt(peg$currPos) === 46) {
                    // @ts-ignore
                    s2 = peg$c29;
                    // @ts-ignore
                    peg$currPos++;
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    s2 = peg$FAILED;
                    // @ts-ignore
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e31);
                    }
                }
                // @ts-ignore
                if (s2 !== peg$FAILED) {
                    // @ts-ignore
                    s3 = [];
                    // @ts-ignore
                    if (peg$r3.test(input.charAt(peg$currPos))) {
                        // @ts-ignore
                        s4 = input.charAt(peg$currPos);
                        // @ts-ignore
                        peg$currPos++;
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        s4 = peg$FAILED;
                        // @ts-ignore
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e66);
                        }
                    }
                    // @ts-ignore
                    if (s4 !== peg$FAILED) {
                        // @ts-ignore
                        while (s4 !== peg$FAILED) {
                            // @ts-ignore
                            s3.push(s4);
                            // @ts-ignore
                            if (peg$r3.test(input.charAt(peg$currPos))) {
                                // @ts-ignore
                                s4 = input.charAt(peg$currPos);
                                // @ts-ignore
                                peg$currPos++;
                                // @ts-ignore
                            }
                            else {
                                // @ts-ignore
                                s4 = peg$FAILED;
                                // @ts-ignore
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e66);
                                }
                            }
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        s3 = peg$FAILED;
                    }
                    // @ts-ignore
                    if (s3 !== peg$FAILED) {
                        // @ts-ignore
                        s2 = [s2, s3];
                        // @ts-ignore
                        s1 = s2;
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s1;
                        // @ts-ignore
                        s1 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s1;
                    // @ts-ignore
                    s1 = peg$FAILED;
                }
            }
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = peg$currPos;
                // @ts-ignore
                if (peg$r7.test(input.charAt(peg$currPos))) {
                    // @ts-ignore
                    s3 = input.charAt(peg$currPos);
                    // @ts-ignore
                    peg$currPos++;
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    s3 = peg$FAILED;
                    // @ts-ignore
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e76);
                    }
                }
                // @ts-ignore
                if (s3 !== peg$FAILED) {
                    // @ts-ignore
                    if (peg$r8.test(input.charAt(peg$currPos))) {
                        // @ts-ignore
                        s4 = input.charAt(peg$currPos);
                        // @ts-ignore
                        peg$currPos++;
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        s4 = peg$FAILED;
                        // @ts-ignore
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e77);
                        }
                    }
                    // @ts-ignore
                    if (s4 === peg$FAILED) {
                        // @ts-ignore
                        s4 = null;
                    }
                    // @ts-ignore
                    s5 = [];
                    // @ts-ignore
                    if (peg$r3.test(input.charAt(peg$currPos))) {
                        // @ts-ignore
                        s6 = input.charAt(peg$currPos);
                        // @ts-ignore
                        peg$currPos++;
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        s6 = peg$FAILED;
                        // @ts-ignore
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e66);
                        }
                    }
                    // @ts-ignore
                    if (s6 !== peg$FAILED) {
                        // @ts-ignore
                        while (s6 !== peg$FAILED) {
                            // @ts-ignore
                            s5.push(s6);
                            // @ts-ignore
                            if (peg$r3.test(input.charAt(peg$currPos))) {
                                // @ts-ignore
                                s6 = input.charAt(peg$currPos);
                                // @ts-ignore
                                peg$currPos++;
                                // @ts-ignore
                            }
                            else {
                                // @ts-ignore
                                s6 = peg$FAILED;
                                // @ts-ignore
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e66);
                                }
                            }
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        s5 = peg$FAILED;
                    }
                    // @ts-ignore
                    if (s5 !== peg$FAILED) {
                        // @ts-ignore
                        s3 = [s3, s4, s5];
                        // @ts-ignore
                        s2 = s3;
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s2;
                        // @ts-ignore
                        s2 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s2;
                    // @ts-ignore
                    s2 = peg$FAILED;
                }
                // @ts-ignore
                if (s2 === peg$FAILED) {
                    // @ts-ignore
                    s2 = null;
                }
                // @ts-ignore
                peg$savedPos = s0;
                // @ts-ignore
                s0 = peg$f96();
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseComment() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            s0 = peg$parseLineComment();
            // @ts-ignore
            if (s0 === peg$FAILED) {
                // @ts-ignore
                s0 = peg$parseBlockComment();
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseLineComment() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            if (input.substr(peg$currPos, 2) === peg$c68) {
                // @ts-ignore
                s1 = peg$c68;
                // @ts-ignore
                peg$currPos += 2;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s1 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e78);
                }
            }
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = [];
                // @ts-ignore
                s3 = peg$currPos;
                // @ts-ignore
                s4 = peg$currPos;
                // @ts-ignore
                peg$silentFails++;
                // @ts-ignore
                if (peg$r9.test(input.charAt(peg$currPos))) {
                    // @ts-ignore
                    s5 = input.charAt(peg$currPos);
                    // @ts-ignore
                    peg$currPos++;
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    s5 = peg$FAILED;
                    // @ts-ignore
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e79);
                    }
                }
                // @ts-ignore
                peg$silentFails--;
                // @ts-ignore
                if (s5 === peg$FAILED) {
                    // @ts-ignore
                    s4 = undefined;
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s4;
                    // @ts-ignore
                    s4 = peg$FAILED;
                }
                // @ts-ignore
                if (s4 !== peg$FAILED) {
                    // @ts-ignore
                    if (input.length > peg$currPos) {
                        // @ts-ignore
                        s5 = input.charAt(peg$currPos);
                        // @ts-ignore
                        peg$currPos++;
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        s5 = peg$FAILED;
                        // @ts-ignore
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e73);
                        }
                    }
                    // @ts-ignore
                    if (s5 !== peg$FAILED) {
                        // @ts-ignore
                        s4 = [s4, s5];
                        // @ts-ignore
                        s3 = s4;
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s3;
                        // @ts-ignore
                        s3 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s3;
                    // @ts-ignore
                    s3 = peg$FAILED;
                }
                // @ts-ignore
                while (s3 !== peg$FAILED) {
                    // @ts-ignore
                    s2.push(s3);
                    // @ts-ignore
                    s3 = peg$currPos;
                    // @ts-ignore
                    s4 = peg$currPos;
                    // @ts-ignore
                    peg$silentFails++;
                    // @ts-ignore
                    if (peg$r9.test(input.charAt(peg$currPos))) {
                        // @ts-ignore
                        s5 = input.charAt(peg$currPos);
                        // @ts-ignore
                        peg$currPos++;
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        s5 = peg$FAILED;
                        // @ts-ignore
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e79);
                        }
                    }
                    // @ts-ignore
                    peg$silentFails--;
                    // @ts-ignore
                    if (s5 === peg$FAILED) {
                        // @ts-ignore
                        s4 = undefined;
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s4;
                        // @ts-ignore
                        s4 = peg$FAILED;
                    }
                    // @ts-ignore
                    if (s4 !== peg$FAILED) {
                        // @ts-ignore
                        if (input.length > peg$currPos) {
                            // @ts-ignore
                            s5 = input.charAt(peg$currPos);
                            // @ts-ignore
                            peg$currPos++;
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            s5 = peg$FAILED;
                            // @ts-ignore
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e73);
                            }
                        }
                        // @ts-ignore
                        if (s5 !== peg$FAILED) {
                            // @ts-ignore
                            s4 = [s4, s5];
                            // @ts-ignore
                            s3 = s4;
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s3;
                            // @ts-ignore
                            s3 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s3;
                        // @ts-ignore
                        s3 = peg$FAILED;
                    }
                }
                // @ts-ignore
                s1 = [s1, s2];
                // @ts-ignore
                s0 = s1;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseBlockComment() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            if (input.substr(peg$currPos, 2) === peg$c69) {
                // @ts-ignore
                s1 = peg$c69;
                // @ts-ignore
                peg$currPos += 2;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s1 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e80);
                }
            }
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                s2 = [];
                // @ts-ignore
                s3 = peg$currPos;
                // @ts-ignore
                s4 = peg$currPos;
                // @ts-ignore
                peg$silentFails++;
                // @ts-ignore
                if (input.substr(peg$currPos, 2) === peg$c70) {
                    // @ts-ignore
                    s5 = peg$c70;
                    // @ts-ignore
                    peg$currPos += 2;
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    s5 = peg$FAILED;
                    // @ts-ignore
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e81);
                    }
                }
                // @ts-ignore
                peg$silentFails--;
                // @ts-ignore
                if (s5 === peg$FAILED) {
                    // @ts-ignore
                    s4 = undefined;
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s4;
                    // @ts-ignore
                    s4 = peg$FAILED;
                }
                // @ts-ignore
                if (s4 !== peg$FAILED) {
                    // @ts-ignore
                    if (input.length > peg$currPos) {
                        // @ts-ignore
                        s5 = input.charAt(peg$currPos);
                        // @ts-ignore
                        peg$currPos++;
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        s5 = peg$FAILED;
                        // @ts-ignore
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e73);
                        }
                    }
                    // @ts-ignore
                    if (s5 !== peg$FAILED) {
                        // @ts-ignore
                        s4 = [s4, s5];
                        // @ts-ignore
                        s3 = s4;
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s3;
                        // @ts-ignore
                        s3 = peg$FAILED;
                    }
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s3;
                    // @ts-ignore
                    s3 = peg$FAILED;
                }
                // @ts-ignore
                while (s3 !== peg$FAILED) {
                    // @ts-ignore
                    s2.push(s3);
                    // @ts-ignore
                    s3 = peg$currPos;
                    // @ts-ignore
                    s4 = peg$currPos;
                    // @ts-ignore
                    peg$silentFails++;
                    // @ts-ignore
                    if (input.substr(peg$currPos, 2) === peg$c70) {
                        // @ts-ignore
                        s5 = peg$c70;
                        // @ts-ignore
                        peg$currPos += 2;
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        s5 = peg$FAILED;
                        // @ts-ignore
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e81);
                        }
                    }
                    // @ts-ignore
                    peg$silentFails--;
                    // @ts-ignore
                    if (s5 === peg$FAILED) {
                        // @ts-ignore
                        s4 = undefined;
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s4;
                        // @ts-ignore
                        s4 = peg$FAILED;
                    }
                    // @ts-ignore
                    if (s4 !== peg$FAILED) {
                        // @ts-ignore
                        if (input.length > peg$currPos) {
                            // @ts-ignore
                            s5 = input.charAt(peg$currPos);
                            // @ts-ignore
                            peg$currPos++;
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            s5 = peg$FAILED;
                            // @ts-ignore
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e73);
                            }
                        }
                        // @ts-ignore
                        if (s5 !== peg$FAILED) {
                            // @ts-ignore
                            s4 = [s4, s5];
                            // @ts-ignore
                            s3 = s4;
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s3;
                            // @ts-ignore
                            s3 = peg$FAILED;
                        }
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        peg$currPos = s3;
                        // @ts-ignore
                        s3 = peg$FAILED;
                    }
                }
                // @ts-ignore
                if (input.substr(peg$currPos, 2) === peg$c70) {
                    // @ts-ignore
                    s3 = peg$c70;
                    // @ts-ignore
                    peg$currPos += 2;
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    s3 = peg$FAILED;
                    // @ts-ignore
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e81);
                    }
                }
                // @ts-ignore
                if (s3 !== peg$FAILED) {
                    // @ts-ignore
                    s1 = [s1, s2, s3];
                    // @ts-ignore
                    s0 = s1;
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    peg$currPos = s0;
                    // @ts-ignore
                    s0 = peg$FAILED;
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                peg$currPos = s0;
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseWhitespace() {
            // @ts-ignore
            var s0, s1;
            // @ts-ignore
            s0 = [];
            // @ts-ignore
            if (peg$r10.test(input.charAt(peg$currPos))) {
                // @ts-ignore
                s1 = input.charAt(peg$currPos);
                // @ts-ignore
                peg$currPos++;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s1 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e82);
                }
            }
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                while (s1 !== peg$FAILED) {
                    // @ts-ignore
                    s0.push(s1);
                    // @ts-ignore
                    if (peg$r10.test(input.charAt(peg$currPos))) {
                        // @ts-ignore
                        s1 = input.charAt(peg$currPos);
                        // @ts-ignore
                        peg$currPos++;
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        s1 = peg$FAILED;
                        // @ts-ignore
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e82);
                        }
                    }
                }
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s0 = peg$FAILED;
            }
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parse_() {
            // @ts-ignore
            var s0, s1, s2;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = [];
            // @ts-ignore
            s2 = peg$parseWhitespace();
            // @ts-ignore
            if (s2 === peg$FAILED) {
                // @ts-ignore
                s2 = peg$parseComment();
            }
            // @ts-ignore
            while (s2 !== peg$FAILED) {
                // @ts-ignore
                s1.push(s2);
                // @ts-ignore
                s2 = peg$parseWhitespace();
                // @ts-ignore
                if (s2 === peg$FAILED) {
                    // @ts-ignore
                    s2 = peg$parseComment();
                }
            }
            // @ts-ignore
            peg$savedPos = s0;
            // @ts-ignore
            s1 = peg$f97();
            // @ts-ignore
            s0 = s1;
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        peg$result = peg$startRuleFunction();
        // @ts-ignore
        if (peg$result !== peg$FAILED && peg$currPos === input.length) {
            // @ts-ignore
            return peg$result;
            // @ts-ignore
        }
        else {
            // @ts-ignore
            if (peg$result !== peg$FAILED && peg$currPos < input.length) {
                // @ts-ignore
                peg$fail(peg$endExpectation());
            }
            // @ts-ignore
            throw peg$buildStructuredError(
            // @ts-ignore
            peg$maxFailExpected, 
            // @ts-ignore
            peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null, 
            // @ts-ignore
            peg$maxFailPos < input.length
                // @ts-ignore
                ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
                // @ts-ignore
                : peg$computeLocation(peg$maxFailPos, peg$maxFailPos));
        }
    }
    // @ts-ignore
    return {
        SyntaxError: peg$SyntaxError,
        parse: peg$parse
    };
})();
peggyParser.SyntaxError.prototype.name = "PeggySyntaxError";
exports.parse = peggyParser.parse;
exports.PeggySyntaxError = peggyParser.SyntaxError;


/***/ }),

/***/ "./src/parser/zrParser.ts":
/*!********************************!*\
  !*** ./src/parser/zrParser.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ZrParser = void 0;
const zrParserError_1 = __webpack_require__(/*! ../errors/zrParserError */ "./src/errors/zrParserError.ts");
const zrSyntaxError_1 = __webpack_require__(/*! ../errors/zrSyntaxError */ "./src/errors/zrSyntaxError.ts");
const parser_1 = __webpack_require__(/*! ./generated/parser */ "./src/parser/generated/parser.ts");
class ZrParser {
    constructor(context) {
        this.context = context;
    }
    parse() {
        try {
            const ast = (0, parser_1.parse)(this.context.scriptText, {
                grammarSource: "zr.peggy",
                startRule: "start",
                parser: {
                    location: true
                },
                filename: this.context.fileName
            });
            this.cachedAst = ast;
            this.context.ast = ast;
        }
        catch (err) {
            if (err instanceof Error) {
                if (err instanceof parser_1.PeggySyntaxError) {
                    this.context.syntaxErrorRange = err.location;
                }
                new zrSyntaxError_1.ZrSyntaxError(this.context, err.message).report();
            }
            new zrParserError_1.ZrParserError(this.context, err).report();
        }
    }
}
exports.ZrParser = ZrParser;


/***/ }),

/***/ "./src/types/access.ts":
/*!*****************************!*\
  !*** ./src/types/access.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MetaType = exports.PropertyType = exports.Access = void 0;
var Access;
(function (Access) {
    Access["PUBLIC"] = "pub";
    Access["PRIVATE"] = "pri";
    Access["PROTECTED"] = "pro";
})(Access || (exports.Access = Access = {}));
var PropertyType;
(function (PropertyType) {
    PropertyType["GET"] = "get";
    PropertyType["SET"] = "set";
    PropertyType["GET_SET"] = "get_set";
})(PropertyType || (exports.PropertyType = PropertyType = {}));
var MetaType;
(function (MetaType) {
    MetaType[MetaType["CONSTRUCTOR"] = 1] = "CONSTRUCTOR";
    MetaType[MetaType["ADD"] = 2] = "ADD";
    MetaType[MetaType["SUB"] = 3] = "SUB";
    MetaType[MetaType["MUL"] = 4] = "MUL";
    MetaType[MetaType["DIV"] = 5] = "DIV";
    MetaType[MetaType["MOD"] = 6] = "MOD";
    MetaType[MetaType["NEG"] = 7] = "NEG";
    MetaType[MetaType["COMPARE"] = 8] = "COMPARE";
    MetaType[MetaType["TO_BOOL"] = 9] = "TO_BOOL";
    MetaType[MetaType["TO_STRING"] = 10] = "TO_STRING";
})(MetaType || (exports.MetaType = MetaType = {}));


/***/ }),

/***/ "./src/utils/i18n.ts":
/*!***************************!*\
  !*** ./src/utils/i18n.ts ***!
  \***************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const i18next_1 = __importDefault(__webpack_require__(/*! i18next */ "i18next"));
const en_json_1 = __importDefault(__webpack_require__(/*! ../../locales/en.json */ "./locales/en.json"));
const zh_json_1 = __importDefault(__webpack_require__(/*! ../../locales/zh.json */ "./locales/zh.json"));
i18next_1.default.init({
    lng: "en",
    resources: {
        en: {
            translation: en_json_1.default
        },
        zh: {
            translation: zh_json_1.default
        }
    },
    interpolation: {
        escapeValue: false
    }
});
globalThis.i = i18next_1.default.t;


/***/ }),

/***/ "./src/utils/logger.ts":
/*!*****************************!*\
  !*** ./src/utils/logger.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Logger = void 0;
class Logger {
    static date() {
        return new Date().toLocaleString();
    }
    static error(msg) {
        console.error(`[Error](${Logger.date()}) ${msg}`);
    }
    static warn(msg) {
        console.warn(`[Warn](${Logger.date()}) ${msg}`);
    }
    static info(msg) {
        console.info(`[Info](${Logger.date()}) ${msg}`);
    }
    static verbose(msg) {
        console.debug(`[Verbose](${Logger.date()}) ${msg}`);
    }
}
exports.Logger = Logger;


/***/ }),

/***/ "./src/utils/prettyPrint.ts":
/*!**********************************!*\
  !*** ./src/utils/prettyPrint.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.prettyPrintSymbolTables = prettyPrintSymbolTables;
const symbol_1 = __webpack_require__(/*! ../analyzer/static/symbol/symbol */ "./src/analyzer/static/symbol/symbol.ts");
const logger_1 = __webpack_require__(/*! ./logger */ "./src/utils/logger.ts");
const scope_1 = __webpack_require__(/*! ../analyzer/static/scope/scope */ "./src/analyzer/static/scope/scope.ts");
const indentCounter = new Map();
function prettyPrintSymbolTables(sym, indent = 0) {
    // create indent
    let indentString = "";
    if (indentCounter.has(indent)) {
        indentString = indentCounter.get(indent);
    }
    else {
        indentString = " ".repeat(indent);
        indentCounter.set(indent, indentString);
    }
    const text = `- ${sym.name} : ${sym.type}`;
    logger_1.Logger.info(`${indentString}${text}`);
    for (const key of Object.keys(sym)) {
        const value = sym[key];
        if (value instanceof scope_1.Scope && key !== "ownerScope") {
            for (const key2 of value.symbolTableList) {
                if (key2 instanceof symbol_1.SymbolTable) {
                    for (const sym of key2.symbolTable) {
                        prettyPrintSymbolTables(sym, indent + 2);
                    }
                }
                else if (typeof (key2) === "function") {
                    const k = key2();
                    if (!k) {
                        continue;
                    }
                    prettyPrintSymbolTables(k, indent + 2);
                }
            }
        }
        else if (value instanceof symbol_1.Symbol) {
            prettyPrintSymbolTables(value, indent + 2);
        }
        else if (value instanceof Array && value.length > 0 && value[0] instanceof symbol_1.Symbol) {
            for (const v of value) {
                prettyPrintSymbolTables(v, indent + 2);
            }
        }
    }
}


/***/ }),

/***/ "./src/utils/utils.ts":
/*!****************************!*\
  !*** ./src/utils/utils.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
__webpack_require__(/*! ./i18n */ "./src/utils/i18n.ts");
__webpack_require__(/*! ./logger */ "./src/utils/logger.ts");
__webpack_require__(/*! ./prettyPrint */ "./src/utils/prettyPrint.ts");


/***/ }),

/***/ "./src/zrCompiler.ts":
/*!***************************!*\
  !*** ./src/zrCompiler.ts ***!
  \***************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ZrCompiler = void 0;
const zrSemanticAnalyzer_1 = __webpack_require__(/*! ./analyzer/zrSemanticAnalyzer */ "./src/analyzer/zrSemanticAnalyzer.ts");
const scriptContext_1 = __webpack_require__(/*! ./common/scriptContext */ "./src/common/scriptContext.ts");
const zrFileReader_1 = __webpack_require__(/*! ./io/zrFileReader */ "./src/io/zrFileReader.ts");
const zrFileResolver_1 = __webpack_require__(/*! ./io/zrFileResolver */ "./src/io/zrFileResolver.ts");
const zrParser_1 = __webpack_require__(/*! ./parser/zrParser */ "./src/parser/zrParser.ts");
__webpack_require__(/*! ./utils/utils */ "./src/utils/utils.ts");
class ZrCompiler {
    constructor(info) {
        const context = new scriptContext_1.ScriptContext(info);
        this.context = context;
        this.fileReader = new zrFileReader_1.ZrFileReader(context);
        this.fileResolver = new zrFileResolver_1.ZrFileResolver(context);
        this.parser = new zrParser_1.ZrParser(context);
        this.analyzer = new zrSemanticAnalyzer_1.ZrSemanticAnalyzer(context);
    }
    compile() {
        return __awaiter(this, void 0, void 0, function* () {
            this.fileResolver.resolve();
            yield this.fileReader.read();
            this.parser.parse();
            this.analyzer.analyze();
        });
    }
}
exports.ZrCompiler = ZrCompiler;


/***/ }),

/***/ "i18next":
/*!**************************!*\
  !*** external "i18next" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("i18next");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ }),

/***/ "./locales/en.json":
/*!*************************!*\
  !*** ./locales/en.json ***!
  \*************************/
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"commonError":"code:{{errCode}} \\n{{message}}\\n  at {{file}}:{{line}}:{{column}}","commonError2":"code:{{errCode}} \\n{{message}}\\n  at {{file}}","syntaxError":"SyntaxError: {{message}}\\n  from {{fromLine}}:{{fromColumn}} to {{toLine}}:{{toColumn}}","syntaxError2":"SyntaxError: {{message}}","noHandlerError":"There is no handler for {{type}}","parserError":"Parser error: {{message}}","internalError":"Internal error: {{message}}","duplicatedIdentifierError":"Duplicated identifier: {{identifier}}, conflicting with {{start}}~{{end}}"}');

/***/ }),

/***/ "./locales/zh.json":
/*!*************************!*\
  !*** ./locales/zh.json ***!
  \*************************/
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"error":{"noHandler":"There is no handler"}}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const zrCompiler_1 = __webpack_require__(/*! ./zrCompiler */ "./src/zrCompiler.ts");
function main() {
    const info = {
        compilingDirectory: process.cwd(),
        fileRelativePath: process.argv[2],
        encoding: "utf-8"
    };
    const compiler = new zrCompiler_1.ZrCompiler(info);
    compiler.compile();
}
main();

})();

/******/ })()
;
//# sourceMappingURL=bundle.js.map