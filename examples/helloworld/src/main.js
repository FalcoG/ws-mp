const queryParams = new URLSearchParams(window.location.search);

const ws = new WebSocket(`ws://token:${queryParams.get('token')}@localhost:1338?token=${queryParams.get('token')}`);

import './scss/main.scss';

import Engine from './lib/Engine';
import Entity from './lib/Entity';

const queue = {};
const game = new Engine()

class Users {
  constructor () {
    this.users = {};
  }

  add (character, identifier = 'self') {
    character.entity = new Entity('player', character.meta);

    if (!character.name) {
      this.users = { ...this.users, ...character };
    } else {
      this.users[identifier] = character;

      if (identifier === 'self') GUI.update(character)
    }
  }

  get (identifier = 'self') {
    return this.users[identifier];
  }
}

const users = new Users();

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

class Interfaces {
  constructor (container) {
    this.elements = {
      PlayerText: container.querySelector('[data-action="PlayerText"]'),
      Condition: container.querySelector('.condition')
    }
  }

  update (character) {
    if (character.meta) {
      this.setPlayerConditions(character.meta.condition);
    }
  }

  close (e) {
    e.target.blur()
  }

  focus (element) {
    this.elements[element].focus()
  }

  setPlayerConditions (conditions) {
    if (!conditions) return false

    Object.keys(conditions).forEach(key => {
      this.setPlayerCondition(key, conditions[key])
    })

    return true;
  }

  setPlayerCondition (type, value) {
    const conditionElement = this.elements.Condition.getElementsByClassName(type)[0]
    conditionElement.querySelector('.quantity').textContent = value + '%'
    conditionElement.querySelector('.status').style.width = value + '%'
  }
}

const GUI = new Interfaces(document.getElementById('interface'));

GUI.elements.PlayerText.addEventListener('keyup', (e) => {
  if (e.key === 'Enter' && e.target.value.length) {
    e.target.setAttribute('disabled', true);
    new Action('text', e.target.value).then(
      res => {
        console.log('Message confirmed', res);
        e.target.value = '';
        e.target.removeAttribute('disabled');
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
  const character = users.get(res.id);

  if (!res.id && res.action !== 'Players' && res.action !== 'PlayerConnect') {
    const item = queue[action].shift();

    item.finish(res.error);

    if (res.error) return;
  }

  switch (res.action) {
    case 'Players':
      users.add(res.users);

      break;
    case 'PlayerConnect':
      users.add(res.character, res.id);

      break;
    case 'PlayerText':
      if (res.success && !res.id || !res.success) {
        const elem = document.createElement('li');

        elem.setAttribute('data-username', character.name);
        elem.setAttribute('data-uuid', res.id ? res.id : 'self');
        elem.innerText = res.message;

        const output = document.querySelector('.chat .output');
        output.appendChild(elem);
        output.scrollTop = document.querySelector('.chat .output').scrollHeight;
      }
      break;
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Meta' || e.metaKey || e.ctrlKey) return

  // Global shortcuts (must not type elsewhere)
  if (e.target === document.body) {
    console.log('key is down', e);

    e.preventDefault(); // Cancel the key output - does not fully work with [enter]

    switch (e.key) {
      case 'Enter':
      case 'j': // Battlefield
      case '/':
        GUI.focus('PlayerText');
        break;
      default:
        const type = 'forward';

        new Action('movement', { type }).then(
          res => {
            console.log('Resolved', res);
          },
          err => {
            console.log('Failed to move', err);
          }
        );
    }
  } else if (e.key === 'Escape') {
    console.log('Close');
    GUI.close(e);
  }
});

document.addEventListener('click', e => {
  if (e.target) {
    const uuid = e.target.getAttribute('data-uuid');

    if (uuid) {
      console.log(users.get(uuid));
    }
  }
})