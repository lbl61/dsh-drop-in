# dsh-drop-in

> 🌐 English: [README.md](README.md)

把系统文件管理器里的文件直接拖进 DeepSeek Harness Web 界面。文件会显示在输入框上方的文件栏里，或在输入框有焦点时以**原生引用气泡**（文件胶囊）内嵌插入到正在输入的文字中间；发送消息时随消息一起发出（含 **绝对路径**），并在气泡中渲染成文件卡片。助手读取的是真实路径——不上传、不复制内容（浏览器兜底时小文件会复制到工作区）。

![文件栏与消息卡片](assets/screenshots/screenshot-1.png)
![消息气泡中的文件卡片](assets/screenshots/screenshot-2.png)

## 特性

- 📎 拖入**任意文件/文件夹**（图片也按文件处理——官方"拖图片"遮罩不再抢占拖拽）
- 🫧 **输入框内嵌文件气泡**：输入框有焦点时拖入/粘贴文件，会在光标处插入原生引用气泡（文件胶囊，可插在文字中间，如 `你好「报告.zip」看一下这个文件`）；发送时气泡自动展开为含**绝对路径**的引用（`@[文件名](绝对路径)`），聊天气泡中渲染为文件卡片，助手可直接按路径读取
- 🖼️ **剪贴板粘贴**：在输入框粘贴图片/文件走同一管道（文件气泡或文件栏），不再落入官方原生图片附件轨
- 🚀 输入框上方文件栏：图标 + 名称 + 大小 + 路径状态，可单独移除（×），自动去重（同路径不重复添加）
- ✔️ 发送消息时自动附带 `📎 拖入文件` 块（名称、大小、**绝对路径**），气泡渲染为文件卡片，悬停可看完整路径
- 🔍 提供 `dropped_files` 工具，助手可随时读取尚未发送的拖入文件
- 🖥️ DSH Desktop（Electron）下绝对路径来自 preload 小桥（`webUtils.getPathForFile`，新版 Electron 唯一取路径方式）
- 🌐 兜底：普通浏览器（无 preload 桥）下，文本文件会复制到工作区 `.dsh-drops/`，粘贴的二进制文件也会以 base64 落盘到同一目录，助手仍可读取

## 安装

```sh
dsh plugin --profile web add https://github.com/lbl61/dsh-drop-in/archive/refs/tags/v1.2.0.tar.gz
```

或手动安装（bundle 形态）：
1. 解压 `dsh-drop-in` 到 `~/.dsh/profiles/web/node_modules/dsh-drop-in/`
2. 在 `~/.dsh/profiles/web/package.json` 的 `dsh.profile.bundles` 数组加入 `"dsh-drop-in"`
3. 重启 `dsh web`（DSH Desktop：完全退出再打开，或在 DevTools 控制台执行 `window.dshDesktop.restartService()`）

## 使用

1. 从资源管理器把文件拖进聊天页（或直接在输入框粘贴图片/文件）
2. 输入框有焦点 → 文件以**原生引用气泡**（文件胶囊）插入到光标处，可插在文字中间；否则出现在输入框上方的文件栏
3. 输入消息并发送（回车 / Ctrl+Enter / 发送按钮均支持）
4. 消息气泡中显示文件卡片——助手在消息里直接拿到绝对路径（`@[文件名](路径)` 或 `📎 拖入文件` 块），可用自己的工具读取文件

## 工作原理

- 客户端半在捕获阶段拦截文件拖拽（官方图片上传流程不会抢走事件），维护按会话隔离的文件栏（`conversation.input.dock`），用文件卡片渲染用户消息气泡（`conversation.chat.node` 的 `user` key），并在提交前把 `📎 拖入文件` 块拼进 draft（回车、Ctrl+Enter 和发送按钮三条路径都覆盖）；输入框有焦点时改为通过 `slash/input-insert-reference` scoped 事件插入**原生引用气泡**（U+FFFC occurrence，合成器 backdrop 渲染文件胶囊），提交时由注册的 `inputTriggers` codec 序列化为 `@[文件名](绝对路径)`
- 宿主半维护按会话的文件登记表，通过 `dropped_files` 工具提供给助手；（浏览器兜底时）把文本文件写入 `.dsh-drops/<sessionId>/`，粘贴的二进制文件经 `file-copy` 路由以 base64 落盘到同一目录
- DSH Desktop 下绝对路径依赖 preload 桥（见 [preload-bridge.md](preload-bridge.md)）：Electron ≥ 32 已移除 `File.path`，这是唯一能拿到真实路径的方式

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
