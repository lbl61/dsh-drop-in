# dsh-drop-in

> 🌐 中文版：[README.zh.md](README.zh.md)

Drag files from your system file manager straight into the DeepSeek Harness web GUI.
Files appear as a chip bar above the input box, or — with the composer focused — as a
**native reference bubble** (file pill) embedded inline in the text you are typing; they
are sent along with your message (including their **absolute paths**), and render as
file cards inside the user bubble. The agent reads the real file paths — no upload, no
content copy (plain-browser fallback copies small files into the workspace).

![Chip bar and message cards](assets/screenshots/screenshot-1.png)
![File cards in the user bubble](assets/screenshots/screenshot-2.png)

## Features

- 📎 Drag in **any file/folder** (images are treated as files — the official image-drop overlay no longer steals the drag)
- 🫧 **Inline file bubble**: dropped/pasted files are inserted at the caret as a native reference pill (works mid-text); the pill shows **`TYPE name`** (e.g. `LNK 坚果云.lnk` — the type survives name clipping, full name on hover)
- 📤 **Path on send**: the pill expands to a reference carrying the **absolute path** (`@[filename](absolute-path)`); the chat bubble renders it as a file card with a type badge — the agent can read the file straight from the path
- 🔀 Messages sent while the agent is running ("interrupt-free") render the same file cards
- 🖼️ **Clipboard paste**: pasting an image/file into the composer goes through the same pipeline instead of the native image-attachment rail; pasted binaries are persisted (base64) under `.dsh-drops/<sessionId>/`
- 🚀 Chip bar above the input: icon + name + size + path status, removable (×), deduplicated by path
- ✔️ Enter / Ctrl+Enter / the send button are all covered; chips clear automatically after sending
- 🔍 A `dropped_files` tool lets the agent list still-unsent dropped files
- 🖥️ Under DSH Desktop (Electron) absolute paths come from the preload bridge (`webUtils.getPathForFile` — the only path source in modern Electron)
- 🌐 Fallback: in a plain browser (no preload bridge) text files are copied to the workspace `.dsh-drops/`

## Install

```sh
dsh plugin --profile web add https://github.com/lbl61/dsh-drop-in/archive/refs/tags/v1.3.0.tar.gz
```

Manual (bundle) install:
1. Extract `dsh-drop-in` into `~/.dsh/profiles/web/node_modules/dsh-drop-in/`
2. Add `"dsh-drop-in"` to the `dsh.profile.bundles` array in `~/.dsh/profiles/web/package.json`
3. Restart `dsh web` (DSH Desktop: quit fully and reopen, or run `window.dshDesktop.restartService()` in DevTools)

## Usage

1. Drag files from Explorer into the chat page (or paste an image/file into the composer)
2. Composer focused → files are inserted at the caret as **native reference bubbles** (file pills), mid-text allowed; otherwise they appear in the chip bar above the input
3. Type your message and send (Enter / Ctrl+Enter / the send button all work; "interrupt-free" sending while the agent runs is supported too)
4. The bubble shows file cards — the agent receives the absolute path (`@[name](path)` or the `📎 拖入文件` block) and can read the files

## How it works

- The client half intercepts file drags in the capture phase (the official image-upload flow never steals the events), keeps a per-session chip bar (`conversation.input.dock`), renders user bubbles with file cards (`conversation.chat.node` `user`/`steering` keys), and stitches the `📎 拖入文件` block into the draft before submit (Enter, Ctrl+Enter, and the send button are all covered); with the composer focused it inserts **native reference bubbles** via the `slash/input-insert-reference` scoped event (U+FFFC occurrences rendered by the composer backdrop) and the registered `inputTriggers` codec serializes them to `@[filename](absolute-path)` on submit
- The host half keeps the per-session file registry behind the `dropped_files` tool, writes fallback text copies to `.dsh-drops/<sessionId>/`, and persists pasted binaries via the `file-copy` route (base64, with an explicit workspace-write sandbox policy rooted at the session cwd)
- Absolute paths under DSH Desktop rely on the preload bridge (see [preload-bridge.md](preload-bridge.md)): Electron ≥ 32 removed `File.path`

## Configuration

| Setting | Description |
| --- | --- |
| `enabled` | Master switch (Settings → 文件拖入). When off, drag/paste falls back to built-in behavior. |

## Uninstall

1. Remove `dsh-drop-in` from the `dsh.profile.bundles` array in `~/.dsh/profiles/web/package.json`
2. Delete `~/.dsh/profiles/web/node_modules/dsh-drop-in/`
3. Restart `dsh web`

## License

MIT
