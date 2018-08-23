const { Client } = require('klasa');

Client.defaultClientSchema
  .add('commands', (folder) => {
    folder
      .add('overall', 'integer', { default: 0 })
      .add('ran', 'any', { default: {} })
      .add('lastMinute', 'any', { array: true, default: [] });
  })
  .add('messages', (folder) => {
    folder
      .add('overall', 'integer', { default: 0 })
      .add('lastMinute', 'any', { array: true, default: [] });
  });
