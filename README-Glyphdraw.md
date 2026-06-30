# Glyphdraw 定制 Fork 说明

本仓库是 [excalidraw/excalidraw](https://github.com/excalidraw/excalidraw) 的 fork，专为 [my-infinite-canvas](https://github.com/emenwin/my-infinite-canvas) 中的 **glyphdraw**（Vue3 + CanvasKit 白板）提供可独立编译的基础 package 依赖。

上游官方仓库中，`packages/common`、`packages/element` 等基础库会引用 `@excalidraw/excalidraw`（React app 包）中的类型与部分逻辑。glyphdraw 不能使用 app 包（见主仓库 `AGENTS.md`），因此在本 fork 中通过 **解耦 shim + tsconfig 路径重映射** 让基础 package 脱离 app 包单独构建，并尽量保持上游源码原样以降低追齐成本。

---

## 1. Fork 目的

| 目标 | 说明 |
| --- | --- |
| 对齐上游 | 以官方 excalidraw 的 `packages/*` 为基线，便于定期 merge `upstream/master` |
| 解耦 app 包 | `common` / `element` / `math` / `utils` 不再依赖 `@excalidraw/excalidraw` 的运行时逻辑与类型 |
| 供 glyphdraw 消费 | 主仓库通过 git submodule 引用本 fork，glyphdraw 仅依赖 `@excalidraw/{basis,common,element,math,utils}` |
| 最小改动 | 上游源码几乎原样保留（仅个别 1 行 import 调整），解耦改动集中在新增 shim 与 tsconfig |

**关联主仓库文档**（在 my-infinite-canvas 内）：

- `docs/3.sprint/sprint-excalidraw-submodule/sprint-excalidraw-submodule-migration-plan.md`
- `docs/3.sprint/sprint-excalidraw-submodule/excalidraw-fork-branching-operations.md`

---

## 2. 分支策略

采用 **多版本分支 + 单提交 patch**，详见主仓库分支操作说明。

| 分支 | 类型 | 说明 |
| --- | --- | --- |
| `glyphdraw/<upstream-7-char-sha>` | 不可变 | 例：`glyphdraw/2535d73` = 上游该 commit + 1 个解耦提交 |
| `excalidraw/<short-sha>-<label>` | 不可变 | 例：`excalidraw/3372149-2026-06` = 上游 `3372149` + 1 个解耦提交（带日期标签，便于识别追齐批次） |
| `glyphdraw/current` | 可变指针 | 指向当前推荐 submodule 使用的版本分支 tip |

**当前基线（`excalidraw/3372149-2026-06`）**

| 项 | 值 |
| --- | --- |
| 版本分支 | `excalidraw/3372149-2026-06` |
| 指针分支 | `glyphdraw/current` → `excalidraw/3372149-2026-06` |
| 上游基线 commit | `33721492771919e8569964fe0b034a9cf7f25955` |
| 上游说明 | feat(packages/excalidraw): export applyDarkModeFilter and simplify (#11429)，2026-06-01 |
| Patch commit | `49fc7308`；执行 `git log --oneline 3372149..excalidraw/3372149-2026-06` 应仅 1 条解耦提交 |

**历史基线（保留）**：`glyphdraw/2535d73` = 上游 `2535d730` + 解耦 patch `3c2d7dd6`。

---

## 3. 解耦方案

核心：**不逐文件改 import，而是用 tsconfig `paths` 把 `@excalidraw/excalidraw/*` 重映射到本地 shim**，使上游源码保持原样；仅个别无法被 paths 接管的相对导入做 1 行调整。详细踩坑与结论见 [DECOUPLE-LESSONS.md](./DECOUPLE-LESSONS.md)。

### 3.1 关键机制

| 机制 | 说明 |
| --- | --- |
| tsconfig 路径重映射 | `packages/tsconfig.base.json` 把 `@excalidraw/excalidraw/{types,components/App,scene/types,global,css}` 映射到本地 shim（无需 `baseUrl`，TS 4.1+ 按 declaring config 位置解析） |
| `AppLike` 结构化接口 | shim 中定义 `AppLike`（`scene`/`state`/`getEffectiveGridSize`/`imageCache`），令 `AppClassProperties = AppLike`、`App = AppLike`。element 源码 `app: AppClassProperties` / `app.scene` / `app.state` / `app.getEffectiveGridSize()` **零改动**通过编译 |
| 相对导入修补 | `element/src/Scene.ts` 原用相对路径 `../../excalidraw/types`（**绕过 paths**，直达 app），改为 `./types_excalidraw`（1 行）。这是 app 被拉入编译的真正根因 |

> `@excalidraw/excalidraw` 作为 workspace 包虽在 node_modules 有软链，但 `paths` 优先级更高；只要被消费的子路径都已映射且无相对导入逃逸，**无需收窄 workspaces**。

### 3.2 改动清单

**新增（additive，不产生对上游源码的 diff）**

| 路径 | 内容 |
| --- | --- |
| `packages/basis/` | 共享类型包：`ToolType`/`Zoom`/`Viewport`/`FrameNameBounds` 等 + 最小 `AppState`/`AppProps`/`NullableGridSize` + `global.d.ts` ambient（含 `process` 桩） |
| `packages/element/src/types_excalidraw.ts` | 完整 app 类型 shim：`AppState`/`AppProps`/`AppClassProperties`(=AppLike)/`ExcalidrawProps`/`ElementOrToolType`/`NullableGridSize` 等 |
| `packages/element/src/app-like.ts` | `@excalidraw/excalidraw/components/App` 替身：默认导出 `App = AppLike` |
| `packages/element/src/scene_excalidraw.ts` | `@excalidraw/excalidraw/scene/types` 替身：`StaticCanvasRenderConfig`/`ElementShape` 等 |

**修改的上游源码（仅 1 行/文件 import 调整，无逻辑改动）**

| 文件 | 改动 |
| --- | --- |
| `packages/common/src/constants.ts` | `@excalidraw/excalidraw/types` → `@excalidraw/basis` |
| `packages/common/src/emitter.ts` | 同上 |
| `packages/common/src/points.ts` | 同上 |
| `packages/common/src/utils.ts` | 同上 |
| `packages/element/src/Scene.ts` | `../../excalidraw/types` → `./types_excalidraw`（相对导入绕过 paths，必须改） |
| `packages/utils/src/index.ts` | 移除 `export * from "./export"`（该模块强依赖 app 包） |
| `packages/utils/src/export.ts` → `export.ts.todo` | 重命名禁用（强依赖 app 包，glyphdraw 不使用） |

**配置**

| 文件 | 改动 |
| --- | --- |
| `packages/tsconfig.base.json` | 新增 `@excalidraw/basis` 与 5 个 `@excalidraw/excalidraw/*` 子路径重映射（无 `baseUrl`、无 catch-all） |
| `packages/common/package.json`、`packages/element/package.json` | 增加 `@excalidraw/basis` 依赖 |

### 3.3 未改动的范围（保持上游原样）

- `packages/element/src/store.ts`、`linearElementEditor.ts`、`binding.ts`、`frame.ts`、`groups.ts`、`image.ts` 等：`app: AppClassProperties`/`app: App` 与 `app.scene`/`app.state`/`app.getEffectiveGridSize()` 调用原样保留（经 `AppLike` 解析）
- `packages/excalidraw`（React app 包）、`excalidraw-app`、`examples/*`：源码与 workspace 配置原样保留
- root `package.json` `workspaces`：保持上游
- 上游测试文件、`StoreDelta` API、`BoundElement` 类名、`getEffectiveGridSize` 行为：均保持上游原样（不裁剪、不重命名）

---

## 4. 编译验证

```bash
yarn install   # 上游 workspaces 原样；@excalidraw/basis 经 packages/* 纳入 workspace

yarn tsc --project packages/basis/tsconfig.json
yarn tsc --project packages/common/tsconfig.json
yarn tsc --project packages/math/tsconfig.json
yarn tsc --project packages/element/tsconfig.json
yarn tsc --project packages/utils/tsconfig.json
```

验收：五个包 `tsc` 全部 0 error，且不拉入 `packages/excalidraw/`（app 包）任何文件（`--listFilesOnly | grep packages/excalidraw/` 为空）。

---

## 5. 创建首个版本分支的步骤（已完成示例：`glyphdraw/2535d73`）

```bash
git clone git@github.com:emenwin/excalidraw.git
cd excalidraw
git remote add upstream https://github.com/excalidraw/excalidraw.git
git fetch upstream

git checkout -b glyphdraw/2535d73 2535d7305485a032b5a860a4538870a0c2d09c5a
# 应用第 3 节改动清单（新增 shim + tsconfig + 1 行 import 调整 + workspaces 收窄）
# squash 为一个提交：
git commit -m "feat(glyphdraw): decouple packages from excalidraw app ..."

# 编译验证（见第 4 节），全绿后推送：
git push -u origin glyphdraw/2535d73
git branch -f glyphdraw/current glyphdraw/2535d73
git push -u origin glyphdraw/current
```

---

## 6. 追齐上游（后续同步）

每次 upstream 有重大更新时，**新建**版本分支，不要 force-push 已有 `glyphdraw/<sha>`：

```bash
git fetch upstream
NEW_SHA=$(git rev-parse upstream/master)
SHORT=${NEW_SHA:0:7}
OLD_BRANCH=glyphdraw/2535d73
PATCH=$(git rev-parse ${OLD_BRANCH})   # patch 提交（仅 1 个）

git checkout -b glyphdraw/${SHORT} ${NEW_SHA}
git cherry-pick ${PATCH}              # 解决冲突后确保仍为 1 个提交
# 编译验证（第 4 节）

git push -u origin glyphdraw/${SHORT}
git branch -f glyphdraw/current glyphdraw/${SHORT}
git push origin glyphdraw/current
```

主仓库 submodule 应 **锁定具体 commit SHA**，并在 README 中记录版本分支与上游基线。

### 冲突高发区

- `packages/element/src/Scene.ts`、`store.ts`：少数被改的源文件，上游同处改动会冲突
- `packages/element/src/types_excalidraw.ts`：完整复制上游 `packages/excalidraw/types.ts`，上游 `types.ts` 变更需同步本 shim（尤其是 `AppState`/`ObservedElementsAppState` 等被 switch 穷尽检查的类型，字段必须与上游一致）
- `packages/tsconfig.base.json`：上游若调整 paths 需合入并保留解耦映射

---

## 7. 主仓库引用方式（submodule）

```bash
git submodule add -b glyphdraw/current \
  git@github.com:emenwin/excalidraw.git \
  vendor/excalidraw
```

`.gitmodules` 示例：

```ini
[submodule "vendor/excalidraw"]
  path = vendor/excalidraw
  url = git@github.com:emenwin/excalidraw.git
  branch = glyphdraw/current
```

---

## 8. 注意事项

1. **不要删除 `packages/basis`**：glyphdraw 与解耦后的 `common`/`element` 均直接依赖它。
2. **版本分支不可变**：修正请新建 `glyphdraw/<new-sha>`，保留旧分支供回滚。
3. **patch 保持单提交**：降低 cherry-pick / rebase 成本。
4. **`Scene.ts` 的相对导入是已知陷阱**：tsconfig `paths` 只接管非相对模块名；任何 `../../excalidraw/...` 相对导入都直达 app，必须改为 shim 引用。详见 [DECOUPLE-LESSONS.md](./DECOUPLE-LESSONS.md)。
5. **`types_excalidraw.ts` 须与上游 `types.ts` 同步**：尤其被 `assertNever` 穷尽检查的类型（如 `ObservedElementsAppState`），多余/缺失字段会导致 switch 非穷尽编译错误。
6. **无需收窄 workspaces / 无需 baseUrl**：`paths` 优先级高于 node_modules 软链；只要子路径映射齐全且无相对导入逃逸，app 不会被拉入。

---

**维护**：成功追齐 upstream 后更新本文件「当前基线」表格，并同步主仓库 README 中的 vendor 版本说明。
