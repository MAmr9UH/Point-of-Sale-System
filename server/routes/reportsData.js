// server/routes/reportsData.js
import {
  profitPerLocation,
  mostPopularItems,
  employeePerformance,
} from "../model/reports.js";

const sendJSON = (res, code, payload) => {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
};

const parseQuery = (req) => {
  const u = new URL(req.url, `http://${req.headers.host}`);
  return {
    pathname: u.pathname,
    q: Object.fromEntries(u.searchParams.entries()),
  };
};

export const handleReports = async (req, res) => {
  const { method } = req;
  const { pathname, q } = parseQuery(req);

  // simple CORS (safe for dev)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (method === "OPTIONS") return sendJSON(res, 204, {});

  const startDate = q.startDate;
  const endDate = q.endDate;
  const desc = String(q.desc) === "true";

  const requireDates =
    !startDate || !endDate || Number.isNaN(Date.parse(startDate)) || Number.isNaN(Date.parse(endDate));

  try {
    if (method === "GET" && pathname === "/api/reports/profit-per-location") {
      if (requireDates) return sendJSON(res, 400, { error: "startDate and endDate are required (YYYY-MM-DD)" });
      const rows = await profitPerLocation(startDate, endDate, desc);
      return sendJSON(res, 200, rows);
    }

    if (method === "GET" && pathname === "/api/reports/most-popular-items") {
      if (requireDates) return sendJSON(res, 400, { error: "startDate and endDate are required (YYYY-MM-DD)" });
      const rows = await mostPopularItems(startDate, endDate, desc);
      return sendJSON(res, 200, rows);
    }

    if (method === "GET" && pathname === "/api/reports/employee-performance") {
      if (requireDates) return sendJSON(res, 400, { error: "startDate and endDate are required (YYYY-MM-DD)" });
      const rows = await employeePerformance(startDate, endDate, desc);
      return sendJSON(res, 200, rows);
    }

    // Not handled here → let caller continue or 404
    sendJSON(res, 404, { error: "Not Found" });
  } catch (err) {
    console.error("Reports route error:", err);
    sendJSON(res, 500, { error: err?.message || "Server error" });
  }
};

export default handleReports;