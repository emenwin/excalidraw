import { ActiveTool, ToolType } from "@excalidraw/basis";
// 部分共享类型（如 FrameNameBounds）原由 app 包 types 导出，element 源码仍以
// `from "@excalidraw/excalidraw/types"` 引用；这里从 basis 转出口，使源码无需改动。
export type { FrameNameBounds } from "@excalidraw/basis";
import {
  Arrowhead,
  BindMode,
  ChartType,
  ExcalidrawBindableElement,
  ExcalidrawElement,
  ExcalidrawElementType,
  ExcalidrawEmbeddableElement,
  ExcalidrawFrameLikeElement,
  ExcalidrawIframeElement,
  ExcalidrawLinearElement,
  ExcalidrawNonSelectionElement,
  ExcalidrawTextElement,
  FileId,
  FontFamilyValues,
  GroupId,
  NonDeleted,
  NonDeletedExcalidrawElement,
  OrderedExcalidrawElement,
  PointerType,
  StrokeRoundness,
  TextAlign,
  Theme,
} from "./types";
import { LinearElementEditor } from "./linearElementEditor";
import { IMAGE_MIME_TYPES, MIME_TYPES, throttleRAF, UserIdleState } from "@excalidraw/common";
import { MakeBrand, Merge, ValueOf } from "@excalidraw/common/utility-types";
import { DurableIncrement, EphemeralIncrement } from "./store";
import { Drawable } from "roughjs/bin/core";
import type { GlobalPoint } from "@excalidraw/math";

/** app 包 ContextMenu 项类型桩（解耦用，element 不消费具体结构） */
export type ContextMenuItems = unknown;

/** app 包对齐线类型桩（解耦用） */
export type SnapLine = {
  id: string;
};



export type ElementOrToolType = ExcalidrawElementType | ToolType | "custom";
export type SidebarName = string;
export type SidebarTabName = string;

export type SocketId = string & { _brand: "SocketId" };
export type Collaborator = Readonly<{
  pointer?: CollaboratorPointer;
  button?: "up" | "down";
  selectedElementIds?: AppState["selectedElementIds"];
  username?: string | null;
  userState?: UserIdleState;
  color?: {
    background: string;
    stroke: string;
  };
  // The url of the collaborator's avatar, defaults to username initials
  // if not present
  avatarUrl?: string;
  // user id. If supplied, we'll filter out duplicates when rendering user avatars.
  id?: string;
  socketId?: SocketId;
  isCurrentUser?: boolean;
  isInCall?: boolean;
  isSpeaking?: boolean;
  isMuted?: boolean;
}>;

export type CollaboratorPointer = {
  x: number;
  y: number;
  tool: "pointer" | "laser";
  /**
   * Whether to render cursor + username. Useful when you only want to render
   * laser trail.
   *
   * @default true
   */
  renderCursor?: boolean;
  /**
   * Explicit laser color.
   *
   * @default string collaborator's cursor color
   */
  laserColor?: string;
};

export type UserToFollow = {
  socketId: SocketId;
  username: string;
};


export type DataURL = string & { _brand: "DataURL" };

export interface Spreadsheet {
  title: string | null;
  labels: string[] | null;
  values: number[];
}

export type SearchMatch = {
  id: string;
  focus: boolean;
  matchedLines: {
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
    showOnCanvas: boolean;
  }[];
};


type _CommonCanvasAppState = {
  zoom: AppState["zoom"];
  scrollX: AppState["scrollX"];
  scrollY: AppState["scrollY"];
  width: AppState["width"];
  height: AppState["height"];
  viewModeEnabled: AppState["viewModeEnabled"];
  openDialog: AppState["openDialog"];
  editingGroupId: AppState["editingGroupId"]; // TODO: move to interactive canvas if possible
  selectedElementIds: AppState["selectedElementIds"]; // TODO: move to interactive canvas if possible
  frameToHighlight: AppState["frameToHighlight"]; // TODO: move to interactive canvas if possible
  offsetLeft: AppState["offsetLeft"];
  offsetTop: AppState["offsetTop"];
  theme: AppState["theme"];
};

export type StaticCanvasAppState = Readonly<
  _CommonCanvasAppState & {
    shouldCacheIgnoreZoom: AppState["shouldCacheIgnoreZoom"];
    /** null indicates transparent bg */
    viewBackgroundColor: AppState["viewBackgroundColor"] | null;
    exportScale: AppState["exportScale"];
    selectedElementsAreBeingDragged: AppState["selectedElementsAreBeingDragged"];
    gridSize: AppState["gridSize"];
    gridStep: AppState["gridStep"];
    frameRendering: AppState["frameRendering"];
    currentHoveredFontFamily: AppState["currentHoveredFontFamily"];
    hoveredElementIds: AppState["hoveredElementIds"];
    suggestedBinding: AppState["suggestedBinding"];
    // Cropping
    croppingElementId: AppState["croppingElementId"];
  }
>;

export type InteractiveCanvasAppState = Readonly<
  _CommonCanvasAppState & {
    activeTool: AppState["activeTool"];
    // renderInteractiveScene
    activeEmbeddable: AppState["activeEmbeddable"];
    selectionElement: AppState["selectionElement"];
    selectedGroupIds: AppState["selectedGroupIds"];
    selectedLinearElement: AppState["selectedLinearElement"];
    multiElement: AppState["multiElement"];
    newElement: AppState["newElement"];
    isBindingEnabled: AppState["isBindingEnabled"];
    isMidpointSnappingEnabled: AppState["isMidpointSnappingEnabled"];
    suggestedBinding: AppState["suggestedBinding"];
    isRotating: AppState["isRotating"];
    elementsToHighlight: AppState["elementsToHighlight"];
    // Collaborators
    collaborators: AppState["collaborators"];
    // SnapLines
    snapLines: AppState["snapLines"];
    zenModeEnabled: AppState["zenModeEnabled"];
    editingTextElement: AppState["editingTextElement"];
    // Cropping
    isCropping: AppState["isCropping"];
    croppingElementId: AppState["croppingElementId"];
    // Search matches
    searchMatches: AppState["searchMatches"];
    activeLockedId: AppState["activeLockedId"];
    // Non-used but needed in binding highlight arrow overdraw
    hoveredElementIds: AppState["hoveredElementIds"];
    frameRendering: AppState["frameRendering"];
    shouldCacheIgnoreZoom: AppState["shouldCacheIgnoreZoom"];
    exportScale: AppState["exportScale"];
    currentItemArrowType: AppState["currentItemArrowType"];
  }
>;

export type ObservedAppState = ObservedStandaloneAppState &
  ObservedElementsAppState;

export type ObservedStandaloneAppState = {
  name: AppState["name"];
  viewBackgroundColor: AppState["viewBackgroundColor"];
};

export type ObservedElementsAppState = {
  editingGroupId: AppState["editingGroupId"];
  selectedElementIds: AppState["selectedElementIds"];
  selectedGroupIds: AppState["selectedGroupIds"];
  selectedLinearElement: {
    elementId: LinearElementEditor["elementId"];
    isEditing: boolean;
  } | null;
  croppingElementId: AppState["croppingElementId"];
  lockedMultiSelections: AppState["lockedMultiSelections"];
  activeLockedId: AppState["activeLockedId"];
};

 

export type ExcalidrawIframeLikeElement =
  | ExcalidrawIframeElement
  | ExcalidrawEmbeddableElement;

export type EmbedsValidationStatus = Map<
  ExcalidrawIframeLikeElement["id"],
  boolean
>;

export type NormalizedZoomValue = number & { _brand: "normalizedZoom" };

export type Zoom = Readonly<{
  value: NormalizedZoomValue
}>

export type Offsets = Partial<{
  top: number;
  right: number;
  bottom: number;
  left: number;
}>;

export type Device = Readonly<{
  viewport: {
    isMobile: boolean;
    isLandscape: boolean;
  };
  editor: {
    isMobile: boolean;
    canFitSidebar: boolean;
  };
  isTouchScreen: boolean;
}>;


export type ElementsPendingErasure = Set<ExcalidrawElement["id"]>;

export type PendingExcalidrawElements = ExcalidrawElement[];


export type ElementShape = Drawable | Drawable[] | null;

export type ElementShapes = {
  rectangle: Drawable;
  ellipse: Drawable;
  diamond: Drawable;
  iframe: Drawable;
  embeddable: Drawable;
  freedraw: Drawable | null;
  arrow: Drawable[];
  line: Drawable[];
  text: null;
  image: null;
  frame: null;
  magicframe: null;
};


export type BoxSelectionMode = "contain" | "overlap";

export interface AppState {
//   contextMenu: {
//     items: ContextMenuItems;
//     top: number;
//     left: number;
//   } | null;
  showWelcomeScreen: boolean;
  isLoading: boolean;
  //errorMessage: React.ReactNode;
  activeEmbeddable: {
    element: NonDeletedExcalidrawElement;
    state: "hover" | "active";
  } | null;
  /**
   * for a newly created element
   * - set on pointer down, updated during pointer move, used on pointer up
   */
  newElement: NonDeleted<ExcalidrawNonSelectionElement> | null;
  /**
   * for a single element that's being resized
   * - set on pointer down when it's selected and the active tool is selection
   */
  resizingElement: NonDeletedExcalidrawElement | null;
  /**
   * multiElement is for multi-point linear element that's created by clicking as opposed to dragging
   * - when set and present, the editor will handle linear element creation logic accordingly
   */
  multiElement: NonDeleted<ExcalidrawLinearElement> | null;
  /**
   * decoupled from newElement, dragging selection only creates selectionElement
   * - set on pointer down, updated during pointer move
   */
  selectionElement: NonDeletedExcalidrawElement | null;
  /**
   * tracking current arrow binding editor state (takes into account
   * `bindingPreference` and keyboard modifiers (ctrl/alt)
   */
  isBindingEnabled: boolean;
  /** user box selection preference; defaults to "contain" when unset */
  boxSelectionMode: BoxSelectionMode;
  /** user arrow binding preference */
  bindingPreference: "enabled" | "disabled";
  /** user preference whether arrow snap to midpoints while binding */
  isMidpointSnappingEnabled: boolean;
  /**
   * The bindable element the UI highlights for the user when an arrow is
   * dragged or otherwise its endpoint being close to said element.
   */
  suggestedBinding: {
    element: NonDeleted<ExcalidrawBindableElement>;
    midPoint?: GlobalPoint;
  } | null;
  frameToHighlight: NonDeleted<ExcalidrawFrameLikeElement> | null;
  frameRendering: {
    enabled: boolean;
    name: boolean;
    outline: boolean;
    clip: boolean;
  };
  editingFrame: string | null;
  /**
   * linear element editor state for currently edited multi-point linear element
   * (arrow/line) while user is manipulating its points. When defined it takes
   * precedence over selectedLinearElement for editing operations.
   * Historically only the element id was stored (editingLinearElementId) in the
   * observed app state snapshot; we now keep the full editor object on AppState
   * and derive the id in ObservedAppState for diffing/collab to reduce churn.
   */
  editingLinearElement?: LinearElementEditor | null;
  elementsToHighlight: NonDeleted<ExcalidrawElement>[] | null;
  /**
   * set when a new text is created or when an existing text is being edited
   */
  editingTextElement: ExcalidrawTextElement | null;
  activeTool: {
    /**
     * indicates a previous tool we should revert back to if we deselect the
     * currently active tool. At the moment applies to `eraser` and `hand` tool.
     */
    lastActiveTool: ActiveTool | null;
    locked: boolean;
    // indicates if the current tool is temporarily switched on from the selection tool
    fromSelection: boolean;
  } & ActiveTool;
  preferredSelectionTool: {
    type: "selection" | "lasso";
    initialized: boolean;
  };
  penMode: boolean;
  penDetected: boolean;
  exportBackground: boolean;
  exportEmbedScene: boolean;
  exportWithDarkMode: boolean;
  exportScale: number;
  currentItemStrokeColor: string;
  currentItemBackgroundColor: string;
  currentItemFillStyle: ExcalidrawElement["fillStyle"];
  currentItemStrokeWidth: number;
  currentItemStrokeStyle: ExcalidrawElement["strokeStyle"];
  currentItemRoughness: number;
  currentItemOpacity: number;
  currentItemFontFamily: FontFamilyValues;
  currentItemFontSize: number;
  currentItemTextAlign: TextAlign;
  currentItemStartArrowhead: Arrowhead | null;
  currentItemEndArrowhead: Arrowhead | null;
  currentHoveredFontFamily: FontFamilyValues | null;
  currentItemRoundness: StrokeRoundness;
  currentItemArrowType: "sharp" | "round" | "elbow";
  viewBackgroundColor: string;
  scrollX: number;
  scrollY: number;
  cursorButton: "up" | "down";
  scrolledOutside: boolean;
  name: string | null;
  isResizing: boolean;
  isRotating: boolean;
  zoom: Zoom;
  openMenu: "canvas" | null;
  openPopup:
    | "canvasBackground"
    | "elementBackground"
    | "elementStroke"
    | "fontFamily"
    | "compactTextProperties"
    | "compactStrokeStyles"
    | "compactOtherProperties"
    | "compactArrowProperties"
    | null;
  openSidebar: { name: SidebarName; tab?: SidebarTabName } | null;
  openDialog:
    | null
    | { name: "imageExport" | "help" | "jsonExport" }
    | { name: "ttd"; tab: "text-to-diagram" | "mermaid" }
    | { name: "commandPalette" }
    | { name: "settings" }
    | { name: "elementLinkSelector"; sourceElementId: ExcalidrawElement["id"] }
    | { name: "charts"; data: Spreadsheet; rawText: string };

  /**
   * Reflects user preference for whether the default sidebar should be docked.
   *
   * NOTE this is only a user preference and does not reflect the actual docked
   * state of the sidebar, because the host apps can override this through
   * a DefaultSidebar prop, which is not reflected back to the appState.
   */
  defaultSidebarDockedPreference: boolean;

  lastPointerDownWith: PointerType;
  selectedElementIds: Readonly<{ [id: string]: true }>;
  hoveredElementIds: Readonly<{ [id: string]: true }>;
  previousSelectedElementIds: { [id: string]: boolean };
  selectedElementsAreBeingDragged: boolean;
  shouldCacheIgnoreZoom: boolean;
  toast: { message: string; closable?: boolean; duration?: number } | null;
  zenModeEnabled: boolean;
  theme: Theme;
  /** grid cell px size */
  gridSize: number;
  gridStep: number;
  gridModeEnabled: boolean;
  viewModeEnabled: boolean;

  /** top-most selected groups (i.e. does not include nested groups) */
  selectedGroupIds: { [groupId: string]: boolean };
  /** group being edited when you drill down to its constituent element
    (e.g. when you double-click on a group's element) */
  editingGroupId: GroupId | null;
  width: number;
  height: number;
  offsetTop: number;
  offsetLeft: number;

  fileHandle: FileSystemFileHandle | null;
  collaborators: Map<SocketId, Collaborator>;
  stats: {
    open: boolean;
    /** bitmap. Use `STATS_PANELS` bit values */
    panels: number;
  };
  showHyperlinkPopup: false | "info" | "editor";
  selectedLinearElement: LinearElementEditor | null;
  snapLines: readonly SnapLine[];
  originSnapOffset: {
    x: number;
    y: number;
  } | null;
  objectsSnapModeEnabled: boolean;
  /** the user's socket id & username who is being followed on the canvas */
  userToFollow: UserToFollow | null;
  /** the socket ids of the users following the current user */
  followedBy: Set<SocketId>;

  /** image cropping */
  isCropping: boolean;
  croppingElementId: ExcalidrawElement["id"] | null;

  /** null if no search matches found / search closed */
  searchMatches: Readonly<{
    focusedId: ExcalidrawElement["id"] | null;
    matches: readonly SearchMatch[];
  }> | null;

  /** the locked element/group that's active and shows unlock popup */
  activeLockedId: string | null;
  // when locking multiple units of elements together, we assign a temporary
  // groupId to them so we can unlock them together;
  // as elements are unlocked, we remove the groupId from the elements
  // and also remove groupId from this map
  lockedMultiSelections: { [groupId: string]: true };
  bindMode: BindMode;
}

export type UIAppState = Omit<AppState, "cursorButton" | "scrollX" | "scrollY">;


export type BinaryFileData = {
  mimeType:
    | ValueOf<typeof IMAGE_MIME_TYPES>
    // future user or unknown file type
    | typeof MIME_TYPES.binary;
  id: FileId;
  dataURL: DataURL;
  /**
   * Epoch timestamp in milliseconds
   */
  created: number;
  /**
   * Indicates when the file was last retrieved from storage to be loaded
   * onto the scene. We use this flag to determine whether to delete unused
   * files from storage.
   *
   * Epoch timestamp in milliseconds.
   */
  lastRetrieved?: number;
  /**
   * indicates the version of the file. This can be used to determine whether
   * the file dataURL has changed e.g. as part of restore due to schema update.
   */
  version?: number;
};

export type BinaryFileMetadata = Omit<BinaryFileData, "dataURL">;

export type BinaryFiles = Record<ExcalidrawElement["id"], BinaryFileData>;

export type ExportOpts = {
  saveFileToDisk?: boolean;
  onExportToBackend?: (
    exportedElements: readonly NonDeletedExcalidrawElement[],
    appState: UIAppState,
    files: BinaryFiles,
  ) => void;
  // renderCustomUI?: (
  //   exportedElements: readonly NonDeletedExcalidrawElement[],
  //   appState: UIAppState,
  //   files: BinaryFiles,
  //   canvas: HTMLCanvasElement,
  // ) => JSX.Element;
};

export type ImageOptions = Partial<{
  maxWidthOrHeight: number;
  maxFileSizeBytes: number;
}>;

// NOTE at the moment, if action name corresponds to canvasAction prop, its
// truthiness value will determine whether the action is rendered or not
// (see manager renderAction). We also override canvasAction values in
// Excalidraw package index.tsx.
export type CanvasActions = Partial<{
  changeViewBackgroundColor: boolean;
  clearCanvas: boolean;
  export: false | ExportOpts;
  loadScene: boolean;
  saveToActiveFile: boolean;
  toggleTheme: boolean | null;
  saveAsImage: boolean;
}>;


export type UIOptions = Partial<{
  dockedSidebarBreakpoint: number;
  canvasActions: CanvasActions;
  tools: {
    image: boolean;
  };
  /** @deprecated does nothing. Will be removed in 0.15 */
  welcomeScreen?: boolean;
}>;

export interface ExcalidrawProps {
  onChange?: (
    elements: readonly OrderedExcalidrawElement[],
    appState: AppState,
    files: BinaryFiles,
  ) => void;
  onIncrement?: (event: DurableIncrement | EphemeralIncrement) => void;
  // initialData?:
  //   | (() => MaybePromise<ExcalidrawInitialDataState | null>)
  //   | MaybePromise<ExcalidrawInitialDataState | null>;
  // excalidrawAPI?: (api: ExcalidrawImperativeAPI) => void;
  // isCollaborating?: boolean;
  // onPointerUpdate?: (payload: {
  //   pointer: { x: number; y: number; tool: "pointer" | "laser" };
  //   button: "down" | "up";
  //   pointersMap: Gesture["pointers"];
  // }) => void;
  // onPaste?: (
  //   data: ClipboardData,
  //   event: ClipboardEvent | null,
  // ) => Promise<boolean> | boolean;
  /**
   * Called when element(s) are duplicated so you can listen or modify as
   * needed.
   *
   * Called when duplicating via mouse-drag, keyboard, paste, library insert
   * etc.
   *
   * Returned elements will be used in place of the next elements
   * (you should return all elements, including deleted, and not mutate
   * the element if changes are made)
   */
  onDuplicate?: (
    nextElements: readonly ExcalidrawElement[],
    /** excludes the duplicated elements */
    prevElements: readonly ExcalidrawElement[],
  ) => ExcalidrawElement[] | void;
  // renderTopRightUI?: (
  //   isMobile: boolean,
  //   appState: UIAppState,
  // ) => JSX.Element | null;
  // langCode?: Language["code"];
  viewModeEnabled?: boolean;
  zenModeEnabled?: boolean;
  gridModeEnabled?: boolean;
  objectsSnapModeEnabled?: boolean;
  libraryReturnUrl?: string;
  theme?: Theme;
  // @TODO come with better API before v0.18.0
  name?: string;
  // renderCustomStats?: (
  //   elements: readonly NonDeletedExcalidrawElement[],
  //   appState: UIAppState,
  // ) => JSX.Element;
  UIOptions?: Partial<UIOptions>;
  detectScroll?: boolean;
  handleKeyboardGlobally?: boolean;
  //onLibraryChange?: (libraryItems: LibraryItems) => void | Promise<any>;
  autoFocus?: boolean;
  generateIdForFile?: (file: File) => string | Promise<string>;
  generateLinkForSelection?: (id: string, type: "element" | "group") => string;
  onLinkOpen?: (
    element: NonDeletedExcalidrawElement,
    event: CustomEvent<{
      nativeEvent: MouseEvent /*| React.PointerEvent<HTMLCanvasElement>*/;
    }>,
  ) => void;
  // onPointerDown?: (
  //   activeTool: AppState["activeTool"],
  //   pointerDownState: PointerDownState,
  // ) => void;
  // onPointerUp?: (
  //   activeTool: AppState["activeTool"],
  //   pointerDownState: PointerDownState,
  // ) => void;
  onScrollChange?: (scrollX: number, scrollY: number, zoom: Zoom) => void;
  //onUserFollow?: (payload: OnUserFollowedPayload) => void;
  //children?: React.ReactNode;
  validateEmbeddable?:
    | boolean
    | string[]
    | RegExp
    | RegExp[]
    | ((link: string) => boolean | undefined);
  // renderEmbeddable?: (
  //   element: NonDeleted<ExcalidrawEmbeddableElement>,
  //   appState: AppState,
  // ) => JSX.Element | null;
  aiEnabled?: boolean;
  showDeprecatedFonts?: boolean;
  renderScrollbars?: boolean;
}

export type AppProps = Merge<
  ExcalidrawProps,
  {
    UIOptions: Merge<
      UIOptions,
      {
        canvasActions: Required<CanvasActions> & { export: ExportOpts };
      }
    >;
    imageOptions: Required<ImageOptions>;
    detectScroll: boolean;
    handleKeyboardGlobally: boolean;
    isCollaborating: boolean;
    //children?: React.ReactNode;
    aiEnabled: boolean;
  }
>;

export type PointerDownState = Readonly<{
  // The first position at which pointerDown happened
  origin: Readonly<{ x: number; y: number }>;
  // Same as "origin" but snapped to the grid, if grid is on
  originInGrid: Readonly<{ x: number; y: number }>;
  // Scrollbar checks
  // scrollbars runtime info (removed unresolved dependency isOverScrollBars during element package extraction)
  // scrollbars?: ReturnType<typeof isOverScrollBars>;
  // The previous pointer position
  lastCoords: { x: number; y: number };
  // original element frozen snapshots so we can access the original
  // element attribute values at time of pointerdown
  originalElements: Map<string, NonDeleted<ExcalidrawElement>>;
  resize: {
    // Handle when resizing, might change during the pointer interaction
  // handleType: MaybeTransformHandleType; // removed unresolved type reference in isolated build
    // This is determined on the initial pointer down event
    isResizing: boolean;
    // This is determined on the initial pointer down event
    offset: { x: number; y: number };
    // This is determined on the initial pointer down event
    arrowDirection: "origin" | "end";
    // This is a center point of selected elements determined on the initial pointer down event (for rotation only)
    center: { x: number; y: number };
  };
  hit: {
    // The element the pointer is "hitting", is determined on the initial
    // pointer down event
    element: NonDeleted<ExcalidrawElement> | null;
    // The elements the pointer is "hitting", is determined on the initial
    // pointer down event
    allHitElements: NonDeleted<ExcalidrawElement>[];
    // This is determined on the initial pointer down event
    wasAddedToSelection: boolean;
    // Whether selected element(s) were duplicated, might change during the
    // pointer interaction
    hasBeenDuplicated: boolean;
    hasHitCommonBoundingBoxOfSelectedElements: boolean;
  };
  withCmdOrCtrl: boolean;
  drag: {
    // Might change during the pointer interaction
    hasOccurred: boolean;
    // Might change during the pointer interaction
    offset: { x: number; y: number } | null;
    // by default same as PointerDownState.origin. On alt-duplication, reset
    // to current pointer position at time of duplication.
    origin: { x: number; y: number };
  };
  // We need to have these in the state so that we can unsubscribe them
  eventListeners: {
    // It's defined on the initial pointer down event
    onMove: null | ReturnType<typeof throttleRAF>;
    // It's defined on the initial pointer down event
    onUp: null | ((event: PointerEvent) => void);
    // It's defined on the initial pointer down event
    onKeyDown: null | ((event: KeyboardEvent) => void);
    // It's defined on the initial pointer down event
    onKeyUp: null | ((event: KeyboardEvent) => void);
  };
  boxSelection: {
    hasOccurred: boolean;
  };
}>;

/** Runtime gridSize value. Null indicates disabled grid. */
export type NullableGridSize =
  | (AppState["gridSize"] & MakeBrand<"NullableGridSize">)
  | null;

export type UnsubscribeCallback = () => void;

  export type PointerCoords = Readonly<{
  x: number;
  y: number;
}>;

// ---------------------------------------------------------------------------
// glyphdraw 解耦：AppClassProperties / App 的结构化最小表面（AppLike）。
//
// element 源码中存在两类对 app 包的引用：
//   1. `import type { AppClassProperties } from "@excalidraw/excalidraw/types"`
//   2. `import type App from "@excalidraw/excalidraw/components/App"`
// 经 packages/tsconfig.base.json 的 paths 重映射后：
//   - `@excalidraw/excalidraw/types`        → 本文件
//   - `@excalidraw/excalidraw/components/App` → ./app-like.ts（默认导出 App = AppLike）
// 从而 element 源码无需修改即可编译：`app: AppClassProperties` / `app: App` 解析为
// AppLike，`app.scene` / `app.state` / `app.getEffectiveGridSize()` 调用保持上游原样。
//
// AppLike 仅声明 element 实际访问的成员（scene、state、getEffectiveGridSize、imageCache），
// 避免引入 app 包的其余依赖（React、Library、props 等）。
// ---------------------------------------------------------------------------

/** App 的结构化最小表面，供 element 解耦使用。 */
export interface AppLike {
  scene: import("./Scene").Scene;
  state: AppState;
  getEffectiveGridSize(): NullableGridSize;
  imageCache: Map<
    FileId,
    {
      image: HTMLImageElement | Promise<HTMLImageElement>;
      mimeType: ValueOf<typeof IMAGE_MIME_TYPES>;
    }
  >;
  lastPointerMoveCoords?: { x: number; y: number } | null;
  lastPointerMoveEvent?: PointerEvent | null;
}

/** 上游 `AppClassProperties` 的解耦替身（仅保留 element 用到的表面）。 */
export type AppClassProperties = AppLike;

/** 与上游 `export type { App }` 对齐，供 element 内 `import type { App }` 使用。 */
export type App = AppLike;
