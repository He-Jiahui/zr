type Exp<T,R extends string> = Extract<T, {type: R}>;
export {Exp};