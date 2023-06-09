const IS_REALTIME = false;

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const DAY_START = 0;
const DAY_END = 6;

const HOUR_START = 0;
const HOUR_END = 23;

const MINUTE_START = 0;
const MINUTE_END = 60;
const MINUTE_INTERVAL = 30;

function get_random_minute() {
  // generate number between 0 and 1
  let randomNumber = Math.round(Math.random());

  // if random number is 1, return 30. else return 0
  if (randomNumber) return 30;
  return 0;
}

function get_random_hour() {
  let randomHour = Math.floor(Math.random() * (HOUR_END - HOUR_START + 1)) + HOUR_START;
  return randomHour;
}

function get_random_day() {
  const randomDate = Math.floor(Math.random() * (DAY_END - DAY_START + 1));
  return DAY_NAMES[randomDate];
}

function get_real_minute() {
  const todayDate = new Date();

  let todayMinute = todayDate.getMinutes();

  if (todayMinute > 30) return 30;
  return 0;
}

function get_real_hour() {
  const todayDate = new Date();
  let todayHour = todayDate.getHours();

  return todayHour;
}

function get_real_day() {
  const todayDate = new Date();
  const dayNumber = todayDate.getDay();

  return DAY_NAMES[dayNumber];
}

function get_day_hour() {
  // day_hour approaches
  // 1. set a const variable determining is realtime or not
  // 2. get real/random day -> dayName [Sun, Mon, Tue, ...]
  // 3. get real/random hour -> hourString

  let hour, dayName, minute;

  if (IS_REALTIME) {
    dayName = get_real_day();
    hour = get_real_hour();
    minute = get_real_minute();
  } else {
    dayName = get_random_day();
    hour = get_random_hour();
    minute = get_random_minute();
  }

  return { dayName, hour, minute };
}

module.exports = get_day_hour;
