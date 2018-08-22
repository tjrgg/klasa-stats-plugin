/* eslint-disable global-require */
const { Client: { plugin } } = require('klasa');

module.exports = {
  StatsClient: require('./lib/Client'),
  Client: require('./lib/Client'),
  [plugin]: require('./lib/Client')[plugin],
};
