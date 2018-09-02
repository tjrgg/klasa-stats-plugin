const { Task } = require('klasa');

const unixTs = () => Math.round((new Date()).getTime() / 1000);

const mergeRan = (a, b) => {
  const obj = a;

  for (const [key, value] of Object.entries(b)) { // eslint-disable-line no-restricted-syntax
    obj[key] = !Object.prototype.hasOwnProperty.call(obj, key) ? value : obj[key] + value;
  }

  return obj;
};

module.exports = class extends Task {
  async run() {
    const timestamp = unixTs();
    const stats = [];

    for (const guild of this.client.guilds.array()) { // eslint-disable-line no-restricted-syntax
      if (this.client.guildStats[guild.id] === undefined) return;

      stats.push({
        timestamp,
        guild,
        messages: this.client.guildStats[guild.id].messages,
        commands: this.client.guildStats[guild.id].commands,
      });

      this.client.guildStats[guild.id].messages.lastHour = 0;
      this.client.guildStats[guild.id].commands.lastHour = 0;
    }

    for (const data of stats) { // eslint-disable-line no-restricted-syntax
      /* messages */
      let msgPastHour = data.guild.settings.messages.pastHour;
      const msgOverall = data.guild.settings.messages.overall + data.messages.lastHour;

      if (msgPastHour.length >= 168) {
        msgPastHour = msgPastHour.slice(Math.max(msgPastHour.length - 168, 0));
      }
      msgPastHour.push({
        timestamp: data.timestamp,
        count: data.messages.lastHour,
      });

      /* commands */
      let cmdPastHour = data.guild.settings.commands.pastHour;
      const cmdOverall = data.guild.settings.commands.overall + data.commands.lastHour;

      if (cmdPastHour.length >= 168) {
        cmdPastHour = cmdPastHour.slice(Math.max(cmdPastHour - 168, 0));
      }
      cmdPastHour.push({
        timestamp: data.timestamp,
        count: data.commands.lastHour,
      });

      const cmdRan = mergeRan(data.guild.settings.commands.ran, data.commands.ran);

      await Promise.all([ // eslint-disable-line no-await-in-loop
        data.guild.settings.update('messages.pastHour', msgPastHour, { action: 'overwrite' }),
        data.guild.settings.update('messages.overall', msgOverall),
        data.guild.settings.update('commands.pastHour', cmdPastHour, { action: 'overwrite' }),
        data.guild.settings.update('commands.overall', cmdOverall),
        data.guild.settings.update('commands.ran', cmdRan),
      ]);
    }
  }

  async init() {
    if (!this.client.settings.schedules.some(task => task.taskName === this.name)) {
      await this.client.schedule.create(this.name, '0 */1 * * *', { catchUp: false });
    }
  }
};
