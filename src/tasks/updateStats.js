const { Task } = require('klasa');

const unixTs = () => Math.round((new Date()).getTime() / 1000);

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
    const msgCount = this.client.settings.messages.overall + this.client.stats.messages.lastMinute;
    const msgLastMinute = this.client.stats.messages.lastMinute;


    /* Commands Stats */
    const cmdRan = mergeRuntime(this.client.settings.commands.ran,
      mapToObj(this.client.stats.commands.ran));
    const cmdCount = this.client.settings.commands.overall + this.client.stats.commands.lastMinute;
    const cmdLastMinute = this.client.stats.commands.lastMinute;


    this.client.stats.commands.lastMinute = 0;
    this.client.stats.messages.lastMinute = 0;

    const timestamp = unixTs();

    await this.client.settings.update('messages.overall', msgCount);
    if (this.client.settings.messages.lastMinute.length >= 60) {
      await this.client.settings.update('messages.lastMinute', this.client.settings.messages.lastMinute[0], { arrayPosition: 0, action: 'remove' });
    }
    await this.client.settings.update('messages.lastMinute', {
      timestamp,
      count: msgLastMinute,
    }, { action: 'add' });
    await this.client.settings.update('commands.overall', cmdCount);
    await this.client.settings.update('commands.ran', cmdRan);
    if (this.client.settings.commands.lastMinute.length >= 60) {
      await this.client.settings.update('commands.lastMinute', this.client.settings.commands.lastMinute[0], { arrayPosition: 0, action: 'remove' });
    }
    await this.client.settings.update('commands.lastMinute', {
      timestamp,
      count: cmdLastMinute,
    }, { action: 'add' });
  }

  async init() {
    if (!this.client.settings.schedules.some(task => task.taskName === this.name)) {
      await this.client.schedule.create(this.name, '*/1 * * * *', { catchUp: false });
    }
  }
};
