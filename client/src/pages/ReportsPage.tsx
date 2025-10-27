import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ReportsPage.css";

/* ========= Types from API ========= */
type ReportType = "locations" | "items" | "employees";
type Range = { from: string; to: string };
type OrderType = "in-person" | "online" | "delivery";

type ProfitPerLocationRow = { LocationName: string; TotalProfit: number | string };
type PopularItemRow = { Name: string; OrderCount: number | string };
type EmployeePerfRow = {
  FName: string;
  LName: string;
  OrdersHandled: number | string;
  TotalSales: number | string;
  TotalHoursWorked: number | string; // decimal hours
  SalesPerHour?: number;             // derived on client
};

const API_BASE = "";

/* ========= Helpers ========= */
const money = (n: number) =>
  Number(n ?? 0).toLocaleString(undefined, { style: "currency", currency: "USD" });

const sortFieldsByType: Record<ReportType, { key: string; label: string }[]> = {
  locations: [
    { key: "LocationName", label: "Location" },
    { key: "TotalProfit", label: "Total Profit" },
  ],
  items: [
    { key: "Name", label: "Item" },
    { key: "OrderCount", label: "Orders" },
  ],
  employees: [
    { key: "FName", label: "First Name" },
    { key: "LName", label: "Last Name" },
    { key: "OrdersHandled", label: "Orders" },
    { key: "TotalSales", label: "Sales" },
    { key: "TotalHoursWorked", label: "Hours" },
    { key: "SalesPerHour", label: "Sales / Hour" },
  ],
};

const isNumeric = (v: any) => v !== null && v !== "" && !isNaN(Number(v));

const haystackForRow = (row: any, type: ReportType) => {
  if (type === "locations") {
    return `${row.LocationName} ${row.TotalProfit}`;
  }
  if (type === "items") {
    return `${row.Name} ${row.OrderCount}`;
  }
  // employees
  const fname = row.FName ?? "";
  const lname = row.LName ?? row.Lname ?? "";
  return `${fname} ${lname} ${row.OrdersHandled} ${row.TotalSales} ${row.TotalHoursWorked} ${row.SalesPerHour ?? ""}`;
};

const HomeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

export default function ReportsPage() {
  const navigate = useNavigate();
  
  /* ---- Default range (last 7 days) ---- */
  const today = new Date();
  const to = today.toISOString().slice(0, 10);
  const fromDate = new Date();
  fromDate.setDate(today.getDate() - 6);
  const from = fromDate.toISOString().slice(0, 10);

  /* ---- Form state ---- */
  const [type, setType] = useState<ReportType>("locations");
  const [location, setLocation] = useState<string>("all"); // placeholder for future server filters
  const [orderType, setOrderType] = useState<"all" | OrderType>("all"); // placeholder
  const [keyword, setKeyword] = useState<string>(""); // now used to filter rows
  const [range, setRange] = useState<Range>({ from, to });
  const [viewed, setViewed] = useState(false);

  /* ---- Sorting ---- */
  const [sortField, setSortField] = useState<string>("TotalProfit");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  /* ---- Data / status ---- */
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  /* ---- Keep sort field sensible per report type (useEffect, not useMemo) ---- */
  useEffect(() => {
    if (type === "locations") {
      setSortField((f) => (["LocationName", "TotalProfit"].includes(f) ? f : "TotalProfit"));
    } else if (type === "items") {
      setSortField((f) => (["Name", "OrderCount"].includes(f) ? f : "OrderCount"));
    } else {
      setSortField((f) =>
        ["FName", "LName", "OrdersHandled", "TotalSales", "TotalHoursWorked", "SalesPerHour"].includes(f)
          ? f
          : "SalesPerHour"
      );
    }
  }, [type]);

  /* ---- Fetch ---- */
  const onView = async () => {
    setViewed(true);
    setLoading(true);
    setErr(null);
    try {
      const params = new URLSearchParams({
        startDate: range.from,
        endDate: range.to,
        desc: String(sortOrder === "desc"),
      });

      let url = "";
      if (type === "locations") url = `${API_BASE}/api/reports/profit-per-location?${params}`;
      else if (type === "items") url = `${API_BASE}/api/reports/most-popular-items?${params}`;
      else url = `${API_BASE}/api/reports/employee-performance?${params}`;

      const res = await fetch(url);
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status}${t ? `: ${t}` : ""}`);
      }
      const data = await res.json();

      if (type === "employees") {
        const normalized = (data as EmployeePerfRow[]).map((r: any) => {
          const LName = r.LName ?? r.Lname ?? r.lname ?? "";
          const TotalHoursWorked = Number(r.TotalHoursWorked ?? 0);
          const TotalSales = Number(r.TotalSales ?? 0);
          return {
            ...r,
            LName,
            TotalHoursWorked,
            TotalSales,
            SalesPerHour: TotalHoursWorked > 0 ? TotalSales / TotalHoursWorked : 0,
          } as EmployeePerfRow;
        });
        setRows(normalized);
      } else {
        setRows(data);
      }
    } catch (e: any) {
      setErr(e?.message || "Failed to load report");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const onSavePDF = () => window.print();

  /* ---- Keyword filter, then sort ---- */
  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => haystackForRow(r, type).toLowerCase().includes(q));
  }, [rows, keyword, type]);

  const result = useMemo(() => {
    const arr = [...filtered];
    return arr.sort((a: any, b: any) => {
      let av = a?.[sortField];
      let bv = b?.[sortField];
      if (isNumeric(av) && isNumeric(bv)) {
        av = Number(av);
        bv = Number(bv);
      }
      if (av < bv) return sortOrder === "asc" ? -1 : 1;
      if (av > bv) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortField, sortOrder]);

  return (
    <div className="report-page">
      {/* Home Button - Fixed Top Left */}
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 20px',
          backgroundColor: 'white',
          border: '2px solid #e5e7eb',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: 600,
          color: '#374151',
          cursor: 'pointer',
          transition: 'all 0.2s',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#f9fafb';
          e.currentTarget.style.borderColor = '#d1d5db';
          e.currentTarget.style.transform = 'translateX(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 8px rgba(0, 0, 0, 0.15)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = 'white';
          e.currentTarget.style.borderColor = '#e5e7eb';
          e.currentTarget.style.transform = 'translateX(0)';
          e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        }}
      >
        <HomeIcon style={{ width: '20px', height: '20px' }} />
        Home
      </button>
      
      {/* FORM */}
      <div className="card">
        <h1 className="page-title">Report Request</h1>
        <h2 className="section-title">Activity Report</h2>

        <div className="form-grid">
          <label className="field span-2">
            <span>Report Type *</span>
            <select value={type} onChange={(e) => setType(e.target.value as ReportType)}>
              <option value="locations">Most Profitable Location</option>
              <option value="items">Most Popular Menu Item</option>
              <option value="employees">Employee Performance</option>
            </select>
          </label>

          <label className="field">
            <span>Location</span>
            <select value={location} onChange={(e) => setLocation(e.target.value)}>
              <option value="all">All</option>
              <option>Midtown</option>
              <option>Campus</option>
            </select>
          </label>

          <label className="field">
            <span>Order Type</span>
            <select value={orderType} onChange={(e) => setOrderType(e.target.value as any)}>
              <option value="all">All Orders</option>
              <option value="in-person">In-person</option>
              <option value="online">Online</option>
              <option value="delivery">Delivery</option>
            </select>
          </label>

          <label className="field span-2">
            <span>Keyword</span>
            <input
              type="text"
              className="keyword-input"
              placeholder="Search item, employee, or location…"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </label>

          <label className="field">
            <span>Activity date from</span>
            <input
              type="date"
              value={range.from}
              onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
            />
          </label>

          <label className="field">
            <span>Activity date to</span>
            <input
              type="date"
              value={range.to}
              onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
            />
          </label>
        </div>

        <div className="actions">
          <button className="btn btn-primary" onClick={onView} disabled={loading}>
            {loading ? "Loading..." : "View Report"}
          </button>
          <div className="save-split">
            <button className="btn btn-secondary" onClick={onSavePDF}>Save as PDF</button>
          </div>
        </div>
      </div>

      {/* PREVIEW */}
      {viewed && (
        <div className="report-output card">
          <div className="report-header">
            <div className="report-title">Report Output</div>
            <div className="report-subtitle">
              {type === "locations" && "Most Profitable Location"}
              {type === "items" && "Most Popular Menu Item"}
              {type === "employees" && "Employee Performance"}
            </div>
            <div className="report-meta">
              Range: {range.from} → {range.to} • Location: {location} • Orders: {orderType}
              {keyword.trim() ? <> • Filter: “{keyword}”</> : null}
              {err ? <span className="error"> • {err}</span> : null}
            </div>
          </div>

          {/* Sort controls */}
          <div className="sort-controls">
            <label>Sort by:</label>
            <select value={sortField} onChange={(e) => setSortField(e.target.value)}>
              {sortFieldsByType[type].map((f) => (
                <option key={f.key} value={f.key}>{f.label}</option>
              ))}
            </select>
            <button
              className="btn btn-outline"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              {sortOrder === "asc" ? "🔼 Ascending" : "🔽 Descending"}
            </button>
          </div>

          {/* Locations */}
          {type === "locations" && (
            <table className="rtable">
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Total Profit</th>
                </tr>
              </thead>
              <tbody>
                {(result as ProfitPerLocationRow[]).map((r) => (
                  <tr key={r.LocationName}>
                    <td>{r.LocationName}</td>
                    <td>{money(Number(r.TotalProfit))}</td>
                  </tr>
                ))}
                <tr className="subtotal">
                  <td>Total</td>
                  <td>
                    {money(
                      (result as ProfitPerLocationRow[]).reduce(
                        (a, b) => a + Number(b.TotalProfit || 0),
                        0
                      )
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          )}

          {/* Items */}
          {type === "items" && (
            <table className="rtable">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Orders</th>
                </tr>
              </thead>
              <tbody>
                {(result as PopularItemRow[]).map((r) => (
                  <tr key={r.Name}>
                    <td>{r.Name}</td>
                    <td>{Number(r.OrderCount)}</td>
                  </tr>
                ))}
                <tr className="subtotal">
                  <td>Total</td>
                  <td>
                    {(result as PopularItemRow[]).reduce(
                      (a, b) => a + Number(b.OrderCount || 0),
                      0
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          )}

          {/* Employees */}
          {type === "employees" && (
            <table className="rtable">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Hours</th>
                  <th>Orders</th>
                  <th>Sales</th>
                  <th>Sales / Hour</th>
                </tr>
              </thead>
              <tbody>
                {(result as EmployeePerfRow[]).map((r, i) => (
                  <tr key={`${r.FName}-${r.LName}-${i}`}>
                    <td>{r.FName} {r.LName}</td>
                    <td>{Number(r.TotalHoursWorked ?? 0).toFixed(2)}</td>
                    <td>{Number(r.OrdersHandled ?? 0)}</td>
                    <td>{money(Number(r.TotalSales ?? 0))}</td>
                    <td>{money(Number(r.SalesPerHour ?? 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="report-footer">Generated on {new Date().toLocaleString()}</div>
        </div>
      )}
    </div>
  );
}
