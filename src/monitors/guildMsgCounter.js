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

  async run(msg) {
    if (!msg.guild) return;
    if (!msg.guild.settings.guildStats) return;
    if (this.client.guildStats[msg.guild.id] === undefined) {
      this.client.guildStats[msg.guild.id] = this.client.guildStatsSchema;
    }
    this.client.guildStats[msg.guild.id].lastHour += 1;
    this.client.guildStats[msg.guild.id].overall += 1;
  }
};
