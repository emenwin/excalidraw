export type ArrowType = 'sharp' | 'round' | 'elbow'

export type UnsubscribeCallback = () => void

export type ToolType =
  | 'selection'
  | 'lasso'
  | 'rectangle'
  | 'diamond'
  | 'ellipse'
  | 'arrow'
  | 'line'
  | 'freedraw'
  | 'text'
  | 'image'
  | 'eraser'
  | 'hand'
  | 'frame'
  | 'magicframe'
  | 'embeddable'
  | 'laser'

export type ActiveTool =
  | {
      type: ToolType
      customType: null
    }
  | {
      type: 'custom'
      customType: string
    }

export type ActiveAndLastTool = {
  /**
   * indicates a previous tool we should revert back to if we deselect the
   * currently active tool. At the moment applies to `eraser` and `hand` tool.
   */
  lastActiveTool: ActiveTool | null
  locked: boolean
  // indicates if the current tool is temporarily switched on from the selection tool
  fromSelection: boolean
} & ActiveTool

export type NormalizedZoomValue = number & { _brand: 'normalizedZoom' }

export type Zoom = Readonly<{
  value: NormalizedZoomValue
}>

export type Device = Readonly<{
  viewport: {
    isMobile: boolean
    isLandscape: boolean
  }
  editor: {
    isMobile: boolean
    canFitSidebar: boolean
  }
  isTouchScreen: boolean
}>
