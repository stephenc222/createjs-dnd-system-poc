/**
 * DND System
 * 
 * modelling drag and drop on a canvas after React Dnd
 */

const createDndContext = (displayObject) => {
  // add a dndType flag to the display object
  displayObject.dndType = 'dnd_context'
  return displayObject
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