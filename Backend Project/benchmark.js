/**
 * FashionStyle API Performance Benchmark
 * Đo tốc độ phản hồi của tất cả API endpoints
 */
const http = require("http");

const BASE_URL = "http://localhost:8080";

// Token Admin 1 (lấy từ đăng nhập)
let ADMIN_TOKEN = "";

// Danh sách endpoints cần đo
const PUBLIC_ENDPOINTS = [
  { method: "GET", path: "/api/products", label: "GET /api/products (All)" },
  { method: "GET", path: "/api/products/1", label: "GET /api/products/:id (Single)" },
  { method: "GET", path: "/api/categories", label: "GET /api/categories" },
  { method: "GET", path: "/api/reviews", label: "GET /api/reviews" },
  { method: "GET", path: "/api/system-config/public", label: "GET /api/system-config/public" },
];

const AUTH_ENDPOINTS = [
  { method: "GET", path: "/api/stats/dashboard/overview", label: "GET /api/stats/dashboard/overview", auth: true },
  { method: "GET", path: "/api/stats/dashboard/charts", label: "GET /api/stats/dashboard/charts", auth: true },
  { method: "GET", path: "/api/orders/admin", label: "GET /api/orders/admin", auth: true },
  { method: "GET", path: "/api/user/admin/permissions", label: "GET /api/user/admin/permissions", auth: true },
  { method: "GET", path: "/api/admin-logs", label: "GET /api/admin-logs", auth: true },
  { method: "GET", path: "/api/promotions", label: "GET /api/promotions", auth: true },
  { method: "GET", path: "/api/notifications", label: "GET /api/notifications", auth: true },
  { method: "GET", path: "/api/system-config", label: "GET /api/system-config", auth: true },
];

const REPEAT = 5; // Số lần đo mỗi endpoint

function httpRequest(method, path, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 8080,
      path,
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };

    const start = Date.now();
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        const elapsed = Date.now() - start;
        resolve({ status: res.statusCode, elapsed, size: Buffer.byteLength(data) });
      });
    });

    req.on("error", (e) => reject(e));
    req.setTimeout(10000, () => { req.destroy(); reject(new Error("Timeout")); });
    req.end();
  });
}

async function login() {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ email: "admin1@fashionstyle.com", password: "Admin@123" });
    const options = {
      hostname: "localhost", port: 8080,
      path: "/api/auth-temp/login", method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
    };
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); } catch { reject(new Error("Parse error")); }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function measureEndpoint(ep, token) {
  const times = [];
  let lastStatus = 0;
  let lastSize = 0;
  for (let i = 0; i < REPEAT; i++) {
    try {
      const r = await httpRequest(ep.method, ep.path, ep.auth ? token : null);
      times.push(r.elapsed);
      lastStatus = r.status;
      lastSize = r.size;
    } catch (e) {
      times.push(null);
    }
    // Nhỏ delay giữa các lần
    await new Promise(r => setTimeout(r, 100));
  }

  const valid = times.filter(t => t !== null);
  const avg = valid.length ? Math.round(valid.reduce((a, b) => a + b, 0) / valid.length) : null;
  const min = valid.length ? Math.min(...valid) : null;
  const max = valid.length ? Math.max(...valid) : null;

  return {
    label: ep.label,
    path: ep.path,
    status: lastStatus,
    sizeKB: (lastSize / 1024).toFixed(2),
    avg, min, max,
    rating: avg === null ? "ERROR" : avg < 100 ? "🟢 EXCELLENT" : avg < 300 ? "🟡 GOOD" : avg < 700 ? "🟠 SLOW" : "🔴 CRITICAL",
  };
}

function pad(str, len) {
  return String(str).padEnd(len).slice(0, len);
}

(async () => {
  console.log("=========================================================");
  console.log("  FashionStyle API Performance Benchmark");
  console.log(`  ${new Date().toLocaleString("vi-VN")}`);
  console.log("=========================================================\n");

  // Đăng nhập lấy token
  console.log("🔑 Đăng nhập Admin 1...");
  try {
    const loginRes = await login();
    ADMIN_TOKEN = loginRes.token || loginRes.data?.token || "";
    if (!ADMIN_TOKEN) throw new Error("Không lấy được token");
    console.log("✅ Token OK\n");
  } catch (e) {
    console.log("⚠️  Không đăng nhập được, bỏ qua auth endpoints:", e.message);
  }

  const all = [...PUBLIC_ENDPOINTS, ...AUTH_ENDPOINTS];
  const results = [];

  for (const ep of all) {
    process.stdout.write(`  Đang đo: ${ep.label.padEnd(55)}`);
    const r = await measureEndpoint(ep, ADMIN_TOKEN);
    results.push(r);
    process.stdout.write(`${r.avg !== null ? r.avg + "ms" : "ERR"}\n`);
  }

  console.log("\n=========================================================");
  console.log("  KẾT QUẢ BENCHMARK");
  console.log("=========================================================");
  console.log(`${"Endpoint".padEnd(50)} ${"Avg".padEnd(8)} ${"Min".padEnd(8)} ${"Max".padEnd(8)} ${"KB".padEnd(8)} Rating`);
  console.log("-".repeat(110));

  results.forEach(r => {
    const avg = r.avg !== null ? r.avg + "ms" : "ERROR";
    const min = r.min !== null ? r.min + "ms" : "-";
    const max = r.max !== null ? r.max + "ms" : "-";
    console.log(`${pad(r.label, 50)} ${pad(avg, 8)} ${pad(min, 8)} ${pad(max, 8)} ${pad(r.sizeKB + "KB", 8)} ${r.rating}`);
  });

  console.log("\n");
  console.log("=========================================================");
  console.log("  PHÂN TÍCH / GỢI Ý TỐI ƯU");
  console.log("=========================================================");

  const critical = results.filter(r => r.avg !== null && r.avg >= 700);
  const slow = results.filter(r => r.avg !== null && r.avg >= 300 && r.avg < 700);
  const good = results.filter(r => r.avg !== null && r.avg < 300);

  if (critical.length) {
    console.log("\n🔴 CRITICAL (>700ms) — Cần tối ưu ngay:");
    critical.forEach(r => console.log(`   • ${r.label} — ${r.avg}ms`));
  }
  if (slow.length) {
    console.log("\n🟠 SLOW (300-700ms) — Nên thêm index/cache:");
    slow.forEach(r => console.log(`   • ${r.label} — ${r.avg}ms`));
  }
  if (good.length) {
    console.log("\n🟢 OK (<300ms):");
    good.forEach(r => console.log(`   • ${r.label} — ${r.avg}ms`));
  }

  // Xuất JSON ra file để dùng trong báo cáo
  const fs = require("fs");
  fs.writeFileSync("benchmark_results.json", JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2));
  console.log("\n📄 Đã lưu kết quả vào benchmark_results.json");
  console.log("=========================================================\n");
})();
