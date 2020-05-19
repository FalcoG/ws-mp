const MultiPlayer = require('../..');
const crypto = require('crypto');

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
  console.log('Player connected!', e.user.auth);

  /**
   * user.character is public
   * user.* is private / client only
   */
  e.user.character = {
    name: e.user.auth.token === '1337'
      ? 'Falco'
      : 'guest-' + crypto.randomBytes(4).toString('hex'),
    meta: {
      condition: {
        health: Math.floor(Math.random() * Math.floor(100)),
        nutrition: Math.floor(Math.random() * Math.floor(100)),
        hydration: Math.floor(Math.random() * Math.floor(100)),
      }
    }
  }

  e.user.private = {
    test: 'privately kept non-shared data - or something like that'
  }

  if (e.user.character.name === 'Banned-name') {
    e.promise.reject('Banned');
  } else {
    e.promise.resolve(e.user);
  }
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