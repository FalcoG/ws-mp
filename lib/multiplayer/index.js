const WebSocket = require('ws');

const events = require('events');

class MultiPlayer {
  constructor () {
    this.server = new events.EventEmitter();
    this.player = new events.EventEmitter();

    setTimeout(() => {
      this.server.emit('init');
    }, 3000);

    return this;
  }
}

module.exports = MultiPlayer;
