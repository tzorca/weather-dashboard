var apiConfig = rootRequire('config/api-config');
var timingConfig = rootRequire('config/timing-config');
var dateFormat = require('date-fns/format');
var fs = require('fs');

// Load SQLite database
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(rootPath('db/weather-data.sqlite'));

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

	var unixForecastTime = Math.floor(forecastTime.getTime()/1000);
	darksky.getAtTime(location.lat, location.lon, unixForecastTime, function (err, res, data) {
		if (err) {
			throw err;
		}
		var dataJson = JSON.stringify(data);
		console.log('data: ' + dataJson);
		
		saveForecastResponseToDatabase(location, forecastTime, dataJson);
	});
}

function saveForecastResponseToDatabase(location, forecastTime, dataJson) {
	db.serialize(function() {
		var statement = "INSERT INTO QueryResponse (DateQueried, ForecastTime, ForecastLatitude, ForecastLongitude, ResponseJson) VALUES ($dateQueried, $forecastTime, $forecastLatitude, $forecastLongitude, $responseJson)";

		db.run(statement, {
			$dateQueried: commonFormatDate(new Date()),
			$forecastTime: commonFormatDate(forecastTime),
			$forecastLatitude: location.lat,
			$forecastLongitude: location.lon,
			$responseJson: dataJson
		}, function(err) {
			console.log('Recorded forecast to DB.');
		});
		
	});
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
	forecastTimes.every(function (forecastTime) {
		apiConfig.darksky.locations.forEach(function(location) {
			downloadForecast(location, forecastTime);
		});
		return false; // break - just query one forecast time for now
	});
}

function commonFormatDate(date) {
	return dateFormat(date, 'MM/DD/YYYY HH:mm:ss');
}