### 介绍

一个用于多进程的并发控制锁

### 安装

```sh
$ npm install lockman --save
```

### 示例

```js
var Locker = require('lockman');

var locker = new Locker('lock1');
locker.acquire(function(){
  //相关处理
  locker.release();
});
```