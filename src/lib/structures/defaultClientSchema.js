const { Client } = require('klasa');

Client.defaultClientSchema
  .add('commands', 'any', {
    default: {
      overall: {
        count: 0,
        ran: {},
      },
      lastMinute: new Array(60).fill(0),
    },
  })
  .add('messages', 'any', {
    default: {
      overall: {
        count: 0,
      },
      lastMinute: new Array(60).fill(0),
    },
  });
