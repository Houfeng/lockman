### 介绍

lockman 是一个用于多进程的并发控制锁， 类似一些语言中（比如 C#）的 lock 关键字可以用来确保代码块完成运行，而不会被其他进程中断。
它可以把一段代码定义为互斥段（critical section），互斥段在一个时刻内只允许一个进程进入执行，
而其他进程必须等待。

[![npm version](https://badge.fury.io/js/lockman.svg)](http://badge.fury.io/js/lockman)
[![Build Status](https://travis-ci.org/Houfeng/lockman.svg?branch=master)](https://travis-ci.org/Houfeng/lockman)

### 安装

```sh
$ npm install lockman --save
```

### 示例

```js
const Locker = require('lockman');

let locker = new Locker('demo');

locker.acquire(function(){
  //此处代码在同一时刻只允许一个进程入执行
  locker.release();
});
```