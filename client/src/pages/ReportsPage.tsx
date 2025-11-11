import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ReportsPage.css";

/* ========= Types from API ========= */
type ReportType = "locations" | "items" | "employees";
type Range = { from: string; to: string };

type ProfitPerLocationRow = {
  LocationName: string;
  TotalOrders: number | string;
  TotalSales: number | string;
  TotalCost: number | string;
  TotalProfit: number | string;
  ProfitMarginPct: number | string;
};
type PopularItemRow = {
  ItemName: string;
  Category: string;
  TotalQuantity: number | string;
  TotalSales: number | string;
  AvgPricePerItem: number | string;
  SalesSharePct: number | string;
};
type EmployeePerfRow = {
  EmployeeName: string;
  Role: string;
  TotalOrdersHandled: number | string;
  TotalSales: number | string;
  TotalHoursWorked: number | string; // decimal hours
  SalesPerHour?: number;             // provided by server
};

const API_BASE = "";

/* ========= Helpers ========= */
const money = (n: number) =>
  Number(n ?? 0).toLocaleString(undefined, { style: "currency", currency: "USD" });

const sortFieldsByType: Record<ReportType, { key: string; label: string }[]> = {
  locations: [
    { key: "LocationName", label: "Location" },
    { key: "TotalOrders", label: "Total Orders" },
    { key: "TotalSales", label: "Total Sales" },
    { key: "TotalCost", label: "Total Cost" },
    { key: "TotalProfit", label: "Total Profit" },
    { key: "ProfitMarginPct", label: "Profit Margin (%)" },
  ],
  items: [
    { key: "ItemName", label: "Item" },
    { key: "Category", label: "Category" },
    { key: "TotalQuantity", label: "Quantity" },
    { key: "TotalSales", label: "Total Sales" },
    { key: "AvgPricePerItem", label: "Avg Price" },
    { key: "SalesSharePct", label: "% of Total Sales" },
  ],
  employees: [
    { key: "EmployeeName", label: "Employee Name" },
    { key: "Role", label: "Role / Position" },
    { key: "TotalOrdersHandled", label: "Orders" },
    { key: "TotalSales", label: "Sales" },
    { key: "TotalHoursWorked", label: "Hours" },
    { key: "SalesPerHour", label: "Sales / Hour" },
  ],
};

const isNumeric = (v: any) => v !== null && v !== "" && !isNaN(Number(v));

const haystackForRow = (row: any, type: ReportType) => {
  if (type === "locations") {
    return `${row.LocationName ?? ""} ${row.TotalOrders ?? ""} ${row.TotalSales ?? ""} ${row.TotalProfit ?? ""}`;
  }
  if (type === "items") {
    return `${row.ItemName ?? row.Name ?? ""} ${row.Category ?? ""} ${row.TotalQuantity ?? row.OrderCount ?? ""} ${row.TotalSales ?? ""}`;
  }
  // employees
  const name = row.EmployeeName ?? `${row.FName ?? ""} ${row.LName ?? row.Lname ?? ""}`.trim();
  return `${name} ${row.Role ?? ""} ${row.TotalOrdersHandled ?? row.OrdersHandled ?? ""} ${row.TotalSales ?? ""} ${row.TotalHoursWorked ?? ""}`;
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
  const fromDate = new Date(today);
  // default "from" = one month prior
  fromDate.setMonth(today.getMonth() - 1);
  const from = fromDate.toISOString().slice(0, 10);

  /* ---- Form state ---- */
  const [type, setType] = useState<ReportType>("locations");
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
    // reset preview/table when user switches report tabs
    setViewed(false);
    setRows([]);
    setErr(null);
    setLoading(false);

    if (type === "locations") {
      setSortField((f) => (["LocationName","TotalOrders","TotalSales","TotalCost","TotalProfit","ProfitMarginPct"].includes(f) ? f : "TotalProfit"));
    } else if (type === "items") {
      setSortField((f) => (["ItemName","Category","TotalQuantity","TotalSales","AvgPricePerItem","SalesSharePct"].includes(f) ? f : "TotalSales"));
    } else {
      setSortField((f) =>
        ["EmployeeName", "Role", "TotalOrdersHandled", "TotalSales", "TotalHoursWorked", "SalesPerHour"].includes(f)
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
        const normalized = (data as any[]).map((r: any) => ({
          EmployeeName: r.EmployeeName ?? `${r.FName ?? ""} ${r.LName ?? r.Lname ?? ""}`.trim(),
          Role: r.Role ?? r.RoleName ?? "",
          TotalOrdersHandled: Number(r.TotalOrdersHandled ?? r.total_orders ?? 0),
          TotalSales: Number(r.TotalSales ?? r.total_sales ?? 0),
          TotalHoursWorked: Number(r.TotalHoursWorked ?? r.total_hours ?? 0),
          SalesPerHour: Number(r.SalesPerHour ?? 0),
        }));
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

        {/* Tabs for report type */}
        <div className="tabs" role="tablist" aria-label="Report tabs">
          <button
            role="tab"
            aria-selected={type === "locations"}
            className={`tab ${type === "locations" ? "active" : ""}`}
            onClick={() => setType("locations")}
          >
            Most Profitable Location
          </button>
          <button
            role="tab"
            aria-selected={type === "items"}
            className={`tab ${type === "items" ? "active" : ""}`}
            onClick={() => setType("items")}
          >
            Most Popular Item
          </button>
          <button
            role="tab"
            aria-selected={type === "employees"}
            className={`tab ${type === "employees" ? "active" : ""}`}
            onClick={() => setType("employees")}
          >
            Employee Performance
          </button>
        </div>

        <div className="form-grid" style={{ marginTop: '0.75rem' }}>
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
              Range: {range.from} → {range.to}
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
                  <th>Location Name</th>
                  <th style={{ textAlign: 'right' }}>Total Orders</th>
                  <th style={{ textAlign: 'right' }}>Total Sales ($)</th>
                  <th style={{ textAlign: 'right' }}>Total Cost ($)</th>
                  <th style={{ textAlign: 'right' }}>Total Profit ($)</th>
                  <th style={{ textAlign: 'right' }}>Profit Margin (%)</th>
                </tr>
              </thead>
              <tbody>
                {(result as ProfitPerLocationRow[]).map((r, i) => (
                  <tr key={`${r.LocationName ?? 'loc'}-${i}`}>
                    <td>{r.LocationName}</td>
                    <td style={{ textAlign: 'right' }}>{Number(r.TotalOrders ?? 0)}</td>
                    <td style={{ textAlign: 'right' }}>{money(Number(r.TotalSales ?? 0))}</td>
                    <td style={{ textAlign: 'right' }}>{money(Number(r.TotalCost ?? 0))}</td>
                    <td style={{ textAlign: 'right' }}>{money(Number(r.TotalProfit ?? 0))}</td>
                    <td style={{ textAlign: 'right' }}>{Number(r.ProfitMarginPct ?? 0).toFixed(2)}%</td>
                  </tr>
                ))}
                <tr className="subtotal">
                  <td>Total</td>
                  <td style={{ textAlign: 'right' }}>
                    {(result as ProfitPerLocationRow[]).reduce((a, b) => a + Number(b.TotalOrders || 0), 0)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {money((result as ProfitPerLocationRow[]).reduce((a, b) => a + Number(b.TotalSales || 0), 0))}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {money((result as ProfitPerLocationRow[]).reduce((a, b) => a + Number(b.TotalCost || 0), 0))}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {money((result as ProfitPerLocationRow[]).reduce((a, b) => a + Number(b.TotalProfit || 0), 0))}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {(() => {
                      const totSales = (result as ProfitPerLocationRow[]).reduce((a, b) => a + Number(b.TotalSales || 0), 0);
                      const totProfit = (result as ProfitPerLocationRow[]).reduce((a, b) => a + Number(b.TotalProfit || 0), 0);
                      return totSales > 0 ? ( (totProfit / totSales) * 100 ).toFixed(2) + '%' : '0.00%';
                    })()}
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
                  <th>Item name</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Quantity</th>
                  <th style={{ textAlign: 'right' }}>Total sales ($)</th>
                  <th style={{ textAlign: 'right' }}>Avg Item Price</th>
                  <th style={{ textAlign: 'right' }}>Porcentage of total sales</th>
                </tr>
              </thead>
              <tbody>
                {(result as PopularItemRow[]).map((r, i) => (
                  <tr key={`${r.ItemName}-${i}`}>
                    <td>{r.ItemName}</td>
                    <td>{r.Category}</td>
                    <td style={{ textAlign: 'right' }}>{Number(r.TotalQuantity ?? 0)}</td>
                    <td style={{ textAlign: 'right' }}>{money(Number(r.TotalSales ?? 0))}</td>
                    <td style={{ textAlign: 'right' }}>{money(Number(r.AvgPricePerItem ?? 0))}</td>
                    <td style={{ textAlign: 'right' }}>{Number(r.SalesSharePct ?? 0).toFixed(2)}%</td>
                  </tr>
                ))}
                <tr className="subtotal">
                  <td>Total</td>
                  <td />
                  <td style={{ textAlign: 'right' }}>
                    {(result as PopularItemRow[]).reduce((a, b) => a + Number(b.TotalQuantity || 0), 0)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {money((result as PopularItemRow[]).reduce((a, b) => a + Number(b.TotalSales || 0), 0))}
                  </td>
                  <td />
                  <td />
                </tr>
              </tbody>
            </table>
          )}

          {/* Employees */}
          {type === "employees" && (
            <table className="rtable">
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Role / Position</th>
                  <th style={{ textAlign: 'right' }}>Total Orders Handled</th>
                  <th style={{ textAlign: 'right' }}>Total Sales ($)</th>
                  <th style={{ textAlign: 'right' }}>Total Hours Worked</th>
                  <th style={{ textAlign: 'right' }}>Sales per Hour</th>
                </tr>
              </thead>
              <tbody>
                {(result as EmployeePerfRow[]).map((r, i) => (
                  <tr key={`${r.EmployeeName ?? `employee-${i}`}`}>
                    <td>{r.EmployeeName}</td>
                    <td>{r.Role}</td>
                    <td style={{ textAlign: 'right' }}>{Number(r.TotalOrdersHandled ?? 0)}</td>
                    <td style={{ textAlign: 'right' }}>{money(Number(r.TotalSales ?? 0))}</td>
                    <td style={{ textAlign: 'right' }}>{Number(r.TotalHoursWorked ?? 0).toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>{Number(r.SalesPerHour ?? 0).toFixed(2)}</td>
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
