/**
 * DND System
 * 
 * modelling drag and drop on a canvas after React Dnd
 * 
 */

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

// checks DndTypes of dragSource and dropTarget objects
const checkDndType = (dragSource, dropTarget) => dragSource.dndType === dropTarget.dndType

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
  if(dropTargetRef.hitTest(target.x, target.y) && checkDndType(dragSourceRef, dropTargetRef)) {
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
  
  if(dropTargetRef.hitTest(targetX, targetY) && checkDndType(dragSourceRef, dropTargetRef)) {
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
  displayObject,
  dragSourceObj,
  dropTargetObj,
  {
    onDragStart,
    onDragEnd,
    onHover,
    onDrop,
    dndType
  } = {}
) => {

  // in case dndType was arbitrarily overwritten/removed
  if (dragSourceObj.dndType !== dndType 
  || dropTargetObj.dndType !== dndType) {
    console.warn('The DragSource or the DropTarget params do not have valid dndTypes')
    console.warn('These objects have not been added to the context display object')
    return displayObject
  }

  // add a dndType flag to the cloned display object
  const contextObj = displayObject.clone(true)
  contextObj.dndType = dndType

  connectCB(onDragStart)
  connectCB(onDragEnd)
  connectCB(onHover)
  connectCB(onDrop)

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

const createDndDragSource = (displayObject, {dndType}) => {
  // add a dndType flag to the display object
  const dragSource = displayObject.clone(true)
  dragSource.dndType = dndType
  return dragSource
}

const createDndDropTarget = (displayObject, {dndType}) => {
  // add a dndType flag to the display object
  const dropTarget = displayObject.clone(true)
  dropTarget.dndType = dndType
  return dropTarget
}

export {
  createDndContext,
  createDndDragSource,
  createDndDropTarget
}