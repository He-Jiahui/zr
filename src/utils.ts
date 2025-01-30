// 辅助函数（需在生成代码中实现）
export function buildBinaryExpression(left:unknown, rest: string[]) {
    return rest.reduce((acc, [op, right]) => ({ type: "Binary", op, left: acc, right }), left);
}
  
export function buildLogicalExpression(left:unknown, rest: string[]) {
    return rest.reduce((acc, [op, right]) => ({ type: "Logical", op, left: acc, right }), left);
}