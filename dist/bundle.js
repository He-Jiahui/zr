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
class Handler {
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
        h.handle(node);
        return h;
    }
    constructor(context) {
        this.context = context;
    }
    handle(node) {
        // clear previous value
        this.value = null;
        // set location
        const { location } = node;
        this.location = location;
        this.context.location = location;
    }
    // collects 
    collectDeclarations() {
    }
}
exports.Handler = Handler;
Handler.handlers = new Map();


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
        this.nameHandler = null;
        this.membersHandler = [];
        this.inheritsHandler = [];
        this.decoratorsHandler = [];
        this.genericHandler = null;
    }
    handle(node) {
        var _a, _b;
        super.handle(node);
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
    handle(node) {
        var _a, _b, _c;
        super.handle(node);
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
        this.bodyHandler = null;
        this.superHandlers = [];
    }
    handle(node) {
        var _a, _b;
        super.handle(node);
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
            body: (_b = this.bodyHandler) === null || _b === void 0 ? void 0 : _b.value,
        };
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
        this.genericHandler = null;
        this.bodyHandler = null;
    }
    handle(node) {
        var _a, _b, _c, _d;
        super.handle(node);
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
            generic: (_c = this.genericHandler) === null || _c === void 0 ? void 0 : _c.value,
            decorators: this.decoratorHandlers.map(handler => handler === null || handler === void 0 ? void 0 : handler.value),
            body: (_d = this.bodyHandler) === null || _d === void 0 ? void 0 : _d.value
        };
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
class PropertyHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.decoratorHandlers = [];
        this.targetTypeHandler = null;
        this.bodyHandler = null;
        this.nameHandler = null;
        this.paramHandler = null;
    }
    handle(node) {
        var _a, _b, _c;
        super.handle(node);
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
            body: this.bodyHandler
        };
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
    handle(node) {
        var _a, _b;
        super.handle(node);
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
    handle(node) {
        var _a, _b;
        super.handle(node);
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
const handler_1 = __webpack_require__(/*! ../../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class FunctionHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.nameHandler = null;
        this.decoratorHandlers = [];
        this.returnTypeHandler = null;
        this.parameterHandlers = [];
        this.genericHandler = null;
        this.bodyHandler = null;
    }
    handle(node) {
        var _a, _b, _c, _d;
        super.handle(node);
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
            generic: (_c = this.genericHandler) === null || _c === void 0 ? void 0 : _c.value,
            decorators: this.decoratorHandlers.map(handler => handler === null || handler === void 0 ? void 0 : handler.value),
            body: (_d = this.bodyHandler) === null || _d === void 0 ? void 0 : _d.value
        };
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
    handle(node) {
        super.handle(node);
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
    handle(node) {
        var _a, _b;
        super.handle(node);
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
        this.nameHandler = null;
        this.membersHandler = [];
        this.inheritsHandler = [];
        this.genericHandler = null;
    }
    handle(node) {
        var _a, _b;
        super.handle(node);
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
        this.genericHandler = null;
        this.nameHandler = null;
    }
    handle(node) {
        var _a, _b, _c;
        super.handle(node);
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
        this.value = {
            type: "InterfaceMethodSignature",
            name: (_a = this.nameHandler) === null || _a === void 0 ? void 0 : _a.value,
            access: access,
            returnType: (_b = this.returnTypeHandler) === null || _b === void 0 ? void 0 : _b.value,
            parameters: this.parameterHandlers.map(handler => handler === null || handler === void 0 ? void 0 : handler.value),
            generic: (_c = this.genericHandler) === null || _c === void 0 ? void 0 : _c.value,
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
    handle(node) {
        var _a;
        super.handle(node);
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
    handle(node) {
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
    handle(node) {
        var _a, _b, _c;
        super.handle(node);
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
        this.bodyHandler = null;
    }
    handle(node) {
        var _a, _b;
        super.handle(node);
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
        this.value = {
            type: "StructMetaFunction",
            access: node.access,
            static: !!node.static,
            meta: (_a = this.metaHandler) === null || _a === void 0 ? void 0 : _a.value,
            parameters: this.parameterHandlers.map(handler => handler === null || handler === void 0 ? void 0 : handler.value),
            body: (_b = this.bodyHandler) === null || _b === void 0 ? void 0 : _b.value,
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
        this.genericHandler = null;
        this.bodyHandler = null;
    }
    handle(node) {
        var _a, _b, _c;
        super.handle(node);
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
            generic: (_c = this.genericHandler) === null || _c === void 0 ? void 0 : _c.value,
            decorators: this.decoratorHandlers.map(handler => handler === null || handler === void 0 ? void 0 : handler.value),
            body: this.bodyHandler
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
        this.nameHandler = null;
        this.membersHandler = [];
    }
    handle(node) {
        var _a;
        super.handle(node);
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
    handle(node) {
        super.handle(node);
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
    handle(node) {
        super.handle(node);
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
    handle(node) {
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
    handle(node) {
        super.handle(node);
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
    handle(node) {
        var _a, _b;
        super.handle(node);
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
    handle(node) {
        var _a, _b;
        super.handle(node);
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
    handle(node) {
        var _a, _b, _c;
        super.handle(node);
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
    handle(node) {
        var _a;
        super.handle(node);
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
    handle(node) {
        super.handle(node);
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
    handle(node) {
        var _a, _b, _c;
        super.handle(node);
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
class LambdaHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.argsHandler = [];
        this.blockHandler = null;
    }
    handle(node) {
        var _a;
        super.handle(node);
        this.argsHandler.length = 0;
        for (const arg of node.args) {
            const handler = handler_1.Handler.handle(arg, this.context);
            this.argsHandler.push(handler);
        }
        this.blockHandler = handler_1.Handler.handle(node.block, this.context);
        this.value = {
            type: 'LambdaExpression',
            args: this.argsHandler.map(handler => handler === null || handler === void 0 ? void 0 : handler.value),
            blocks: (_a = this.blockHandler) === null || _a === void 0 ? void 0 : _a.value
        };
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
    handle(node) {
        var _a;
        super.handle(node);
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
    handle(node) {
        var _a;
        super.handle(node);
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
    handle(node) {
        var _a, _b;
        super.handle(node);
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
    handle(node) {
        var _a;
        super.handle(node);
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
    handle(node) {
        super.handle(node);
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
    handle(node) {
        var _a, _b;
        super.handle(node);
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
    handle(node) {
        var _a;
        super.handle(node);
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
exports.SwitchExpressionHandler = void 0;
const handler_1 = __webpack_require__(/*! ../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class SwitchExpressionHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.exprHandler = null;
        this.caseHandlers = [];
        this.defaultHandler = null;
    }
    handle(node) {
        var _a, _b;
        super.handle(node);
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
            expr: (_a = this.exprHandler) === null || _a === void 0 ? void 0 : _a.value,
            cases: this.caseHandlers.map(handler => handler === null || handler === void 0 ? void 0 : handler.value),
            default: (_b = this.defaultHandler) === null || _b === void 0 ? void 0 : _b.value
        };
    }
}
exports.SwitchExpressionHandler = SwitchExpressionHandler;
handler_1.Handler.registerHandler("SwitchExpression", SwitchExpressionHandler);


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
    handle(node) {
        super.handle(node);
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
    handle(node) {
        var _a, _b;
        super.handle(node);
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
    handle(node) {
        super.handle(node);
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
    handle(node) {
        super.handle(node);
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
    handle(node) {
        super.handle(node);
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
    handle(node) {
        super.handle(node);
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
    handle(node) {
        super.handle(node);
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
    handle(node) {
        super.handle(node);
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
    handle(node) {
        var _a;
        super.handle(node);
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
    handle(start) {
        var _a;
        super.handle(start);
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
    handle(node) {
        super.handle(node);
        this.bodyHandler.length = 0;
        for (const statement of node.body) {
            const handler = handler_1.Handler.handle(statement, this.context);
            this.bodyHandler.push(handler);
        }
        this.value = {
            type: "Block",
            body: this.bodyHandler.map(handler => handler === null || handler === void 0 ? void 0 : handler.value)
        };
    }
}
exports.BlockHandler = BlockHandler;
handler_1.Handler.registerHandler("Block", BlockHandler);


/***/ }),

/***/ "./src/analyzer/semantic/statements/controls/forHandler.ts":
/*!*****************************************************************!*\
  !*** ./src/analyzer/semantic/statements/controls/forHandler.ts ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ForeachLoopStatementHandler = exports.ForLoopStatementHandler = void 0;
const handler_1 = __webpack_require__(/*! ../../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class ForLoopStatementHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.initHandler = null;
        this.conditionHandler = null;
        this.stepHandler = null;
        this.blockHandler = null;
    }
    handle(node) {
        var _a, _b, _c;
        super.handle(node);
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
            type: "ForLoopStatement",
            init: (_a = this.initHandler) === null || _a === void 0 ? void 0 : _a.value,
            condition: (_b = this.conditionHandler) === null || _b === void 0 ? void 0 : _b.value,
            step: (_c = this.stepHandler) === null || _c === void 0 ? void 0 : _c.value,
            block: this.blockHandler.value
        };
    }
}
exports.ForLoopStatementHandler = ForLoopStatementHandler;
handler_1.Handler.registerHandler("ForLoop", ForLoopStatementHandler);
class ForeachLoopStatementHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.patternHandler = null;
        this.typeHandler = null;
        this.exprHandler = null;
        this.blockHandler = null;
    }
    handle(node) {
        var _a;
        super.handle(node);
        this.patternHandler = handler_1.Handler.handle(node.pattern, this.context);
        if (node.typeInfo) {
            this.typeHandler = handler_1.Handler.handle(node.typeInfo, this.context);
        }
        this.exprHandler = handler_1.Handler.handle(node.expr, this.context);
        this.blockHandler = handler_1.Handler.handle(node.block, this.context);
        this.value = {
            type: "ForeachLoopStatement",
            pattern: this.patternHandler.value,
            typeInfo: (_a = this.typeHandler) === null || _a === void 0 ? void 0 : _a.value,
            expr: this.exprHandler.value,
            block: this.blockHandler.value
        };
    }
}
exports.ForeachLoopStatementHandler = ForeachLoopStatementHandler;
handler_1.Handler.registerHandler("ForeachLoop", ForeachLoopStatementHandler);


/***/ }),

/***/ "./src/analyzer/semantic/statements/controls/ifHandler.ts":
/*!****************************************************************!*\
  !*** ./src/analyzer/semantic/statements/controls/ifHandler.ts ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IfStatementHandler = void 0;
const handler_1 = __webpack_require__(/*! ../../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class IfStatementHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.conditionHandler = null;
        this.thenHandler = null;
        this.elseHandler = null;
    }
    handle(node) {
        var _a, _b, _c;
        super.handle(node);
        this.conditionHandler = handler_1.Handler.handle(node.condition, this.context);
        this.thenHandler = handler_1.Handler.handle(node.then, this.context);
        if (node.else) {
            this.elseHandler = handler_1.Handler.handle(node.else, this.context);
        }
        else {
            this.elseHandler = null;
        }
        this.value = {
            type: "IfStatement",
            condition: (_a = this.conditionHandler) === null || _a === void 0 ? void 0 : _a.value,
            then: (_b = this.thenHandler) === null || _b === void 0 ? void 0 : _b.value,
            else: (_c = this.elseHandler) === null || _c === void 0 ? void 0 : _c.value
        };
    }
}
exports.IfStatementHandler = IfStatementHandler;
handler_1.Handler.registerHandler("IfStatement", IfStatementHandler);


/***/ }),

/***/ "./src/analyzer/semantic/statements/controls/index.ts":
/*!************************************************************!*\
  !*** ./src/analyzer/semantic/statements/controls/index.ts ***!
  \************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
__webpack_require__(/*! ./switchHandler */ "./src/analyzer/semantic/statements/controls/switchHandler.ts");
__webpack_require__(/*! ./returnHandler */ "./src/analyzer/semantic/statements/controls/returnHandler.ts");
__webpack_require__(/*! ./ifHandler */ "./src/analyzer/semantic/statements/controls/ifHandler.ts");
__webpack_require__(/*! ./whileHandler */ "./src/analyzer/semantic/statements/controls/whileHandler.ts");
__webpack_require__(/*! ./forHandler */ "./src/analyzer/semantic/statements/controls/forHandler.ts");


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
    handle(node) {
        var _a;
        super.handle(node);
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

/***/ "./src/analyzer/semantic/statements/controls/switchHandler.ts":
/*!********************************************************************!*\
  !*** ./src/analyzer/semantic/statements/controls/switchHandler.ts ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SwitchDefaultHandler = exports.SwitchCaseHandler = exports.SwitchStatementHandler = void 0;
const handler_1 = __webpack_require__(/*! ../../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class SwitchStatementHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.caseHandlers = [];
        this.defaultHandler = null;
    }
    handle(node) {
        var _a;
        super.handle(node);
        this.caseHandlers.length = 0;
        for (const caseNode of node.cases) {
            const handler = handler_1.Handler.handle(caseNode, this.context);
            this.caseHandlers.push(handler);
        }
        if (node.default) {
            this.defaultHandler = handler_1.Handler.handle(node.default, this.context);
        }
        else {
            this.defaultHandler = null;
        }
        this.value = {
            type: "SwitchStatement",
            cases: this.caseHandlers.map(handler => handler === null || handler === void 0 ? void 0 : handler.value),
            default: (_a = this.defaultHandler) === null || _a === void 0 ? void 0 : _a.value
        };
    }
}
exports.SwitchStatementHandler = SwitchStatementHandler;
handler_1.Handler.registerHandler("SwitchStatement", SwitchStatementHandler);
class SwitchCaseHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.testHandler = null;
        this.blockHandler = null;
    }
    handle(node) {
        super.handle(node);
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
    handle(node) {
        var _a;
        super.handle(node);
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

/***/ "./src/analyzer/semantic/statements/controls/whileHandler.ts":
/*!*******************************************************************!*\
  !*** ./src/analyzer/semantic/statements/controls/whileHandler.ts ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WhileLoopStatementHandler = void 0;
const handler_1 = __webpack_require__(/*! ../../common/handler */ "./src/analyzer/semantic/common/handler.ts");
class WhileLoopStatementHandler extends handler_1.Handler {
    constructor() {
        super(...arguments);
        this.conditionHandler = null;
        this.blockHandler = null;
    }
    handle(node) {
        var _a, _b;
        super.handle(node);
        this.conditionHandler = handler_1.Handler.handle(node.cond, this.context);
        this.blockHandler = handler_1.Handler.handle(node.block, this.context);
        this.value = {
            type: "WhileLoopStatement",
            condition: (_a = this.conditionHandler) === null || _a === void 0 ? void 0 : _a.value,
            block: (_b = this.blockHandler) === null || _b === void 0 ? void 0 : _b.value
        };
    }
}
exports.WhileLoopStatementHandler = WhileLoopStatementHandler;
handler_1.Handler.registerHandler("WhileLoop", WhileLoopStatementHandler);


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
    handle(node) {
        var _a;
        super.handle(node);
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
    handle(node) {
        super.handle(node);
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
    handle(node) {
        super.handle(node);
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
    handle(node) {
        var _a, _b, _c;
        super.handle(node);
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
    handle(node) {
        super.handle(node);
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
    handle(node) {
        var _a;
        super.handle(node);
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

/***/ "./src/analyzer/zrSemanticAnalyzer.ts":
/*!********************************************!*\
  !*** ./src/analyzer/zrSemanticAnalyzer.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ZrSemanticAnalyzer = void 0;
const handler_1 = __webpack_require__(/*! ./semantic/common/handler */ "./src/analyzer/semantic/common/handler.ts");
__webpack_require__(/*! ./semantic/index */ "./src/analyzer/semantic/index.ts");
class ZrSemanticAnalyzer {
    constructor(context) {
        this.context = context;
    }
    analyze() {
        this.scriptHandler = handler_1.Handler.handle(this.context.ast, this.context);
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
        this.compilingDirectory = info.compilingDirectory;
        this.fileRelativePath = info.fileRelativePath;
        this.encoding = info.encoding;
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
})(ZrErrorCode || (exports.ZrErrorCode = ZrErrorCode = {}));


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
        var _a;
        const range = context.syntaxErrorRange;
        const location = (_a = context.syntaxErrorRange) === null || _a === void 0 ? void 0 : _a.start;
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
        var peg$c9 = "fn";
        var peg$c10 = "if";
        var peg$c11 = "else";
        var peg$c12 = "switch";
        var peg$c13 = "while";
        var peg$c14 = "for";
        var peg$c15 = "break";
        var peg$c16 = "continue";
        var peg$c17 = "return";
        var peg$c18 = "super";
        var peg$c19 = "new";
        var peg$c20 = "set";
        var peg$c21 = "get";
        var peg$c22 = "static";
        var peg$c23 = "in";
        var peg$c24 = "?";
        var peg$c25 = ":";
        var peg$c26 = ";";
        var peg$c27 = ",";
        var peg$c28 = ".";
        var peg$c29 = "~";
        var peg$c30 = "@";
        var peg$c31 = "#";
        var peg$c32 = "$";
        var peg$c33 = "(";
        var peg$c34 = ")";
        var peg$c35 = "{";
        var peg$c36 = "}";
        var peg$c37 = "[";
        var peg$c38 = "]";
        var peg$c39 = "=";
        var peg$c40 = "+=";
        var peg$c41 = "-=";
        var peg$c42 = "*=";
        var peg$c43 = "/=";
        var peg$c44 = "%=";
        var peg$c45 = "==";
        var peg$c46 = "!=";
        var peg$c47 = "!";
        var peg$c48 = "<";
        var peg$c49 = "<=";
        var peg$c50 = ">";
        var peg$c51 = ">=";
        var peg$c52 = "+";
        var peg$c53 = "-";
        var peg$c54 = "*";
        var peg$c55 = "/";
        var peg$c56 = "%";
        var peg$c57 = "&&";
        var peg$c58 = "||";
        var peg$c59 = "=>";
        var peg$c60 = "true";
        var peg$c61 = "false";
        var peg$c62 = "0x";
        var peg$c63 = "0";
        var peg$c64 = "'";
        var peg$c65 = "\"";
        var peg$c66 = "null";
        var peg$c67 = "//";
        var peg$c68 = "/*";
        var peg$c69 = "*/";
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
        var peg$e11 = peg$literalExpectation("fn", false);
        var peg$e12 = peg$literalExpectation("if", false);
        var peg$e13 = peg$literalExpectation("else", false);
        var peg$e14 = peg$literalExpectation("switch", false);
        var peg$e15 = peg$literalExpectation("while", false);
        var peg$e16 = peg$literalExpectation("for", false);
        var peg$e17 = peg$literalExpectation("break", false);
        var peg$e18 = peg$literalExpectation("continue", false);
        var peg$e19 = peg$literalExpectation("return", false);
        var peg$e20 = peg$literalExpectation("super", false);
        var peg$e21 = peg$literalExpectation("new", false);
        var peg$e22 = peg$literalExpectation("set", false);
        var peg$e23 = peg$literalExpectation("get", false);
        var peg$e24 = peg$literalExpectation("static", false);
        var peg$e25 = peg$literalExpectation("in", false);
        var peg$e26 = peg$literalExpectation("?", false);
        var peg$e27 = peg$literalExpectation(":", false);
        var peg$e28 = peg$literalExpectation(";", false);
        var peg$e29 = peg$literalExpectation(",", false);
        var peg$e30 = peg$literalExpectation(".", false);
        var peg$e31 = peg$literalExpectation("~", false);
        var peg$e32 = peg$literalExpectation("@", false);
        var peg$e33 = peg$literalExpectation("#", false);
        var peg$e34 = peg$literalExpectation("$", false);
        var peg$e35 = peg$literalExpectation("(", false);
        var peg$e36 = peg$literalExpectation(")", false);
        var peg$e37 = peg$literalExpectation("{", false);
        var peg$e38 = peg$literalExpectation("}", false);
        var peg$e39 = peg$literalExpectation("[", false);
        var peg$e40 = peg$literalExpectation("]", false);
        var peg$e41 = peg$literalExpectation("=", false);
        var peg$e42 = peg$literalExpectation("+=", false);
        var peg$e43 = peg$literalExpectation("-=", false);
        var peg$e44 = peg$literalExpectation("*=", false);
        var peg$e45 = peg$literalExpectation("/=", false);
        var peg$e46 = peg$literalExpectation("%=", false);
        var peg$e47 = peg$literalExpectation("==", false);
        var peg$e48 = peg$literalExpectation("!=", false);
        var peg$e49 = peg$literalExpectation("!", false);
        var peg$e50 = peg$literalExpectation("<", false);
        var peg$e51 = peg$literalExpectation("<=", false);
        var peg$e52 = peg$literalExpectation(">", false);
        var peg$e53 = peg$literalExpectation(">=", false);
        var peg$e54 = peg$literalExpectation("+", false);
        var peg$e55 = peg$literalExpectation("-", false);
        var peg$e56 = peg$literalExpectation("*", false);
        var peg$e57 = peg$literalExpectation("/", false);
        var peg$e58 = peg$literalExpectation("%", false);
        var peg$e59 = peg$literalExpectation("&&", false);
        var peg$e60 = peg$literalExpectation("||", false);
        var peg$e61 = peg$literalExpectation("=>", false);
        var peg$e62 = peg$literalExpectation("true", false);
        var peg$e63 = peg$literalExpectation("false", false);
        var peg$e64 = peg$classExpectation([["1", "9"]], false, false);
        var peg$e65 = peg$classExpectation([["0", "9"]], false, false);
        var peg$e66 = peg$literalExpectation("0x", false);
        var peg$e67 = peg$classExpectation([["0", "9"], ["a", "f"], ["A", "F"]], false, false);
        var peg$e68 = peg$literalExpectation("0", false);
        var peg$e69 = peg$classExpectation([["0", "7"]], false, false);
        var peg$e70 = peg$literalExpectation("'", false);
        var peg$e71 = peg$classExpectation(["\"", "\n", "\r", "\""], false, false);
        var peg$e72 = peg$anyExpectation();
        var peg$e73 = peg$literalExpectation("\"", false);
        var peg$e74 = peg$literalExpectation("null", false);
        var peg$e75 = peg$classExpectation(["e", "E"], false, false);
        var peg$e76 = peg$classExpectation(["+", "-"], false, false);
        var peg$e77 = peg$literalExpectation("//", false);
        var peg$e78 = peg$classExpectation(["\n", "\r"], false, false);
        var peg$e79 = peg$literalExpectation("/*", false);
        var peg$e80 = peg$literalExpectation("*/", false);
        var peg$e81 = peg$classExpectation([" ", "\t", "\n", "\r"], false, false);
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
        var peg$f4 = function (access, staticSymbol, meta, params, body) {
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
                body,
                // @ts-ignore
                access,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f5 = function (access, staticSymbol, name, typePart, initPart) {
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
        var peg$f6 = function (decorator, access, staticSymbol, name, generic, params, returnPart, body) {
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
                returnType: returnPart ? returnPart[2] : null,
                // @ts-ignore
                body: body,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f7 = function (decorator, name, generic, superPart, members) {
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
        var peg$f8 = function (dec) {
            // @ts-ignore
            return dec;
        }; // @ts-ignore
        var peg$f9 = function (access, staticSymbol, meta, params, argsPart, body) {
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
                superArgs: argsPart ? argsPart[2] : [],
                // @ts-ignore
                body: body,
                // @ts-ignore
                access,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f10 = function (decorator, access, staticSymbol, name, typePart, initPart) {
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
        var peg$f11 = function (decorator, access, staticSymbol, name, generic, params, returnPart, body) {
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
                returnType: returnPart ? returnPart[2] : null,
                // @ts-ignore
                body,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f12 = function (decorator, access, staticSymbol, modifier) {
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
        var peg$f13 = function (name, returnPart, body) {
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
        var peg$f14 = function (name, param, paramTypePart, body) {
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
        var peg$f15 = function (name, generic, extendsPart, members) {
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
        var peg$f16 = function (dec) {
            // @ts-ignore
            return dec;
        }; // @ts-ignore
        var peg$f17 = function (access, name, generic, params, returnPart) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "InterfaceMethodSignature",
                // @ts-ignore
                name,
                // @ts-ignore
                params: params || [],
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
        var peg$f18 = function (access, propertyType, name, typePart) {
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
        var peg$f19 = function () {
            return "get_set";
        }; // @ts-ignore
        var peg$f20 = function () {
            return "get_set";
        }; // @ts-ignore
        var peg$f21 = function () {
            return "get";
        }; // @ts-ignore
        var peg$f22 = function () {
            return "set";
        }; // @ts-ignore
        var peg$f23 = function (access, name, typePart) {
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
        var peg$f24 = function (name, baseTypePart, members) {
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
        var peg$f25 = function (key, valuePart) {
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
        var peg$f26 = function (params) {
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
        var peg$f27 = function (dec) {
            // Block 本身也是语句（如 if 的 then 块） 
            // @ts-ignore
            return dec;
        }; // @ts-ignore
        var peg$f28 = function (expr) {
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
        var peg$f29 = function (pattern, typePart, value) {
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
        var peg$f30 = function (expr) {
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
        var peg$f31 = function (ctrl, expr) {
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
        var peg$f32 = function (cond, thenBlock, elseBlock) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "IfStatement",
                // @ts-ignore
                condition: cond,
                // @ts-ignore
                then: thenBlock,
                // @ts-ignore
                else: elseBlock ? elseBlock[3] : null,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f33 = function (expr, cases, defaultCase) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "SwitchStatement",
                // @ts-ignore
                expr,
                // @ts-ignore
                cases,
                // @ts-ignore
                default: defaultCase,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f34 = function (value, block) {
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
        var peg$f35 = function (block) {
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
        var peg$f36 = function (cond, block) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "WhileLoop",
                // @ts-ignore
                cond,
                // @ts-ignore
                block,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f37 = function (init, cond, step, block) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "ForLoop",
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
        var peg$f38 = function (pattern, typePart, expr, block) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "ForeachLoop",
                // @ts-ignore
                pattern,
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
        var peg$f39 = function (statements) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "Block",
                // @ts-ignore
                body: statements.filter(s => s !== null), // 过滤空白和注释
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f40 = function (exp) {
            // @ts-ignore
            return exp;
        }; // @ts-ignore
        var peg$f41 = function (left, op, right) {
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
        var peg$f42 = function (test, consequent, alternate) {
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
        var peg$f43 = function (left, parts) {
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
        var peg$f44 = function (left, parts) {
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
        var peg$f45 = function (left, parts) {
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
        var peg$f46 = function (left, parts) {
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
        var peg$f47 = function (left, parts) {
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
        var peg$f48 = function (left, parts) {
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
        var peg$f49 = function (op, argument) {
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
        var peg$f50 = function (property, members) {
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
        var peg$f51 = function (property) {
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
        var peg$f52 = function (property) {
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
        var peg$f53 = function (args) {
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
        var peg$f54 = function (value) {
            return { type: "ValueLiteral", value, location: location() };
        }; // @ts-ignore
        var peg$f55 = function (value) {
            return { type: "IdentifierLiteral", value, location: location() };
        }; // @ts-ignore
        var peg$f56 = function (expr) {
            return expr;
        }; // @ts-ignore
        var peg$f57 = function (elements) {
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
        var peg$f58 = function (pairs) {
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
        var peg$f59 = function (key, value) {
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
        var peg$f60 = function (expr) {
            return expr;
        }; // @ts-ignore
        var peg$f61 = function (args, block) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "LambdaExpression",
                // @ts-ignore
                args: args ? args : [],
                // @ts-ignore
                block,
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f62 = function (condition, thenExpr, elseExpr) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "IfExpression",
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
        var peg$f63 = function (expr, cases, defaultCase) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "SwitchExpression",
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
        var peg$f64 = function () {
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
        var peg$f65 = function (decorator, name, generic, params, returnPart, body) {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "FunctionDeclaration",
                // @ts-ignore
                name,
                // @ts-ignore
                params: params || [],
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
        var peg$f66 = function (name, dimensions) {
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
        var peg$f67 = function (name, params) {
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
        var peg$f68 = function (types) {
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
        var peg$f69 = function (name, typePart, defaultValuePart) {
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
        var peg$f70 = function (head, tail) {
            // @ts-ignore
            return [head].concat(tail.map(t => t[2]));
        }; // @ts-ignore
        var peg$f71 = function (head, tail) {
            // @ts-ignore
            return [head].concat(tail.map(t => t[2]));
        }; // @ts-ignore
        var peg$f72 = function (head, tail) {
            // @ts-ignore
            return [head].concat(tail.map(t => t[2]));
        }; // @ts-ignore
        var peg$f73 = function (name) {
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
        var peg$f74 = function (expr) {
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
        var peg$f75 = function (keys) {
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
        var peg$f76 = function (keys) {
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
        var peg$f77 = function (head, tail) {
            // @ts-ignore
            return [head].concat(tail.map(t => t[2]));
        }; // @ts-ignore
        var peg$f78 = function () {
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
        var peg$f79 = function () {
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
        var peg$f80 = function () {
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
        var peg$f81 = function () {
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
        var peg$f82 = function () {
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
        var peg$f83 = function (ch) {
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
        var peg$f84 = function (str) {
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
        var peg$f85 = function () {
            // @ts-ignore
            return {
                // @ts-ignore
                type: "Null",
                // @ts-ignore
                location: location()
            };
        }; // @ts-ignore
        var peg$f86 = function () {
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
        var peg$f87 = function () {
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
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13;
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
                            s0 = peg$f4(s1, s3, s5, s9, s13);
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
                        s0 = peg$f5(s1, s3, s7, s9, s11);
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
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15, s16, s17, s18, s19, s20;
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
                    s15 = peg$parseRPAREN();
                    // @ts-ignore
                    if (s15 !== peg$FAILED) {
                        // @ts-ignore
                        s16 = peg$parse_();
                        // @ts-ignore
                        s17 = peg$currPos;
                        // @ts-ignore
                        s18 = peg$parseCOLON();
                        // @ts-ignore
                        if (s18 !== peg$FAILED) {
                            // @ts-ignore
                            s19 = peg$parse_();
                            // @ts-ignore
                            s20 = peg$parseType();
                            // @ts-ignore
                            if (s20 !== peg$FAILED) {
                                // @ts-ignore
                                s18 = [s18, s19, s20];
                                // @ts-ignore
                                s17 = s18;
                                // @ts-ignore
                            }
                            else {
                                // @ts-ignore
                                peg$currPos = s17;
                                // @ts-ignore
                                s17 = peg$FAILED;
                            }
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s17;
                            // @ts-ignore
                            s17 = peg$FAILED;
                        }
                        // @ts-ignore
                        if (s17 === peg$FAILED) {
                            // @ts-ignore
                            s17 = null;
                        }
                        // @ts-ignore
                        s18 = peg$parse_();
                        // @ts-ignore
                        s19 = peg$parseBlock();
                        // @ts-ignore
                        if (s19 !== peg$FAILED) {
                            // @ts-ignore
                            peg$savedPos = s0;
                            // @ts-ignore
                            s0 = peg$f6(s1, s3, s5, s7, s9, s13, s17, s19);
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
                            s0 = peg$f7(s1, s4, s6, s8, s11);
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
                s0 = peg$f8(s2);
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
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15, s16, s17, s18, s19, s20, s21;
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
                    s11 = peg$parseRPAREN();
                    // @ts-ignore
                    if (s11 !== peg$FAILED) {
                        // @ts-ignore
                        s12 = peg$parse_();
                        // @ts-ignore
                        s13 = peg$currPos;
                        // @ts-ignore
                        s14 = peg$parse_();
                        // @ts-ignore
                        s15 = peg$parseSUPER();
                        // @ts-ignore
                        if (s15 !== peg$FAILED) {
                            // @ts-ignore
                            s16 = peg$parse_();
                            // @ts-ignore
                            s17 = peg$parseLPAREN();
                            // @ts-ignore
                            if (s17 !== peg$FAILED) {
                                // @ts-ignore
                                s18 = peg$parse_();
                                // @ts-ignore
                                s19 = peg$parseArgumentList();
                                // @ts-ignore
                                if (s19 === peg$FAILED) {
                                    // @ts-ignore
                                    s19 = null;
                                }
                                // @ts-ignore
                                s20 = peg$parse_();
                                // @ts-ignore
                                s21 = peg$parseRPAREN();
                                // @ts-ignore
                                if (s21 !== peg$FAILED) {
                                    // @ts-ignore
                                    s14 = [s14, s15, s16, s17, s18, s19, s20, s21];
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
                        s15 = peg$parseBlock();
                        // @ts-ignore
                        if (s15 !== peg$FAILED) {
                            // @ts-ignore
                            peg$savedPos = s0;
                            // @ts-ignore
                            s0 = peg$f9(s1, s3, s5, s9, s13, s15);
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
                        s0 = peg$f10(s1, s3, s5, s9, s11, s13);
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
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15, s16, s17, s18, s19, s20;
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
                    s15 = peg$parseRPAREN();
                    // @ts-ignore
                    if (s15 !== peg$FAILED) {
                        // @ts-ignore
                        s16 = peg$parse_();
                        // @ts-ignore
                        s17 = peg$currPos;
                        // @ts-ignore
                        s18 = peg$parseCOLON();
                        // @ts-ignore
                        if (s18 !== peg$FAILED) {
                            // @ts-ignore
                            s19 = peg$parse_();
                            // @ts-ignore
                            s20 = peg$parseType();
                            // @ts-ignore
                            if (s20 !== peg$FAILED) {
                                // @ts-ignore
                                s18 = [s18, s19, s20];
                                // @ts-ignore
                                s17 = s18;
                                // @ts-ignore
                            }
                            else {
                                // @ts-ignore
                                peg$currPos = s17;
                                // @ts-ignore
                                s17 = peg$FAILED;
                            }
                            // @ts-ignore
                        }
                        else {
                            // @ts-ignore
                            peg$currPos = s17;
                            // @ts-ignore
                            s17 = peg$FAILED;
                        }
                        // @ts-ignore
                        if (s17 === peg$FAILED) {
                            // @ts-ignore
                            s17 = null;
                        }
                        // @ts-ignore
                        s18 = peg$parse_();
                        // @ts-ignore
                        s19 = peg$parseBlock();
                        // @ts-ignore
                        if (s19 !== peg$FAILED) {
                            // @ts-ignore
                            peg$savedPos = s0;
                            // @ts-ignore
                            s0 = peg$f11(s1, s3, s5, s7, s9, s13, s17, s19);
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
                s0 = peg$f12(s1, s2, s4, s6);
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
                        s0 = peg$f13(s3, s5, s7);
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
                                    s0 = peg$f14(s3, s6, s8, s11);
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
                            s0 = peg$f15(s3, s5, s7, s11);
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
                s0 = peg$f16(s2);
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
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15, s16;
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
                    s11 = peg$parseRPAREN();
                    // @ts-ignore
                    if (s11 !== peg$FAILED) {
                        // @ts-ignore
                        s12 = peg$parse_();
                        // @ts-ignore
                        s13 = peg$currPos;
                        // @ts-ignore
                        s14 = peg$parseCOLON();
                        // @ts-ignore
                        if (s14 !== peg$FAILED) {
                            // @ts-ignore
                            s15 = peg$parse_();
                            // @ts-ignore
                            s16 = peg$parseType();
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
                            s0 = peg$f17(s1, s3, s5, s9, s13);
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
                    s0 = peg$f18(s1, s3, s5, s7);
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
                    s0 = peg$f19();
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
                        s0 = peg$f20();
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
                        s1 = peg$f21();
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
                            s1 = peg$f22();
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
                        s0 = peg$f23(s1, s5, s6);
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
                                s0 = peg$f24(s3, s5, s9);
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
                s0 = peg$f25(s2, s4);
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
                        s0 = peg$f26(s3);
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
                                s2 = peg$parseBlock();
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
                s0 = peg$f27(s2);
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
                    s0 = peg$f28(s1);
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
                                s0 = peg$f29(s3, s4, s8);
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
                    s0 = peg$f30(s3);
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
                    s0 = peg$f31(s1, s3);
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
                                        s14 = peg$parseIfStatement();
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
                                s0 = peg$f32(s5, s9, s10);
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
        function peg$parseSwitchStatement() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13;
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
                        s9 = peg$parseLBRACE();
                        // @ts-ignore
                        if (s9 !== peg$FAILED) {
                            // @ts-ignore
                            s10 = [];
                            // @ts-ignore
                            s11 = peg$parseSwitchCase();
                            // @ts-ignore
                            while (s11 !== peg$FAILED) {
                                // @ts-ignore
                                s10.push(s11);
                                // @ts-ignore
                                s11 = peg$parseSwitchCase();
                            }
                            // @ts-ignore
                            s11 = peg$parseSwitchDefault();
                            // @ts-ignore
                            if (s11 === peg$FAILED) {
                                // @ts-ignore
                                s11 = null;
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
                                s0 = peg$f33(s5, s10, s11);
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
                            s0 = peg$f34(s4, s8);
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
                        s0 = peg$f35(s6);
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
                                s0 = peg$f36(s5, s9);
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
                                    s0 = peg$f37(s5, s7, s9, s13);
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
                                            s0 = peg$f38(s7, s8, s12, s15);
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
                    s0 = peg$f39(s3);
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
                s0 = peg$f40(s2);
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
                        s0 = peg$f41(s1, s3, s5);
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
                                s0 = peg$f42(s1, s5, s9);
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
                s0 = peg$f43(s1, s2);
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
                s0 = peg$f44(s1, s2);
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
                s0 = peg$f45(s1, s2);
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
                s0 = peg$f46(s1, s2);
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
                s0 = peg$f47(s1, s2);
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
                s0 = peg$f48(s1, s2);
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
                    s0 = peg$f49(s1, s3);
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
                    s0 = peg$f50(s1, s3);
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
                    s0 = peg$f51(s3);
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
                            s0 = peg$f52(s3);
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
                            s0 = peg$f53(s3);
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
                s1 = peg$f54(s1);
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
                                    s0 = peg$currPos;
                                    // @ts-ignore
                                    s1 = peg$parseIDENTIFIER();
                                    // @ts-ignore
                                    if (s1 !== peg$FAILED) {
                                        // @ts-ignore
                                        peg$savedPos = s0;
                                        // @ts-ignore
                                        s1 = peg$f55(s1);
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
                                                    s0 = peg$f56(s3);
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
                    s0 = peg$f57(s3);
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
                        s0 = peg$f59(s1, s5);
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
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;
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
                s5 = peg$parseRPAREN();
                // @ts-ignore
                if (s5 !== peg$FAILED) {
                    // @ts-ignore
                    s6 = peg$parse_();
                    // @ts-ignore
                    s7 = peg$parseRIGHT_ARROW();
                    // @ts-ignore
                    if (s7 !== peg$FAILED) {
                        // @ts-ignore
                        s8 = peg$parse_();
                        // @ts-ignore
                        s9 = peg$parseBlock();
                        // @ts-ignore
                        if (s9 !== peg$FAILED) {
                            // @ts-ignore
                            s10 = peg$parse_();
                            // @ts-ignore
                            peg$savedPos = s0;
                            // @ts-ignore
                            s0 = peg$f61(s3, s9);
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
        function peg$parseIfExpression() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;
            // @ts-ignore
            s0 = peg$currPos;
            // @ts-ignore
            s1 = peg$parseIF();
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
                    s5 = peg$parseBlock();
                    // @ts-ignore
                    if (s5 !== peg$FAILED) {
                        // @ts-ignore
                        s6 = peg$currPos;
                        // @ts-ignore
                        s7 = peg$parse_();
                        // @ts-ignore
                        s8 = peg$parseELSE();
                        // @ts-ignore
                        if (s8 !== peg$FAILED) {
                            // @ts-ignore
                            s9 = peg$parse_();
                            // @ts-ignore
                            s10 = peg$parseBlock();
                            // @ts-ignore
                            if (s10 === peg$FAILED) {
                                // @ts-ignore
                                s10 = peg$parseIfExpression();
                            }
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
                        peg$savedPos = s0;
                        // @ts-ignore
                        s0 = peg$f62(s3, s5, s6);
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
                                s0 = peg$f63(s5, s11, s12);
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
            s0 = peg$parseLESS_THAN();
            // @ts-ignore
            if (s0 === peg$FAILED) {
                // @ts-ignore
                s0 = peg$parseLESS_THAN_EQUALS();
                // @ts-ignore
                if (s0 === peg$FAILED) {
                    // @ts-ignore
                    s0 = peg$parseGREATER_THAN();
                    // @ts-ignore
                    if (s0 === peg$FAILED) {
                        // @ts-ignore
                        s0 = peg$parseGREATER_THAN_EQUALS();
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
                s1 = peg$f64();
            }
            // @ts-ignore
            s0 = s1;
            // @ts-ignore
            return s0;
        }
        // @ts-ignore
        function peg$parseFunctionDeclaration() {
            // @ts-ignore
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15;
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
                    s9 = peg$parseParameterList();
                    // @ts-ignore
                    if (s9 === peg$FAILED) {
                        // @ts-ignore
                        s9 = null;
                    }
                    // @ts-ignore
                    s10 = peg$parseRPAREN();
                    // @ts-ignore
                    if (s10 !== peg$FAILED) {
                        // @ts-ignore
                        s11 = peg$parse_();
                        // @ts-ignore
                        s12 = peg$currPos;
                        // @ts-ignore
                        s13 = peg$parseCOLON();
                        // @ts-ignore
                        if (s13 !== peg$FAILED) {
                            // @ts-ignore
                            s14 = peg$parse_();
                            // @ts-ignore
                            s15 = peg$parseType();
                            // @ts-ignore
                            if (s15 !== peg$FAILED) {
                                // @ts-ignore
                                s13 = [s13, s14, s15];
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
                        if (s12 === peg$FAILED) {
                            // @ts-ignore
                            s12 = null;
                        }
                        // @ts-ignore
                        s13 = peg$parse_();
                        // @ts-ignore
                        s14 = peg$parseBlock();
                        // @ts-ignore
                        if (s14 !== peg$FAILED) {
                            // @ts-ignore
                            peg$savedPos = s0;
                            // @ts-ignore
                            s0 = peg$f65(s2, s4, s6, s9, s12, s14);
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
                s0 = peg$f66(s1, s3);
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
                s0 = peg$f69(s1, s3, s5);
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
                s0 = peg$f70(s1, s3);
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
                s0 = peg$f71(s1, s3);
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
                s0 = peg$f72(s1, s3);
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
                    s0 = peg$f73(s3);
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
                        s0 = peg$f74(s3);
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
                        s0 = peg$f75(s3);
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
                        s0 = peg$f76(s3);
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
                s0 = peg$f77(s1, s3);
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
                s0 = peg$f78();
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
        function peg$parseFN() {
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
        function peg$parseIF() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 2) === peg$c10) {
                // @ts-ignore
                s0 = peg$c10;
                // @ts-ignore
                peg$currPos += 2;
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
        function peg$parseELSE() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 4) === peg$c11) {
                // @ts-ignore
                s0 = peg$c11;
                // @ts-ignore
                peg$currPos += 4;
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
        function peg$parseSWITCH() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 6) === peg$c12) {
                // @ts-ignore
                s0 = peg$c12;
                // @ts-ignore
                peg$currPos += 6;
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
        function peg$parseWHILE() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 5) === peg$c13) {
                // @ts-ignore
                s0 = peg$c13;
                // @ts-ignore
                peg$currPos += 5;
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
        function peg$parseFOR() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 3) === peg$c14) {
                // @ts-ignore
                s0 = peg$c14;
                // @ts-ignore
                peg$currPos += 3;
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
        function peg$parseBREAK() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 5) === peg$c15) {
                // @ts-ignore
                s0 = peg$c15;
                // @ts-ignore
                peg$currPos += 5;
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
        function peg$parseCONTINUE() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 8) === peg$c16) {
                // @ts-ignore
                s0 = peg$c16;
                // @ts-ignore
                peg$currPos += 8;
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
        function peg$parseRETURN() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 6) === peg$c17) {
                // @ts-ignore
                s0 = peg$c17;
                // @ts-ignore
                peg$currPos += 6;
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
        function peg$parseSUPER() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 5) === peg$c18) {
                // @ts-ignore
                s0 = peg$c18;
                // @ts-ignore
                peg$currPos += 5;
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
        function peg$parseNEW() {
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
        function peg$parseSET() {
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
        function peg$parseGET() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 3) === peg$c21) {
                // @ts-ignore
                s0 = peg$c21;
                // @ts-ignore
                peg$currPos += 3;
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
        function peg$parseSTATIC() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 6) === peg$c22) {
                // @ts-ignore
                s0 = peg$c22;
                // @ts-ignore
                peg$currPos += 6;
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
        function peg$parseIN() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 2) === peg$c23) {
                // @ts-ignore
                s0 = peg$c23;
                // @ts-ignore
                peg$currPos += 2;
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
        function peg$parseQUESTIONMARK() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 63) {
                // @ts-ignore
                s0 = peg$c24;
                // @ts-ignore
                peg$currPos++;
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
        function peg$parseCOLON() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 58) {
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
        function peg$parseSEMICOLON() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 59) {
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
        function peg$parseCOMMA() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 44) {
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
        function peg$parseDOT() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 46) {
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
        function peg$parseTILDE() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 126) {
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
        function peg$parseAT() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 64) {
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
        function peg$parseSHARP() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 35) {
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
        function peg$parseDOLLAR() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 36) {
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
        function peg$parseLPAREN() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 40) {
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
        function peg$parseRPAREN() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 41) {
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
        function peg$parseLBRACE() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 123) {
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
        function peg$parseRBRACE() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 125) {
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
        function peg$parseLBRACKET() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 91) {
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
        function peg$parseRBRACKET() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 93) {
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
        function peg$parseEQUALS() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 61) {
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
        function peg$parsePLUS_EQUALS() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 2) === peg$c40) {
                // @ts-ignore
                s0 = peg$c40;
                // @ts-ignore
                peg$currPos += 2;
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
        function peg$parseMINUS_EQUALS() {
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
        function peg$parseSTAR_EQUALS() {
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
        function peg$parseSLASH_EQUALS() {
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
        function peg$parsePERCENT_EQUALS() {
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
        function peg$parseDOUBLE_EQUALS() {
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
        function peg$parseBANG_EQUALS() {
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
        function peg$parseBANG() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 33) {
                // @ts-ignore
                s0 = peg$c47;
                // @ts-ignore
                peg$currPos++;
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
        function peg$parseLESS_THAN() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 60) {
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
        function peg$parseLESS_THAN_EQUALS() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 2) === peg$c49) {
                // @ts-ignore
                s0 = peg$c49;
                // @ts-ignore
                peg$currPos += 2;
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
        function peg$parseGREATER_THAN() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 62) {
                // @ts-ignore
                s0 = peg$c50;
                // @ts-ignore
                peg$currPos++;
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
        function peg$parseGREATER_THAN_EQUALS() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 2) === peg$c51) {
                // @ts-ignore
                s0 = peg$c51;
                // @ts-ignore
                peg$currPos += 2;
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
        function peg$parsePLUS() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 43) {
                // @ts-ignore
                s0 = peg$c52;
                // @ts-ignore
                peg$currPos++;
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
        function peg$parseMINUS() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 45) {
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
        function peg$parseSTAR() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 42) {
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
        function peg$parseSLASH() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 47) {
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
        function peg$parsePERCENT() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.charCodeAt(peg$currPos) === 37) {
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
        function peg$parseAMPERSAND_AMPERSAND() {
            // @ts-ignore
            var s0;
            // @ts-ignore
            if (input.substr(peg$currPos, 2) === peg$c57) {
                // @ts-ignore
                s0 = peg$c57;
                // @ts-ignore
                peg$currPos += 2;
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
        function peg$parsePIPE_PIPE() {
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
        function peg$parseRIGHT_ARROW() {
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
            if (input.substr(peg$currPos, 4) === peg$c60) {
                // @ts-ignore
                s1 = peg$c60;
                // @ts-ignore
                peg$currPos += 4;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s1 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e62);
                }
            }
            // @ts-ignore
            if (s1 === peg$FAILED) {
                // @ts-ignore
                if (input.substr(peg$currPos, 5) === peg$c61) {
                    // @ts-ignore
                    s1 = peg$c61;
                    // @ts-ignore
                    peg$currPos += 5;
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
            }
            // @ts-ignore
            if (s1 !== peg$FAILED) {
                // @ts-ignore
                peg$savedPos = s0;
                // @ts-ignore
                s1 = peg$f79();
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
                    peg$fail(peg$e64);
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
                        peg$fail(peg$e65);
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
                            peg$fail(peg$e65);
                        }
                    }
                }
                // @ts-ignore
                peg$savedPos = s0;
                // @ts-ignore
                s0 = peg$f80();
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
            if (input.substr(peg$currPos, 2) === peg$c62) {
                // @ts-ignore
                s1 = peg$c62;
                // @ts-ignore
                peg$currPos += 2;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s1 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e66);
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
                        peg$fail(peg$e67);
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
                                peg$fail(peg$e67);
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
                    s0 = peg$f81();
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
                s1 = peg$c63;
                // @ts-ignore
                peg$currPos++;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s1 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e68);
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
                        peg$fail(peg$e69);
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
                            peg$fail(peg$e69);
                        }
                    }
                }
                // @ts-ignore
                peg$savedPos = s0;
                // @ts-ignore
                s0 = peg$f82();
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
                    peg$fail(peg$e70);
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
                        peg$fail(peg$e71);
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
                            peg$fail(peg$e72);
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
                        s3 = peg$c64;
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
                    if (s3 !== peg$FAILED) {
                        // @ts-ignore
                        peg$savedPos = s0;
                        // @ts-ignore
                        s0 = peg$f83(s2);
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
                    peg$fail(peg$e73);
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
                        peg$fail(peg$e71);
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
                            peg$fail(peg$e72);
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
                            peg$fail(peg$e71);
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
                                peg$fail(peg$e72);
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
                        peg$fail(peg$e73);
                    }
                }
                // @ts-ignore
                if (s3 !== peg$FAILED) {
                    // @ts-ignore
                    peg$savedPos = s0;
                    // @ts-ignore
                    s0 = peg$f84(s2);
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
            if (input.substr(peg$currPos, 4) === peg$c66) {
                // @ts-ignore
                s1 = peg$c66;
                // @ts-ignore
                peg$currPos += 4;
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
                peg$savedPos = s0;
                // @ts-ignore
                s1 = peg$f85();
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
                    peg$fail(peg$e65);
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
                            peg$fail(peg$e65);
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
                    s3 = peg$c28;
                    // @ts-ignore
                    peg$currPos++;
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    s3 = peg$FAILED;
                    // @ts-ignore
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e30);
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
                            peg$fail(peg$e65);
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
                                peg$fail(peg$e65);
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
                    s2 = peg$c28;
                    // @ts-ignore
                    peg$currPos++;
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    s2 = peg$FAILED;
                    // @ts-ignore
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e30);
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
                            peg$fail(peg$e65);
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
                                    peg$fail(peg$e65);
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
                        peg$fail(peg$e75);
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
                            peg$fail(peg$e76);
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
                            peg$fail(peg$e65);
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
                                    peg$fail(peg$e65);
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
                s0 = peg$f86();
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
            if (input.substr(peg$currPos, 2) === peg$c67) {
                // @ts-ignore
                s1 = peg$c67;
                // @ts-ignore
                peg$currPos += 2;
                // @ts-ignore
            }
            else {
                // @ts-ignore
                s1 = peg$FAILED;
                // @ts-ignore
                if (peg$silentFails === 0) {
                    peg$fail(peg$e77);
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
                        peg$fail(peg$e78);
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
                            peg$fail(peg$e72);
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
                            peg$fail(peg$e78);
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
                                peg$fail(peg$e72);
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
                    peg$fail(peg$e79);
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
                if (input.substr(peg$currPos, 2) === peg$c69) {
                    // @ts-ignore
                    s5 = peg$c69;
                    // @ts-ignore
                    peg$currPos += 2;
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    s5 = peg$FAILED;
                    // @ts-ignore
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e80);
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
                            peg$fail(peg$e72);
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
                    if (input.substr(peg$currPos, 2) === peg$c69) {
                        // @ts-ignore
                        s5 = peg$c69;
                        // @ts-ignore
                        peg$currPos += 2;
                        // @ts-ignore
                    }
                    else {
                        // @ts-ignore
                        s5 = peg$FAILED;
                        // @ts-ignore
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e80);
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
                                peg$fail(peg$e72);
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
                if (input.substr(peg$currPos, 2) === peg$c69) {
                    // @ts-ignore
                    s3 = peg$c69;
                    // @ts-ignore
                    peg$currPos += 2;
                    // @ts-ignore
                }
                else {
                    // @ts-ignore
                    s3 = peg$FAILED;
                    // @ts-ignore
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e80);
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
                    peg$fail(peg$e81);
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
                            peg$fail(peg$e81);
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
            s1 = peg$f87();
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

/***/ "./src/utils/utils.ts":
/*!****************************!*\
  !*** ./src/utils/utils.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
__webpack_require__(/*! ./i18n */ "./src/utils/i18n.ts");
__webpack_require__(/*! ./logger */ "./src/utils/logger.ts");


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

module.exports = /*#__PURE__*/JSON.parse('{"commonError":"code:{{errCode}} \\n{{message}}\\n  at {{file}}:{{line}}:{{column}}","commonError2":"code:{{errCode}} \\n{{message}}\\n  at {{file}}","syntaxError":"SyntaxError: {{message}}\\n  from {{fromLine}}:{{fromColumn}} to {{toLine}}:{{toColumn}}","syntaxError2":"SyntaxError: {{message}}","noHandlerError":"There is no handler for {{type}}","parserError":"Parser error: {{message}}"}');

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