const WebSocket = require('ws');

const events = require('events');

class MultiPlayer {
  constructor (port = 1337) {
    this.server = new events.EventEmitter();
    this.player = new events.EventEmitter();

    this.wss = new WebSocket.Server({
      port: port
    });

    this.wss.on('connection', ws => {
      this.player.emit('connect', ws); // TODO: Refactor with custom data

      ws.on('message', (message) => {
        if (typeof(message) === 'string') {
          if (message.indexOf('/') === 0) {
            const params = message.substr(1, message.length - 1).split(' ');
            const command = params.shift();

            new Promise((resolve, reject) => {
              this.player.emit('command', { command, params, promise: { resolve, reject } });
            }).then(
              result => {
                console.log('PlayerCommand', result);
              },
              err => {
                console.log('PlayerCommandDenied', err);
              }
            );
          } else {
            new Promise((resolve, reject) => {
              this.player.emit('text', { message, promise: { resolve, reject } });
            }).then(
              result => {
                console.log('PlayerText', result);
              },
              err => {
                console.log('PlayerTextDenied', err);
              }
            );
          }
        }
      })
    });

    return this;
  }

  shutdown (callback) {
    // Pre-shutdown

    this.wss.close(() => {
      callback();
    })
  }
}

module.exports = MultiPlayer;
