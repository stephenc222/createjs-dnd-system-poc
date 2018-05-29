import React, { Component } from 'react'

const {
  Stage,
  Container,
  Shape,
  Ticker
} = window.createjs

const NUM_COINS = 5
const COIN_RADIUS = 20
const PLAYER_WIDTH = 50
const PLAYER_HEIGHT = 50


const KEY = {
  END: 35,
  HOME: 36,
  LEFT: 37,
  RIGHT: 39,
  UP: 38,
  DOWN: 40,
  BACKSPACE: 8,
  DELETE: 46,
  ENTER: 13
}

const CURSOR_KEYS = [
  KEY.UP,
  KEY.DOWN,
  KEY.LEFT,
  KEY.RIGHT
]

const gameState = {
  player: null,
  coins: [],
  score: 0,
  timer: 100,
  paused: false,
  moveLeft: false,
  moveRight: false,
  moveDown: false,
  moveUp: false,
  isMoving: false
}

// main game Canvas container, class for context access
class Game extends Component {

  constructor(props) {
    super(props)
    this.Ticker = Ticker
  }

  togglePause = () => {
    gameState.paused = !gameState.paused
  }

  onKeyDown = (event) => {

    const {
      metaKey,
      keyCode,
    } = event

    const isKey = (keyMatch) => keyCode === keyMatch

    if (isKey(KEY.LEFT)) {
      gameState.isMoving = true
      gameState.moveLeft = true
    } else if (isKey(KEY.RIGHT)) {
      gameState.isMoving = true
      gameState.moveRight = true
    } else if (isKey(KEY.DOWN)) {
      gameState.isMoving = true
      gameState.moveDown = true
    } if (isKey(KEY.UP)) {
      gameState.isMoving = true      
      gameState.moveUp = true
    }
  }

  onKeyUp = (event) => {
    const isKey = (keyMatch) => event.keyCode === keyMatch

    if (isKey(KEY.LEFT)) {
      gameState.moveLeft = false
    } else if (isKey(KEY.RIGHT)) {
      gameState.moveRight = false
    } else if (isKey(KEY.DOWN)) {
      gameState.moveDown = false
    } if (isKey(KEY.UP)) {
      gameState.moveUp = false
    }

    // if none of these are true, then stop moving
    if (!gameState.moveDown && !gameState.moveLeft && !gameState.moveUp && !gameState.moveRight) {
      gameState.isMoving = false
    }

  }

  onKeyPress = (event) => {
    const {
      charCode,
      keyCode,
      shiftKey
    } = event
  }

  createCoin(x, y) {
    // create the ball
    const coinShape = new Shape()
    coinShape.graphics.beginFill("yellow").drawCircle(0, 0, COIN_RADIUS)
    coinShape.x = x
    coinShape.y = y
    // playerShape.setBounds(0, , 24, 24)

    const coin = new Container()
    coin.addChild(coinShape)
    return coin
  }
  
  addRandomCoins = (scene) => {    
    const coins = []
    for (let i = 0; i < NUM_COINS; ++i) {
      // quick hack seems to make the coins not partially drawn off canvas
      let x = Math.floor(Math.random() * (this.gameCanvas.width - COIN_RADIUS * 2)) + COIN_RADIUS
      let y = Math.floor(Math.random() * (this.gameCanvas.height - COIN_RADIUS * 2)) + COIN_RADIUS
      let coin = this.createCoin(x,y)
      console.log({coin})
      scene.addChild(coin)
      coins.push(coin)
    }

    gameState.coins = coins    
  }

  componentDidMount() {
    // game init stuff

    window.document.onkeydown = this.onKeyDown;
    window.document.onkeyup = this.onKeyUp;
    window.document.onkeypress = this.onKeyPress;

    const {
      width: WIDTH,
      height: HEIGHT
    } = this.gameCanvas

    const stage = new Stage(this.gameCanvas)

    // create the ball
    const playerShape = new Shape()
    playerShape.graphics.beginFill("blue").drawRect(0, 0, PLAYER_WIDTH, PLAYER_HEIGHT)
    playerShape.x = WIDTH / 2 - PLAYER_WIDTH / 2
    playerShape.y = HEIGHT / 2 - PLAYER_HEIGHT / 2

    const player = new Container()
    player.addChild(playerShape)
    gameState.player = player

    const scene = new Container()
    scene.addChild(player)
    this.addRandomCoins(scene)
    scene.mouseChildren = true
    stage.addChild(scene)

    stage.update();

    this.Ticker.timingMode = Ticker.RAF_SYNCHED;
    this.Ticker.framerate = 40;

    const tick = () => {
      if (!gameState.paused) {
        if (gameState.isMoving) {
          this.movePlayer(gameState)
          this.checkCollision(gameState)
        }
        stage.update()
      }
    }
    this.Ticker.on("tick", tick)

  }

  // the gameState is passed as a shallow copied object, not deep copied
  // so relying on maintained references works

  // TODO: improve "smoothness" of player movement
  movePlayer = (gameState) => {
    gameState.moveDown && (gameState.player.y += 15)
    gameState.moveUp && (gameState.player.y -= 15)
    gameState.moveRight && (gameState.player.x += 15)
    gameState.moveLeft && (gameState.player.x -= 15)
  }

  checkCollision = (gameState) => {
    this.hitCanvasEdge(gameState)
    this.hitCoin(gameState)
  }

  hitCanvasEdge(gameState) {
    // TODO: find out why '315' and '225' is nice-ish here...
    if (gameState.player.x <= -315) {
      gameState.player.x += 15
    }
    if (gameState.player.x >= 315) {
      gameState.player.x -= 15
    }
    if (gameState.player.y <= -225) {
      gameState.player.y += 15
    }
    if (gameState.player.y >= 225) {
      gameState.player.y -= 15
    }
  }

  // TODO: work on coin collision
  hitCoin(gameState) {
    gameState.coins.forEach((coin, index) => {
      const playerX = gameState.player.x
      const playerY = gameState.player.y
      const coinX = coin.children[0].x
      const coinY = coin.children[0].y
      if(playerX <= coinX - COIN_RADIUS && playerX + PLAYER_WIDTH >= coinX + COIN_RADIUS ) {
        console.log('hit coin')
      }
    })
  }

  render () {
    return ( <canvas 
      width={640} 
      height={480} 
      style={{
        border: '1px solid red',
        background: 'darkgrey'
      }} 
      ref={(elem => this.gameCanvas = elem)}
      onClick={this.togglePause}
      onKeyDown={this.onKeyDown}
      onKeyPress={this.onKeyPress}
      onKeyUp={this.onKeyUp}
    /> )
  }
}

export default Game