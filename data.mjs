// API data bersama dashboard Monitoring Stok ZM68.
// GET  /api/data          -> data terbaru (perlu kode akses jika VIEW_KEY diisi)
// GET  /api/data?meta=1   -> versi terbaru saja (untuk cek pembaruan)
// POST /api/data          -> simpan data baru (perlu ADMIN_KEY)
// POST /api/data?check=1  -> cek kunci admin
import { getStore } from "@netlify/blobs";

const env = (k) => (globalThis.Netlify?.env?.get(k) ?? process.env[k] ?? "").trim();
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

export default async (req) => {
  const ADMIN_KEY = env("ADMIN_KEY");
  const VIEW_KEY = env("VIEW_KEY");
  const url = new URL(req.url);
  const store = getStore({ name: "zm68", consistency: "strong" });
  const adminHdr = req.headers.get("x-admin-key") || "";
  const viewHdr = req.headers.get("x-view-key") || "";
  const isAdmin = ADMIN_KEY !== "" && adminHdr === ADMIN_KEY;
  const canView = isAdmin || VIEW_KEY === "" || viewHdr === VIEW_KEY || (ADMIN_KEY !== "" && viewHdr === ADMIN_KEY);

  if (req.method === "GET") {
    if (!canView) return json({ error: "unauthorized" }, 401);
    if (url.searchParams.has("meta")) {
      const meta = await store.get("meta", { type: "json" });
      return json(meta || { empty: true });
    }
    const snap = await store.get("snapshot", { type: "json" });
    return json(snap || { empty: true });
  }

  if (req.method === "POST") {
    if (ADMIN_KEY === "") return json({ error: "ADMIN_KEY belum diatur di Netlify" }, 500);
    if (!isAdmin) return json({ error: "unauthorized" }, 401);
    if (url.searchParams.has("check")) return json({ ok: true });
    let body;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Body bukan JSON" }, 400);
    }
    const d = body && body.data;
    if (!d || !Array.isArray(d.rows) || !Array.isArray(d.cols) || !d.meta) return json({ error: "Format data tidak dikenali" }, 400);
    const meta = { ver: Date.now().toString(36) + Math.random().toString(36).slice(2, 7), at: new Date().toISOString() };
    await store.setJSON("snapshot", {
      ...meta,
      data: { v: 1, meta: d.meta, cols: d.cols, rows: d.rows },
      settings: body.settings && typeof body.settings === "object" ? body.settings : null,
      hist: Array.isArray(body.hist) ? body.hist.slice(-30) : [],
    });
    await store.setJSON("meta", meta);
    return json(meta);
  }

  return json({ error: "Method tidak didukung" }, 405);
};

export const config = { path: "/api/data" };
