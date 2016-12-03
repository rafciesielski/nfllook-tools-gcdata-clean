console.log('Cleaning schedules ...')

var recursive = require('recursive-readdir');
var fs = require('fs');
var path = require('path');
var parseString = require('xml2js').parseString;

var gameDataDir = process.argv[2];

recursive(gameDataDir, ['*.json'], function(err, files) {
    if (err) {
        return console.log(err);
    }
    files.forEach(function(file) {
        fs.readFile(file, 'utf8', function(err, data) {
            if (err) {
                return console.log(err);
            }
            cleanSchedule(path.dirname(file), data);
        });
    });
});

function cleanSchedule(dirName, xml) {

    parseString(xml, function(err, result) {
        if (err) {
            return console.log(err);
        }
        var schedule = buildCleanSchedule(dirName, result);
        var cleanPath = dirName + path.sep + 'schedule.clean.json';
        fs.writeFile(cleanPath, JSON.stringify(schedule, null, 2), function(err) {
            if (err) {
                return console.log(err);
            }
            console.log("Done: " + cleanPath);
        });
    });
}

function buildCleanSchedule(dirName, xmlSchedule) {

    var dirParts = dirName.split(path.sep)
    var season = dirParts[dirParts.length - 2];
    var week  = dirParts[dirParts.length - 1];

    var schedule = {};
    schedule._id = season + '_' + week;
    schedule.week = parseInt(week);
    schedule.games = [];

    var xmlGames = xmlSchedule.ss.gms[0];
    xmlGames.g.forEach(function(entry) {
        game = {};
        game.home = entry['$'].h;
        game.away = entry['$'].v;
        game.dayOfTheWeek = entry['$'].d;
        game.time = entry['$'].t;
        schedule.games.push(game);
    });

    return schedule;
}