export interface FocusElementOptions {
  afterFocus?: () => void
  maxFrames?: number
  waitForStablePosition?: boolean
}

export interface FocusWhenPositionStableOptions {
  maxFrames?: number
  onFocus?: () => void
}

function focusElementNow(element: HTMLElement | null | undefined, afterFocus?: () => void) {
  if (!element) return
  element.focus()
  afterFocus?.()
}

function isStableRect(rect: DOMRectReadOnly, previousRect?: DOMRectReadOnly) {
  return previousRect
    && Math.abs(rect.top - previousRect.top) < 1
    && Math.abs(rect.left - previousRect.left) < 1
    && Math.abs(rect.width - previousRect.width) < 1
    && Math.abs(rect.height - previousRect.height) < 1
}

function isVisibleRect(rect: DOMRectReadOnly) {
  return rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.bottom > 0
}

export function focusElement(
  getElement: () => HTMLElement | null | undefined,
  options: FocusElementOptions = {}
) {
  if (!options.waitForStablePosition) {
    focusElementNow(getElement(), options.afterFocus)
    return
  }

  focusWhenPositionStable(getElement, {
    maxFrames: options.maxFrames,
    onFocus: options.afterFocus
  })
}

export function focusWhenPositionStable(
  getElement: () => HTMLElement | null | undefined,
  options: FocusWhenPositionStableOptions = {}
) {
  const maxFrames = options.maxFrames ?? 30

  if (typeof requestAnimationFrame === 'undefined') {
    focusElementNow(getElement(), options.onFocus)
    return
  }

  const tick = (frame = 0, previousRect?: DOMRectReadOnly) => {
    const element = getElement()
    if (!element || frame > maxFrames) {
      focusElementNow(element, options.onFocus)
      return
    }

    const rect = element.getBoundingClientRect()
    if (isVisibleRect(rect) && isStableRect(rect, previousRect)) {
      focusElementNow(element, options.onFocus)
      return
    }

    requestAnimationFrame(() => tick(frame + 1, rect))
  }

  requestAnimationFrame(() => tick())
}
