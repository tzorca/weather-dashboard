var setHours = require('date-fns/set_hours');
var addDays = require('date-fns/add_days');
var startOfDay = require('date-fns/start_of_day');

var timingConfig = {};
module.exports = timingConfig;

timingConfig.minutesBetweenQueries = 30;

timingConfig.getQueryPeriods = function() {
  var startOfToday = startOfDay(new Date());
  return [{
    start: setHours(startOfToday, 6), // 6am
    end: setHours(startOfToday, 10) // 10am
  },{
    start: setHours(startOfToday, 15), // 3pm
    end: setHours(startOfToday, 23) // 11pm
  }];
};

timingConfig.getForecastTimes = function() {
  var now = new Date();
  var startOfToday = startOfDay(now);
  var startOfTomorrow = addDays(startOfToday, 1);
  var targetDates = [startOfToday, startOfTomorrow];

  // Use these times for each target date (today and tomorrow)
  var forecastTimes = [];
  targetDates.forEach(function (targetDate) {
    forecastTimes = forecastTimes.concat([
      setHours(targetDate, 7), // 7am
      setHours(targetDate, 8), // 8am
      setHours(targetDate, 9), // 9am
      setHours(targetDate, 16), // 4pm
      setHours(targetDate, 17), // 5pm
      setHours(targetDate, 18), // 6pm
      setHours(targetDate, 19), // 7pm
    ]);
  });

  // Remove times that have already passed
  forecastTimes = forecastTimes.filter(function(forecastTime) {
    return now <= forecastTime;
  });

  return forecastTimes;
};

