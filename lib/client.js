window.__ModuleLoader__.load({
  id: "dsh-drop-in",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    var React = require("react");

    /** 与宿主半通信：POST /api/dsh-drop-in/<method>（仅回环地址）。 */
    function api(method, args) {
      return fetch("/api/dsh-drop-in/" + method, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(args || {})
      }).then(function (r) { return r.json(); });
    }

    var CSS = ".ddrop-settings{display:flex;flex-direction:column;gap:8px}.ddrop-settings-title{font-size:15px;font-weight:700;margin:0}.ddrop-settings-row{display:flex;align-items:center;gap:8px;font-size:14px;cursor:pointer}.ddrop-settings-desc{font-size:12px;color:var(--dsw-alias-label-secondary,#8b9ac4);margin:0;line-height:18px}.ddrop-dock{display:flex;flex-wrap:wrap;align-items:center;gap:6px;width:100%;max-width:var(--dsh-composer-card-max-width,760px);margin:0 auto;padding:0 4px 2px}.ddrop-hint{flex:1 1 100%;font-size:11px;color:var(--dsw-alias-label-tertiary,#8b9ac4);line-height:16px;opacity:.85}.ddrop-chip{display:inline-flex;align-items:center;gap:7px;max-width:280px;padding:4px 8px 4px 6px;border:1px solid var(--dsw-alias-border-l1,rgba(255,255,255,.1));border-radius:10px;background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.06));cursor:default;user-select:none}.ddrop-ico{display:grid;place-items:center;width:22px;height:22px;border-radius:6px;color:#fff;flex:none}.ddrop-ico-image{background:#f472b6}.ddrop-ico-pdf{background:#f87171}.ddrop-ico-doc{background:#60a5fa}.ddrop-ico-sheet{background:#4ade80}.ddrop-ico-zip{background:#fbbf24}.ddrop-ico-code{background:#a78bfa}.ddrop-ico-audio{background:#fb923c}.ddrop-ico-video{background:#22d3ee}.ddrop-ico-other{background:#94a3b8}.ddrop-name{font-size:12px;font-weight:600;color:var(--dsw-alias-label-primary,#e6ecff);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:150px}.ddrop-size{font-size:11px;color:var(--dsw-alias-label-tertiary,#8b9ac4);flex:none}.ddrop-status{font-size:10.5px;padding:1px 6px;border-radius:999px;flex:none}.ddrop-ok{color:#3ddc84;background:rgba(61,220,132,.12)}.ddrop-copied{color:#60a5fa;background:rgba(96,165,250,.12)}.ddrop-copying{color:#fbbf24;background:rgba(251,191,36,.12)}.ddrop-nopath{color:#ff7a85;background:rgba(255,122,133,.12)}.ddrop-remove{border:none;background:transparent;color:var(--dsw-alias-label-tertiary,#8b9ac4);cursor:pointer;font-size:14px;line-height:14px;padding:0 2px;border-radius:6px}.ddrop-remove:hover{color:var(--dsw-alias-state-error-primary,#ff7a85);background:rgba(255,122,133,.12)}.ddrop-overlay{position:fixed;inset:0;z-index:2147482500;display:grid;place-items:center;pointer-events:none}.ddrop-overlay-inner{display:flex;flex-direction:column;align-items:center;gap:10px;padding:28px 44px;border:1.5px dashed var(--dsw-alias-accent-primary,#679efd);border-radius:20px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-2,#0b1220) 82%,transparent);backdrop-filter:blur(6px);box-shadow:0 12px 40px rgba(0,0,0,.45)}.ddrop-overlay-icon{font-size:30px}.ddrop-overlay-title{font-size:15px;font-weight:700;color:var(--dsw-alias-label-primary,#e6ecff)}.ddrop-overlay-sub{font-size:12px;color:var(--dsw-alias-label-secondary,#b8c5ea)}.ddrop-msg-user{display:flex;justify-content:flex-end;padding:6px 14px 2px 0}.ddrop-msg-stack{display:flex;flex-direction:column;align-items:flex-end;gap:6px;max-width:min(78%,640px)}.ddrop-msg-bubble{padding:8px 12px;border-radius:16px;background:color-mix(in srgb,var(--dsw-alias-brand-primary,#3964fe) 15%,var(--dsw-alias-bg-layer-1,#131c31));border:1px solid color-mix(in srgb,var(--dsw-alias-brand-primary,#3964fe) 28%,transparent);color:var(--dsw-alias-label-primary,#eef2ff);font-size:14px;line-height:22px;word-break:break-word;text-align:left}.ddrop-msg-text{white-space:pre-wrap}.ddrop-msg-cards{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}.ddrop-msg-img{max-width:240px;max-height:240px;border-radius:12px;object-fit:cover;display:block}.ddrop-msg-imgerr{font-size:12px;color:var(--dsw-alias-state-error-primary,#ff7a85);padding:6px}.ddrop-msg-imgloading{font-size:12px;color:var(--dsw-alias-label-secondary,#b8c5ea);padding:6px}.ddrop-msg-inline{display:inline-flex;vertical-align:middle;margin:1px 3px}.ddrop-msg-inline .ddrop-chip{vertical-align:middle}";

    const inject = ["slots", "settingsScope", "sessions", "inputTriggers"];

    function apply(ctx) {
      const entriesBySession = new Map();
      const tokensBySession = new Map(); // sid -> Map<"@name", entry> 兜底：纯文本 @ 引用
      const entriesById = new Map(); // ref(entry.id) -> entry：occurrence 序列化查找（跨会话）
      const pendingCopies = new Map(); // ref -> Promise：等待落盘后再序列化
      const REFS_KEY = "dsh-drop-in.refs.v1";
      const listeners = new Set();
      let refsLoaded = false;
      let currentSessionId = "";
      let dragDepth = 0;
      let dragCount = 0;
      let lastBridge = [];
      let latestDraftRef = "";
      let currentInputActions = null;
      let currentInput = null;
      let origSubmitRef = null;
      let settingsScope = null;
      try { if (ctx.settingsScope && typeof ctx.settingsScope.bind === "function") settingsScope = ctx.settingsScope.bind({ namespace: "drop-in" }); } catch {}
      const isEnabled = () => {
        try {
          if (!settingsScope || typeof settingsScope.getSnapshot !== "function") return true;
          const value = settingsScope.getSnapshot().value;
          return value === undefined || value === null || value.enabled !== false;
        } catch { return true; }
      };

      const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      const getEntries = (sid) => entriesBySession.get(sid) || [];
      const emit = () => { for (const fn of Array.from(listeners)) { try { fn(); } catch {} } };
      const subscribe = (fn) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
      // ---- 引用（occurrence）登记：entry.id 全局唯一，序列化按 id 找回 entry ----
      const saveRefs = () => {
        try {
          const out = {};
          let n = 0;
          for (const [k, v] of entriesById) { out[k] = v; if (++n >= 600) break; }
          localStorage.setItem(REFS_KEY, JSON.stringify(out));
        } catch {}
      };
      const loadRefs = () => {
        if (refsLoaded) return;
        refsLoaded = true;
        try {
          const raw = localStorage.getItem(REFS_KEY);
          if (raw) {
            const obj = JSON.parse(raw);
            for (const k of Object.keys(obj)) {
              const v = obj[k];
              if (v && typeof v.name === "string") entriesById.set(k, { name: v.name, path: v.path || "", size: Number(v.size) || 0, sid: v.sid || "" });
            }
          }
        } catch {}
      };
      const refEntry = (ref) => entriesById.get(ref) || null;
      const sessionsService = () => {
        try {
          const s = (ctx && (ctx.get ? ctx.get("sessions") : null)) || (ctx && ctx.sessions);
          return s || null;
        } catch { return null; }
      };
      const bailInsertRef = (sid, entry, span) => {
        const sessions = sessionsService();
        let actx = null;
        try { actx = sessions && sessions.scope ? sessions.scope(sid) : null; } catch {}
        if (!actx || typeof actx.bail !== "function") return false;
        const reference = {
          source: "drop-in",
          ref: entry.id,
          label: entry.name,
          clipboardText: entry.path || entry.name
        };
        try {
          return actx.bail(actx, "slash/input-insert-reference", { reference, span }) === true;
        } catch { return false; }
      };
      /** 原生引用气泡：在光标处插入 U+FFFC occurrence，合成器 backdrop 渲染为文件 chip。 */
      const insertRefAtCaret = async (entries, sid) => {
        const el = findComposerTextarea();
        if (!el || document.activeElement !== el) return false;
        if (el.disabled || el.readOnly) return false;
        loadRefs();
        let ok = false;
        let pos = Math.min(Math.max(el.selectionStart ?? 0, 0), String(el.value || "").length);
        for (const entry of entries) {
          const input = currentInput; // 每次取最新快照（每次 bail 后 store 变更、dock 已重渲染）
          if (!input || input.phase !== "plain") return ok;
          const span = { start: pos, end: pos, draftRev: input.draftRev };
          if (!bailInsertRef(sid, entry, span)) return ok;
          entriesById.set(entry.id, { name: entry.name, path: entry.path, size: entry.size, sid });
          saveRefs();
          ok = true;
          pos += 2; // 机器在 chip 后自动补一个空格（U+FFFC + ' '），光标跳过 2 字符
          try { el.setSelectionRange(pos, pos); } catch {}
          await new Promise((r) => requestAnimationFrame(() => r()));
        }
        return ok;
      };
      const hasFiles = (ev) => !!(ev.dataTransfer && Array.prototype.indexOf.call(ev.dataTransfer.types, "Files") >= 0);
      const filePathOf = (f) => { try { if (typeof f.path === "string" && f.path) return f.path; } catch {} return ""; };
      const TEXT_EXT = /\.(txt|md|markdown|csv|json|xml|yml|yaml|log|ini|cfg|conf|js|ts|jsx|tsx|py|java|c|cpp|h|hpp|cs|go|rs|sh|ps1|bat|html|htm|css|sql|toml|properties|env|gitignore)$/i;
      const readFileText = (f) => new Promise((resolve) => {
        try {
          if (typeof f.text === "function") { f.text().then(resolve, () => resolve("")); return; }
          const r = new FileReader();
          r.onload = () => resolve(String(r.result || ""));
          r.onerror = () => resolve("");
          r.readAsText(f);
        } catch { resolve(""); }
      });
      const fmtSize = (n) => {
        const v = Number(n) || 0;
        if (v < 1024) return v + " B";
        if (v < 1024 * 1024) return (v / 1024).toFixed(1) + " KB";
        if (v < 1024 * 1024 * 1024) return (v / 1024 / 1024).toFixed(1) + " MB";
        return (v / 1024 / 1024 / 1024).toFixed(2) + " GB";
      };
      const buildBlock = (entries) => {
        const lines = ["📎 拖入文件（" + entries.length + " 个）"];
        entries.forEach((e, i) => {
          if (e.path) {
            lines.push((i + 1) + ". " + e.name + "（" + fmtSize(e.size) + "）");
            lines.push("   路径: " + e.path);
          } else {
            lines.push((i + 1) + ". " + e.name + "（" + fmtSize(e.size) + "）· 无法获取绝对路径");
          }
        });
        return lines.join("\n");
      };
      const attachBlock = (draftText) => {
        const entries = getEntries(currentSessionId);
        if (entries.length === 0) return draftText;
        return draftText + (draftText ? "\n\n" : "") + buildBlock(entries);
      };
      const clearChips = (sid) => {
        if (entriesBySession.delete(sid)) emit();
        tokensBySession.delete(sid);
        for (const [k, v] of Array.from(entriesById)) {
          if (v && v.sid === sid) { entriesById.delete(k); pendingCopies.delete(k); }
        }
        saveRefs();
        try { api("clear", { sessionId: sid }).catch(() => {}); } catch {}
      };
      const isDuplicate = (sid, p) => {
        const list = getEntries(sid);
        const pl = String(p.path || "").toLowerCase();
        if (!pl) return false; // 无路径条目（剪贴板粘贴等）不去重，允许重复粘贴
        return list.some((e) => String(e.path || "").toLowerCase() === pl);
      };
      const parseDrops = (text) => {
        const out = { before: [], entries: [], after: [] };
        const lines = String(text || "").split("\n");
        let state = 0;
        let current = null;
        for (const line of lines) {
          if (state === 0) {
            if (line.indexOf("📎 拖入文件（") >= 0) { state = 1; continue; }
            out.before.push(line);
            continue;
          }
          if (state === 1) {
            const pm = /^\s*路径[:：]\s*(.+)$/.exec(line);
            if (pm) { if (current) current.path = pm[1].trim(); continue; }
            const em = /^\s*\d+\.\s+(.+)$/.exec(line);
            if (em) {
              if (current) out.entries.push(current);
              const rest = em[1];
              const sizeM = /（([^）]*)）/.exec(rest);
              const noteM = /·\s*(.+)$/.exec(rest);
              const nm = sizeM ? rest.slice(0, sizeM.index).trim() : rest;
              current = { name: nm, size: sizeM ? sizeM[1].trim() : "", path: "", note: noteM ? noteM[1].trim() : "" };
              continue;
            }
            if (current) { out.entries.push(current); current = null; }
            state = 2;
            out.after.push(line);
            continue;
          }
          out.after.push(line);
        }
        if (state === 1 && current) out.entries.push(current);
        return out;
      };

      /** 合成器输入框（[data-composer-card] 内的 textarea）。 */
      const findComposerTextarea = () => {
        const active = document.activeElement;
        if (active && active.tagName === "TEXTAREA" && active.closest && active.closest("[data-composer-card]")) return active;
        const el = document.querySelector("[data-composer-card] textarea");
        return el instanceof HTMLTextAreaElement ? el : null;
      };
      /** 文件 → base64（data URL 剥离前缀）。 */
      const readFileBase64 = (f) => new Promise((resolve) => {
        try {
          const r = new FileReader();
          r.onload = () => {
            const s = String(r.result || "");
            resolve(s.indexOf(",") >= 0 ? s.slice(s.indexOf(",") + 1) : s);
          };
          r.onerror = () => resolve("");
          r.readAsDataURL(f);
        } catch { resolve(""); }
      });
      /** 把草稿里的 @文件名 引用替换为 @[文件名](绝对路径)（代理可读路径，气泡渲染为卡片）。 */
      const inlineTokens = (draft, sid) => {
        const map = tokensBySession.get(sid || currentSessionId);
        if (!map || map.size === 0) return draft;
        let out = draft;
        const tokens = Array.from(map.keys()).sort((a, b) => b.length - a.length);
        for (const token of tokens) {
          const entry = map.get(token);
          if (!entry || out.indexOf(token) < 0) continue;
          const rep = entry.path ? "@[" + entry.name + "](" + entry.path + ")" : token;
          out = out.split(token).join(rep);
        }
        return out;
      };
      /** 兜底：原生引用气泡不可用（bail 失败）时，在光标处插入纯文本 @文件名，并登记 token。 */
      const insertTokensAtCaret = (entries, sid) => {
        const el = findComposerTextarea();
        if (!el || document.activeElement !== el) return false;
        if (el.disabled || el.readOnly) return false;
        const ia = currentInputActions;
        if (!ia) return false;
        const draft = String(el.value || "");
        const pos = Math.min(Math.max(el.selectionStart ?? draft.length, 0), draft.length);
        const tokenStr = entries.map((e) => "@" + e.name).join("");
        if (!tokenStr) return false;
        ia.setDraft(draft.slice(0, pos) + tokenStr + draft.slice(pos));
        let map = tokensBySession.get(sid);
        if (!map) { map = new Map(); tokensBySession.set(sid, map); }
        for (const e of entries) map.set("@" + e.name, e);
        requestAnimationFrame(() => {
          try {
            el.focus({ preventScroll: true });
            el.setSelectionRange(pos + tokenStr.length, pos + tokenStr.length);
          } catch {}
        });
        return true;
      };
      /** 气泡内联解析：@[名称](路径) → 文件卡片片段。 */
      const splitInline = (text) => {
        const segments = [];
        const re = /@\[([^\]]+)\]\(([^)]*)\)/g;
        let last = 0;
        let m;
        while ((m = re.exec(text)) !== null) {
          if (m.index > last) segments.push({ type: "text", text: text.slice(last, m.index) });
          segments.push({ type: "file", name: m[1], path: m[2] });
          last = m.index + m[0].length;
        }
        if (last < text.length) segments.push({ type: "text", text: text.slice(last) });
        return segments;
      };
      /** 共享入库管道：去重 → 上报 → 原生引用气泡（光标处）→ 兜底纯文本@或chips → 无路径文件落盘。 */
      const finalizeEntries = async (pendingAll, files, sid) => {
        const pending = pendingAll.filter((p) => !isDuplicate(sid, p));
        if (pending.length === 0) return;
        loadRefs();
        const inserted = await insertRefAtCaret(pending, sid);
        if (!inserted) {
          const tokInserted = insertTokensAtCaret(pending, sid);
          if (!tokInserted) {
            entriesBySession.set(sid, [...getEntries(sid), ...pending]);
            emit();
          }
        }
        try { await api("report", { sessionId: sid, entries: pending }); } catch (err) { console.error("[drop-in] report failed", err); }
        for (const entry of pending) {
          if (entry.path || entry.copying) continue;
          const file = files[pending.indexOf(entry)];
          entry.copying = true;
          emit();
          if (!file || entry.size > 16 * 1024 * 1024) { entry.copying = false; emit(); continue; }
          if (!TEXT_EXT.test(entry.name)) {
            const run = async () => {
              const b64 = await readFileBase64(file);
              entry.copying = false;
              if (!b64) return;
              try {
                const res = await api("file-copy", { sessionId: sid, id: entry.id, name: entry.name, dataBase64: b64 });
                if (res && res.ok) { entry.path = res.path; entry.status = "copied"; }
              } catch (err) { entry.error = String((err && err.message) || err); }
              emit();
              try { await api("report", { sessionId: sid, entries: [entry] }); } catch {}
              // 序列化时若 chip 还没落盘，会等待这个 promise 拿到路径
              const cur = refEntry(entry.id);
              if (cur) { cur.path = entry.path; cur.size = entry.size; saveRefs(); }
            };
            pendingCopies.set(entry.id, run());
            try { await pendingCopies.get(entry.id); } finally { pendingCopies.delete(entry.id); }
            continue;
          }
          const content = await readFileText(file);
          entry.copying = false;
          if (!content) continue;
          try {
            const res = await api("text-copy", { sessionId: sid, id: entry.id, name: entry.name, content });
            if (res && res.ok) { entry.path = res.path; entry.status = "copied"; }
          } catch (err) { entry.error = String((err && err.message) || err); }
          emit();
          try { await api("report", { sessionId: sid, entries: [entry] }); } catch {}
          const cur = refEntry(entry.id);
          if (cur) { cur.path = entry.path; cur.size = entry.size; saveRefs(); }
        }
      };

      const onDrop = async (ev) => {
        if (!hasFiles(ev)) return;
        if (!isEnabled()) return;
        ev.preventDefault();
        ev.stopPropagation();
        dragDepth = 0;
        emit();
        const files = Array.from(ev.dataTransfer.files);
        if (files.length === 0) return;
        const sid = currentSessionId;
        const bridge = lastBridge;
        lastBridge = [];
        const pendingAll = files.map((f, i) => {
          const b = bridge[i] || {};
          const path = filePathOf(f) || (typeof b.path === "string" ? b.path : "");
          return {
            id: uid(),
            name: f.name || "unnamed",
            size: f.size || 0,
            type: f.type || "",
            lastModified: f.lastModified || 0,
            path,
            status: path ? "ok" : "no-path",
            error: "",
            copying: false
          };
        });
        await finalizeEntries(pendingAll, files, sid);
      };
      const onDragEnter = (ev) => {
        if (!hasFiles(ev)) return;
        ev.preventDefault();
        ev.stopPropagation();
        dragDepth += 1;
        dragCount = ev.dataTransfer.items ? ev.dataTransfer.items.length : ev.dataTransfer.files.length;
        emit();
      };
      const onDragOver = (ev) => {
        if (!hasFiles(ev)) return;
        ev.preventDefault();
        ev.stopPropagation();
        if (ev.dataTransfer) ev.dataTransfer.dropEffect = "copy";
      };
      const onDragLeave = (ev) => {
        if (!hasFiles(ev)) return;
        ev.preventDefault();
        ev.stopPropagation();
        dragDepth = Math.max(0, dragDepth - 1);
        if (dragDepth === 0) emit();
      };
      const onDragEnd = () => { if (dragDepth !== 0) { dragDepth = 0; emit(); } };
      const onBridge = (e) => {
        const d = e && e.detail;
        lastBridge = Array.isArray(d && d.entries) ? d.entries : [];
      };
      /** 剪贴板图片/文件粘贴：拦截合成器内的文件粘贴，走插件管道（@插入或chips+落盘），不再落入原生图片附件轨。 */
      const onPaste = (ev) => {
        if (!isEnabled()) return;
        const target = ev.target;
        if (!target || target.tagName !== "TEXTAREA") return;
        if (!(target.closest && target.closest("[data-composer-card]"))) return;
        const cd = ev.clipboardData;
        if (!cd || !cd.items) return;
        const files = [];
        for (const item of Array.from(cd.items)) {
          if (item.kind === "file") {
            const f = item.getAsFile();
            if (f) files.push(f);
          }
        }
        if (files.length === 0) return;
        const input = currentInput;
        if (input && input.phase !== "plain") return;
        if (!currentInputActions) return;
        ev.preventDefault();
        ev.stopPropagation();
        const sid = currentSessionId;
        if (!sid) return;
        const pendingAll = files.map((f) => ({
          id: uid(),
          name: f.name || "pasted-" + Date.now() + ".png",
          size: f.size || 0,
          type: f.type || "",
          lastModified: f.lastModified || 0,
          path: filePathOf(f),
          status: filePathOf(f) ? "ok" : "no-path",
          error: "",
          copying: false
        }));
        finalizeEntries(pendingAll, files, sid);
      };
      const onKeyDown = (ev) => {
        if (!currentSessionId) return;
        const hasTokens = () => { const m = tokensBySession.get(currentSessionId); return !!(m && m.size > 0); };
        if (getEntries(currentSessionId).length === 0 && !hasTokens()) {
          // 只有原生引用 chip（occurrence）时走合成器原生提交路径（机器会序列化路径）
          return;
        }
        // Enter / Ctrl+Enter / Cmd+Enter 都拦截（合成器的 Ctrl+Enter 走 keyboard.submit
        // 会绕过我们的附加逻辑）；Shift/Alt 组合与长按重复放行。
        if (ev.key !== "Enter" || ev.shiftKey || ev.altKey || ev.repeat) return;
        if (ev.isComposing || ev.keyCode === 229) return;
        const target = ev.target;
        if (!target || target.tagName !== "TEXTAREA") return;
        const input = currentInput;
        if (input && input.phase !== "plain") return;
        const ia = currentInputActions;
        if (!ia) return;
        ev.preventDefault();
        ev.stopPropagation();
        const draft = String(target.value || "");
        ia.setDraft(attachBlock(inlineTokens(draft)));
        if (origSubmitRef) { try { origSubmitRef(); } catch {} }
        clearChips(currentSessionId);
      };

      ctx.effect(() => {
        window.addEventListener("dsh-dropped-paths", onBridge);
        document.addEventListener("dragenter", onDragEnter, true);
        document.addEventListener("dragover", onDragOver, true);
        document.addEventListener("dragleave", onDragLeave, true);
        document.addEventListener("drop", onDrop, true);
        document.addEventListener("keydown", onKeyDown, true);
        document.addEventListener("paste", onPaste, true);
        window.addEventListener("dragend", onDragEnd);
        // 注册 @ 触发源：提交时机器把 U+FFFC occurrence 序列化为模型文本（绝对路径）。
        let unregisterSource = null;
        try {
          const inputTriggers = ctx && ctx.get ? ctx.get("inputTriggers") : null;
          if (inputTriggers && typeof inputTriggers.registerSource === "function") {
            unregisterSource = inputTriggers.registerSource({
              trigger: "@",
              name: "drop-in",
              order: 100,
              candidates: async () => [],
              onPick: () => undefined,
              codec: {
                clipboardText: (ref) => {
                  const e = refEntry(ref);
                  return (e && e.path) || (e && e.name) || ref;
                },
                serialize: async (ref, signal) => {
                  let e = refEntry(ref);
                  const pend = pendingCopies.get(ref);
                  if (pend) {
                    try { await Promise.race([pend, new Promise((res) => { if (signal) signal.addEventListener("abort", res); }) ]); } catch {}
                    e = refEntry(ref);
                  }
                  if (!e) return ref;
                  return e.path ? "@[" + e.name + "](" + e.path + ")" : "@" + e.name;
                }
              }
            });
          }
        } catch (err) { console.error("[drop-in] registerSource failed", err); }
        const styleEl = document.createElement("style");
        styleEl.textContent = CSS;
        document.head.appendChild(styleEl);
        return () => {
          window.removeEventListener("dsh-dropped-paths", onBridge);
          document.removeEventListener("dragenter", onDragEnter, true);
          document.removeEventListener("dragover", onDragOver, true);
          document.removeEventListener("dragleave", onDragLeave, true);
          document.removeEventListener("drop", onDrop, true);
          document.removeEventListener("keydown", onKeyDown, true);
          document.removeEventListener("paste", onPaste, true);
          window.removeEventListener("dragend", onDragEnd);
          if (unregisterSource) { try { unregisterSource(); } catch {} }
          try { styleEl.remove(); } catch {}
        };
      }, "drop-in: drag listeners + styles");

      const kindOf = (nm) => {
        const ext = String(nm).split(".").pop().toLowerCase();
        if (/^(png|jpe?g|gif|webp|svg|bmp|ico|avif)$/.test(ext)) return "image";
        if (ext === "pdf") return "pdf";
        if (/^(docx?|txt|md|markdown|rtf|odt|pages)$/.test(ext)) return "doc";
        if (/^(xlsx?|csv|ods|numbers|tsv)$/.test(ext)) return "sheet";
        if (/^(zip|rar|7z|tar|gz|bz2|xz)$/.test(ext)) return "zip";
        if (/^(js|ts|jsx|tsx|py|java|c|cpp|h|hpp|cs|go|rs|json|xml|yml|yaml|html?|css|sh|ps1|sql|toml|ini|cfg)$/.test(ext)) return "code";
        if (/^(mp3|wav|flac|ogg|m4a|aac|wma)$/.test(ext)) return "audio";
        if (/^(mp4|mkv|avi|mov|webm|flv|wmv)$/.test(ext)) return "video";
        return "other";
      };
      const fileGlyph = () => React.createElement("svg", { width: 12, height: 14, viewBox: "0 0 12 14", fill: "none", xmlns: "http://www.w3.org/2000/svg" }, [
        React.createElement("path", { key: "p", d: "M1 1.5C1 .95 1.45.5 2 .5h5.5L10.5 3.5V12.5c0 .55-.45 1-1 1H2c-.55 0-1-.45-1-1V1.5z", fill: "rgba(255,255,255,.92)" }),
        React.createElement("path", { key: "f", d: "M7.5.5v3h3", stroke: "rgba(0,0,0,.25)", strokeWidth: ".8", fill: "none" })
      ]);
      const Chip = (props) => {
        const entry = props.entry;
        const kind = kindOf(entry.name);
        const status = entry.copying
          ? React.createElement("span", { className: "ddrop-status ddrop-copying", key: "st" }, "读取中…")
          : entry.status === "ok"
            ? React.createElement("span", { className: "ddrop-status ddrop-ok", key: "st" }, "路径已读取")
            : entry.status === "copied"
              ? React.createElement("span", { className: "ddrop-status ddrop-copied", key: "st" }, "已复制到工作区")
              : React.createElement("span", { className: "ddrop-status ddrop-nopath", key: "st" }, "无法读取路径");
        return React.createElement("div", { className: "ddrop-chip", title: entry.path || entry.name }, [
          React.createElement("span", { className: "ddrop-ico ddrop-ico-" + kind, key: "i" }, fileGlyph()),
          React.createElement("span", { className: "ddrop-name", key: "n" }, entry.name),
          React.createElement("span", { className: "ddrop-size", key: "s" }, fmtSize(entry.size)),
          status,
          React.createElement("button", { className: "ddrop-remove", onClick: props.onRemove, "aria-label": "移除 " + entry.name, title: "移除", key: "x" }, "×")
        ]);
      };
      const BubbleCard = (props) => {
        const e = props.entry;
        const kind = kindOf(e.name);
        const badge = e.path ? null : React.createElement("span", { className: "ddrop-status ddrop-nopath", key: "st" }, "路径不可用");
        return React.createElement("div", { className: "ddrop-chip", title: e.path || e.name }, [
          React.createElement("span", { className: "ddrop-ico ddrop-ico-" + kind, key: "i" }, fileGlyph()),
          React.createElement("span", { className: "ddrop-name", key: "n" }, e.name),
          e.size ? React.createElement("span", { className: "ddrop-size", key: "s" }, e.size) : null,
          badge
        ]);
      };
      const MsgImage = (props) => {
        const [src, setSrc] = React.useState(null);
        const [err, setErr] = React.useState(false);
        React.useEffect(() => {
          let live = true;
          setErr(false);
          setSrc(null);
          if (typeof props.load !== "function") { setErr(true); return; }
          try {
            Promise.resolve(props.load(props.attachment)).then((url) => { if (live) setSrc(url); }).catch(() => { if (live) setErr(true); });
          } catch { if (live) setErr(true); }
          return () => { live = false; };
        }, [props.attachment, props.load]);
        if (err) return React.createElement("div", { className: "ddrop-msg-imgerr" }, "图片加载失败");
        if (!src) return React.createElement("div", { className: "ddrop-msg-imgloading" }, "加载中…");
        return React.createElement("img", { className: "ddrop-msg-img", src, alt: (props.attachment && props.attachment.name) || "图片" });
      };
      const UserNodeView = (props) => {
        const node = props.node;
        const data = node && node.data;
        const blocks = data && Array.isArray(data.content) ? data.content : [];
        const textParts = [];
        const images = [];
        for (const b of blocks) {
          if (b && b.type === "text" && typeof b.text === "string") textParts.push(b.text);
          else if (b && b.type === "image") images.push(b);
        }
        const fullText = textParts.join("\n");
        const parsed = parseDrops(fullText);
        const inlineSegs = splitInline(fullText);
        const hasInline = inlineSegs.some((s) => s.type === "file");
        const hasCards = parsed.entries.length > 0;
        // 文本里的 @[名称](路径) 渲染为内联文件卡片；无引用时原样返回字符串。
        const renderInlineText = (text, keyPrefix) => {
          const segs = splitInline(text);
          if (!segs.some((s) => s.type === "file")) return text;
          return segs.map((s, i) => s.type === "file"
            ? React.createElement("span", { key: keyPrefix + "f" + i, className: "ddrop-msg-inline" }, React.createElement(BubbleCard, { entry: { name: s.name, path: s.path, size: 0 } }))
            : React.createElement("span", { key: keyPrefix + "t" + i }, s.text));
        };
        const stack = [];
        images.forEach((img, i) => stack.push(React.createElement(MsgImage, { key: "img" + i, attachment: img.attachment, load: props.loadImage })));
        if (fullText !== "") {
          const parts = [];
          if (hasCards) {
            if (parsed.before.length > 0) parts.push(React.createElement("div", { key: "tb", className: "ddrop-msg-text" }, renderInlineText(parsed.before.join("\n"), "tb")));
            parts.push(React.createElement("div", { key: "cards", className: "ddrop-msg-cards" }, parsed.entries.map((e, i) => React.createElement(BubbleCard, { key: "c" + i, entry: e }))));
            if (parsed.after.length > 0) parts.push(React.createElement("div", { key: "ta", className: "ddrop-msg-text" }, renderInlineText(parsed.after.join("\n"), "ta")));
          } else if (hasInline) {
            // 内联 @[名称](路径) 引用：文本与文件卡片混合渲染
            parts.push(React.createElement("div", { key: "mixed", className: "ddrop-msg-text" }, renderInlineText(fullText, "m")));
          } else {
            parts.push(React.createElement("div", { key: "t", className: "ddrop-msg-text" }, fullText));
          }
          stack.push(React.createElement("div", { key: "bubble", className: "ddrop-msg-bubble" }, parts));
        }
        if (stack.length === 0) return null;
        return React.createElement("div", { className: "ddrop-msg-user" }, [
          React.createElement("div", { className: "ddrop-msg-stack", key: "stack" }, stack)
        ]);
      };
      const Dock = (props) => {
        const sid = props.sessionId || "";
        const [entries, setList] = React.useState(() => getEntries(sid));
        const ownerInput = props.input || null;
        if (ownerInput) { latestDraftRef = ownerInput.draft || ""; currentInput = ownerInput; }
        React.useEffect(() => {
          currentSessionId = sid;
          const update = () => setList(getEntries(sid));
          const unsub = subscribe(update);
          update();
          if (props.inputActions && typeof props.inputActions.submit === "function") {
            const ia = props.inputActions;
            const orig = ia.submit;
            const wrapped = () => {
              const tmap = tokensBySession.get(sid);
              const occ = currentInput && Array.isArray(currentInput.occurrences) ? currentInput.occurrences : [];
              if (getEntries(sid).length === 0 && !(tmap && tmap.size > 0) && occ.length === 0) { orig(); return; }
              const el = findComposerTextarea();
              const draft = el ? String(el.value || "") : (latestDraftRef || "");
              ia.setDraft(attachBlock(inlineTokens(draft, sid)));
              orig();
              clearChips(sid);
            };
            currentInputActions = ia;
            origSubmitRef = orig;
            ia.submit = wrapped;
            return () => {
              unsub();
              if (ia.submit === wrapped) ia.submit = orig;
              if (currentSessionId === sid) { currentSessionId = ""; currentInputActions = null; origSubmitRef = null; currentInput = null; }
            };
          }
          return () => {
            unsub();
            if (currentSessionId === sid) { currentSessionId = ""; currentInputActions = null; origSubmitRef = null; currentInput = null; }
          };
        }, [sid]);
        if (!entries.length) return null;
        const removeOne = (entry) => {
          entriesBySession.set(sid, getEntries(sid).filter((x) => x.id !== entry.id));
          emit();
          try { api("remove", { sessionId: sid, id: entry.id }).catch(() => {}); } catch {}
        };
        return React.createElement("div", { className: "ddrop-dock" }, [
          ...entries.map((entry) => React.createElement(Chip, { key: entry.id, entry, onRemove: () => removeOne(entry) })),
          React.createElement("div", { className: "ddrop-hint", key: "__hint" }, "输入框有焦点时拖入/粘贴文件会在光标处插入文件气泡（发送时转为含绝对路径的引用）；否则显示在此栏，随消息一起发送")
        ]);
      };
      const Overlay = () => {
        const [drag, setDrag] = React.useState({ active: false, count: 0 });
        React.useEffect(() => {
          const update = () => setDrag({ active: dragDepth > 0, count: dragCount });
          const unsub = subscribe(update);
          return unsub;
        }, []);
        if (!drag.active) return null;
        return React.createElement("div", { className: "ddrop-overlay" }, [
          React.createElement("div", { className: "ddrop-overlay-inner", key: "i" }, [
            React.createElement("div", { className: "ddrop-overlay-icon", key: "ic" }, "📁"),
            React.createElement("div", { className: "ddrop-overlay-title", key: "t" }, drag.count > 1 ? "松开以添加 " + drag.count + " 个文件" : "松开以添加文件"),
            React.createElement("div", { className: "ddrop-overlay-sub", key: "s" }, "发送消息时随消息一起发送（含绝对路径）")
          ])
        ]);
      };

      ctx.slots.inject("conversation.input.dock", () => ctx.slots.register({
        name: "conversation.input.dock",
        id: "drop-in",
        order: 5,
        inject: (sessionId) => ({ sessionId })
      }, Dock));
      ctx.slots.inject("shell.overlay", () => ctx.slots.register({
        name: "shell.overlay",
        id: "drop-in-overlay",
        order: 10
      }, Overlay));
      ctx.slots.inject("conversation.chat.node", () => ctx.slots.register({
        name: "conversation.chat.node",
        key: "user",
        priority: -10
      }, UserNodeView));

      const SettingsRow = () => {
        const [enabled, setEnabled] = React.useState(() => isEnabled());
        const toggle = (e) => {
          const next = !!e.target.checked;
          setEnabled(next);
          try {
            if (settingsScope && typeof settingsScope.set === "function") {
              Promise.resolve(settingsScope.set("enabled", next)).catch(() => {});
            }
          } catch {}
        };
        return React.createElement("div", { className: "ddrop-settings" }, [
          React.createElement("h2", { key: "t", className: "ddrop-settings-title" }, "文件拖入"),
          React.createElement("label", { key: "row", className: "ddrop-settings-row" }, [
            React.createElement("input", { key: "cb", type: "checkbox", checked: enabled, onChange: toggle }),
            React.createElement("span", { key: "l", className: "ddrop-settings-label" }, "启用拖入文件功能")
          ]),
          React.createElement("p", { key: "d", className: "ddrop-settings-desc" }, "从系统拖入或粘贴的文件会显示在输入框上方（chips）或以文件气泡插入到正在输入的文字中，发送时随消息附带（含绝对路径）。关闭后拖拽/粘贴回落到内置的图片行为。")
        ]);
      };
      ctx.slots.inject("settings.section", () => ctx.slots.register({
        name: "settings.section",
        id: "drop-in",
        order: 50,
        label: "文件拖入"
      }, SettingsRow));

      console.log("[drop-in] client half ready");
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
