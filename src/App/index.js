import React, { Component } from 'react';
import Demo from './Demo'
import './index.css'

class App extends Component {
  render() {
    return (
      <div className="App">
        <div style={{padding: 30}}> Createjs Dnd System Demo </div>
        <Demo/>
      </div>
    );
  }
}

export default App;
