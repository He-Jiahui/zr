export type TNullable<T> = T | null;

export type TNonNullable<T> = NonNullable<T>;

export type TMaybeUndefined<T> = T | undefined;

export type TMaybeArray<T> = T | Array<T>;

export type TWritable<T> = {
    -readonly [P in keyof T]: T[P];
};

export type TReadonly<T> = {
    readonly [P in keyof T]: T[P];
};

export type TExpression<T, R extends string> = Extract<T, { type: R }>;
