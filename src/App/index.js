import React, { Component } from 'react';
import Game from './Game'
import './index.css'

class App extends Component {
  render() {
    return (
      <div className="App">
        <div style={{padding: 30}}> Createjs Dnd System Demo </div>
        <Game/>
      </div>
    );
  }
}

export default App;
