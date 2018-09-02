const { Client } = require('klasa');

Client.defaultGuildSchema
  .add('guildStats', 'boolean', { default: true })
  .add('commands', (folder) => {
    folder
      .add('overall', 'number', { default: 0, configurable: false })
      .add('ran', 'any', { default: {} })
      .add('pastWeek', 'any', { array: true, default: [] });
  })
  .add('messages', (folder) => {
    folder
      .add('overall', 'number', { default: 0, configurable: false })
      .add('pastWeek', 'any', { array: true, default: [] });
  });
