// glyphdraw 解耦：common 包通过 `@excalidraw/basis` 消费的「最小」App 级类型。
//
// 这些类型原本来自 `@excalidraw/excalidraw/types`（React app 包）。
// AGENTS.md 禁止 glyphdraw 使用 app 包，故 common 改从本包导入。
// common 仅通过索引访问使用 AppState 的少量字段（如 `AppState["activeTool"]`、
// `AppState["currentItemArrowType"]`）以及 `AppProps["UIOptions"]`，因此这里只定义
// 满足 common 需要的最小结构。
//
// element 包使用完整的 AppState / AppProps / AppClassProperties 等，见
// `packages/element/src/types_excalidraw.ts`。结构上 element 的完整 AppState 字段
// 是本最小 AppState 的超集，故 element→common 调用时的赋值兼容。

import type { ActiveAndLastTool, ArrowType } from "./types";

/** 最小 AppState：仅包含 common 包通过索引访问使用的字段。
 *  activeTool 使用 ActiveAndLastTool（含 lastActiveTool/locked/fromSelection），
 *  与上游 AppState["activeTool"] 一致，common/src/utils.ts 据此访问这些字段。 */
export interface AppState {
  activeTool: ActiveAndLastTool;
  currentItemArrowType: ArrowType;
}

/** 最小 AppProps：仅包含 common 包通过索引访问使用的字段。 */
export interface AppProps {
  UIOptions: Record<string, unknown>;
  imageOptions: {
    maxWidthOrHeight: number;
    maxFileSizeBytes: number;
  };
}

/** gridSize 或 null（null 表示禁用网格）。 */
export type NullableGridSize = number | null;
