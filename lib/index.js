import { defineTool } from "@deepseek-ai/dsh-tools";
import { settingsNamespace } from "@deepseek-ai/dsh-settings";
import z from "@deepseek-ai/schemastery";
import { writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

/**
 * dsh-drop-in 宿主半（正式安装版）：
 * - 五个仅限回环地址的 POST 路由（/api/dsh-drop-in/*）承接页面端的上报/移除/清空/文本兜底复制/二进制落盘；
 * - 注册 dropped_files 工具，助手可按 exec.agent.session.id 读取当前会话拖入文件（含绝对路径）；
 * - 提供 settings 开关（enabled）与 cordis 配置（maxEntries）。
 */

const name = "dsh-drop-in";
const inject = ["webServer", "sessions", "fs", "tools", "settings"];

const Config = z.object({
  maxEntries: z.natural().min(1).default(300)
});

const SETTINGS_NS = settingsNamespace("drop-in");
const DropInSettingsSchema = z.object({
  enabled: z.boolean().default(true)
});

function sidOf(args) {
  return String((args && args.sessionId) || "");
}

function isLoopback(req) {
  const ra = req.socket && req.socket.remoteAddress;
  return ra === "127.0.0.1" || ra === "::1" || ra === "::ffff:127.0.0.1";
}

function sendJson(res, status, body) {
  const data = Buffer.from(JSON.stringify(body), "utf8");
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "content-length": String(data.length)
  });
  res.end(data);
}

function readBody(req, maxBytes = 4 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on("data", (c) => {
      chunks.push(c);
      total += c.length;
      if (total > maxBytes) {
        req.destroy();
        reject(new Error("body too large"));
      }
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function fmtSize(n) {
  const v = Number(n) || 0;
  if (v < 1024) return v + " B";
  if (v < 1024 * 1024) return (v / 1024).toFixed(1) + " KB";
  if (v < 1024 * 1024 * 1024) return (v / 1024 / 1024).toFixed(1) + " MB";
  return (v / 1024 / 1024 / 1024).toFixed(2) + " GB";
}

/** 同会话去重：绝对路径一致（Windows 忽略大小写），或（无路径时）名称+大小+修改时间一致。 */
function isDup(list, entry) {
  if (entry.path) {
    return list.some((x) => x.path && String(x.path).toLowerCase() === String(entry.path).toLowerCase());
  }
  return list.some((x) => !x.path && x.name === entry.name && x.size === entry.size && x.lastModified === entry.lastModified);
}

function apply(ctx, config) {
  const resolved = Config(config ?? {});
  const settings = ctx.settings.register(SETTINGS_NS, DropInSettingsSchema, { applies: "live" });
  const enabled = () => {
    try {
      return settings.get().enabled !== false;
    } catch {
      return true;
    }
  };
  const store = new Map(); // sessionId -> entries[]

  const post = (path, fn, maxBytes) => ctx.webServer.register({
    kind: "exact",
    path,
    handler: async (req, res) => {
      if (!isLoopback(req)) return sendJson(res, 403, { ok: false, error: "forbidden" });
      if (req.method !== "POST") return sendJson(res, 405, { ok: false, error: "method not allowed" });
      let args = {};
      try {
        const raw = await readBody(req, maxBytes);
        if (raw) args = JSON.parse(raw);
      } catch (err) {
        return sendJson(res, 400, { ok: false, error: String((err && err.message) || err) });
      }
      try {
        sendJson(res, 200, await fn(args));
      } catch (err) {
        sendJson(res, 400, { ok: false, error: String((err && err.message) || err) });
      }
    }
  });

  ctx.effect(() => {
    const disposers = [
      post("/api/dsh-drop-in/report", async (args) => {
        const sid = sidOf(args);
        const entries = Array.isArray(args && args.entries) ? args.entries : [];
        if (!sid || entries.length === 0) return { ok: false, error: "empty" };
        let list = store.get(sid);
        if (!list) {
          list = [];
          store.set(sid, list);
        }
        for (const e of entries) {
          if (!e || typeof e.name !== "string" || !e.name) continue;
          const entry = {
            id: typeof e.id === "string" && e.id ? e.id : String(Math.random()).slice(2),
            name: e.name,
            size: Number(e.size) || 0,
            type: typeof e.type === "string" ? e.type : "",
            lastModified: Number(e.lastModified) || 0,
            path: typeof e.path === "string" ? e.path : "",
            status: typeof e.status === "string" ? e.status : (typeof e.path === "string" && e.path ? "ok" : "no-path"),
            error: typeof e.error === "string" ? e.error : "",
            droppedAt: Date.now()
          };
          if (isDup(list, entry)) continue;
          const idx = list.findIndex((x) => x.id === entry.id);
          if (idx >= 0) list[idx] = entry;
          else list.push(entry);
        }
        if (list.length > resolved.maxEntries) list.splice(0, list.length - resolved.maxEntries);
        return { ok: true, count: list.length };
      }),

      post("/api/dsh-drop-in/remove", async (args) => {
        const sid = sidOf(args);
        const id = args && args.id;
        const list = store.get(sid);
        if (!sid || !list || typeof id !== "string") return { ok: false };
        store.set(sid, list.filter((x) => x.id !== id));
        return { ok: true };
      }),

      post("/api/dsh-drop-in/clear", async (args) => {
        const sid = sidOf(args);
        if (!sid) return { ok: false };
        store.delete(sid);
        return { ok: true };
      }),

      post("/api/dsh-drop-in/text-copy", async (args) => {
        const sid = sidOf(args);
        const nm = args && typeof args.name === "string" ? args.name : "";
        const content = args && typeof args.content === "string" ? args.content : "";
        const id = args && typeof args.id === "string" ? args.id : "";
        if (!sid || !nm || !content) return { ok: false, error: "empty" };
        if (content.length > 2 * 1024 * 1024) return { ok: false, error: "too-large" };
        const session = ctx.sessions.get(sid);
        const cwd = session && session.header ? session.header.cwd : "";
        if (!cwd) return { ok: false, error: "no-cwd" };
        const safeName = nm.replace(/[\\/:*?"<>|]/g, "_");
        const target = await ctx.fs.resolve(".dsh-drops/" + sid + "/" + safeName, { cwd });
        // 显式声明 workspace-write 策略（根 = 会话 cwd），否则 sandbox 默认根是宿主进程 cwd，会误拒
        await ctx.fs.writeText(target, content, undefined, undefined, { mode: "workspace-write", workspaceRoot: cwd });
        const path = ctx.fs.processPath(target);
        const list = store.get(sid);
        if (list) {
          const entry = list.find((x) => x.id === id);
          if (entry) {
            entry.path = path;
            entry.status = "copied";
            entry.error = "";
          }
        }
        return { ok: true, path };
      }, 4 * 1024 * 1024),

      /** 二进制落盘（粘贴的图片/其他二进制文件）：base64 → .dsh-drops/<sid>/<name>。 */
      post("/api/dsh-drop-in/file-copy", async (args) => {
        const sid = sidOf(args);
        const nm = args && typeof args.name === "string" ? args.name : "";
        const b64 = args && typeof args.dataBase64 === "string" ? args.dataBase64 : "";
        const id = args && typeof args.id === "string" ? args.id : "";
        if (!sid || !nm || !b64) return { ok: false, error: "empty" };
        const buf = Buffer.from(b64, "base64");
        if (buf.length === 0) return { ok: false, error: "empty" };
        if (buf.length > 16 * 1024 * 1024) return { ok: false, error: "too-large" };
        const session = ctx.sessions.get(sid);
        const cwd = session && session.header ? session.header.cwd : "";
        if (!cwd) return { ok: false, error: "no-cwd" };
        const safeName = nm.replace(/[\\/:*?"<>|]/g, "_");
        const target = await ctx.fs.resolve(".dsh-drops/" + sid + "/" + safeName, { cwd });
        const abs = ctx.fs.processPath(target);
        await mkdir(dirname(abs), { recursive: true });
        await writeFile(abs, buf);
        const path = abs;
        const list = store.get(sid);
        if (list) {
          const entry = list.find((x) => x.id === id);
          if (entry) {
            entry.path = path;
            entry.status = "copied";
            entry.error = "";
          }
        }
        return { ok: true, path };
      }, 24 * 1024 * 1024)
    ];

    const tool = defineTool({
      name: "dropped_files",
      description: "列出用户最近拖入/粘贴到聊天窗口、尚未随消息发送的文件（含每个文件的绝对路径）。用户拖入文件后文件会显示在输入框上方（chips），或在输入框有焦点时以 @文件名 形式插入到正在输入的文字中（发送时自动转为 @[文件名](绝对路径) 内联格式，聊天气泡会渲染为文件卡片）；发送消息时 chips 中的文件会作为“📎 拖入文件”块自动附加到消息里（含绝对路径）。消息文本中形如 @[文件名](路径) 的片段即文件引用，可直接用路径读取/打开。若消息里已包含上述块或引用，则无需调用本工具；仅在需要查证或文件未随消息发送时调用。无参数。",
      parameters: {},
      output: {
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            sessionId: { type: "string", required: true },
            files: {
              type: "array",
              required: true,
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  id: { type: "string", required: true },
                  name: { type: "string", required: true },
                  path: { type: "string" },
                  size: { type: "integer" },
                  type: { type: "string" },
                  status: { type: "string" },
                  error: { type: "string" },
                  droppedAt: { type: "integer" }
                }
              }
            }
          }
        },
        render: (args, value) => {
          const lines = ["拖入文件（" + (value.files || []).length + " 个）："];
          if (!value.files || value.files.length === 0) lines.push("（当前没有待发送的拖入文件）");
          (value.files || []).forEach((f, i) => {
            const size = f.size === void 0 ? "" : " · " + fmtSize(f.size);
            const status = f.status === "ok" ? "" : f.status === "copied" ? "（已复制到工作区）" : f.status === "no-path" ? "（无法获取绝对路径）" : "（" + (f.error || f.status || "") + "）";
            lines.push((i + 1) + ". " + f.name + size + status);
            if (f.path) lines.push("   路径: " + f.path);
          });
          return [{ type: "text", text: lines.join("\n") }];
        },
        presentationMeta: (args, value) => value
      },
      isConcurrencySafe: () => true,
      async execute(args, exec) {
        let sid = "";
        try {
          sid = exec && exec.agent && exec.agent.session ? String(exec.agent.session.id) : "";
        } catch {}
        const files = (store.get(sid) || []).map((e) => ({
          id: e.id,
          name: e.name,
          path: e.path,
          size: e.size,
          type: e.type,
          status: e.status,
          error: e.error,
          droppedAt: e.droppedAt
        }));
        return { sessionId: sid, files };
      }
    });
    disposers.push(ctx.tools.register(tool));

    return () => {
      for (const d of disposers) {
        try { d(); } catch {}
      }
    };
  }, "drop-in: routes + tool");
}

export { Config, apply, inject, name };
