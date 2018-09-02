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
      executions: newExecutions.slice(Math.max(newExecutions.length - 5, 0)),
    };
  });
  return obj;
};

module.exports = class extends Task {
  async run() {
    const timestamp = unixTs();

    /* Messages Stats */
    const msgCount = this.client.settings.messages.overall + this.client.stats.messages.pastHour;
    await this.client.settings.update('messages.overall', msgCount, { force: true });

    let settingsMsgPastHour = this.client.settings.messages.pastHour;

    if (!settingsMsgPastHour.some(x => x.timestamp === timestamp)) {
      if (settingsMsgPastHour.length >= 60) {
        settingsMsgPastHour = settingsMsgPastHour
          .slice(Math.max(settingsMsgPastHour.length - 59, 0));
      }
      settingsMsgPastHour.push({
        timestamp,
        count: this.client.stats.messages.pastHour,
      });

      await this.client.settings.update('messages.pastHour', settingsMsgPastHour, {
        force: true,
        action: 'overwrite',
      });
    }

    /* Commands Stats */
    const cmdRan = mergeRuntime(this.client.settings.commands.ran,
      mapToObj(this.client.stats.commands.ran));
    await this.client.settings.update('commands.ran', cmdRan, { force: true });


    const cmdCount = this.client.settings.commands.overall + this.client.stats.commands.pastHour;
    await this.client.settings.update('commands.overall', cmdCount, { force: true });

    let settingsCmdPastHour = this.client.settings.commands.pastHour;
    if (!settingsCmdPastHour.some(x => x.timestamp === timestamp)) {
      if (settingsCmdPastHour.length >= 60) {
        settingsCmdPastHour = settingsCmdPastHour
          .slice(Math.max(settingsCmdPastHour.length - 59, 0));
      }

      settingsCmdPastHour.push({
        timestamp,
        count: this.client.stats.commands.pastHour,
      });

      await this.client.settings.update('commands.pastHour', settingsCmdPastHour, {
        force: true,
        action: 'overwrite',
      });
    }

    this.client.stats.commands.pastHour = 0;
    this.client.stats.messages.pastHour = 0;
  }

  async init() {
    if (!this.client.settings.schedules.some(task => task.taskName === this.name)) {
      await this.client.schedule.create(this.name, '*/1 * * * *', { catchUp: false });
    }
  }
};
