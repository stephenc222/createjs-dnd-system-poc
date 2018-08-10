class Dispatcher {
  constructor() {
    this._listeners = []
  }

  // called once
  listen(listener, eventName) {
    this._listeners.push({listener, eventName})
  }
  // dispatched to then update the listener function
  dispatch(eventName, eventData) {
    this._listeners.forEach( ({listener, eventName: name }) => {
      if (name === eventName) {
        // call the listener associated with the event dispatch
        listener && listener(eventName, eventData)
      }
    })
  }
}

// deal with a singleton for now
const dispatcher = new Dispatcher()
export default dispatcher