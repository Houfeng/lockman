const Class = require('cify').Class;
const utils = require('ntils');
const net = require('net');
const split = require('split');
const consts = require('./consts');
const Server = require('./server');
const oneport = require('oneport');

/**
 * 锁客户端
 **/
const Client = new Class({

  /**
   * 构造一个锁链接对象
   **/
  constructor: function (options) {
    options = options || {};
    this.options = options;
    this._connecteStatus = 0;
    this._connecteClabacks = [];
    this._serverCallbacks = {};
    this._connTryCount = 0;
  },

  /**
   * 进程链接
   **/
  _connect: function (callback) {
    if (this._connecteStatus == 2) return callback();
    if (callback) this._connecteClabacks.push(callback);
    if (this._connecteStatus == 1) return;
    this._connecteStatus = 1;
    //进行连接尝试
    this._connectServer();
  },

  /**
   * 启动并连接
   **/
  _startServerAndConnect: function () {
    this._connTryCount++;
    if (this._connTryCount > consts.CONN_TRY_NUM) {
      return utils.each(this._serverCallbacks, function (id, callback) {
        if (callback) callback(new Error('Connection failed'));
      });
    };
    if (this.options.autoCreateServer !== false) {
      this._server = new Server(this.options);
      this._server.start(this._connectServer());
    } else {
      this._connectServer();
    }
  },

  /**
   * 连接到锁控制服务
   **/
  _connectServer: function () {
    this._client = new net.Socket();
    //出错时重连
    this._client.on('error', this._startServerAndConnect.bind(this));
    this._client.on('close', this._startServerAndConnect.bind(this));
    this._client.on('end', this._startServerAndConnect.bind(this));
    //--
    oneport.last(consts.PORT_KEY, function (portErr, port) {
      if (portErr || !port) {
        return setTimeout(this._startServerAndConnect.bind(this), 0);
      }
      this._client.connect(port, consts.HOST, function (err) {
        if (this._connecteStatus == 2) return;
        this._connecteStatus = 2;
        this._connTryCount = 0;
        this._client.pipe(split()).on('data', function (id) {
          if (!id) return;
          id = id.toString();
          var callback = this._serverCallbacks[id];
          if (callback) callback(err);
          delete this._serverCallbacks[id];
        }.bind(this));
        while (this._connecteClabacks.length > 0) {
          this._connecteClabacks.shift()(err, this._client);
        }
      }.bind(this));
    }.bind(this));
  },

  /**
   * 调用锁管理服务
   **/
  _call: function (info, callback) {
    callback = utils.isFunction(callback) ? callback : consts.NOOP;
    this._connect(function (err) {
      if (err) return callback(err);
      info.push(utils.newGuid());
      this._serverCallbacks[info[2]] = callback;
      this._client.write(info.join(',') + '\n');
    }.bind(this));
  }

});

/**
 * 默认连接实例
 **/
const DEFAULT_CLIENT = new Client();

/**
 * 客户端 Locker 类
 **/
Client.Locker = new Class({

  /**
   * 构造一个指定名称的锁
   * @param {String} 锁名称
   * @param {Client} 锁连接实例
   **/
  constructor: function (name, client) {
    if (!name ||
      name.length < 1 ||
      name.length > 32 ||
      !(/^[a-z0-9\-\_\$]+$/igm.test(name))) {
      throw new Error('Involid locker name:', name);
    }
    this.name = name;
    this._client = client || this._static.client || DEFAULT_CLIENT;
  },

  /**
   * 审申锁控制权
   * @param {Function} action 拿到控制权后执行的函数
   **/
  acquire: function (action) {
    if (!utils.isFunction(action)) return;
    this._client._call(['acquire', this.name], action);
  },

  /**
   * 释放锁控制权
   * @param {Function} callback 释放成功后的回调
   **/
  release: function (callback) {
    callback = utils.isFunction(callback) ? callback : consts.NOOP;
    this._client._call(['release', this.name], callback);
  },

  /**
   * 审申锁控制权(acquire 的别名)
   * @param {Function} action 拿到控制权后执行的函数
   **/
  lock: function (action) {
    this.acquire(action);
  },

  /**
   * 释放锁控制权(release 的别名)
   * @param {Function} callback 释放成功后的回调
   **/
  unlock: function (callback) {
    this.release(callback);
  }

});

module.exports = Client;