"use strict";

const Locker = require('../');

var locker = new Locker('a1');

console.time('test');
var count = 0, max = 5000;
for (let i = 0; i < max; i++) {
  locker.lock(function () {
    //console.log(i);
    if (++count >= max)
      console.timeEnd('test');
    locker.unlock();
  });
}

var locker2 = new Locker('a2');
locker2.lock(function () {
  console.log('a2', 0);
  locker2.unlock();
});

locker2.lock(function () {
  console.log('a2', 1);
  locker2.unlock();
});