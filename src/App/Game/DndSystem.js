/**
 * DND System
 * 
 * modelling drag and drop on a canvas after React Dnd
 * 
 */

// NOTE: DS - DragSource

const _internalState = {
  isMouseMoving: false,
  dragSourceRef: {},
  dropTargetRef: {},
  initialOffset: {
    x: null,
    y: null
  }
}

// TODO: maybe add a config setting to "auto center" mouse on drag source
const handlePressMove = (event) => {
  // first pressMove event here  - cache initial offset for this drag event in progress
  const {
    target,
    stageX,
    stageY
  } = event

  if (!_internalState.isMouseMoving) {
    _internalState.initialOffset.x = target.x - stageX
    _internalState.initialOffset.y = target.y - stageY
  }
  _internalState.isMouseMoving = true

  target.x = stageX + _internalState.initialOffset.x
  target.y = stageY + _internalState.initialOffset.y
  if(_internalState.dropTargetRef.hitTest(target.x, target.y)) {
    // hovers on target is true here
  }
}

const handleDrop = ({targetX, targetY}) => {
  if(_internalState.dropTargetRef.hitTest(targetX, targetY)) {
    // drops on target is true here
  }
}

const handlePressUp = (event) => {
  event.preventDefault()
  _internalState.isMouseMoving = false
  handleDrop({
    targetX: event.target.x,
    targetY: event.target.y
  })
}

const createDndContext = (contextObj, dragSourceObj, dropTargetObj) => {
  // add a dndType flag to the display object
  contextObj.dndType = 'dnd_context'

  // in case dndType was arbitrarily overwritten/removed
  if (dragSourceObj.dndType !== 'dnd_drag_source' 
  || dropTargetObj.dndType !== 'dnd_drop_target') {
    throw new Error('The DragSource or the DropTarget params do not have valid dndTypes')
  }

  dragSourceObj.addEventListener("pressmove", handlePressMove)
  dragSourceObj.addEventListener("pressup", handlePressUp)
  
  dropTargetObj.addEventListener('pressmove', (e) => console.log('mouseover'))

  _internalState.dragSourceRef = dragSourceObj
  _internalState.dropTargetRef = dropTargetObj
  // to enable the contextObj display object to ensure an ability to manage the
  // dragSource and dropTarget via reference
  contextObj.addChild(
    _internalState.dropTargetRef,
    _internalState.dragSourceRef
  )

  return contextObj
}

const createDndDragSource = (displayObject) => {
  // add a dndType flag to the display object
  displayObject.dndType = 'dnd_drag_source'
  return displayObject
}

const createDndDropTarget = (displayObject) => {
  // add a dndType flag to the display object
  displayObject.dndType = 'dnd_drop_target'
  return displayObject
}

export {
  createDndContext,
  createDndDragSource,
  createDndDropTarget
}