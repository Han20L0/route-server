const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const DAY_START = 0;
const DAY_END = 6;

const HOUR_START = 0;
const HOUR_END = 23;

function get_random_hour() {
  let randomHour = Math.floor(Math.random() * (HOUR_END - HOUR_START + 1)) + HOUR_START;
  return randomHour;
}

function get_random_day() {
  const randomDate = Math.floor(Math.random() * (DAY_END - DAY_START + 1));
  return DAY_NAMES[randomDate];
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

function get_day_hour(IS_REALTIME) {
  // day_hour approaches
  // 1. set a const variable determining is realtime or not
  // 2. get real/random day -> dayName [Sun, Mon, Tue, ...]
  // 3. get real/random hour -> hourString

  let hour, dayName;

  if (IS_REALTIME) {
    dayName = get_real_day();
    hour = get_real_hour();
  } else {
    dayName = get_random_day();
    hour = get_random_hour();
  }

  return { dayName, hour };
}

module.exports = get_day_hour;
