import React, { Component } from 'react'
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
        this.demoEnter()
      }
      return
    } else if (gameState.sceneName === 'demo') {
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
    const titleText = 'Createjs Dnd Demo'
    const subtitleText = 'Press Enter to start Demo'

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

  demoUpdate = (event, gameState) => {
    gameState.stage.update()
  }

  demoExit = () => {
    this.stage.removeChild(gameState.scene)
  }

  demoEnter = () => {
    const {
      width: WIDTH,
      height: HEIGHT
    } = this.gameCanvas

    gameState.sceneName = 'demo'

    const stage = this.stage
    const titleText = 'Drag the squares to the corresponding colored bin'
    // const subtitleText = 'DIFFICULTY'

    const titleTextObj = createText(
      centerText(this.ctx, WIDTH, titleText), 
      50, 
      titleText
    )

    const scene = new Container()

    // create the dragSource display object to the context
    const dragSourceObj = this.createContainerWithRectShape({
      color: 'orange', 
      x: 50, 
      y: 50, 
      width: 50, 
      height: 50
    })

    const wrapDragSourceObj = createDndDragSource(dragSourceObj)
    
    // create the dropTarget display object to the context
    const dropTargetObj = this.createContainerWithRectShape({
      color: 'yellow', 
      x: 150, 
      y: 150, 
      width: 200, 
      height: 100
    })

    const wrapDropTargetObj = createDndDropTarget(dropTargetObj)

    // create the context display object to the scene
    const contextObj = this.createContainerWithRectShape({
      color: 'lightgreen', 
      x: 0, 
      y: 0, 
      width: WIDTH, 
      height: HEIGHT
    })

    // TODO: add in-depth documentation on how to use these callbacks and what they expect
    const dragEventCallbacks = {
      onDragStart: ({dragSourceRef, dropTargetRef}) => {
        console.warn('onDragStart:', {dragSourceRef, dropTargetRef})
      },
      onDragEnd: ({dragSourceRef, dropTargetRef}) => {
        console.warn('onDragEnd:', {dragSourceRef, dropTargetRef})
      },
      onHover: ({dragSourceRef, dropTargetRef}, hoversOnTarget) => {
        console.warn('onHover:', {dragSourceRef, dropTargetRef}, hoversOnTarget)
      },
      onDrop: ({dragSourceRef, dropTargetRef}, didDropOnTarget) => {
        console.warn('onDrop:', {dragSourceRef, dropTargetRef}, didDropOnTarget)
      },
    }

    const wrapContextObj = createDndContext(
      contextObj, 
      wrapDragSourceObj, 
      wrapDropTargetObj,
      {...dragEventCallbacks}
    )

    scene.addChild(wrapContextObj)
    scene.addChild(titleTextObj)
    gameState.scene = scene
    stage.addChild(scene)
    gameState.stage = stage
    gameState.stage.update()
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

    this.Ticker.timingMode = Ticker.RAF_SYNCHED;
    this.Ticker.framerate = 40;

    this[`${gameState.sceneName}Enter`]()
    this.gameCanvas.focus()
    // handle event then update scene state - pretty standard stuff
    const masterTick = (event) => {
      // gameState is a global
      this[`${gameState.sceneName}Update`](event, gameState)
    }
    this.Ticker.on("tick", (event) => masterTick(event))
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