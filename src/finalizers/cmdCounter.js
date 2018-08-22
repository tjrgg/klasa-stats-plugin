const { Finalizer } = require('klasa');

module.exports = class extends Finalizer {
  constructor(...args) {
    super(...args, { enabled: true });
  }

  async run(message, response, runTime) {
    let cmd = this.client.stats.commands.overall.ran.get(message.command.name);
    if (!cmd) {
      this.client.stats.commands.overall.ran.set(message.command.name, {
        count: 0,
        executions: [],
      });
    }
    cmd = this.client.stats.commands.overall.ran.get(message.command.name);
    const { executions } = cmd;
    if (executions.length >= 20) executions.shift();
    executions.push(runTime.stop());

    this.client.stats.commands.overall.ran.set(message.command.name, {
      count: cmd.count + 1,
      executions,
    });
    this.client.stats.commands.overall.count += 1;
    this.client.stats.commands.lastMinute += 1;
  }
};
