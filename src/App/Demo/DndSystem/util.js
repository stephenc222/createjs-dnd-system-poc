/**
 * @ignore
 * used like "this" for creating pseudo-context without the ES6 class overhead
 */
export const _internalState = {
  onDragStart: () => {},
  onDragEnd: () => {},
  onDragging: () => {},
  onDrop: () => {},
  isMouseMoving: false,
  dragSourceRefs: [],
  dropTargetRefs: [],
  initialOffset: {
    x: null,
    y: null
  }
}