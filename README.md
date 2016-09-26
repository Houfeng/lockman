### 介绍

一个用于多进程的并发控制锁

### 安装

```sh
$ npm install lockman --save
```

### 示例

```js
const Locker = require('lockman');

let locker1 = new Locker('locker1');

locker1.acquire(function(){
  //相关处理
  locker1.release();
});
```