# dsh-drop-in

> 馃寪 涓枃鐗堬細[README.zh.md](README.zh.md)

Drag files from your system file manager straight into the DeepSeek Harness web GUI.
Files appear as a chip bar above the input box, are sent along with your message
(including their **absolute paths**), and render as pretty file cards inside the
message bubble. The agent reads the real file paths 鈥?no upload, no content copy.

![Chip bar and message cards](assets/screenshots/screenshot-1.png)
![File cards in the message bubble](assets/screenshots/screenshot-2.png)

## Features

- 馃柋锔?Drag **any file or folder** from the OS into the page (images are treated as
  files too 鈥?no more "drop images here" mask taking over)
- 馃搶 A chip bar above the composer: icon + name + size + path status, per-file
  removal (`脳`), deduplicated (same path / name+size+mtime won't be added twice)
- 鉁夛笍 When you send the message, the file list is attached automatically as a
  `馃搸 鎷栧叆鏂囦欢` block (name, size, **absolute path**) 鈥?the bubble renders it as
  file cards; hover a card to see the full path
- 馃敡 A `dropped_files` tool so the agent can also list not-yet-sent files
- 馃枼锔?Works in the DSH Desktop shell (Electron): absolute paths come from a tiny
  `preload.js` bridge (`webUtils.getPathForFile`, the only way in modern Electron)
- 馃寪 Fallback: in a plain browser (no preload bridge), small text files are copied
  into `.dsh-drops/` under the session workspace so the agent can still read them

## Install

```sh
dsh plugin --profile web add https://github.com/lbl61/dsh-drop-in/archive/refs/tags/v1.1.1.tar.gz
```

or install the package into the web profile manually (bundle form):

1. Unpack `dsh-drop-in` into `~/.dsh/profiles/web/node_modules/dsh-drop-in/`
2. Add `"dsh-drop-in"` to the `dsh.profile.bundles` array in
   `~/.dsh/profiles/web/package.json`
3. Restart `dsh web` (DSH Desktop: fully quit and reopen, or
   `window.dshDesktop.restartService()` from the DevTools console)

## Usage

1. Drag files from Explorer / Finder / Files into the chat page.
2. The chip bar above the input box shows what will be attached.
3. Type your message and send (Enter or the send button).
4. The message bubble shows the files as cards 鈥?the agent receives the absolute
   paths in the message and can read the files directly with its own tools.

## How it works

- The client half intercepts file drags in the capture phase (so the built-in
  image-drop flow never hijacks them), keeps a per-session chip bar
  (`conversation.input.dock`), renders the user message bubble with file cards
  (`conversation.chat.node` key `user`), and appends the `馃搸 鎷栧叆鏂囦欢` block to the
  draft right before submit (both Enter and the send button).
- The host half keeps a per-session registry, serves it to the agent through the
  `dropped_files` tool, and (browser fallback) writes text files into
  `.dsh-drops/<sessionId>/`.
- Absolute paths in the DSH Desktop shell require the preload bridge (see
  [preload-bridge.md](preload-bridge.md)); it is the only way to get real paths in
  modern Electron (Electron 鈮?32 removed `File.path`).

## Configuration

| Setting | Meaning |
| --- | --- |
| `enabled` | Master switch (Settings 鈫?鏂囦欢鎷栧叆). When off, drags fall through to the built-in behavior. |

## Uninstall

1. Remove `dsh-drop-in` from `dsh.profile.bundles` in
   `~/.dsh/profiles/web/package.json`
2. Delete `~/.dsh/profiles/web/node_modules/dsh-drop-in/`
3. Restart `dsh web`

## License

MIT


