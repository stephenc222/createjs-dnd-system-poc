import React, { Component } from 'react'
import { 
  createText, 
  pascalCase 
} from '../util'

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
  isMoving: false,
  sceneName: 'title'
}

// main game Canvas container, class for context access
class Game extends Component {

  constructor(props) {
    super(props)
    this.Ticker = Ticker
    this.stage = {}
  }

  // rough text for now
  
  togglePause = () => {
    gameState.paused = !gameState.paused
  }

  onKeyDown = (event) => {

    const {
      metaKey,
      keyCode,
    } = event

    const isKey = (keyMatch) => keyCode === keyMatch

    if (gameState.sceneName === 'title') {
      if(isKey(KEY.ENTER)) {
        this.titleExit()
        this.playEnter()
        gameState.sceneName = 'play'
      }
    }

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

    const coin = new Container()
    coin.addChild(coinShape)
    return coin
  }

  createPlayer() {
    const playerShape = new Shape()
    const player = new Container()

    playerShape.graphics.beginFill("blue").drawRect(0, 0, PLAYER_WIDTH, PLAYER_HEIGHT)
    playerShape.x = 0 
    playerShape.y = 0
    
    player.addChild(playerShape)

    return player
  }
  
  addRandomCoins = (scene) => {    
    const coins = []
    for (let i = 0; i < NUM_COINS; ++i) {
      // quick hack seems to make the coins not partially drawn off canvas
      const coin = this.createCoin()
      scene.addChild(coin)
      coins.push(coin)
    }

    gameState.coins = coins    
  }

  /**
   * concatenates sceneName param to create reference correct scene to enter
   * @param {string} sceneName - string used to look up which scene to enter
   */
  enterScene = (sceneName) => {
    gameState.sceneName = sceneName
    this[`${sceneName}Enter`]()
  }

  exitScene = (sceneName) => {
    this[`${sceneName}Exit`]()
  }

  titleHandleEvent = (event) => {}
  
  titleEnter = () => {
    // TODO: enter Title Scene
    const {
      width: WIDTH,
      height: HEIGHT
    } = this.gameCanvas

    const stage = this.stage
    // FIXME: position this better
    const titleText = createText(WIDTH / 2, HEIGHT / 2 - 50, 'Coin Grabber - TITLE')
    const subTitleText = createText(WIDTH / 2, HEIGHT / 2, 'Coin Grabber - subtitle')
    const scene = new Container()
    scene.addChild(titleText)
    scene.addChild(subTitleText)
    gameState.scene = scene
    stage.addChild(scene)
    stage.update()
    gameState.stage = stage
  }

  titleUpdate = (gameState) => {
    // TODO: update Title Scene
    gameState.stage.update()
  }

  titleExit = () => {
    // TODO: exit Title Scene
    this.stage.removeChild(gameState.scene)
  }

  playEnter = () => {
    const {
      width: WIDTH,
      height: HEIGHT
    } = this.gameCanvas

    const stage = this.stage

    const player = this.createPlayer()
    gameState.player = player
  
    // set up HUD
    this.scoreText = createText(30, 30, gameState.score)
    this.timerText = createText(30, 50, gameState.timer)

    const scene = new Container()
    scene.addChild(player)
    this.addRandomCoins(scene)
    scene.mouseChildren = true
    stage.addChild(scene)
    scene.addChild(this.scoreText)
    scene.addChild(this.timerText)
    gameState.scene = scene

    stage.update()
    // add a master reference to stage
    gameState.stage = stage
    // after initial update - now set positions, so shapes line up with containers
    gameState.player.x = WIDTH / 2 - PLAYER_WIDTH / 2
    gameState.player.y = HEIGHT / 2 - PLAYER_HEIGHT / 2
    gameState.coins.forEach( (coin, index) => {
      let x = Math.floor(Math.random() * (this.gameCanvas.width - COIN_RADIUS * 2)) + COIN_RADIUS
      let y = Math.floor(Math.random() * (this.gameCanvas.height - COIN_RADIUS * 2)) + COIN_RADIUS
      coin.children[0].x = x
      coin.children[0].y = y
      // TODO: quick debug trick for helping with coin detection
      const text = createText(x, y, `${index}`)
      coin.addChild(text)
    })

  }
  playUpdate = (gameState) => {
    if (!gameState.paused) {
      if (gameState.isMoving) {
        this.movePlayer(gameState)
        this.checkCollision(gameState, gameState.scene)
      }
      this.updateHUD(gameState)
      gameState.stage.update()
    }
  }

  handlePlayEvent = () => {

  }

  playExit = () => {}

  gameOverEnter = () => {
    // TODO: enter game over scene
  }

  gameOverUpdate = () => {}

  gameOverExit = () => {}

  handleEvent = (event, sceneName) => {
    this[`handle${pascalCase(sceneName)}Event`]
  }


  componentDidMount() {
    // game init stuff
    this.stage = new Stage(this.gameCanvas)

    window.document.onkeydown = this.onKeyDown;
    window.document.onkeyup = this.onKeyUp;
    window.document.onkeypress = this.onKeyPress;

    this.Ticker.timingMode = Ticker.RAF_SYNCHED;
    this.Ticker.framerate = 40;

    // handle event then update scene state - pretty standard stuff
    const masterTick = (event) => {
      this.handleEvent(event, gameState.sceneName)
      // gameState is a global
      this[`${gameState.sceneName}Update`](gameState)
    }
    this.Ticker.on("tick", (event) => masterTick(event))

    this[`${gameState.sceneName}Enter`]()
    
  }

updateHUD = (gameState) => {
  this.timerText.text =  gameState.timer
  this.scoreText.text =  gameState.score
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

  checkCollision = (gameState, scene) => {
    this.hitCanvasEdge(gameState)
    this.hitCoin(gameState, scene)
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

  hitCoin = (gameState, scene) => {
    gameState.coins.forEach((coin, index) => {
      const playerX = gameState.player.x
      const playerY = gameState.player.y
      const coinX = coin.children[0].x
      const coinY = coin.children[0].y
      const centerPlayerX = gameState.player.x + PLAYER_WIDTH / 2
      const centerPlayerY = gameState.player.y + PLAYER_HEIGHT / 2

      const distX = Math.abs(coinX - centerPlayerX)
      const distY = Math.abs(coinY - centerPlayerY)

      if (distX > (PLAYER_WIDTH / 2 + COIN_RADIUS)) { 
        return
      }
      if (distY > (PLAYER_HEIGHT / 2 + COIN_RADIUS)) { 
        return
      }

      if (distX <= (PLAYER_WIDTH / 2)) {
        ++gameState.score
        scene.removeChild(coin)
        gameState.coins.splice(index, 1) 
        return 
      } 
      
      if (distY <= (PLAYER_HEIGHT / 2)) { 
        ++gameState.score
        scene.removeChild(coin)
        gameState.coins.splice(index, 1)
        return 
      }
      
    })
  }

  render () {
    return ( 
      <canvas 
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
      /> 
    )
  }
}

export default Game