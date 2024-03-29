const { Client } = require('klasa');
const { Collection } = require('discord.js');
const { join } = require('path');

require('./structures/defaultClientSchema');

class StatsClient extends Client {
  constructor(config) {
    super(config);
    this.constructor[Client.plugin].call(this);
  }

  static [Client.plugin]() {
    this.stats = {
      commands: {
        overall: 0,
        ran: {},
        lastMinute: 0,
      },
      messages: {
        overall: 0,
        lastMinute: 0,
      },
    };

    this.tasks.registerCoreDirectory(join(__dirname, '..', '/'));
    this.finalizers.registerCoreDirectory(join(__dirname, '..', '/'));
    this.monitors.registerCoreDirectory(join(__dirname, '..', '/'));
  }
}
module.exports = StatsClient;
