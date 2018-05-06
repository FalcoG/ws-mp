const ws = new WebSocket('ws://localhost:1338');

import './scss/main.scss';

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
    if (!queue[action]) queue[action] = []

    queue[action].push(this);

    ws.send(JSON.stringify({
      action,
      message: value
    }));

    // Return the promise to allow .then
    return this.promise;
  }

  finish (error) {
    // Resolve or reject promise depending on the success status
    !error ? this.actions.resolve() : this.actions.reject(error);
  }
}

document.querySelector('[data-action="PlayerText"]').addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    e.target.setAttribute('disabled', true);
    new Action('text', e.target.value).then(
      res => {
        console.log('Message confirmed', res);
        e.target.value = '';
        e.target.removeAttribute('disabled');
        e.target.focus();
      },
      err => {
        console.log('Message denied. Reason:', err);
        e.target.removeAttribute('disabled');
      }
    );
  }
});

ws.onmessage = message => {
  const res = JSON.parse(message.data);
  const action = res.action.replace('Player', '').toLowerCase();

  if (!res.id) {
    const item = queue[action].shift();

    item.finish(res.error);

    if (res.error) return;
  }

  switch (res.action) {
    case 'PlayerText':
      if (res.success && !res.id || !res.success) {
        const elem = document.createElement('li');

        if (!res.id) {
          elem.classList.add('self');
        }

        elem.innerText = res.message;

        const output = document.querySelector('.chat .output');
        output.appendChild(elem);
        output.scrollTop = document.querySelector('.chat .output').scrollHeight;
      }
      break;
  }
}

document.addEventListener('keydown', (e) => {
  if (e.target === document.body) {
    const type = 'forward';

    new Action('movement', { type }).then(
      res => {
        console.log('Resolved', res);
      },
      err => {
        console.log('Failed to move', err);
      }
    );

    console.log('key is down', e);
  }
});