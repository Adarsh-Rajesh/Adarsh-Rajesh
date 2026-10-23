import { DurableObject } from "cloudflare:workers";

// One Durable Object instance holds the single counter in its own SQLite
// database, so increments are atomic and the count survives restarts.
export class Counter extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    const sql = ctx.storage.sql;
    sql.exec(
      "CREATE TABLE IF NOT EXISTS views (id INTEGER PRIMARY KEY CHECK (id = 1), count INTEGER NOT NULL)",
    );
    sql.exec(
      "INSERT OR IGNORE INTO views (id, count) VALUES (1, ?)",
      Number.parseInt(env.START_COUNT, 10) || 0,
    );
  }

  hit() {
    return this.ctx.storage.sql
      .exec("UPDATE views SET count = count + 1 WHERE id = 1 RETURNING count")
      .one().count;
  }

  peek() {
    return this.ctx.storage.sql.exec("SELECT count FROM views WHERE id = 1").one().count;
  }
}

const COLORS = { blueviolet: "8a2be2", blue: "007ec6", green: "4c1", red: "e05d44", orange: "fe7d37", purple: "a55cff" };

function pickColor(value) {
  const v = (value || "blueviolet").toLowerCase();
  if (COLORS[v]) return `#${COLORS[v]}`;
  return /^[0-9a-f]{3}([0-9a-f]{3})?$/.test(v) ? `#${v}` : `#${COLORS.blueviolet}`;
}

// Same look as the komarev "for-the-badge" badge.
function badge(count, color) {
  const text = count.toLocaleString("en-US");
  const labelW = 112.95;
  const valueW = 18.1 + [...text].reduce((w, c) => w + (c === "," ? 5.2 : 8.5), 0);
  const w = labelW + valueW;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w.toFixed(2)}" height="28" role="img" aria-label="PROFILE VIEWS: ${text}">
	<title>PROFILE VIEWS: ${text}</title>
	<g shape-rendering="crispEdges">
		<rect width="${labelW}" height="28" fill="#555"/>
		<rect x="${labelW}" width="${valueW.toFixed(2)}" height="28" fill="${color}"/>
	</g>
	<g fill="#fff" text-anchor="middle" text-rendering="geometricPrecision" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="10" letter-spacing="1.1">
		<text x="57.5" y="17.5" fill="#fff">PROFILE VIEWS</text>
		<text x="${(labelW + valueW / 2).toFixed(2)}" y="17.5" fill="#fff" font-weight="bold">${text}</text>
	</g>
</svg>`;
}

const HEADERS = {
  "content-type": "image/svg+xml; charset=utf-8",
  // never cached, so every profile view reaches the counter
  "cache-control": "max-age=0, no-cache, no-store, must-revalidate",
  "x-content-type-options": "nosniff",
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/views") return new Response("Not found", { status: 404 });

    const user = url.searchParams.get("username") || "";
    if (user.toLowerCase() !== env.ALLOWED_USER.toLowerCase()) {
      return new Response("Not found", { status: 404 });
    }

    const counter = env.COUNTER.get(env.COUNTER.idFromName("profile"));
    // HEAD requests and ?peek=1 read the number without counting a view
    const count =
      request.method === "GET" && !url.searchParams.has("peek") ? await counter.hit() : await counter.peek();

    return new Response(request.method === "HEAD" ? null : badge(count, pickColor(url.searchParams.get("color"))), {
      headers: HEADERS,
    });
  },
};
