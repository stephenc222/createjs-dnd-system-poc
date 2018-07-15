/**
 * DND System
 * 
 * modelling drag and drop on a canvas after React Dnd
 * 
 */

// type constants
const DND_CONTEXT = 'DND_CONTEXT'
const DND_DRAG_SOURCE = 'DND_DRAG_SOURCE'
const DND_DROP_TARGET = 'DND_DROP_TARGET'

const _internalState = {
  onDragStart: () => {},
  onDragEnd: () => {},
  onHover: () => {},
  onDrop: () => {},
  isMouseMoving: false,
  dragSourceRef: {},
  dropTargetRef: {},
  initialOffset: {
    x: null,
    y: null
  }
}

// attach drag event callbacks
const connectCB = cb => cb && (_internalState[cb.name] = cb)

// TODO: maybe add a config setting to "auto center" mouse on drag source
const handlePressMove = (event) => {
  // first pressMove event here  - cache initial offset for this drag event in progress
  const {
    target,
    stageX,
    stageY
  } = event

  // maintains shallow reference to _internalState
  const {
    dragSourceRef,
    dropTargetRef,
    initialOffset,
  } = _internalState

  if (!_internalState.isMouseMoving) {
    initialOffset.x = target.x - stageX
    initialOffset.y = target.y - stageY
    _internalState.onDragStart({ dragSourceRef, dropTargetRef })
  }
  _internalState.isMouseMoving = true

  target.x = stageX + initialOffset.x
  target.y = stageY + initialOffset.y
  if(dropTargetRef.hitTest(target.x, target.y)) {
    // hovers on target is true here
    _internalState.onHover({ dragSourceRef,dropTargetRef },true)
  } else {
    _internalState.onHover({ dragSourceRef,dropTargetRef }, false)
  }
}

const handleDrop = ({targetX, targetY}) => {
  // maintains shallow reference to _internalState
  const {
    dragSourceRef,
    dropTargetRef
  } = _internalState
  
  if(dropTargetRef.hitTest(targetX, targetY)) {
    // drops on target is true here
    _internalState.onDrop({ dragSourceRef, dropTargetRef }, true)
  } else {
    _internalState.onDrop({ dragSourceRef, dropTargetRef }, false)
  }
}

const handlePressUp = (event) => {
  event.preventDefault()
  const dragSourceRef = _internalState.dragSourceRef
  const dropTargetRef = _internalState.dropTargetRef
  _internalState.isMouseMoving = false

  // NOTE: dragEnd called before onDrop
  _internalState.onDragEnd({dragSourceRef, dropTargetRef})
  handleDrop({
    targetX: event.target.x,
    targetY: event.target.y
  })
}

const createDndContext = (
  contextObj,
  dragSourceObj,
  dropTargetObj,
  {
    onDragStart,
    onDragEnd,
    onHover,
    onDrop
  } = {}
) => {

  // in case dndType was arbitrarily overwritten/removed
  if (dragSourceObj.dndType !== DND_DRAG_SOURCE 
  || dropTargetObj.dndType !== DND_DROP_TARGET) {
    throw new Error('The DragSource or the DropTarget params do not have valid dndTypes')
  }

  // add a dndType flag to the display object
  contextObj.dndType = DND_CONTEXT

  connectCB(_internalState, onDragStart)
  connectCB(_internalState, onDragEnd)
  connectCB(_internalState, onHover)
  connectCB(_internalState, onDrop)

  dragSourceObj.addEventListener("pressmove", handlePressMove)
  dragSourceObj.addEventListener("pressup", handlePressUp)
  
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
  const dragSource = displayObject
  dragSource.dndType = DND_DRAG_SOURCE
  return dragSource
}

const createDndDropTarget = (displayObject) => {
  // add a dndType flag to the display object
  const dropTarget = displayObject
  dropTarget.dndType = DND_DROP_TARGET
  return dropTarget
}

export {
  createDndContext,
  createDndDragSource,
  createDndDropTarget
}