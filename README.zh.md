# dsh-drop-in

> 🌐 English: [README.md](README.md)

把系统文件管理器里的文件直接拖进 DeepSeek Harness Web 界面。文件会显示在输入框上方的文件栏里，或在输入框有焦点时以**原生引用气泡**（文件胶囊）内嵌插入到正在输入的文字中间；发送消息时随消息一起发出（含 **绝对路径**），并在气泡中渲染成文件卡片。助手读取的是真实路径——不上传、不复制内容（浏览器兜底时小文件会复制到工作区）。

![文件栏与消息卡片](assets/screenshots/screenshot-1.png)
![消息气泡中的文件卡片](assets/screenshots/screenshot-2.png)

## 特性

- 📎 拖入**任意文件/文件夹**（图片也按文件处理——官方"拖图片"遮罩不再抢占拖拽）
- 🫧 **输入框内嵌文件气泡**：拖入/粘贴文件会在光标处插入原生引用气泡（文件胶囊，可插在文字中间）；气泡显示 **`类型 文件名`**（如 `LNK 坚果云.lnk`，长名截断时类型仍可见，悬停看全名）
- 📤 **发送即路径**：发送时气泡自动展开为含**绝对路径**的引用（`@[文件名](绝对路径)`），聊天气泡中渲染为文件卡片（带类型徽章），助手可直接按路径读取
- 🔀 **agent 运行中发送（不打断）** 的消息同样渲染文件卡片
- 🖼️ **剪贴板粘贴**：在输入框粘贴图片/文件走同一管道（文件气泡或文件栏），不再落入官方原生图片附件轨；粘贴的二进制以 base64 落盘到工作区 `.dsh-drops/<会话id>/`
- 🚀 输入框上方文件栏：图标 + 名称 + 大小 + 路径状态，可单独移除（×），自动去重（同路径不重复添加）
- ✔️ 回车 / Ctrl+Enter / 发送按钮三条路径全覆盖；chips 随消息发送后自动清空
- 🔍 提供 `dropped_files` 工具，助手可随时读取尚未发送的拖入文件
- 🖥️ DSH Desktop（Electron）下绝对路径来自 preload 小桥（`webUtils.getPathForFile`，新版 Electron 唯一取路径方式）
- 🌐 兜底：普通浏览器（无 preload 桥）下，文本文件会复制到工作区 `.dsh-drops/`

## 安装

```sh
dsh plugin --profile web add https://github.com/lbl61/dsh-drop-in/archive/refs/tags/v1.3.0.tar.gz
```

或手动安装（bundle 形态）：
1. 解压 `dsh-drop-in` 到 `~/.dsh/profiles/web/node_modules/dsh-drop-in/`
2. 在 `~/.dsh/profiles/web/package.json` 的 `dsh.profile.bundles` 数组加入 `"dsh-drop-in"`
3. 重启 `dsh web`（DSH Desktop：完全退出再打开，或在 DevTools 控制台执行 `window.dshDesktop.restartService()`）

## 使用

1. 从资源管理器把文件拖进聊天页（或直接在输入框粘贴图片/文件）
2. 输入框有焦点 → 文件以**原生引用气泡**（文件胶囊）插入到光标处，可插在文字中间；否则出现在输入框上方的文件栏
3. 输入消息并发送（回车 / Ctrl+Enter / 发送按钮均支持；agent 运行中也可"不打断"发送）
4. 消息气泡中显示文件卡片——助手在消息里直接拿到绝对路径（`@[文件名](路径)` 或 `📎 拖入文件` 块），可用自己的工具读取文件

## 工作原理

- 客户端半在捕获阶段拦截文件拖拽（官方图片上传流程不会抢走事件），维护按会话隔离的文件栏（`conversation.input.dock`），用文件卡片渲染用户消息气泡（`conversation.chat.node` 的 `user`/`steering` key），并在提交前把 `📎 拖入文件` 块拼进 draft（回车、Ctrl+Enter 和发送按钮三条路径都覆盖）；输入框有焦点时通过 `slash/input-insert-reference` scoped 事件插入**原生引用气泡**（U+FFFC occurrence，合成器 backdrop 渲染文件胶囊），提交时由注册的 `inputTriggers` codec 序列化为 `@[文件名](绝对路径)`
- 宿主半维护按会话的文件登记表，通过 `dropped_files` 工具提供给助手；文本文件写入 `.dsh-drops/<sessionId>/`，粘贴的二进制经 `file-copy` 路由以 base64 落盘到同一目录（显式 workspace-write sandbox 策略，根 = 会话 cwd）
- DSH Desktop 下绝对路径依赖 preload 桥（见 [preload-bridge.md](preload-bridge.md)）：Electron ≥ 32 已移除 `File.path`

## 配置

| 设置项 | 说明 |
| --- | --- |
| `enabled` | 总开关（设置 → 文件拖入）。关闭后拖拽/粘贴行为回落到内置逻辑。 |

## 卸载

1. 从 `~/.dsh/profiles/web/package.json` 的 `dsh.profile.bundles` 移除 `dsh-drop-in`
2. 删除 `~/.dsh/profiles/web/node_modules/dsh-drop-in/`
3. 重启 `dsh web`

## 许可

MIT
