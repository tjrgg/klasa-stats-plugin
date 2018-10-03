const { Task } = require('klasa');
const { Collection } = require('discord.js');

const unixTs = () => Math.round((new Date()).getTime() / 1000);

const mergeRuntime = (a, b) => {
  const obj = a;
  for (const [key, value] in Object.entries(b)) {
    if (obj[key] === undefined) {
      obj[key] = value;
      continue;
    }
    const newExecutions = [...obj[key].executions, ...value.executions];
    obj[key] = {
      count: obj[key].count + value.count,
      executions: newExecutions.slice(Math.max(newExecutions.length - 5, 0)),
    };
  }
  return obj;
};

module.exports = class extends Task {
  async run() {
    const timestamp = unixTs();

    const msgLastMinute = this.client.stats.messages.lastMinute;
    const cmdLastMinute = this.client.stats.commands.lastMinute;

    this.client.stats.commands.lastMinute = 0;
    this.client.stats.messages.lastMinute = 0;

    /* Messages Stats */
    const msgCount = this.client.settings.messages.overall + msgLastMinute;
    await this.client.settings.update('messages.overall', msgCount, { force: true });

    let settingsMsgPastHour = this.client.settings.messages.pastHour;

    if (!settingsMsgPastHour.some(x => x.timestamp === timestamp)) {
      if (settingsMsgPastHour.length >= 60) {
        settingsMsgPastHour = settingsMsgPastHour
          .slice(Math.max(settingsMsgPastHour.length - 59, 0));
      }
      settingsMsgPastHour.push({
        timestamp,
        count: msgLastMinute,
      });

      await this.client.settings.update('messages.pastHour', settingsMsgPastHour, {
        force: true,
        action: 'overwrite',
      });
    }

    /* Commands Stats */
    const cmdRan = mergeRuntime(this.client.settings.commands.ran, this.client.stats.commands.ran);
    await this.client.settings.update('commands.ran', cmdRan, { force: true });
    this.client.stats.commands.ran = {};

    const cmdCount = this.client.settings.commands.overall + cmdLastMinute;
    await this.client.settings.update('commands.overall', cmdCount, { force: true });

    let settingsCmdPastHour = this.client.settings.commands.pastHour;
    if (!settingsCmdPastHour.some(x => x.timestamp === timestamp)) {
      if (settingsCmdPastHour.length >= 60) {
        settingsCmdPastHour = settingsCmdPastHour
          .slice(Math.max(settingsCmdPastHour.length - 59, 0));
      }

      settingsCmdPastHour.push({
        timestamp,
        count: cmdLastMinute,
      });

      await this.client.settings.update('commands.pastHour', settingsCmdPastHour, {
        force: true,
        action: 'overwrite',
      });
    }
  }

  async init() {
    if (!this.client.settings.schedules.some(task => task.taskName === this.name)) {
      await this.client.schedule.create(this.name, '*/1 * * * *', { catchUp: false });
    }
  }
};
