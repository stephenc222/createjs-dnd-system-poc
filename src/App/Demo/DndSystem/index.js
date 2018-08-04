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
 * @param {Array} dragSourceRefs - the dragSourceRefs array
 * @param {Object} dropTargetRefs - the dropTargetRefs array
 * @returns {Object|undefined} - the found dropTarget Object, or null
 */
const checkDndType = (dragSourceRefs, dropTargetRefs, dragSourceRefIndex) => {
  return dropTargetRefs.find(
    dropTarget => dragSourceRefs[dragSourceRefIndex].dndType === dropTarget.dndType
  )
}

/**
 * if the dragSource did drop on a corresponding dropTarget
 * @param {Array} dragSourceRefs - the dragSourceRefs array
 * @param {Array} dropTargetRefs - the dropTargetRefs array
 * @param {Number} dragSourceRedIndex - the index of the dragSource involved in this drop event
 * @returns {Boolean} - returns if the drop was sucessfull (dndTypes match and hit areas match) 
 */
const didDrop = (dragSourceRefs, dropTargetRefs, dragSourceRefIndex, target) => {
  const foundDropTarget = checkDndType(dragSourceRefs, dropTargetRefs, dragSourceRefIndex)
  return !!foundDropTarget && foundDropTarget.hitTest(target.x, target.y)
}

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
  const { currentTarget } = event
  const { dragSourceRefIndex } = currentTarget
  const {
    target,
    stageX,
    stageY
  } = event

  // maintains shallow reference to _internalState
  const {
    dragSourceRefs,
    dropTargetRefs,
    initialOffset,
  } = _internalState
  
  if (!_internalState.isMouseMoving) {
    initialOffset.x = target.x - stageX
    initialOffset.y = target.y - stageY
    _internalState.onDragStart({ dragSourceRefs, dropTargetRefs, dragSourceRefIndex })
  }
  _internalState.isMouseMoving = true

  target.x = stageX + initialOffset.x
  target.y = stageY + initialOffset.y
  _internalState.onDragging(
    { 
      dragSourceRefs,
      dropTargetRefs,
      dragSourceRefIndex
    },
    // dragging on target is true here if compatible types and true hit test
    didDrop(dragSourceRefs, dropTargetRefs, dragSourceRefIndex, target)
  )
}

/**
 * internal handler for drop event on pressup event
 * @private
 * @param {Object} eventTarget - event target object containing the targetX and targetY of the drop event
 * @param {Number} eventTarget.targetX - the X value of the drop event
 * @param {Number} eventTarget.targetY - the Y value of the drop event
 */
const handleDrop = ({event, dragSourceRefs, dropTargetRefs, dragSourceRefIndex}) => {
  event.preventDefault()
  const { target } = event
  // maintains shallow reference to _internalState
  const {
    onDrop
  } = _internalState
  onDrop(
    { 
      dragSourceRefs, 
      dropTargetRefs,
      dragSourceRefIndex
    }, 
    // drops on target is true here if compatible types and true hit test
    didDrop(dragSourceRefs, dropTargetRefs, dragSourceRefIndex, target)
  )
}

/**
 * internal handler connected to CreateJS' pressup event used to coordinate dnd interaction
 * @private
 * @param {Object} event - pressup event object
 */
const handlePressUp = (event) => {
  event.preventDefault()
  const { currentTarget } = event
  const { dragSourceRefIndex } = currentTarget
  const {
    dragSourceRefs,
    dropTargetRefs,
    onDragEnd
  } = _internalState

  _internalState.isMouseMoving = false

  // NOTE: dragEnd called before onDrop
  onDragEnd({dragSourceRefs, dropTargetRefs, dragSourceRefIndex})
  handleDrop({event, dragSourceRefs, dropTargetRefs, dragSourceRefIndex})
}

const connectDragSource = (dragSourceObj, index, contextObj) => {
  dragSourceObj.dragSourceRefIndex = index
  dragSourceObj.addEventListener("pressmove", handlePressMove)
  dragSourceObj.addEventListener("pressup", handlePressUp)
  
  _internalState.dragSourceRefs.push(dragSourceObj)
  contextObj.addChild(_internalState.dragSourceRefs[_internalState.dragSourceRefs.length - 1])
}

const connectDropTarget = (dropTargetObj, index, contextObj) => {
  dropTargetObj.dropTargetRefIndex = index
  _internalState.dropTargetRefs.push(dropTargetObj)
  contextObj.addChild(_internalState.dropTargetRefs[_internalState.dropTargetRefs.length - 1])
}

/**
 * creates a DndContext object
 * @param {Object} displayObject - display object to designate as DndContext
 * @param {Object|Array} dragSourceObjs - dragSource object(s) created before calling this
 * @param {Object|Array} dropTargetObjs - dropTarget object(s) created before calling this
 * @param {Object} callbackObj - object literal containing dnd event callback functions
 * @param {Function} callbackObj.onDragStart - callback for onDragStart
 * @param {Function} callbackObj.onDragEnd - callback for onDragEnd
 * @param {Function} callbackObj.onDragging - callback for onDragging
 * @param {Function} callbackObj.onDrop - callback for onDrop
 * @param {Number|String} callbackObj.dndType - dndType to supply dndContext object with
 */
const createDndContext = (
  displayObject,
  dragSourceObjs,
  dropTargetObjs,
  {
    onDragStart,
    onDragEnd,
    onDragging,
    onDrop,
    dndType
  } = {}
) => {

  // standardize handling of multiple or single dragSources or dropTargets
  !dragSourceObjs.length && ( dragSourceObjs = [dragSourceObjs])
  !dropTargetObjs.length && ( dropTargetObjs = [dropTargetObjs])

  // add a dndType flag to the cloned display object
  const contextObj = displayObject.clone(true)
  contextObj.dndType = dndType
  
  connectCB(onDragStart)
  connectCB(onDragEnd)
  connectCB(onDragging)
  connectCB(onDrop)
  dropTargetObjs.forEach((dropTarget, index) => connectDropTarget(dropTarget, index, contextObj))
  dragSourceObjs.forEach((dragSource, index) => connectDragSource(dragSource,index, contextObj))

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