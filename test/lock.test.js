const assert = require('assert');
const Locker = require('../');

describe('lockman', function () {

  it('lock', function (done) {
    var locker1 = new Locker('locker1');
    var mark = 0;
    locker1.acquire(function () {
      setTimeout(function () {
        mark++;
        locker1.release();
      }, 500);
    });
    locker1.acquire(function () {
      mark++;
      assert.equal(mark, 2);
      done();
      locker1.release();
    });
  });

});
