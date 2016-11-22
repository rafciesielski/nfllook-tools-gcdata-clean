var recursive = require('recursive-readdir');
var fs = require('fs');
var path = require('path');

var gameDataDir = process.argv[2];

recursive(gameDataDir, ['*.clean.json'], function(err, files) {

    if (err) {
        return console.log(err);
    }

    files.forEach(function(file) {
        fs.readFile(file, 'utf8', function(err, data) {
            if (err) {
                return console.log(err);
            }
            var gameId = path.basename(file, '.json');
            var dirName = path.dirname(file);
            cleanGame(gameId, data, dirName);
        });
    });

});

function cleanGame(id, data, dirName) {

    var gameJson = JSON.parse(data);
    var gameData = gameJson[id];
    delete gameData.drives;
    delete gameData.scrsummary;
    cleanTeam(gameData.home.stats);
    cleanTeam(gameData.away.stats);

    var path = dirName + '\\' + id + '.clean.json';
    fs.writeFile(path, JSON.stringify(gameData, null, 2), function(err) {
        if (err) {
            return console.log(err);
        }
        console.log("Done: " + path);
    });
}

function cleanTeam(team) {
    clean(team, "passing", 'passers');
    clean(team, "rushing", 'rushers');
    clean(team, "receiving", 'receivers');
    clean(team, "fumbles", 'fumbles');
    clean(team, "kicking", 'kickers');
    clean(team, "punting", 'punters');
    clean(team, "kickret", 'kickReturners');
    clean(team, "puntret", 'puntReturners');
    clean(team, "defense", 'defenders');
}

function clean(root, toReplace, replaceWith) {
    if (root[toReplace] != null) {
        var players = [];
        var playersIds = Object.getOwnPropertyNames(root[toReplace]);
        playersIds.forEach(function(entry) {
            var player = root[toReplace][entry];
            player.id = entry;
            players.push(player);
        });
        root[replaceWith] = players;
        delete root[toReplace];
    }
}
