# preload.js path bridge (DSH Desktop only)

Modern Electron (≥ 32) removed the non-standard `File.path` property, and
`webUtils.getPathForFile` is only reachable from a preload script — the page
itself cannot obtain real absolute paths for dropped files.

dsh-drop-in therefore adds a small, additive, fully-guarded block to the DSH
Desktop shell's preload (`<install>/resources/app/preload.js`):

```js
if (webUtils && typeof webUtils.getPathForFile === 'function') {
  document.addEventListener('drop', (event) => {
    try {
      const dt = event.dataTransfer;
      if (!dt || !dt.files || dt.files.length === 0) return;
      const entries = [];
      for (const file of dt.files) {
        let path = '';
        try { path = String(webUtils.getPathForFile(file) || ''); } catch {}
        entries.push({ name: String(file.name || ''), size: file.size || 0,
          type: String(file.type || ''), lastModified: file.lastModified || 0, path });
      }
      window.dispatchEvent(new CustomEvent('dsh-dropped-paths', { detail: { entries } }));
    } catch {}
  }, true);
}
```

Plus one line in the existing `require('electron')` to include `webUtils`.

The capture-phase `drop` listener runs before the page's own handlers, resolves
absolute paths, and forwards them to the page through the synchronous
`dsh-dropped-paths` window event, which the plugin's client half consumes.

## Important

- This file belongs to the **DSH Desktop shell**, not to the plugin package —
  a DSH Desktop update overwrites it. Re-apply the patch after updating.
- It is optional: without it, chips still appear, but entries show
  "无法读取路径" (no path); in a plain browser the text-file copy fallback applies.
- The patch never breaks the window: everything is wrapped in try/catch.
