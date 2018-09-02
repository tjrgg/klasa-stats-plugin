const { Monitor } = require('klasa');

module.exports = class extends Monitor {
  constructor(...args) {
    super(...args, {
      ignoreBots: false,
      ignoreSelf: true,
      ignoreOthers: false,
      ignoreEdits: false,
    });
  }

  async run() {
    this.client.stats.messages.lastMinute += 1;
    this.client.stats.messages.overall += 1;
  }
};
