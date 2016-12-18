if(process.argv[2] == null) {
    console.log('Usage: npm run clean <gameDataDir>')
    return
}

require('./clean_games');