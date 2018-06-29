import React, { Component } from 'react'
import ParticleSystem from './ParticleSystem'
import {
  createDndContext,
  createDndDragSource,
  createDndDropTarget
} from './DndSystem'
import { 
  centerText,
  createText, 
  pascalCase 
} from '../util'

const {
  Stage,
  Container,
  Shape,
  Ticker,
  Text,
} = window.createjs

const {
  resetParticles,
  updateParticles,
  setParticleCoords,
  createParticles
} = ParticleSystem

const PARTICLE_SPEED = 15
const PARTICLE_LIFE = 5
const NUM_COINS = 5
const NUM_PARTICLES = 25
const COIN_RADIUS = 20
const PLAYER_WIDTH = 50
const PLAYER_HEIGHT = 50
const WIDTH = 640
const HEIGHT = 480

const KEY = {
  END: 35,
  HOME: 36,
  LEFT: 37,
  RIGHT: 39,
  UP: 38,
  DOWN: 40,
  BACKSPACE: 8,
  DELETE: 46,
  ENTER: 13,
  P: 80
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
  sceneName: 'title',
  particleLife: 5
}

// main game Canvas container, class for context access
class Game extends Component {
  constructor(props) {
    super(props)
    this.Ticker = Ticker
    this.stage = {}
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

    if (gameState.sceneName === 'title') {
      if(isKey(KEY.ENTER)) {
        this.titleExit()
        this.difficultySelectEnter()
      }
      return
    } else if (gameState.sceneName === 'difficultySelect') {
      // TODO: disabling play scene enter for work on drag and drop POC
      // keyDown events aren't going to be handled by drag and drop either
      // this.difficultySelectExit()
      // this.playEnter()
      return

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
    } else if (isKey(KEY.UP)) {
      gameState.isMoving = true      
      gameState.moveUp = true
    } else if (isKey(KEY.P)) {
      this.togglePause()
    }
  }

  onKeyUp = (event) => {
    const isKey = (keyMatch) => event.keyCode === keyMatch

    if (gameState.sceneName === 'play') {
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
    const coin = new Container()

    coinShape.graphics.beginFill('yellow').drawCircle(0, 0, COIN_RADIUS)
    coinShape.x = 0
    coinShape.y = 0

    coin.addChild(coinShape)
    return coin
  }

  createContainerWithRectShape({
    color = 'blue',
    x = 0,
    y = 0,
    width = null,
    height = null
  }) {
    if (!width || !height) {
      throw new Error('createContainerWithRectShape: did not supply width or height')
    }

    const shape = new Shape()
    const container = new Container()

    shape.graphics.beginFill(color).drawRect(x, y, width, height)
    shape.x = x
    shape.y = y
    shape.regX = x
    shape.regY = y
    
    container.addChild(shape)
    return container
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
   * concatenates sceneName param to create reference to correct scene to enter
   * @param {string} sceneName - string used to look up which scene to enter
   * @returns {void}
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
    const {
      width: WIDTH,
      height: HEIGHT
    } = this.gameCanvas

    const stage = this.stage
    const titleText = 'Coin Grabber - TITLE'
    const subtitleText = 'Coin Grabber - subtitle'

    const titleTextObj = createText(
      centerText(this.ctx, WIDTH, titleText), 
      HEIGHT / 2 - 50, 
      titleText
    )
    const subTitleTextObj = createText(
      centerText(this.ctx, WIDTH, subtitleText), 
      HEIGHT / 2, 
      subtitleText
    )
    const scene = new Container()
    scene.addChild(titleTextObj)
    scene.addChild(subTitleTextObj)
    gameState.scene = scene
    stage.addChild(scene)
    gameState.stage = stage
    gameState.stage.update()
  }

  titleUpdate = (event, gameState) => {
    // TODO: update Title Scene
    gameState.stage.update()
  }

  titleExit = () => {
    // TODO: exit Title Scene
    this.stage.removeChild(gameState.scene)
  }

  difficultySelectUpdate = (event, gameState) => {
    gameState.stage.update()
  }

  difficultySelectExit = () => {
    this.stage.removeChild(gameState.scene)
  }

  difficultySelectEnter = () => {
    const {
      width: WIDTH,
      height: HEIGHT
    } = this.gameCanvas

    gameState.sceneName = 'difficultySelect'

    const stage = this.stage
    const titleText = 'SELECT'
    const subtitleText = 'DIFFICULTY'

    // TODO: hardcoded offsets for now
    const titleTextObj = createText(
      centerText(this.ctx, WIDTH, titleText) - 200, 
      HEIGHT / 2, 
      titleText
    )
    const subTitleTextObj = createText(
      centerText(this.ctx, WIDTH, subtitleText) + 200, 
      HEIGHT / 2, 
      subtitleText
    )

    // **** START OF POC ****
    const scene = new Container()
    // add the context display object to the scene
    const contextObj = this.createContainerWithRectShape({
      color: 'lightgreen', 
      x: 0, 
      y: 0, 
      width: WIDTH, 
      height: HEIGHT
    })

    const wrapContextObj = createDndContext(contextObj)

    // add the dragSource display object to the context
    const dragSourceObj = this.createContainerWithRectShape({
      color: 'orange', 
      x: 50, 
      y: 50, 
      width: 50, 
      height: 50
    })

    const wrapDragSourceObj = createDndDragSource(dragSourceObj)

    
    // add the dropTarget display object to the context
    const dropTargetObj = this.createContainerWithRectShape({
      color: 'yellow', 
      x: 150, 
      y: 150, 
      width: 200, 
      height: 100
    })

    const wrapDropTargetObj = createDndDropTarget(dropTargetObj)

    wrapContextObj.addChild(wrapDragSourceObj)
    wrapContextObj.addChild(wrapDropTargetObj)
    scene.addChild(wrapContextObj)
    scene.addChild(titleTextObj)
    scene.addChild(subTitleTextObj)
    gameState.scene = scene
    stage.addChild(scene)
    gameState.stage = stage
    gameState.stage.update()
  }

  playEnter = () => {

    const stage = this.stage

    const player = this.createContainerWithRectShape({
      color: 'blue',
      x: 0,
      y: 0,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT
    })
    gameState.player = player
  
    // set up HUD
    this.scoreText = createText(30, 30, gameState.score)
    this.timerText = createText(30, 50, gameState.timer)

    const particleList = createParticles(NUM_PARTICLES)

    const scene = new Container()
    scene.addChild(particleList)
    scene.addChild(player)
    this.addRandomCoins(scene)
    scene.mouseChildren = true
    stage.addChild(scene)
    scene.addChild(this.scoreText)
    scene.addChild(this.timerText)
    gameState.scene = scene
    gameState.sceneName = 'play'

    // add a master reference to stage
    gameState.stage = stage
    // after initial update - now set positions, so shapes line up with containers
    gameState.player.x = WIDTH / 2 - PLAYER_WIDTH / 2
    gameState.player.y = HEIGHT / 2 - PLAYER_HEIGHT / 2
    gameState.coins.forEach( (coin, index) => {
      let x = Math.floor(Math.random() * (this.gameCanvas.width - COIN_RADIUS * 2)) + COIN_RADIUS
      let y = Math.floor(Math.random() * (this.gameCanvas.height - COIN_RADIUS * 2)) + COIN_RADIUS
      // 0 --> yellow circle
      coin.children[0].x = x
      coin.children[0].y = y
      // TODO: quick debug trick for helping with coin detection
      const text = createText(x, y, `${index}`)
      coin.addChild(text)
    })
  }
  playUpdate = (event, gameState) => {
    if (!gameState.paused) {
      if (gameState.isMoving) {
        this.movePlayer(gameState)
        this.checkCollision(gameState, gameState.scene)
      }

      if (gameState.showParticles) {
        // TODO: cleanup: particle list === gameState.scene.children[0]
        const particleList = gameState.scene.children[0]
        particleList.visible = true
        updateParticles(particleList, PARTICLE_SPEED)
        gameState.particleLife -= event.delta / 1000
        if (gameState.particleLife <= 0) {
          gameState.scene.children[0].visible = false
          gameState.particleLife = PARTICLE_LIFE
          resetParticles(particleList)
          gameState.showParticles = false
        }
      }
      this.updateHUD(event, gameState)

      if (gameState.timer <= 0) {
        gameState.sceneName = 'gameOver'
        this.playExit()
        this.gameOverEnter()
        return
      }

      gameState.stage.update()
    }
  }

  handlePlayEvent = () => {

  }

  playExit = () => {
    this.stage.removeChild(gameState.scene)
  }

  gameOverEnter = () => {
    // TODO: enter game over scene
    const stage = this.stage
    const titleText = 'GAME OVER - TITLE'
    const subtitleText = 'GAME OVER - subtitle'

    const titleTextObj = createText(
      centerText(this.ctx, WIDTH, titleText), 
      HEIGHT / 2 - 50, 
      titleText
    )
    const subTitleTextObj = createText(
      centerText(this.ctx, WIDTH, subtitleText), 
      HEIGHT / 2, 
      subtitleText
    )
    const scene = new Container()
    scene.addChild(titleTextObj)
    scene.addChild(subTitleTextObj)
    gameState.scene = scene
    stage.addChild(scene)
    gameState.stage = stage
    gameState.stage.update()
  }

  gameOverUpdate = (event, gameState) => {}

  gameOverExit = () => {}

  handleEvent = (event, sceneName) => {
    // this[`handle${pascalCase(sceneName)}Event`](event)
  }

  componentWillUnmount() {
    this.Ticker = null
    gameState.scene = null
    gameState.stage = null

    window.document.removeEventListener('keydown', this.onKeyDown)
    window.document.removeEventListener('keyup', this.onKeyUp)
    window.document.removeEventListener('keypress', this.onKeyPress)
  }

  componentDidMount() {
    // game init stuff
    this.stage = new Stage(this.gameCanvas)
    this.ctx = this.stage.canvas.getContext('2d')

    window.document.addEventListener('keydown', this.onKeyDown)
    window.document.addEventListener('keyup', this.onKeyUp)
    window.document.addEventListener('keypress', this.onKeyPress)

    // init Particle System
    ParticleSystem.init()
    this.Ticker.timingMode = Ticker.RAF_SYNCHED;
    this.Ticker.framerate = 40;

    this[`${gameState.sceneName}Enter`]()
    this.gameCanvas.focus()
    // handle event then update scene state - pretty standard stuff
    const masterTick = (event) => {
      this.handleEvent(event, gameState.sceneName)
      // gameState is a global
      this[`${gameState.sceneName}Update`](event, gameState)
    }
    this.Ticker.on("tick", (event) => masterTick(event))
  }

  updateHUD = (event, gameState) => {
    gameState.timer -= event.delta / 1000;
    this.timerText.text = Math.trunc(gameState.timer)
    this.scoreText.text = gameState.score
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
    if (gameState.player.x >= (WIDTH - PLAYER_WIDTH)) {
      gameState.player.x -= 15
    }
    if (gameState.player.y <= 0) {
      gameState.player.y += 15
    }
    if (gameState.player.y >= (HEIGHT - PLAYER_HEIGHT)) {
      gameState.player.y -= 15
    }
  }

  hitCoin = (gameState, scene) => {
    gameState.coins.forEach((coin, index) => {
      const playerX = gameState.player.x
      const playerY = gameState.player.y
      const coinX = coin.children[0].x
      const coinY = coin.children[0].y
      const centerPlayerX = playerX + PLAYER_WIDTH / 2
      const centerPlayerY = playerY + PLAYER_HEIGHT / 2

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
        gameState.showParticles = true
        // FIXME: hardcoded "assumed" that child 0 is particleList
        setParticleCoords(scene.children[0], playerX, playerY)
        scene.removeChild(coin)
        gameState.coins.splice(index, 1) 
        return 
      } 
      
      if (distY <= (PLAYER_HEIGHT / 2)) { 
        ++gameState.score
        gameState.showParticles = true
        // FIXME: hardcoded "assumed" that child 0 is particleList
        setParticleCoords(scene.children[0], playerX, playerY)
        scene.removeChild(coin)
        gameState.coins.splice(index, 1)
        return 
      }
    })
  }

  render () {
    return ( 
      <canvas 
        width={WIDTH} 
        height={HEIGHT} 
        style={{
          border: '1px solid red',
          background: 'lightgrey'
        }} 
        ref={(elem => this.gameCanvas = elem)}
      /> 
    )
  }
}

export default Game