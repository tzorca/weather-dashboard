var apiConfig = rootRequire('config/api-config');
var timingConfig = rootRequire('config/timing-config');
var dateFormat = require('date-fns/format');
// TODO: var sqlite = require('sql.js');

// Init db
// TODO: var db = sqlite.connect('./db/todo-sql.db');

// Init DarkSky
var DarkSky = require('forecast.io');
var darksky = new DarkSky({
  APIKey: apiConfig.darksky.api_key,
  timeout: 1000
});

module.exports = {};

module.exports.startDownloadSchedule = function() {
  var millisBetweenQueries = timingConfig.minutesBetweenQueries * 60 * 1000;
  setInterval(downloadForecasts, millisBetweenQueries);
  downloadForecasts();
};

function downloadForecast(location, forecastTime) {
	console.log('Downloading ' + JSON.stringify(location) + ' for ' + commonFormatDate(forecastTime));

	throw 'Not yet implemented: Save to DB';
	
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
	var queryPeriods = timingConfig.getQueryPeriods();
	var now = new Date();
	for (var i = 0; i < queryPeriods.length; i++) {
		var queryPeriod = queryPeriods[i];
		if (now >= queryPeriod.start && now <= queryPeriod.end) {
			return true;
		}
	}
	return false;
}

function downloadForecasts() {
	if (!insideAnyQueryPeriod()) {
		return;
	}

	var forecastTimes = timingConfig.getForecastTimes();
	forecastTimes.forEach(function (forecastTime) {
		apiConfig.darksky.locations.forEach(function(location) {
			downloadForecast(location, forecastTime);
		});
	});
}

function commonFormatDate(date) {
	return dateFormat(date, 'MM/DD/YYYY HH:mm');
}