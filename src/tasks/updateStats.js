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
    const msgOverallCount = this.client.stats.messages.lastMinute
      + this.client.settings.messages.overall.count;
    await this.client.settings.update('messages.overall.count', msgOverallCount);

    const msgLastMinute = this.client.settings.messages.lastMinute;
    if (msgLastMinute.length >= 60) {
      await this.client.settings.update('messages.lastMinute', msgLastMinute[0], {
        arrayPosition: 0,
        action: 'remove',
      });
    }
    await this.client.settings.update('messages.lastMinute', this.client.stats.messages.lastMinute, {
      action: 'add',
    });

    /* Commands Stats */
    const commandRun = mergeRuntime(this.client.settings.commands.overall.ran,
      mapToObj(this.client.stats.commands.overall.ran));
    await this.client.settings.update('commands.overall.ran', commandRun);

    const cmdOverallCount = this.client.stats.commands.lastMinute
      + this.client.settings.commands.overall.count;
    await this.client.settings.update('commands.overall.count', cmdOverallCount);

    const cmdLastMinute = this.client.settings.commands.lastMinute;
    if (cmdLastMinute.length >= 60) {
      await this.client.settings.update('commands.lastMinute', cmdLastMinute[0], {
        arrayPosition: 0,
        action: 'remove',
      });
    }
    await this.client.settings.update('commands.lastMinute', this.client.stats.commands.lastMinute, {
      action: 'add',
    });

    this.client.stats.commands.lastMinute = 0;
    this.client.stats.messages.lastMinute = 0;
  }

  async init() {
    if (!this.client.settings.schedules.some(task => task.taskName === this.name)) {
      await this.client.schedule.create(this.name, '*/1 * * * *');
    }
  }
};
