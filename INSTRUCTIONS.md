# ZR Language Documentation

## Control Statements

### `out` Expression

The `out` statement is used to return a value from a block expression. It is typically used within a block to return a
value to the nearest enclosing block expression.

#### Syntax:

```zr
out <expression>;
```

#### Example:

```zr
var k = {{
    if(Object.type(j) == "array"){
        // out to block expression
        out j.toArray();
    }
    // default out null;
}};
```

### `continue` and `break` in Loop Statements

The `continue` and `break` statements can be used within loop statements to control the flow of the loop. When used in a
loop, they can generate an iterator that can be captured and used later.

#### Syntax:

```zr
for (var <variable> in <expression>) {
    if (<condition>) {
        continue <expression>;
    }
    if (<condition>) {
        break <expression>;
    }
    // default continue null;
}
```

#### Example:

```zr
var j = for(var i in [1, 2, 3, 4, 5]){
    if(i % 2 == 0){
        continue i;
    }
    if(i >= 4){
        break i;
    }
    // default continue null;
};
// result is [2, 4]
```

### Block Expressions

Block expressions are used to group multiple statements together. They can return a value using the `out` statement.

#### Syntax:

```zr
{{
    <statements>
    out <expression>;
}}
```

#### Example:

```zr
var k = {{
    if(Object.type(j) == "array"){
        // out to block expression
        out j.toArray();
    }
    // default out null;
}};
```

## Iterators

Iterators can be generated using `for` loops with `continue` and `break` statements. The result of the loop can be
captured and used as an iterator.

#### Example:

```zr
var j = for(var i in [1, 2, 3, 4, 5]){
    if(i % 2 == 0){
        continue i;
    }
    if(i >= 4){
        break i;
    }
    // default continue null;
};
// result is an enumerator of [2, 4]
```

## Function Declarations

Functions can be declared with parameters, return types, and decorators. They can also have generic types and arguments.

#### Syntax:

```zr
<name>(<parameters>): <return_type> {
    <body>
}
```

#### Example:

```zr
test(): int {
    return 1;
}
```

## Class Declarations

Classes can be declared with fields, methods, and constructors. They can also inherit from other classes and implement
interfaces.

#### Syntax:

```zr
class <name>: <super_class>, <interface> {
    <fields>
    <methods>
    <constructors>
}
```

#### Example:

```zr
class Student: Person, Man {
    pub @constructor(id: string)super(id){
        // constructor body
    }
    pub get a: int {
        return 0;
    }
    pub set a(val: int) {
        // setter body
    }
}
```

## Struct Declarations

Structs are similar to classes but are value types and cannot inherit from other structs.

#### Syntax:

```zr
struct <name> {
    <fields>
    <methods>
    <constructors>
}
```

#### Example:

```zr
struct Vector3 {
    pub var x: float;
    var y: float;
    var z: float = 0;
    pub @constructor(x: float, y: float, z: float) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}
```

## Enum Declarations

Enums can be declared with values and can inherit from basic types like `int`, `string`, `float`, or `bool`.

#### Syntax:

```zr
enum <name>: <type> {
    <values>
}
```

#### Example:

```zr
enum RGBA: string {
    R = "R",
    G = "G",
    B = "B",
    A = "A",
}
```

## Interface Declarations

Interfaces can be declared with methods and fields but cannot contain implementations.

#### Syntax:

```zr
interface <name>: <interface> {
    <fields>
    <methods>
}
```

#### Example:

```zr
interface Man {
    pub var id: string;
    pub var telephone;
    pro var _address: string;
    pub get set address: int;
}
```

## Decorators

Decorators can be used to annotate classes, methods, and properties.

#### Syntax:

```zr
#<decorator_name>#
```

#### Example:

```zr
#singleton#
class Person {
    # header("Person Info") #
    # serializable #
    pub var id: string;
}
```

## Conclusion

This document provides an overview of the ZR language syntax and features. For more detailed information, refer to the
source code and test files provided in the repository.