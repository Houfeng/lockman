const Class = require('cify').Class;
const utils = require('ntils');
const net = require('net');
const split = require('split');
const consts = require('./consts');

/**
 * 锁管理 Server
 **/
const Server = new Class({

  /**
   * 构造
   **/
  constructor: function (options) {
    options = options || {};
    options.port = options.port || consts.PORT;
    options.host = options.host || consts.HOST;
    this.options = options;
    this._lockers = {};
  },

  /**
   * 审申指定名称的锁
   * @param {String} name 锁名称
   * @param {Function} action 申请成功后的动作
   **/
  acquire: function (name, action) {
    action = utils.isFunction(action) ? action : consts.NOOP;
    this._lockers[name] = this._lockers[name] || new Server.Locker();
    var locker = this._lockers[name];
    locker.actionStack.push(action);
    if (locker.locked) return;
    locker.locked = true;
    this._execute(name);
  },

  /**
   * 执行申请锁的动作(这里会触发通知 client 执行)
   **/
  _execute: function (name) {
    var locker = this._lockers[name];
    if (!locker) return;
    var action = locker.actionStack.shift();
    if (utils.isFunction(action)) action();
  },

  /**
   * 释放指定名称的锁
   * @param {String}  name 锁名称
   * @param {Function} 释放成功后的回调
   **/
  release: function (name, callback) {
    callback = utils.isFunction(callback) ? callback : consts.NOOP;
    var locker = this._lockers[name];
    if (locker && locker.actionStack.length > 0) {
      this._execute(name);
    } else {
      delete this._lockers[name];
    }
    return callback();
  },

  /**
   * 启动锁管理 server
   * @param {Function} callback 启动成功时的回调
   **/
  start: function (callback) {
    callback = utils.isFunction(callback) ? callback : consts.NOOP;
    this._server = net.createServer(function (socket) {
      socket.pipe(split()).on('data', function (data) {
        if (!data) return;
        var info = data.toString().split(',');
        this[info[0]]([info[1]], function () {
          socket.write(info[2] + '\n');
        });
      }.bind(this));
    }.bind(this));
    this._server.on('error', callback);
    this._server.listen(this.options.port, this.options.host, callback);
  }

});

/**
 * 服务端 Locker 类
 **/
Server.Locker = new Class({

  constructor: function () {
    this.actionStack = [];
    this.locked = false;
  }

});

module.exports = Server;