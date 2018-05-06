const MultiPlayer = require('../..');

class GameMode extends MultiPlayer {
  constructor () {
    super({
      port: 1338,
      auth: true
    });
  }
}

const Hello = new GameMode;

Hello.player.on('connect', e => {
  console.log('Player connected!');
});

Hello.player.on('text', e => {
  if (e.message.indexOf('blacklisted') === -1) {
    const message = e.message.replace('test', '****');
    e.promise.resolve(message);

    console.log('Text:', message);
  } else {
    e.promise.reject('Forbidden')
  }
});

Hello.player.on('command', e => {
  console.log('Command:', e);

  e.promise.reject('Does this actually work?');
});

Hello.player.on('movement', e => {
  console.log('Movement:', e.message);

  e.promise.reject();
});