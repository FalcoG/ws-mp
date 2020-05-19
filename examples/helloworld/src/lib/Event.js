class Event {
  constructor (e, task, element, start) {
    if(typeof(e) === 'string') e = [e];
    if(typeof(element) === 'undefined') element = window;
    if(typeof(start) === 'undefined') start = true;

    this.e = e;
    this.task = task;
    this.element = element;

    if(start) this.start();
    console.log(`Event ${e} has been added.`);
  }

  start () {
    const element = this.element;
    const task = this.task;

    this.e.forEach(function (eventName) {
      if(typeof(element) === 'object' && element.length){
        for(let i = 0; i < element.length; i++){
          element[i].addEventListener(eventName, task);
        }
      }else{
        element.addEventListener(eventName, task);
      }
    });
  }

  stop () {
    const element = this.element;
    const task = this.task;

    this.e.forEach(function (eventName) {
      if(typeof(element) === 'object' && element.length){
        for(let i = 0; i < element.length; i++){
          element[i].removeEventListener(eventName, task);
        }
      }else{
        element.removeEventListener(eventName, task);
      }
    });
  }
}

export default Event;