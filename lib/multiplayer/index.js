const WebSocket = require('ws');

const events = require('events');

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

    this.wss.broadcast = data => {
      const res = typeof(data) === 'object' ? JSON.stringify(data) : data;

      this.wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(res);
        }
      });
    }

    this.wss.on('connection', ws => {
      this.player.emit('connect', ws); // TODO: Refactor with custom data

      ws.reject = (action, data) => {
        ws.send(JSON.stringify({
          action: action,
          message: data,
          success: false
        }));
      }

      ws.resolve = action => {
        ws.send(JSON.stringify({
          action: action,
          success: true
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
                    ws.resolve(type);
                    this.wss.broadcast({
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
