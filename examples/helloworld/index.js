const MultiPlayer = require('../..');

class GameMode extends MultiPlayer {
  constructor () {
    super();

    console.log(this);
  }
}

const Hello = new GameMode;

Hello.server.on('init', () => {
  console.log('init?!')
});
