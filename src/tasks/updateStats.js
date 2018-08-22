const { Task } = require('klasa');

const mapToObj = (aMap) => {
  const obj = {};
  aMap.forEach((v, k) => { obj[k] = v; });
  return obj;
};

const mergeRuntime = (a, b) => {
  const obj = a;
  Object.keys(b).forEach((key) => {
    const data = b[key];
    if (obj[key] === undefined) {
      obj[key] = data;
      return;
    }
    const newExecutions = obj[key].executions.concat(data.executions);
    obj[key] = {
      count: obj[key].count + data.count,
      executions: newExecutions.slice(Math.max(newExecutions.length - 60, 1)),
    };
  });
  return obj;
};

module.exports = class extends Task {
  async run() {
    /* Messages Stats */
    const msg = this.client.settings.messages;
    msg.overall.count += this.stats.messages.lastMinute;
    if (msg.lastMinute.length >= 60) msg.lastMinute.shift();
    msg.lastMinute.push(this.client.stats.messages.lastMinute);
    this.client.settings.update('messages', msg);

    /* Commands Stats */
    const cmd = this.client.settings.commands;
    cmd.overall.ran = mergeRuntime(this.client.settings.commands.overall.ran,
      mapToObj(this.client.stats.commands.overall.ran));
    cmd.overall.count += this.client.stats.commands.lastMinute;
    if (cmd.lastMinute.length) cmd.lastMinute.shift();
    cmd.lastMinute.push(this.client.stats.commands.lastMinute);
    this.client.settings.update('commands', cmd);

    const cmdOverallCount = this.client.stats.commands.lastMinute
      + this.client.settings.commands.overall.count;
    await this.client.settings.update('commands.overall.count', cmdOverallCount);

    this.client.stats.commands.lastMinute = 0;
    this.client.stats.messages.lastMinute = 0;
  }

  async init() {
    if (!this.client.settings.schedules.some(task => task.taskName === this.name)) {
      await this.client.schedule.create(this.name, '*/1 * * * *');
    }
  }
};
