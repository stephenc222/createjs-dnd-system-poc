/**
 * DND System
 * 
 * modelling drag and drop on a canvas after React Dnd
 * 
 */
import { _internalState } from './util'

/**
 * helper to check DndTypes of DragSource and DropTarget objects
 * @private
 * @param {Object} dragSource - the dragSource object
 * @param {Object} dropTarget - the dropTarget object
 * @returns {Boolean} - whether or not dndTypes of either dragSource or dropTarget match
 */
const checkDndType = (dragSource, dropTarget) => dragSource.dndType === dropTarget.dndType

/**
 * helper that attaches dnd event callbacks to _internalState
 * @private
 * @param {Function} cb - the callback function to assign to _internalState
 */
const connectCB = cb => cb && (_internalState[cb.name] = cb)

/**
 * internal handler connected to CreateJS' pressmove event used to coordinate dnd interaction
 * @private
 * @param {Object} event - pressmove event object
 */
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
  _internalState.onDragging(
    { 
      dragSourceRef,
      dropTargetRef 
    },
    // dragging on target is true here if compatible types and true hit test
    !!checkDndType(dragSourceRef, dropTargetRef) && dropTargetRef.hitTest(target.x, target.y)
  )
}

/**
 * internal handler for drop event on pressup event
 * @private
 * @param {Object} eventTarget - event target object containing the targetX and targetY of the drop event
 * @param {Number} eventTarget.targetX - the X value of the drop event
 * @param {Number} eventTarget.targetY - the Y value of the drop event
 */
const handleDrop = ({targetX, targetY}) => {
  // maintains shallow reference to _internalState
  const {
    dragSourceRef,
    dropTargetRef,
    onDrop
  } = _internalState
  
  onDrop(
    { 
      dragSourceRef, 
      dropTargetRef 
    }, 
    // drops on target is true here if compatible types and true hit test
    !!checkDndType(dragSourceRef, dropTargetRef) && dropTargetRef.hitTest(targetX, targetY)
  )
}

/**
 * internal handler connected to CreateJS' pressup event used to coordinate dnd interaction
 * @private
 * @param {Object} event - pressup event object
 */
const handlePressUp = (event) => {
  event.preventDefault()
  const {
    dragSourceRef,
    dropTargetRef,
    onDragEnd
  } = _internalState

  _internalState.isMouseMoving = false

  // NOTE: dragEnd called before onDrop
  onDragEnd({dragSourceRef, dropTargetRef})
  handleDrop({
    targetX: event.target.x,
    targetY: event.target.y
  })
}

/**
 * creates a DndContext object
 * @param {Object} displayObject - display object to designate as DndContext
 * @param {Object} dragSourceObj - dragSource object created before calling this
 * @param {Object} dropTargetObj - dropTarget object created before calling this
 * @param {Object} callbackObj - object literal containing dnd event callback functions
 * @param {Function} callbackObj.onDragStart - callback for onDragStart
 * @param {Function} callbackObj.onDragEnd - callback for onDragEnd
 * @param {Function} callbackObj.onDragging - callback for onDragging
 * @param {Function} callbackObj.onDrop - callback for onDrop
 * @param {Number|String} callbackObj.dndType - dndType to supply dndContext object with
 */
const createDndContext = (
  displayObject,
  dragSourceObj,
  dropTargetObj,
  {
    onDragStart,
    onDragEnd,
    onDragging,
    onDrop,
    dndType
  } = {}
) => {

  // add a dndType flag to the cloned display object
  const contextObj = displayObject.clone(true)
  contextObj.dndType = dndType

  connectCB(onDragStart)
  connectCB(onDragEnd)
  connectCB(onDragging)
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

/**
 * creates a DragSource object
 * @param {Object} displayObject - display object to designate as DragSource
 * @param {Object} param object - object containing dndType
 * @param {Number|String} param.dndType - dndType to supply dragSource 
 */
const createDndDragSource = (displayObject, {dndType}) => {
  // add a dndType flag to the display object
  const dragSource = displayObject.clone(true)
  dragSource.dndType = dndType
  return dragSource
}

/**
 * creates a DropTarget object
 * @param {Object} displayObject - display object to designate as DropTarget
 * @param {Object} param object - object containing dndType
 * @param {Number|String} param.dndType - dndType to supply DropTarget 
 */
const createDndDropTarget = (displayObject, {dndType}) => {
  // add a dndType flag to the display object
  const dropTarget = displayObject.clone(true)
  dropTarget.dndType = dndType
  return dropTarget
}

export {
  checkDndType,
  connectCB,
  handlePressMove,
  handleDrop,
  handlePressUp,
  createDndContext,
  createDndDragSource,
  createDndDropTarget
}