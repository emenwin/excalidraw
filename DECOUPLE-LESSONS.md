# excalidraw 解耦经验教训（Lessons Learned）

记录在为 glyphdraw 解耦 excalidraw 基础 package（`common`/`element`/`math`/`utils`）过程中踩过的坑与最终结论，供后续追齐 upstream 与类似解耦场景参考。

---

## 1. 核心结论

**解耦的最小必要改动 = shim 类型 + tsconfig `paths` 重映射 + 修补相对导入。**
无需收窄 workspaces、无需 baseUrl、无需 catch-all 桩、无需改 app 调用点签名。

---

## 2. 关键教训

### 2.1 tsconfig `paths` 不接管相对导入（最重要的根因）

`paths` 只对**非相对模块名**（如 `@excalidraw/excalidraw/types`）生效。**相对导入**（如 `../../excalidraw/types`）完全绕过 `paths`，按文件系统路径直接解析。

`packages/element/src/Scene.ts` 原本有：

```ts
import type { AppState } from "../../excalidraw/types";   // 相对导入 → 直达 app 包 types.ts
```

这一行把 app 包的 `types.ts` 拉进编译，而 `types.ts` 又相对导入 `./components/App` → 整个 React app 被拉入，产生 ~69（甚至更多）个无关编译错误。

**这是 app 被拉入的真正根因**，与 node_modules 软链无关。修复只需 1 行：改为引用本地 shim（`./types_excalidraw`）。

> 排查手段：`tsc --traceResolution` 直接看每个 specifier 解析到哪个文件。看到 `Resolving module '../../excalidraw/types' from '.../Scene.ts'` → `packages/excalidraw/types.ts` 即定位。

### 2.2 workspace 软链本身不是问题

`@excalidraw/excalidraw` 作为 yarn workspace 包会在 `node_modules/@excalidraw/excalidraw` 建软链指向 `packages/excalidraw`。一度怀疑这是 app 被拉入的原因，于是收窄 `workspaces` 移除 app 包。

**实测**：只要所有被消费的子路径都在 `paths` 中显式映射、且没有相对导入逃逸，**保留软链（workspaces 不变）依然 0 app 拉入**——因为 `paths` 优先级高于 node_modules 解析。

结论：**无需收窄 workspaces**。收窄是基于「软链是根因」的错误假设产生的中间改动，已移除。保留上游 `workspaces` 配置可减少对 root `package.json` 的改动。

### 2.3 `paths` 无需 `baseUrl`（TS 4.1+）

TS 4.1 起，`paths` 在没有 `baseUrl` 时按**声明该 paths 的 tsconfig 文件位置**解析相对路径。本 fork 的 `packages/tsconfig.base.json` 被 `packages/*/tsconfig.json` 继承，paths 相对 `packages/` 解析，无需 `baseUrl`。

> 加 `baseUrl` 是 debug 期间的中间改动，已移除。

### 2.4 默认类型导出在 TS 4.9 可用

`app-like.ts` 用 `export { App as default }`（`App` 为类型别名）配合 `import type App from "..."`，在 TS 4.9 下正常工作。

曾经误判「默认类型导出会导致 TS 回退到 node_modules app」，实际那是**指向不存在的目标文件**（`__NE_APP__.ts`）时 TS 回退的假象，与默认导出无关。目标文件真实存在时默认导出解析正常。

结论：`store.ts` 可保持上游原样的 `import type App from "..."`，**无需改为命名导入**。

### 2.5 shim 中被 `assertNever` 穷尽检查的类型必须与上游逐字一致

`packages/element/src/delta.ts` 对 `keyof ObservedElementsAppState` 做 switch 穷尽检查，`default` 分支调用 `assertNever(key)`（`key` 须被收窄为 `never`）。

早期 shim 的 `ObservedElementsAppState` 比 upstream 多了两个可选 legacy 字段，导致 switch 非穷尽，`key` 退化为 `string`，`assertNever(key)` 报 `string → never`。

结论：shim 中**被穷尽检查的类型**（如 `ObservedElementsAppState`、`AppState` 的相关子集）必须与 upstream `packages/excalidraw/types.ts` **字段完全一致**，不能擅自增删字段。每次追齐 upstream 时重点同步这些类型。

### 2.6 不要把无关「改进」塞进解耦 patch

早期 patch 混入了与解耦无关的改动：`constants.ts` 的 SSR `navigator` 守卫、删除 `StoreDelta.squash/empty`、`BoundElement` 类改名 `BoundElementOps`、`getEffectiveGridSize()` 硬编码 `null`、拆 `app` 参数为 `appState`/`appScene` 等。

这些改动：
- 不服务解耦目标；
- 大幅放大对上游源码的 diff（~40 文件、多行）；
- 每次追齐 upstream 都产生大量冲突。

**最小解耦 patch 应只做必要改动**：把 app 类型下沉到 shim，用 `AppLike` 结构化接口让 `app: AppClassProperties` / `app.scene` / `app.state` / `app.getEffectiveGridSize()` 原样编译，上游行为全部保留。

---

## 3. 最终最小改动清单

### 新增（additive，不对上游源码产生 diff）

- `packages/basis/`：共享 leaf 类型 + 最小 `AppState`/`AppProps`/`NullableGridSize` + `global.d.ts`（含 `process` 桩）
- `packages/element/src/types_excalidraw.ts`：完整 app 类型 shim + `AppLike` + `AppClassProperties = AppLike`
- `packages/element/src/app-like.ts`：`@excalidraw/excalidraw/components/App` 替身，默认导出 `App = AppLike`
- `packages/element/src/scene_excalidraw.ts`：`@excalidraw/excalidraw/scene/types` 替身

### 修改的上游源码（仅 1 行/文件）

- `packages/common/src/{constants,emitter,points,utils}.ts`：`@excalidraw/excalidraw/types` → `@excalidraw/basis`（common 不能引用 element shim，会成环）
- `packages/element/src/Scene.ts`：`../../excalidraw/types` → `./types_excalidraw`（相对导入绕过 paths，**必须改**）
- `packages/utils/src/index.ts`：移除 `export * from "./export"`
- `packages/utils/src/export.ts` → `export.ts.todo`：禁用强依赖 app 包的模块

### 配置

- `packages/tsconfig.base.json`：新增 `@excalidraw/basis` 与 5 个 `@excalidraw/excalidraw/*` 子路径重映射（types/components/App/scene/types/global/css）。**无 baseUrl、无 catch-all**
- `packages/common/package.json`、`packages/element/package.json`：增加 `@excalidraw/basis` 依赖

### 未改动（保持上游原样）

- `packages/element/src/{linearElementEditor,binding,frame,groups,image,store,...}.ts`：`app: AppClassProperties` 与 `app.*` 调用原样（经 `AppLike` 解析）
- `packages/excalidraw`、`excalidraw-app`、`examples/*`：源码与 workspace 配置原样
- root `package.json`：`workspaces` 保持上游

---

## 4. 排查 app 被拉入编译的标准流程

1. `tsc -p packages/element/tsconfig.json --listFilesOnly | grep packages/excalidraw/` — 列出被拉入的 app 文件。
2. `tsc --traceResolution 2>&1 | grep -B2 -A4 "packages/excalidraw/types.ts"` — 找到谁解析到 app 文件。
3. 若解析来源是**相对导入**（`../../excalidraw/...`）→ 改为 shim 引用（这是最常见根因）。
4. 若是 `@excalidraw/excalidraw/<subpath>` 且未在 `paths` 映射 → 在 `tsconfig.base.json` 增加该子路径映射，或确认不应消费该子路径。
5. 确认 `paths` 中所有被消费的子路径都已映射后，软链存在与否不影响结果。

---

## 5. 追齐 upstream 时的检查重点

- `packages/element/src/types_excalidraw.ts` 与 upstream `packages/excalidraw/types.ts` 的**被穷尽检查类型**（`ObservedElementsAppState` 等）字段是否一致。
- upstream 是否在 basis 包中新增了 `@excalidraw/excalidraw/*` 子路径导入 → 需新增 `paths` 映射。
- upstream 是否新增了**相对导入**到 app 包 → 必须改为 shim 引用。
- `AppLike` 表面是否仍覆盖 element 新增的 `app.*` 访问 → 按需扩字段。
