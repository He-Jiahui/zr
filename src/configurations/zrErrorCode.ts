export enum ZrErrorCode{

    UnknownError = 0x1000,
    ParserError = 0x2001,
    SyntaxError = 0x2002,
    
    SemanticError = 0x3000,
    NoHandler = 0x3001,
}