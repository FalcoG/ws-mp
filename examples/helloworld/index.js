const MultiPlayer = require('../..');

class GameMode extends MultiPlayer {
  constructor () {
    super(1338);
  }
}

const Hello = new GameMode;

Hello.player.on('connect', e => {
  console.log('Player connected!');
});

Hello.player.on('text', e => {
  if (e.message.indexOf('blacklisted') === -1) {
    e.promise.resolve(`Team Blue ${e.message}`);
  } else {
    e.promise.reject('Forbidden')
  }
});

Hello.player.on('command', e => {
  console.log('Command:', e);

  e.promise.reject('Does this actually work?');
});