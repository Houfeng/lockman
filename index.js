const Client = require('./lib/client');
const Server = require('./lib/Server');

const Locker = Client.Locker;

Locker.Client = Client;
Locker.Server = Server;
Locker.ClientLocker = Client.Locker;
Locker.ServerLocker = Server.Locker;
Locker.Locker = Client.Locker;

module.exports = Locker;