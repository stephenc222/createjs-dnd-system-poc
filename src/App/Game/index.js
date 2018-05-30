import React, { Component } from 'react'

const {
  Stage,
  Container,
  Shape,
  Ticker,
  Text
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

  // rough text for now
  createText = (x, y, textVal) => {
    const text = new Text(textVal, "20px Arial", "#000");
    text.x = x;
    text.y = y
    text.textBaseline = "alphabetic";
    return text
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

  createCoin() {
    // create the ball
    const coinShape = new Shape()
    coinShape.graphics.beginFill("yellow").drawCircle(0, 0, COIN_RADIUS)
    coinShape.x = 0
    coinShape.y = 0
    // playerShape.setBounds(0, , 24, 24)

    const coin = new Container()
    coin.addChild(coinShape)
    return coin
  }
  
  addRandomCoins = (scene) => {    
    const coins = []
    for (let i = 0; i < NUM_COINS; ++i) {
      // quick hack seems to make the coins not partially drawn off canvas
      let coin = this.createCoin()
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
    playerShape.x = 0 
    playerShape.y = 0

    const player = new Container()
    player.addChild(playerShape)
    gameState.player = player

    const scene = new Container()
    scene.addChild(player)
    this.addRandomCoins(scene)
    scene.mouseChildren = true
    stage.addChild(scene)

    stage.update();
    // after initial update - now set positions, so shapes line up with containers
    gameState.player.x = WIDTH / 2 - PLAYER_WIDTH / 2
    gameState.player.y = HEIGHT / 2 - PLAYER_HEIGHT / 2
    gameState.coins.forEach( (coin, index) => {
      let x = Math.floor(Math.random() * (this.gameCanvas.width - COIN_RADIUS * 2)) + COIN_RADIUS
      let y = Math.floor(Math.random() * (this.gameCanvas.height - COIN_RADIUS * 2)) + COIN_RADIUS
      coin.children[0].x = x
      coin.children[0].y = y
      // TODO: quick debug trick for helping with coin detection
      const text = this.createText(x, y, `${index}`)
      coin.addChild(text)
    })

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
    if (gameState.player.x <= 0) {
      gameState.player.x += 15
    }
    if (gameState.player.x >= (640 - PLAYER_WIDTH)) {
      gameState.player.x -= 15
    }
    if (gameState.player.y <= 0) {
      gameState.player.y += 15
    }
    if (gameState.player.y >= (480 - PLAYER_HEIGHT)) {
      gameState.player.y -= 15
    }
  }

  // TODO: work on coin collision - improve efficiency of hit calc
  hitCoin(gameState) {
    gameState.coins.forEach((coin, index) => {
      const playerX = gameState.player.x
      const playerY = gameState.player.y
      const coinX = coin.children[0].x
      const coinY = coin.children[0].y
      const centerPlayerX = gameState.player.x + PLAYER_WIDTH / 2
      const centerPlayerY = gameState.player.y + PLAYER_HEIGHT / 2
          
      const  corner1 = {
        x: (centerPlayerX + PLAYER_WIDTH / 2), 
        y: (centerPlayerY + PLAYER_HEIGHT / 2)
      }
      const  corner2 = {
        x: (centerPlayerX + PLAYER_WIDTH / 2), 
        y: (centerPlayerY - PLAYER_HEIGHT / 2)
      }
      const  corner3 = {
        x: (centerPlayerX - PLAYER_WIDTH / 2), 
        y: (centerPlayerY + PLAYER_HEIGHT / 2)
      }
      const  corner4 = {
        x: (centerPlayerX - PLAYER_WIDTH / 2), 
        y: (centerPlayerY - PLAYER_HEIGHT / 2)
      }

      // distance from corner to circle center is less than or equal to radius === hit
      // distance = Math.sqrt((coinX-cornerX)**2 + (coinY - cornerY)**2 )
      // TODO: sqrts are expensive
      const distanceFromCircle1 = Math.sqrt((coinX-corner1.x)**2 + (coinY - corner1.y)**2 )
      const distanceFromCircle2 = Math.sqrt((coinX-corner2.x)**2 + (coinY - corner2.y)**2 )
      const distanceFromCircle3 = Math.sqrt((coinX-corner3.x)**2 + (coinY - corner3.y)**2 )
      const distanceFromCircle4 = Math.sqrt((coinX-corner4.x)**2 + (coinY - corner4.y)**2 )

      if (distanceFromCircle1 <= COIN_RADIUS) {
        console.log('hit via corner 1', {index})
      } else if (distanceFromCircle2 <= COIN_RADIUS) {
        console.log('hit via corner 2', {index})
      } else if (distanceFromCircle3 <= COIN_RADIUS) {
        console.log('hit via corner 3', {index})
      } else if (distanceFromCircle4 <= COIN_RADIUS) {
        console.log('hit via corner 4',{index})
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