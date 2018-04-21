const ws = new WebSocket('ws://localhost:1338');

const queue = {
  'text': []
};

class Action {
  constructor (action, value) {
    // Create the promise before sending a message
    this.promise = new Promise((resolve, reject) => {
      this.actions = {resolve, reject};
    });

    // Add it to the queue for onmessage
    queue[action].push(this);

    ws.send(JSON.stringify({
      action,
      message: value
    }));

    // Return the promise to allow .then
    return this.promise;
  }

  finish (success, message) {
    // Resolve or reject promise depending on the success status
    success ? this.actions.resolve() : this.actions.reject(message);
  }
}

document.querySelector('[data-action="PlayerText"]').addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    // The server will return this action as PlayerText instead of text.
    new Action('text', e.target.value).then(
      res => {
        console.log('Message confirmed', res);
      },
      err => {
        console.log('Message denied. Reason:', err);
      }
    );
  }
});

ws.onmessage = message => {
  const res = JSON.parse(message.data);
  const action = res.action.replace('Player', '').toLowerCase();

  switch (res.action) {
    case 'PlayerText':
      if (res.success !== undefined) {
        queue[action].shift().finish(res.success, res.message);
      }
      break;
  }
}