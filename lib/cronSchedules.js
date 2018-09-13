const CronJob = require("cron").CronJob;

const tz = "America/Chicago";

let trolleyActive = false;
let busesActive = false;
let uahBusActive = false;

// Seconds: 0-59
// Minutes: 0-59
// Hours: 0-23
// Day of Month: 1-31
// Months: 0-11
// Day of Week: 0-6

const trolleyStart = new CronJob({
  cronTime: "00 45 16 * * 5,6",
  onTick() {
    trolleyActive = true;
  },
  start: true,
  timeZone: tz
});

const trolleyDone = new CronJob({
  cronTime: "00 30 0 * * 0,6",
  onTick() {
    trolleyActive = false;
  },
  start: true,
  timeZone: tz
});

const busesStart = new CronJob({
  cronTime: "00 45 5 * * 0-6",
  onTick() {
    busesActive = true;
  },
  start: true,
  timeZone: tz
});

const busesDone = new CronJob({
  cronTime: "00 15 19 * * 0-6",
  onTick() {
    busesActive = false;
  },
  start: true,
  timeZone: tz
});

const uahBusStart = new CronJob({
  cronTime: "00 45 16 * * 5",
  onTick() {
    uahBusActive = true;
  },
  start: true,
  timeZone: tz
});

const uahBusDone = new CronJob({
  cronTime: "00 45 22 * * 5",
  onTick() {
    uahBusActive = false;
  },
  start: true,
  timeZone: tz
});

function isTrolleyActive() {
  return trolleyAcive;
}

function areBusesActive() {
  return busesActive;
}

function isUahBusActive() {
  return uahBusActive;
}

exports.isTrolleyActive = isTrolleyActive;
exports.areBusesActive = areBusesActive;
exports.isUahBusActive = isUahBusActive;
