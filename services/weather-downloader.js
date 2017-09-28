var config = rootRequire('config');
// TODO: var sqlite = require('sql.js');

// Init db
// TODO: var db = sqlite.connect('./db/todo-sql.db');

// Init DarkSky
var DarkSky = require('forecast.io');
var darksky = new DarkSky({
  APIKey: config.darksky.api_key,
  timeout: 1000
});

module.exports = {};

module.exports.startDownloadSchedule = function() {
  var millisBetweenQueries = config.minutesBetweenQueries * 60 * 1000;
  setInterval(downloadForecasts, millisBetweenQueries);
};

function downloadForecast(location, forecastTime) {
	// TODO: Time
	darksky.get(location.lat, location.lon, function (err, res, data) {
    if (err) {
    	throw err;
    }
    console.log('res: ' + JSON.stringify(res));
    console.log('data: ' + JSON.stringify(data));

    // TODO: Save to DB
  	saveForecastResponseToDatabase(location, forecastTime, data);
	});
}

function saveForecastResponseToDatabase(location, forecastTime, data) {
	// TODO: Save to Sqlite DB
}

function insideAnyQueryPeriod() {
	for (var i = 0; i < config.queryPeriods.length; i++) {
		var queryPeriod = config.queryPeriods[i];
		// TODO: var startTime = moment(queryPeriod.start);
		// TODO: var endTime = moment(queryPeriod.end);
		if (moment() >= startTime && moment() <= endTime) {
			return true;
		}
	}
	return false;
}

function downloadForecasts() {
	if (!insideAnyQueryPeriod()) {
		return;
	}
	config.forecastTimes.forEach(function (forecastTimeString) {
		// TODO: var forecastTime = moment(forecastTimeString);
		config.locations.forEach(function(location) {
			downloadForecast(location, forecastTime);
		});
	});
}