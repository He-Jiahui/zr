# Zr 语言快速入门指南

此文档由 `Deepseek-R1`根据语法规则生成。

目前仍然在依据以下目标开发中：

## 语言特性概览

Zr 是一款面向游戏开发的静态类型语言，核心特性包括：

- 值类型 struct 和引用类型 class 双系统
- 零成本抽象的元函数系统
- 基于原型的面向对象设计
- 强类型推导系统
- 支持热更新的虚拟机架构

## 基础语法

### 模块声明

```zr
module "physics"; // 模块名支持字符串格式
module math;      // 或标识符格式
```

### 变量声明

```zr
var a = 10;                  // 类型推导
var b:int = 20;              // 显式类型
var [x, y] = [1, 2];         // 数组解构
var {width, height} = size;  // 对象解构
```

### 结构体（值类型）

```zr
struct Vector3 {
    pub var x:float;
    var y:float = 0;
  
    pub @constructor(x, y) {
        this.x = x;
        this.y = y;
    }
  
    pub static @add(a:Vector3, b:Vector3) {
        return $Vector3(a.x + b.x, a.y + b.y);
    }
}

var v = $Vector3(1.0, 2.0); // 值类型构造
```

### 类（引用类型）

```zr
#singleton#
class GameObject {
    #serializable#
    pub var id:string;
    pri var _position:Vector3;
  
    pub @constructor(id:string) {
        this.id = id;
    }
  
    pub move(delta:Vector3) {
        this._position = Vector3.add(this._position, delta);
    }
}
```

### 接口与继承

```zr
interface Movable {
    pub var speed:float;
    pub move(direction:Vector3);
}

class Player : GameObject, Movable {
    pub var speed:float = 5.0;
  
    pub move(direction) {
        // 实现接口方法
    }
}
```

### 流程控制

```zr
// 带返回值的 if 表达式
var result = if (condition) {
    1; 
} else { 
    2; 
};

// 模式匹配 switch
switch (status) {
    (Status.Running) { /* 处理运行状态 */ }
    (Status.Paused)  { /* 处理暂停状态 */ }
    ()              { /* 默认情况 */ }
}

// 循环结构
for (var i = 0; i < 100; i += 1) {
    // 传统 for 循环
}

for (var item in collection) {
    // foreach 循环
}
```

### 函数系统

```zr
// 普通函数
add(a:int, b:int):int {
    return a + b;
}

// Lambda 表达式
var adder = (a, b) => {
    return a + b;
};

// 元函数（操作符重载）
struct Matrix {
    pub static @mul(a:Matrix, b:Matrix) {
        // 矩阵乘法实现
    }
}
```

### 类型系统

```zr
// 泛型支持
class Container<T> {
    var _data:T;
  
    pub get():T {
        return this._data;
    }
}

// 枚举类型
enum Direction {
    Up = "UP",
    Down;    // 自动推导为 1
    Left;    // 自动推导为 2
    Right;   // 自动推导为 3
}
```

## 高级特性

### 反射系统

```zr
var typeInfo = typeof(Vector3);
for (var field in typeInfo.fields) {
    print(field.name + ": " + field.type);
}

var obj = new GameObject();
var methods = obj.metaFunctions;
```

### 装饰器

```zr
#networked#
class Character {
    #sync#
    pub var health:float = 100;
  
    #clientOnly#
    pub updateAnimation() {
        // 客户端特有逻辑
    }
}
```

### 内存管理

```zr
// 值类型栈分配
var vec = $Vector3(1, 2, 3); 

// 引用类型堆分配
var obj = new GameObject("player");

// 显式内存回收
destroy(obj); 
```

## 编译与执行

```bash
# 编译为字节码
zrc compile example.zr -o example.zbc

# 执行字节码
zr run example.zbc

# 启动REPL
zr repl
```

## 标准库示例

```zr
// 数学库
var math = import("math");
var random = math.random(0, 100);

// 输入系统
var input = import("input");
input.onKeyPress(KeyCode.Space, () => {
    player.jump();
});
```

更多高级用法请参考完整语言规范文档。
