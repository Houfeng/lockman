### 介绍

一个用于多进程的并发控制锁

[![npm version](https://badge.fury.io/js/lockman.svg)](http://badge.fury.io/js/lockman)
[![Build Status](https://travis-ci.org/Houfeng/lockman.svg?branch=master)](https://travis-ci.org/Houfeng/lockman)

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