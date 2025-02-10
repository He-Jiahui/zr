import type { Expression } from "../../expressions"
import type { BlockType } from "../blockHandler"

export type SwitchStatementType = {
    type: "SwitchStatement",
    cases: SwitchCaseType[],
    default: SwitchDefaultType | null
}

export type SwitchCaseType = {
    type: "SwitchCase",
    test: Expression,
    block: BlockType
}

export type SwitchDefaultType = {
    type: "SwitchDefault",
    block: BlockType
}