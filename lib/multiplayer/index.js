const WebSocket = require('ws');

const events = require('events');
const crypto = require('crypto');

class MultiPlayer {
  constructor (options = {
    port: 1337,
    auth: false
  }) {
    this.server = new events.EventEmitter();
    this.player = new events.EventEmitter();

    this.wss = new WebSocket.Server({
      port: options.port
    });

    this.wss.broadcast = (data, identifier) => {
      const res = typeof(data) === 'object' ? JSON.stringify({
        id: identifier,
        ...data
      }) : data;

      this.wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          if (client.identifier === identifier) {
            client.send(JSON.stringify(data));
          } else {
            client.send(res);
          }
        }
      });
    }

    this.wss.on('connection', ws => {
      ws.identifier = crypto.randomBytes(16).toString('hex');
      this.player.emit('connect', ws); // TODO: Refactor with custom data

      ws.broadcast = data => {
        this.wss.broadcast(data, ws.identifier);
      }

      ws.reject = (action, data) => {
        ws.send(JSON.stringify({
          action: action,
          error: data
        }));
      }

      ws.on('message', (message) => {
        try {
          message = JSON.parse(message);
        } catch (e) {
          // TODO: Handle failed to parse
        }

        if (typeof(message) === 'string') {
          // TODO: Figure out what to do with strings
        } else if (typeof(message) === 'object') {
          const data = message;
          message = data.message;

          if (data.action) {
            const type = 'Player' + data.action.charAt(0).toUpperCase() + data.action.slice(1);

            switch (data.action) {
              case 'text':
                new Promise((resolve, reject) => {
                  this.player.emit(data.action, {
                    message,
                    promise: {
                      resolve, reject
                    }
                  });
                }).then(
                  result => {
                    ws.broadcast({
                      action: type,
                      message: result
                    });
                  },
                  err => {
                    ws.reject(type, err);
                  }
                );

                break;
              case 'command':
                const params = message.split(' ');
                const command = params.shift();

                new Promise((resolve, reject) => {
                  this.player.emit('command', {
                    command,
                    params,
                    promise: {
                      resolve,
                      reject
                    }
                  });
                }).then(
                  result => {
                    console.log('PlayerCommand', result);
                  },
                  err => {
                    console.log('PlayerCommandDenied', err);
                  }
                );

                break;
              case 'movement':
                // TODO: Finish this with actual player movement
                new Promise((resolve, reject) => {
                  this.player.emit(data.action, {
                    message,
                    promise: {
                      resolve, reject
                    }
                  });
                }).then(
                  result => {
                    ws.broadcast({
                      action: type,
                      message: result
                    });
                  },
                  err => {
                    ws.reject(type, err);
                  }
                );

                break;
            }
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
