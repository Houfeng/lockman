### 介绍

一个用于多进程的并发控制锁

### 安装

```sh
$ npm install lockman --save
```

### 示例

```js
const locker = require('lockman');

locker.lock(function(){
  //相关处理
  locker.unlock();
});
```