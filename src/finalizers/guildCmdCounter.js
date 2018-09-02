const { Finalizer } = require('klasa');

module.exports = class extends Finalizer {
  constructor(...args) {
    super(...args, { enabled: true });
  }

  async run(msg) {
    if (!msg.guild) return;

    if (this.client.guildStats.commands.ran[msg.command.name] === undefined) {
      this.client.guildStats.commands.ran[msg.command.name] = 0;
    }
    this.client.guildStats.commands.ran[msg.command.name] += 1;

    this.client.guildStats.commands.overall += 1;
    this.client.guildStats.commands.lastHour += 1;
  }
};
