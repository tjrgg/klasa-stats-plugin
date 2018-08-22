const { Client } = require('klasa');

Client
  .add('commands', (folder) => {
    folder
      .add('overall', (subfolder) => {
        subfolder
          .add('count', 'integer', { default: 0 })
          .add('ran', 'any', { default: {} });
      })
      .add('lastMinute', 'integer', { array: true, default: new Array(60).fill(0) });
  })
  .add('messages', (folder) => {
    folder
      .add('overall', (subfolder) => {
        subfolder
          .add('count', 'integer', { default: 0 });
      })
      .add('lastMinute', 'integer', { array: true, default: new Array(60).fill(0) });
  });
