// benchmark v2 - auto-login with correct path
const http = require("http");
const fs = require("fs");

const BASE_URL = "http://localhost:8080";
const REPEAT = 5;

function httpRequest(method, path, token, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const options = {
      hostname: "localhost", port: 8080, path, method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(bodyStr ? { "Content-Length": Buffer.byteLength(bodyStr) } : {}),
      },
    };
    const start = Date.now();
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        const elapsed = Date.now() - start;
        resolve({ status: res.statusCode, elapsed, size: Buffer.byteLength(data), body: data });
      });
    });
    req.on("error", reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error("Timeout")); });
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

// Try to find login route by checking server routes
async function findAndLogin() {
  const loginPaths = [
    ["/api/auth-temp/login", { email: "admin1@fashionstyle.com", password: "Admin@123" }],
    ["/api/auth-temp/signin", { email: "admin1@fashionstyle.com", password: "Admin@123" }],
    ["/api/auth/login", { email: "admin1@fashionstyle.com", password: "Admin@123" }],
    ["/api/auth-temp/login", { Email: "admin1@fashionstyle.com", Password: "Admin@123" }],
    ["/api/auth-temp/admin-login", { email: "admin1@fashionstyle.com", password: "Admin@123" }],
  ];
  
  for (const [path, body] of loginPaths) {
    try {
      const r = await httpRequest("POST", path, null, body);
      if (r.status === 200) {
        const data = JSON.parse(r.body);
        const token = data.token || data.data?.token || data.accessToken;
        if (token) {
          console.log(`✅ Logged in via ${path}`);
          return token;
        }
      }
    } catch {}
  }
  return null;
}

const ENDPOINTS = [
  // Public
  { method: "GET", path: "/api/products", label: "GET /api/products (All)", auth: false },
  { method: "GET", path: "/api/products/10", label: "GET /api/products/:id", auth: false },
  { method: "GET", path: "/api/categories", label: "GET /api/categories", auth: false },
  { method: "GET", path: "/api/reviews", label: "GET /api/reviews", auth: false },
  { method: "GET", path: "/api/system-config/public", label: "GET /api/system-config/public", auth: false },
  { method: "GET", path: "/api/promotions", label: "GET /api/promotions", auth: false },
  // Auth required
  { method: "GET", path: "/api/stats/dashboard/overview", label: "GET /stats/dashboard/overview", auth: true },
  { method: "GET", path: "/api/stats/dashboard/charts", label: "GET /stats/dashboard/charts", auth: true },
  { method: "GET", path: "/api/orders/admin", label: "GET /api/orders/admin", auth: true },
  { method: "GET", path: "/api/user/admin/permissions", label: "GET /api/user/admin/permissions", auth: true },
  { method: "GET", path: "/api/admin-logs", label: "GET /api/admin-logs", auth: true },
  { method: "GET", path: "/api/notifications", label: "GET /api/notifications", auth: true },
  { method: "GET", path: "/api/system-config", label: "GET /api/system-config", auth: true },
  { method: "GET", path: "/api/cart", label: "GET /api/cart (user cart)", auth: true },
  { method: "GET", path: "/api/orders/my-orders", label: "GET /api/orders/my-orders", auth: true },
];

async function measureEndpoint(ep, token) {
  const times = [];
  let lastStatus = 0, lastSize = 0;
  for (let i = 0; i < REPEAT; i++) {
    try {
      const r = await httpRequest(ep.method, ep.path, ep.auth ? token : null);
      times.push(r.elapsed);
      lastStatus = r.status;
      lastSize = r.size;
    } catch { times.push(null); }
    await new Promise(r => setTimeout(r, 80));
  }
  const valid = times.filter(t => t !== null);
  const avg = valid.length ? Math.round(valid.reduce((a, b) => a + b, 0) / valid.length) : null;
  const min = valid.length ? Math.min(...valid) : null;
  const max = valid.length ? Math.max(...valid) : null;
  return {
    label: ep.label, path: ep.path,
    status: lastStatus, sizeKB: (lastSize / 1024).toFixed(2),
    avg, min, max, times,
    hasAuth: ep.auth,
    authWorked: ep.auth ? lastStatus !== 401 : true,
    rating: avg === null ? "ERROR" : avg < 50 ? "🟢 EXCELLENT" : avg < 200 ? "🟢 GOOD" : avg < 500 ? "🟡 ACCEPTABLE" : avg < 1000 ? "🟠 SLOW" : "🔴 CRITICAL",
  };
}

(async () => {
  console.log("=".repeat(60));
  console.log("  FashionStyle API Benchmark v2");
  console.log(`  ${new Date().toLocaleString("vi-VN")}`);
  console.log("=".repeat(60));
  console.log(`  Mỗi endpoint: ${REPEAT} lần đo, delay 80ms\n`);

  // Login
  const token = await findAndLogin();
  if (!token) console.log("⚠️  Không lấy được token — auth endpoints sẽ trả 401\n");

  const results = [];
  for (const ep of ENDPOINTS) {
    process.stdout.write(`  Đo: ${ep.label.padEnd(50)}`);
    const r = await measureEndpoint(ep, token);
    results.push(r);
    const status = r.authWorked ? (r.avg + "ms") : "401 (no token)";
    process.stdout.write(`${status}\n`);
  }

  // Print table
  console.log("\n" + "=".repeat(100));
  console.log("  BẢNG KẾT QUẢ");
  console.log("=".repeat(100));
  console.log(`${"Endpoint".padEnd(52)} ${"Status".padEnd(7)} ${"Avg".padEnd(8)} ${"Min".padEnd(8)} ${"Max".padEnd(8)} ${"KB".padEnd(7)} Rating`);
  console.log("-".repeat(100));
  results.forEach(r => {
    const s = String(r.status);
    const avg = r.avg !== null ? r.avg + "ms" : "ERR";
    const min = r.min !== null ? r.min + "ms" : "-";
    const max = r.max !== null ? r.max + "ms" : "-";
    console.log(`${r.label.padEnd(52)} ${s.padEnd(7)} ${avg.padEnd(8)} ${min.padEnd(8)} ${max.padEnd(8)} ${(r.sizeKB+"KB").padEnd(7)} ${r.rating}`);
  });

  fs.writeFileSync("benchmark_v2_results.json", JSON.stringify({ timestamp: new Date().toISOString(), token_obtained: !!token, results }, null, 2));
  console.log("\n📄 Đã lưu: benchmark_v2_results.json\n");
  process.exit(0);
})();
