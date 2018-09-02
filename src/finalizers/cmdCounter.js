const { Finalizer } = require('klasa');

module.exports = class extends Finalizer {
  constructor(...args) {
    super(...args, { enabled: true });
  }

  async run(message, response, runTime) {
    let cmd = this.client.stats.commands.ran.get(message.command.name);
    if (!cmd) {
      this.client.stats.commands.ran.set(message.command.name, {
        count: 0,
        executions: [],
      });
    }
    cmd = this.client.stats.commands.ran.get(message.command.name);
    let { executions } = cmd;
    if (executions.length >= 20) executions = executions.slice(Math.max(executions.length - 5, 0));
    executions.push(runTime.stop().duration);

    this.client.stats.commands.ran.set(message.command.name, {
      count: cmd.count + 1,
      executions,
    });
    this.client.stats.commands.overall += 1;
    this.client.stats.commands.pastHour += 1;
  }
};
