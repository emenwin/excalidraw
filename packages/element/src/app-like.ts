// glyphdraw 解耦：`@excalidraw/excalidraw/components/App` 的替身模块。
//
// element/src/store.ts 中：
//   import type App from "@excalidraw/excalidraw/components/App";
// 经 packages/tsconfig.base.json 重映射后该 specifier 解析到本文件。
// 默认导出 `App` 即 AppLike（结构化最小表面），使 `app: App` 与 `this.app.scene` /
// `this.app.state` 调用保持上游原样，store.ts 无需修改。

import type { AppLike } from "./types_excalidraw";

export type App = AppLike;
export type { AppLike };
export { App as default };
