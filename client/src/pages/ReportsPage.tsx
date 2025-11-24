import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ReportsPage.css";
import ProfitLocationChart from "../components/ProfitLocationChart";
import PopularItemChart from "../components/PopularItemChart";
import EmployeePerformanceChart from "../components/EmployeePerformanceChart";

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

// Format datetime as stored in database without timezone conversion
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return 'N/A';
  
  // Remove 'Z' suffix and 'T' separator if present (ISO format)
  let cleanStr = dateStr.replace('T', ' ').replace('Z', '').replace('.000', '');
  
  // MySQL datetime format: "YYYY-MM-DD HH:MM:SS"
  const parts = cleanStr.split(' ');
  const datePart = parts[0]; // YYYY-MM-DD
  const timePart = parts[1]; // HH:MM:SS
  
  if (!datePart || !timePart) return dateStr;
  
  const [year, month, day] = datePart.split('-');
  const [hours, minutes, seconds] = timePart.split(':');
  
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  
  return `${month}/${day}/${year}, ${displayHour}:${minutes}:${seconds} ${ampm}`;
};

const sortFieldsByType: Record<ReportType, { key: string; label: string }[]> = {
  locations: [
    { key: "LocationName", label: "Location" },
    { key: "TotalOrders", label: "Total Orders" },
    { key: "TotalSales", label: "Revenue Share (%)" },
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
  
  /* ---- Location filter ---- */
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  
  /* ---- Menu Items filter ---- */
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [availableItems, setAvailableItems] = useState<string[]>([]);
  
  /* ---- Employees filter ---- */
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<string[]>([]);

  /* ---- Sorting ---- */
  const [sortField, setSortField] = useState<string>("TotalProfit");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  /* ---- Data / status ---- */
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showRawData, setShowRawData] = useState(false);
  
  /* ---- Raw transaction data for Locations ---- */
  const [rawData, setRawData] = useState<any[]>([]);
  const [rawDataLoading, setRawDataLoading] = useState(false);
  const [rawDataError, setRawDataError] = useState<string | null>(null);
  const [rawDataPagination, setRawDataPagination] = useState({ total: 0, page: 1, pages: 0, limit: 100 });

  /* ---- Raw transaction data for Items ---- */
  const [rawDataItems, setRawDataItems] = useState<any[]>([]);
  const [rawDataItemsLoading, setRawDataItemsLoading] = useState(false);
  const [rawDataItemsError, setRawDataItemsError] = useState<string | null>(null);
  const [rawDataItemsPagination, setRawDataItemsPagination] = useState({ total: 0, page: 1, pages: 0, limit: 100 });
  const [showRawDataItems, setShowRawDataItems] = useState(false);

  /* ---- Raw transaction data for Employees ---- */
  const [rawDataEmployees, setRawDataEmployees] = useState<any[]>([]);
  const [rawDataEmployeesLoading, setRawDataEmployeesLoading] = useState(false);
  const [rawDataEmployeesError, setRawDataEmployeesError] = useState<string | null>(null);
  const [rawDataEmployeesPagination, setRawDataEmployeesPagination] = useState({ total: 0, page: 1, pages: 0, limit: 100 });
  const [showRawDataEmployees, setShowRawDataEmployees] = useState(false);

  /* ---- Keep sort field sensible per report type (useEffect, not useMemo) ---- */
  useEffect(() => {
    console.log(`🔄 Tab switched to: ${type}`);
    
    // reset preview/table when user switches report tabs
    setViewed(false);
    setRows([]);
    setErr(null);
    setLoading(false);
    setKeyword(""); // Clear search bar when switching tabs
    setShowRawData(false); // Close raw data section when switching tabs
    setShowRawDataItems(false); // Close items raw data section when switching tabs
    setShowRawDataEmployees(false); // Close employees raw data section when switching tabs
    
    console.log(`✅ State reset complete for ${type} tab`);

    if (type === "locations") {
      setSortField((f: string) => (["LocationName","TotalOrders","TotalSales","TotalCost","TotalProfit","ProfitMarginPct"].includes(f) ? f : "TotalProfit"));
    } else if (type === "items") {
      setSortField((f: string) => (["ItemName","Category","TotalQuantity","TotalSales","AvgPricePerItem","SalesSharePct"].includes(f) ? f : "TotalSales"));
    } else {
      setSortField((f: string) =>
        ["EmployeeName", "Role", "TotalOrdersHandled", "TotalSales", "TotalHoursWorked", "SalesPerHour"].includes(f)
          ? f
          : "SalesPerHour"
      );
    }
  }, [type]);

  /* ---- Fetch available locations on mount ---- */
  useEffect(() => {
    const fetchAvailableLocations = async () => {
      try {
        const params = new URLSearchParams({
          startDate: range.from,
          endDate: range.to,
          desc: "false",
        });
        const url = `${API_BASE}/api/reports/profit-per-location?${params}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const locations = [...new Set(data.map((row: any) => row.LocationName).filter(Boolean))] as string[];
            setAvailableLocations(locations.sort());
          }
        }
      } catch (e) {
        console.error("Failed to fetch available locations:", e);
      }
    };

    if (type === "locations") {
      fetchAvailableLocations();
    }
  }, [type, range.from, range.to]);

  /* ---- Fetch available menu items on mount ---- */
  useEffect(() => {
    const fetchAvailableItems = async () => {
      try {
        const params = new URLSearchParams({
          startDate: range.from,
          endDate: range.to,
          desc: "false",
        });
        const url = `${API_BASE}/api/reports/most-popular-items?${params}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const items = [...new Set(data.map((row: any) => row.ItemName).filter(Boolean))] as string[];
            setAvailableItems(items.sort());
          }
        }
      } catch (e) {
        console.error("Failed to fetch available items:", e);
      }
    };

    if (type === "items") {
      fetchAvailableItems();
    }
  }, [type, range.from, range.to]);
  
  /* ---- Fetch available employees for filtering ---- */
  useEffect(() => {
    const fetchAvailableEmployees = async () => {
      try {
        const params = new URLSearchParams({
          startDate: range.from,
          endDate: range.to,
        });
        const url = `${API_BASE}/api/reports/employee-performance?${params}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const employees = data.map((row: any) => 
              row.EmployeeName ?? `${row.FName ?? ""} ${row.LName ?? row.Lname ?? ""}`.trim()
            ).filter(Boolean);
            const uniqueEmployees = [...new Set(employees)] as string[];
            setAvailableEmployees(uniqueEmployees.sort());
          }
        }
      } catch (e) {
        console.error("Failed to fetch available employees:", e);
      }
    };

    if (type === "employees") {
      fetchAvailableEmployees();
    }
  }, [type, range.from, range.to]);
  
  /* ---- Reset filters when changing tabs ---- */
  useEffect(() => {
    setSelectedLocations([]);
    setSelectedItems([]);
    setSelectedEmployees([]);
    setKeyword("");
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
      
      // Extract unique locations from data for the filter dropdown
      if (type === "locations" && data && data.length > 0) {
        const locations = [...new Set(data.map((row: any) => row.LocationName).filter(Boolean))] as string[];
        setAvailableLocations(locations);
      }
    } catch (e: any) {
      setErr(e?.message || "Failed to load report");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const onSavePDF = () => window.print();

  /* ---- Fetch raw transaction data ---- */
  const fetchRawData = async (page = 1) => {
    if (type !== "locations") return; // Only for locations for now
    
    console.log("🔍 Fetching raw data with params:", { startDate: range.from, endDate: range.to, page });
    
    setRawDataLoading(true);
    setRawDataError(null);
    try {
      const params = new URLSearchParams({
        startDate: range.from,
        endDate: range.to,
        page: String(page)
      });
      
      const url = `${API_BASE}/api/reports/raw-transactions-locations?${params}`;
      console.log("📡 Fetching from URL:", url);
      
      const res = await fetch(url);
      console.log("📨 Response status:", res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Error response:", errorText);
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }
      const result = await res.json();
      console.log("✅ Received raw data:", result);
      
      setRawData(result.data || []);
      setRawDataPagination(result.pagination || { total: 0, page: 1, pages: 0, limit: 100 });
    } catch (e: any) {
      console.error("❌ Failed to load raw data:", e);
      setRawDataError(e?.message || "Failed to load transactions");
      setRawData([]);
    } finally {
      setRawDataLoading(false);
    }
  };

  /* ---- Toggle raw data and fetch on first show ---- */
  const toggleRawData = async () => {
    const newState = !showRawData;
    setShowRawData(newState);
    
    if (newState) {
      // Fetch data whenever opening (ensures fresh data with current date range)
      await fetchRawData(1);
    }
  };

  /* ---- Fetch raw transaction data for Items ---- */
  const fetchRawDataItems = async (page = 1) => {
    if (type !== "items") return;
    
    console.log("🔍 Fetching raw items data with params:", { startDate: range.from, endDate: range.to, page });
    
    setRawDataItemsLoading(true);
    setRawDataItemsError(null);
    try {
      const params = new URLSearchParams({
        startDate: range.from,
        endDate: range.to,
        page: String(page)
      });
      
      const url = `${API_BASE}/api/reports/raw-transactions-items?${params}`;
      console.log("📡 Fetching from URL:", url);
      
      const res = await fetch(url);
      console.log("📨 Response status:", res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Error response:", errorText);
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }
      const result = await res.json();
      console.log("✅ Received raw items data:", result);
      
      setRawDataItems(result.data || []);
      setRawDataItemsPagination(result.pagination || { total: 0, page: 1, pages: 0, limit: 100 });
    } catch (e: any) {
      console.error("❌ Failed to load raw items data:", e);
      setRawDataItemsError(e?.message || "Failed to load transactions");
      setRawDataItems([]);
    } finally {
      setRawDataItemsLoading(false);
    }
  };

  /* ---- Toggle raw data items and fetch on show ---- */
  const toggleRawDataItems = async () => {
    const newState = !showRawDataItems;
    setShowRawDataItems(newState);
    
    if (newState) {
      await fetchRawDataItems(1);
    }
  };

  /* ---- Fetch raw transaction data for Employees ---- */
  const fetchRawDataEmployees = async (page = 1) => {
    if (type !== "employees") return;
    
    console.log("🔍 Fetching raw employees data with params:", { startDate: range.from, endDate: range.to, page });
    
    setRawDataEmployeesLoading(true);
    setRawDataEmployeesError(null);
    try {
      const params = new URLSearchParams({
        startDate: range.from,
        endDate: range.to,
        page: String(page)
      });
      
      const url = `${API_BASE}/api/reports/raw-transactions-employees?${params}`;
      console.log("📡 Fetching from URL:", url);
      
      const res = await fetch(url);
      console.log("📨 Response status:", res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Error response:", errorText);
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }
      const result = await res.json();
      console.log("✅ Received raw employees data:", result);
      
      setRawDataEmployees(result.data || []);
      setRawDataEmployeesPagination(result.pagination || { total: 0, page: 1, pages: 0, limit: 100 });
    } catch (e: any) {
      console.error("❌ Failed to load raw employees data:", e);
      setRawDataEmployeesError(e?.message || "Failed to load timecards");
      setRawDataEmployees([]);
    } finally {
      setRawDataEmployeesLoading(false);
    }
  };

  /* ---- Toggle raw data employees and fetch on show ---- */
  const toggleRawDataEmployees = async () => {
    const newState = !showRawDataEmployees;
    setShowRawDataEmployees(newState);
    
    if (newState) {
      await fetchRawDataEmployees(1);
    }
  };

  /* ---- Keyword filter, then sort ---- */
  const filtered = useMemo(() => {
    let result = rows;
    
    // Apply location filter for locations report
    if (type === "locations" && selectedLocations.length > 0) {
      result = result.filter(r => selectedLocations.includes(r.LocationName));
    }
    
    // Apply items filter for items report
    if (type === "items" && selectedItems.length > 0) {
      result = result.filter(r => selectedItems.includes(r.ItemName || r.Name));
    }
    
    // Apply employees filter for employees report
    if (type === "employees" && selectedEmployees.length > 0) {
      result = result.filter(r => selectedEmployees.includes(r.EmployeeName));
    }
    
    // Apply keyword filter
    const q = keyword.trim().toLowerCase();
    if (q) {
      const keywords = q.split(/[,\s]+/).filter(k => k.length > 0);
      result = result.filter((r) => {
        const haystack = haystackForRow(r, type).toLowerCase();
        return keywords.some(kw => haystack.includes(kw));
      });
    }
    
    return result;
  }, [rows, keyword, type, selectedLocations, selectedItems, selectedEmployees]);

  /* ---- Filter raw data by keyword ---- */
  const filteredRawData = useMemo(() => {
    let result = rawData;
    
    // Apply location filter
    if (type === "locations" && selectedLocations.length > 0) {
      result = result.filter(r => selectedLocations.includes(r.LocationName));
    }
    
    // Apply keyword filter
    const q = keyword.trim().toLowerCase();
    if (q && result.length > 0) {
      const keywords = q.split(/[,\s]+/).filter(k => k.length > 0);
      result = result.filter((r) => {
        const haystack = `${r.OrderID ?? ''} ${r.OrderDate ?? ''} ${r.LocationName ?? ''} ${r.PaymentMethod ?? ''} ${r.StaffName ?? ''}`.toLowerCase();
        return keywords.some(kw => haystack.includes(kw));
      });
    }
    
    return result;
  }, [rawData, keyword, type, selectedLocations]);

  /* ---- Filter raw items data by keyword ---- */
  const filteredRawDataItems = useMemo(() => {
    let result = rawDataItems;
    
    // Apply items filter
    if (type === "items" && selectedItems.length > 0) {
      result = result.filter(r => selectedItems.includes(r.ItemName));
    }
    
    // Apply keyword filter
    const q = keyword.trim().toLowerCase();
    if (q && result.length > 0) {
      const keywords = q.split(/[,\s]+/).filter(k => k.length > 0);
      result = result.filter((r) => {
        const haystack = `${r.OrderItemID ?? ''} ${r.OrderID ?? ''} ${r.ItemName ?? ''} ${r.Category ?? ''} ${r.LocationName ?? ''} ${r.StaffName ?? ''}`.toLowerCase();
        return keywords.some(kw => haystack.includes(kw));
      });
    }
    
    return result;
  }, [rawDataItems, keyword, type, selectedItems]);

  /* ---- Filter raw employees data by keyword ---- */
  const filteredRawDataEmployees = useMemo(() => {
    let result = rawDataEmployees;
    
    // Apply employees filter
    if (type === "employees" && selectedEmployees.length > 0) {
      result = result.filter(r => selectedEmployees.includes(r.EmployeeName));
    }
    
    // Apply keyword filter
    const q = keyword.trim().toLowerCase();
    if (!q || result.length === 0) return result;
    
    // Split by comma or space, remove empty strings
    const keywords = q.split(/[,\s]+/).filter(k => k.length > 0);
    
    // Filter raw employee rows
    return result.filter((r) => {
      const haystack = `${r.TimecardID ?? ''} ${r.EmployeeID ?? ''} ${r.EmployeeName ?? ''} ${r.Role ?? ''} ${r.LocationName ?? ''}`.toLowerCase();
      return keywords.some(kw => haystack.includes(kw));
    });
  }, [rawDataEmployees, keyword, type, selectedEmployees]);

  /* ---- Refetch raw data when date range changes (if section is open) ---- */
  useEffect(() => {
    if (showRawData && type === "locations" && viewed) {
      fetchRawData(1);
    }
  }, [range.from, range.to]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (showRawDataItems && type === "items" && viewed) {
      fetchRawDataItems(1);
    }
  }, [range.from, range.to]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (showRawDataEmployees && type === "employees" && viewed) {
      fetchRawDataEmployees(1);
    }
  }, [range.from, range.to]); // eslint-disable-line react-hooks/exhaustive-deps

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
            Locations
          </button>
          <button
            role="tab"
            aria-selected={type === "items"}
            className={`tab ${type === "items" ? "active" : ""}`}
            onClick={() => setType("items")}
          >
            Menu Items
          </button>
          <button
            role="tab"
            aria-selected={type === "employees"}
            className={`tab ${type === "employees" ? "active" : ""}`}
            onClick={() => setType("employees")}
          >
            Employees
          </button>
        </div>

        <div className="form-grid" style={{ marginTop: '0.75rem' }}>
          <label className="field span-2">
            <span>Keyword</span>
            <input
              type="text"
              className="keyword-input"
              placeholder={
                type === "employees" 
                  ? "Search by multiple keywords (e.g., Maria, Carlos or Manager, Server)…"
                  : type === "items"
                  ? "Search by multiple keywords (e.g., Burger, Pizza or Appetizer, Dessert)…"
                  : "Search by multiple keywords (e.g., Downtown, Mall or Location A, Location B)…"
              }
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </label>
          
          {/* Location Filter - Show for Locations report once locations are loaded */}
          {type === "locations" && availableLocations.length > 0 && (
            <label className="field span-2">
              <span>Filter by Location(s) - {selectedLocations.length > 0 ? `${selectedLocations.length} selected` : 'All locations'}</span>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '8px', 
                padding: '8px', 
                border: '1px solid #d1d5db', 
                borderRadius: '6px',
                backgroundColor: '#f9fafb',
                minHeight: '42px'
              }}>
                {availableLocations.map(location => (
                  <label 
                    key={location}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      backgroundColor: selectedLocations.includes(location) ? '#3b82f6' : 'white',
                      color: selectedLocations.includes(location) ? 'white' : '#374151',
                      border: '1px solid',
                      borderColor: selectedLocations.includes(location) ? '#3b82f6' : '#d1d5db',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 500,
                      transition: 'all 0.2s'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedLocations.includes(location)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLocations([...selectedLocations, location]);
                        } else {
                          setSelectedLocations(selectedLocations.filter(l => l !== location));
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    {location}
                  </label>
                ))}
                {selectedLocations.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedLocations([])}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                      border: '1px solid #fecaca',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 500
                    }}
                  >
                    Clear All
                  </button>
                )}
              </div>
            </label>
          )}
          
          {/* Menu Items Filter - Show for Items report once items are loaded */}
          {type === "items" && availableItems.length > 0 && (
            <label className="field span-2">
              <span>Filter by Menu Item(s) - {selectedItems.length > 0 ? `${selectedItems.length} selected` : 'All items'}</span>
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ position: 'relative' }}>
                  <select
                    size={1}
                    value=""
                    onChange={(e) => {
                      const item = e.target.value;
                      if (item && !selectedItems.includes(item)) {
                        setSelectedItems([...selectedItems, item]);
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '13px',
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">Select an item to add...</option>
                    {availableItems.map(item => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Selected items display */}
                {selectedItems.length > 0 && (
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    padding: '8px',
                    backgroundColor: '#f9fafb',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px'
                  }}>
                    {selectedItems.map(item => (
                      <span
                        key={item}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: 500
                        }}
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => setSelectedItems(selectedItems.filter(i => i !== item))}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '16px',
                            padding: '0',
                            marginLeft: '2px',
                            lineHeight: '1'
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <button
                      type="button"
                      onClick={() => setSelectedItems([])}
                      style={{
                        padding: '4px 10px',
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 500
                      }}
                    >
                      Clear All
                    </button>
                  </div>
                )}
              </div>
            </label>
          )}
          
          {/* Employees Filter - Show for Employees report once employees are loaded */}
          {type === "employees" && availableEmployees.length > 0 && (
            <label className="field span-2">
              <span>Filter by Employee(s) - {selectedEmployees.length > 0 ? `${selectedEmployees.length} selected` : 'All employees'}</span>
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ position: 'relative' }}>
                  <select
                    size={1}
                    value=""
                    onChange={(e) => {
                      const employee = e.target.value;
                      if (employee && !selectedEmployees.includes(employee)) {
                        setSelectedEmployees([...selectedEmployees, employee]);
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '13px',
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">Select an employee to add...</option>
                    {availableEmployees.map(employee => (
                      <option key={employee} value={employee}>
                        {employee}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Selected employees display */}
                {selectedEmployees.length > 0 && (
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    padding: '8px',
                    backgroundColor: '#f9fafb',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px'
                  }}>
                    {selectedEmployees.map(employee => (
                      <span
                        key={employee}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: 500
                        }}
                      >
                        {employee}
                        <button
                          type="button"
                          onClick={() => setSelectedEmployees(selectedEmployees.filter(e => e !== employee))}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '16px',
                            padding: '0',
                            marginLeft: '2px',
                            lineHeight: '1'
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <button
                      type="button"
                      onClick={() => setSelectedEmployees([])}
                      style={{
                        padding: '4px 10px',
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 500
                      }}
                    >
                      Clear All
                    </button>
                  </div>
                )}
              </div>
            </label>
          )}

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

        {/* Quick Date Presets */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          flexWrap: 'wrap', 
          marginTop: '0.5rem',
          marginBottom: '0.5rem'
        }}>
          <span style={{ 
            fontSize: '13px', 
            color: '#6b7280', 
            fontWeight: 500,
            alignSelf: 'center',
            marginRight: '4px'
          }}>
            Quick Select:
          </span>
          <button
            type="button"
            onClick={() => {
              const today = new Date();
              const sevenDaysAgo = new Date(today);
              sevenDaysAgo.setDate(today.getDate() - 7);
              setRange({
                from: sevenDaysAgo.toISOString().slice(0, 10),
                to: today.toISOString().slice(0, 10)
              });
            }}
            style={{
              padding: '6px 12px',
              fontSize: '13px',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500,
              color: '#374151'
            }}
          >
            Last 7 Days
          </button>
          <button
            type="button"
            onClick={() => {
              const today = new Date();
              const thirtyDaysAgo = new Date(today);
              thirtyDaysAgo.setDate(today.getDate() - 30);
              setRange({
                from: thirtyDaysAgo.toISOString().slice(0, 10),
                to: today.toISOString().slice(0, 10)
              });
            }}
            style={{
              padding: '6px 12px',
              fontSize: '13px',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500,
              color: '#374151'
            }}
          >
            Last 30 Days
          </button>
          <button
            type="button"
            onClick={() => {
              const today = new Date();
              const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
              const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
              setRange({
                from: firstDayLastMonth.toISOString().slice(0, 10),
                to: lastDayLastMonth.toISOString().slice(0, 10)
              });
            }}
            style={{
              padding: '6px 12px',
              fontSize: '13px',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500,
              color: '#374151'
            }}
          >
            Last Month
          </button>
          <button
            type="button"
            onClick={() => {
              const today = new Date();
              const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
              setRange({
                from: firstDayOfYear.toISOString().slice(0, 10),
                to: today.toISOString().slice(0, 10)
              });
            }}
            style={{
              padding: '6px 12px',
              fontSize: '13px',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500,
              color: '#374151'
            }}
          >
            This Year
          </button>
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
          {type === "locations" && rows.length > 0 && result && result.length > 0 && (
            <>
              {/* Chart - only show for numeric metrics */}
              {sortField !== "LocationName" && (
                <ProfitLocationChart 
                  key={`location-chart-${type}`}
                  data={result as ProfitPerLocationRow[]} 
                  metric={sortField as 'TotalProfit' | 'TotalSales' | 'TotalCost' | 'TotalOrders' | 'ProfitMarginPct'}
                />
              )}
              
              {/* Table */}
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

              {/* Raw Data Source Section */}
              <div style={{ marginTop: '2rem', borderTop: '2px solid #e5e7eb', paddingTop: '1.5rem' }}>
                <button 
                  onClick={toggleRawData}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#374151',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    marginBottom: '1rem'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#e5e7eb';
                    e.currentTarget.style.borderColor = '#9ca3af';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{showRawData ? '🔼' : '🔽'}</span>
                  {showRawData ? 'Hide' : 'Show'} Database Source Records
                  {showRawData && rawDataPagination.total > 0 && (
                    <span style={{ 
                      marginLeft: '8px', 
                      padding: '2px 8px', 
                      backgroundColor: '#dbeafe', 
                      color: '#1e40af', 
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 700
                    }}>
                      {rawDataPagination.total} total
                    </span>
                  )}
                </button>

                {showRawData && (
                  <div style={{ 
                    backgroundColor: '#fafafa', 
                    padding: '1rem', 
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <h4 style={{ 
                      margin: '0 0 1rem 0', 
                      fontSize: '16px', 
                      fontWeight: 600,
                      color: '#1f2937',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      📊 Raw Database Transactions
                      <span style={{ 
                        fontSize: '13px', 
                        fontWeight: 400, 
                        color: '#6b7280' 
                      }}>
                        (Individual orders from database)
                      </span>
                    </h4>
                    
                    {/* Technical Details */}
                    <div style={{ 
                      marginBottom: '1rem', 
                      padding: '12px', 
                      backgroundColor: '#f0f9ff', 
                      border: '1px solid #bae6fd',
                      borderRadius: '6px',
                      fontSize: '12px',
                      lineHeight: '1.6'
                    }}>
                      <div style={{ fontWeight: 600, color: '#0369a1', marginBottom: '6px' }}>
                        🗄️ Data Source:
                      </div>
                      <div style={{ color: '#0c4a6e', fontFamily: 'monospace' }}>
                        This data is extracted from the <strong>`order`</strong> table, joined with the <strong>`staff`</strong> table 
                        to show employee attribution, and the <strong>`order_item`</strong> table to calculate total item quantities. 
                        Each row represents a single customer transaction with its timestamp, location, item count, payment method, total amount, and staff attribution.
                      </div>
                      <div style={{ marginTop: '8px', color: '#64748b', fontSize: '11px', fontStyle: 'italic' }}>
                        💡 The summary table above aggregates these individual transactions by location to calculate totals and metrics.
                      </div>
                    </div>
                    
                    {rawDataLoading ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                        Loading transactions...
                      </div>
                    ) : rawDataError ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
                        <strong>Error:</strong> {rawDataError}
                      </div>
                    ) : filteredRawData.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                        {keyword ? 'No transactions match your search criteria' : 'No transactions found for this date range'}
                      </div>
                    ) : (
                      <>
                        {keyword && (
                          <div style={{ 
                            marginBottom: '1rem', 
                            padding: '8px 12px', 
                            backgroundColor: '#dbeafe', 
                            color: '#1e40af',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: 500
                          }}>
                            📌 Showing {filteredRawData.length} of {rawData.length} transactions matching "{keyword}"
                          </div>
                        )}
                        
                        <div style={{ overflowX: 'auto' }}>
                          <table className="rtable" style={{ fontSize: '13px' }}>
                            <thead>
                              <tr style={{ backgroundColor: '#f9fafb' }}>
                                <th>Order ID</th>
                                <th>Order Date</th>
                                <th>Location</th>
                                <th style={{ textAlign: 'center' }}>Items</th>
                                <th style={{ textAlign: 'right' }}>Total Order Amount ($)</th>
                                <th>Payment Method</th>
                                <th>Staff Member</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredRawData.map((row, i) => (
                                <tr key={`raw-${row.OrderID}-${i}`} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                                  <td>#{row.OrderID}</td>
                                  <td>{formatDateTime(row.OrderDate)}</td>
                                  <td>{row.LocationName || 'N/A'}</td>
                                  <td style={{ textAlign: 'center' }}>
                                    <span style={{ 
                                      padding: '2px 8px',
                                      borderRadius: '4px',
                                      fontSize: '12px',
                                      fontWeight: 600,
                                      backgroundColor: '#f3f4f6',
                                      color: '#374151'
                                    }}>
                                      {row.ItemCount || 0}
                                    </span>
                                  </td>
                                  <td style={{ textAlign: 'right' }}>{money(Number(row.TotalAmount ?? 0))}</td>
                                  <td>
                                    {row.PaymentMethod 
                                      ? row.PaymentMethod.charAt(0).toUpperCase() + row.PaymentMethod.slice(1).toLowerCase()
                                      : 'Null'}
                                  </td>
                                  <td>
                                    <span style={{ 
                                      padding: '2px 8px',
                                      borderRadius: '4px',
                                      fontSize: '12px',
                                      fontWeight: 600,
                                      backgroundColor: row.StaffName === 'Online' ? '#dbeafe' : '#d1fae5',
                                      color: row.StaffName === 'Online' ? '#1e40af' : '#065f46'
                                    }}>
                                      {row.StaffName}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination */}
                        {rawDataPagination.pages > 1 && (
                          <div style={{ 
                            marginTop: '1rem', 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            gap: '8px',
                            flexWrap: 'wrap'
                          }}>
                            <button
                              onClick={() => fetchRawData(rawDataPagination.page - 1)}
                              disabled={rawDataPagination.page === 1}
                              style={{
                                padding: '6px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                backgroundColor: rawDataPagination.page === 1 ? '#f3f4f6' : 'white',
                                color: rawDataPagination.page === 1 ? '#9ca3af' : '#374151',
                                cursor: rawDataPagination.page === 1 ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                fontWeight: 500
                              }}
                            >
                              ← Previous
                            </button>

                            {/* Page numbers */}
                            {Array.from({ length: Math.min(rawDataPagination.pages, 10) }, (_, i) => {
                              let pageNum;
                              if (rawDataPagination.pages <= 10) {
                                pageNum = i + 1;
                              } else if (rawDataPagination.page <= 6) {
                                pageNum = i + 1;
                              } else if (rawDataPagination.page >= rawDataPagination.pages - 5) {
                                pageNum = rawDataPagination.pages - 9 + i;
                              } else {
                                pageNum = rawDataPagination.page - 5 + i;
                              }
                              
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => fetchRawData(pageNum)}
                                  style={{
                                    padding: '6px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    backgroundColor: rawDataPagination.page === pageNum ? '#2563eb' : 'white',
                                    color: rawDataPagination.page === pageNum ? 'white' : '#374151',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: rawDataPagination.page === pageNum ? 700 : 500,
                                    minWidth: '40px'
                                  }}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}

                            <button
                              onClick={() => fetchRawData(rawDataPagination.page + 1)}
                              disabled={rawDataPagination.page === rawDataPagination.pages}
                              style={{
                                padding: '6px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                backgroundColor: rawDataPagination.page === rawDataPagination.pages ? '#f3f4f6' : 'white',
                                color: rawDataPagination.page === rawDataPagination.pages ? '#9ca3af' : '#374151',
                                cursor: rawDataPagination.page === rawDataPagination.pages ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                fontWeight: 500
                              }}
                            >
                              Next →
                            </button>

                            <span style={{ 
                              marginLeft: '12px', 
                              fontSize: '13px', 
                              color: '#6b7280' 
                            }}>
                              Page {rawDataPagination.page} of {rawDataPagination.pages}
                            </span>
                          </div>
                        )}

                        <p style={{ 
                          marginTop: '1rem', 
                          fontSize: '12px', 
                          color: '#6b7280',
                          fontStyle: 'italic'
                        }}>
                          💡 These are actual individual orders from the database for the selected date range. 
                          Each row represents one customer transaction. The summary table above aggregates these orders by location.
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Items */}
          {type === "items" && rows.length > 0 && result && result.length > 0 && (
            <>
              {/* Chart - only show for numeric metrics */}
              {sortField !== "ItemName" && sortField !== "Category" && (
                <PopularItemChart 
                  key={`item-chart-${type}`}
                  data={result as PopularItemRow[]} 
                  metric={sortField as 'TotalQuantity' | 'TotalSales' | 'AvgPricePerItem' | 'SalesSharePct'}
                />
              )}
              
              {/* Table */}
              <table className="rtable">
                <thead>
                  <tr>
                    <th>Item name</th>
                    <th>Category</th>
                    <th style={{ textAlign: 'right' }}>Quantity</th>
                    <th style={{ textAlign: 'right' }}>Total sales ($)</th>
                    <th style={{ textAlign: 'right' }}>Avg Item Price</th>
                    <th style={{ textAlign: 'right' }}>Percentage of total sales</th>
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

              {/* Raw Data Source Section for Items */}
              <div style={{ marginTop: '2rem', borderTop: '2px solid #e5e7eb', paddingTop: '1.5rem' }}>
                <button 
                  onClick={toggleRawDataItems}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#374151',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    marginBottom: '1rem'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#e5e7eb';
                    e.currentTarget.style.borderColor = '#9ca3af';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{showRawDataItems ? '🔼' : '🔽'}</span>
                  {showRawDataItems ? 'Hide' : 'Show'} Database Source Records
                  {showRawDataItems && rawDataItemsPagination.total > 0 && (
                    <span style={{ 
                      marginLeft: '8px', 
                      padding: '2px 8px', 
                      backgroundColor: '#dbeafe', 
                      color: '#1e40af', 
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 700
                    }}>
                      {rawDataItemsPagination.total} total
                    </span>
                  )}
                </button>

                {showRawDataItems && (
                  <div style={{ 
                    backgroundColor: '#fafafa', 
                    padding: '1rem', 
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <h4 style={{ 
                      margin: '0 0 1rem 0', 
                      fontSize: '16px', 
                      fontWeight: 600,
                      color: '#1f2937',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      📊 Raw Database Item Transactions
                      <span style={{ 
                        fontSize: '13px', 
                        fontWeight: 400, 
                        color: '#6b7280' 
                      }}>
                        (Individual order items from database)
                      </span>
                    </h4>
                    
                    {/* Technical Details */}
                    <div style={{ 
                      marginBottom: '1rem', 
                      padding: '12px', 
                      backgroundColor: '#f0f9ff', 
                      border: '1px solid #bae6fd',
                      borderRadius: '6px',
                      fontSize: '12px',
                      lineHeight: '1.6'
                    }}>
                      <div style={{ fontWeight: 600, color: '#0369a1', marginBottom: '6px' }}>
                        🗄️ Data Source:
                      </div>
                      <div style={{ color: '#0c4a6e', fontFamily: 'monospace' }}>
                        This data is extracted from the <strong>`order_item`</strong> table, joined with the <strong>`order`</strong> table 
                        for order details, <strong>`menu_item`</strong> table for item information, and <strong>`staff`</strong> table 
                        for employee attribution. Each row represents a single menu item from a customer order with its quantity, pricing, and context.
                      </div>
                      <div style={{ marginTop: '8px', color: '#64748b', fontSize: '11px', fontStyle: 'italic' }}>
                        💡 The summary table above aggregates these individual item transactions by menu item to calculate totals and metrics.
                      </div>
                    </div>
                    
                    {rawDataItemsLoading ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                        Loading item transactions...
                      </div>
                    ) : rawDataItemsError ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
                        <strong>Error:</strong> {rawDataItemsError}
                      </div>
                    ) : filteredRawDataItems.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                        {keyword ? 'No item transactions match your search criteria' : 'No item transactions found for this date range'}
                      </div>
                    ) : (
                      <>
                        {keyword && (
                          <div style={{ 
                            marginBottom: '1rem', 
                            padding: '8px 12px', 
                            backgroundColor: '#dbeafe', 
                            color: '#1e40af',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: 500
                          }}>
                            📌 Showing {filteredRawDataItems.length} of {rawDataItems.length} item transactions matching "{keyword}"
                          </div>
                        )}
                        
                        <div style={{ overflowX: 'auto' }}>
                          <table className="rtable" style={{ fontSize: '13px' }}>
                            <thead>
                              <tr style={{ backgroundColor: '#f9fafb' }}>
                                <th>Item ID</th>
                                <th>Order ID</th>
                                <th>Order Date</th>
                                <th>Item Name</th>
                                <th>Category</th>
                                <th style={{ textAlign: 'center' }}>Qty</th>
                                <th style={{ textAlign: 'right' }}>Unit Price ($)</th>
                                <th style={{ textAlign: 'right' }}>Line Total ($)</th>
                                <th>Location</th>
                                <th>Staff/Online</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredRawDataItems.map((row, i) => (
                                <tr key={`raw-item-${row.OrderItemID}-${i}`} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                                  <td>#{row.OrderItemID}</td>
                                  <td>#{row.OrderID}</td>
                                  <td>{formatDateTime(row.OrderDate)}</td>
                                  <td>{row.ItemName || 'N/A'}</td>
                                  <td>{row.Category || 'N/A'}</td>
                                  <td style={{ textAlign: 'center' }}>
                                    <span style={{ 
                                      padding: '2px 8px',
                                      borderRadius: '4px',
                                      fontSize: '12px',
                                      fontWeight: 600,
                                      backgroundColor: '#f3f4f6',
                                      color: '#374151'
                                    }}>
                                      {row.Quantity || 0}
                                    </span>
                                  </td>
                                  <td style={{ textAlign: 'right' }}>{money(Number(row.UnitPrice ?? 0))}</td>
                                  <td style={{ textAlign: 'right' }}>{money(Number(row.LineTotal ?? 0))}</td>
                                  <td>{row.LocationName || 'N/A'}</td>
                                  <td>
                                    <span style={{ 
                                      padding: '2px 8px',
                                      borderRadius: '4px',
                                      fontSize: '12px',
                                      fontWeight: 600,
                                      backgroundColor: row.StaffName === 'Online' ? '#dbeafe' : '#d1fae5',
                                      color: row.StaffName === 'Online' ? '#1e40af' : '#065f46'
                                    }}>
                                      {row.StaffName}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination */}
                        {rawDataItemsPagination.pages > 1 && (
                          <div style={{ 
                            marginTop: '1rem', 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            gap: '8px',
                            flexWrap: 'wrap'
                          }}>
                            <button
                              onClick={() => fetchRawDataItems(rawDataItemsPagination.page - 1)}
                              disabled={rawDataItemsPagination.page === 1}
                              style={{
                                padding: '6px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                backgroundColor: rawDataItemsPagination.page === 1 ? '#f3f4f6' : 'white',
                                color: rawDataItemsPagination.page === 1 ? '#9ca3af' : '#374151',
                                cursor: rawDataItemsPagination.page === 1 ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                fontWeight: 500
                              }}
                            >
                              ← Previous
                            </button>

                            {/* Page numbers */}
                            {Array.from({ length: Math.min(rawDataItemsPagination.pages, 10) }, (_, i) => {
                              let pageNum;
                              if (rawDataItemsPagination.pages <= 10) {
                                pageNum = i + 1;
                              } else if (rawDataItemsPagination.page <= 6) {
                                pageNum = i + 1;
                              } else if (rawDataItemsPagination.page >= rawDataItemsPagination.pages - 5) {
                                pageNum = rawDataItemsPagination.pages - 9 + i;
                              } else {
                                pageNum = rawDataItemsPagination.page - 5 + i;
                              }
                              
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => fetchRawDataItems(pageNum)}
                                  style={{
                                    padding: '6px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    backgroundColor: rawDataItemsPagination.page === pageNum ? '#2563eb' : 'white',
                                    color: rawDataItemsPagination.page === pageNum ? 'white' : '#374151',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: rawDataItemsPagination.page === pageNum ? 700 : 500,
                                    minWidth: '40px'
                                  }}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}

                            <button
                              onClick={() => fetchRawDataItems(rawDataItemsPagination.page + 1)}
                              disabled={rawDataItemsPagination.page === rawDataItemsPagination.pages}
                              style={{
                                padding: '6px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                backgroundColor: rawDataItemsPagination.page === rawDataItemsPagination.pages ? '#f3f4f6' : 'white',
                                color: rawDataItemsPagination.page === rawDataItemsPagination.pages ? '#9ca3af' : '#374151',
                                cursor: rawDataItemsPagination.page === rawDataItemsPagination.pages ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                fontWeight: 500
                              }}
                            >
                              Next →
                            </button>

                            <span style={{ 
                              marginLeft: '12px', 
                              fontSize: '13px', 
                              color: '#6b7280' 
                            }}>
                              Page {rawDataItemsPagination.page} of {rawDataItemsPagination.pages}
                            </span>
                          </div>
                        )}

                        <p style={{ 
                          marginTop: '1rem', 
                          fontSize: '12px', 
                          color: '#6b7280',
                          fontStyle: 'italic'
                        }}>
                          💡 These are actual individual order items from the database for the selected date range. 
                          Each row represents one menu item from a customer order. The summary table above aggregates these items by menu item name.
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Employees */}
          {type === "employees" && rows.length > 0 && (
            <>
              {/* Chart - only show for numeric metrics */}
              {sortField !== "EmployeeName" && sortField !== "Role" && (
                <EmployeePerformanceChart 
                  key={`employee-chart-${type}`}
                  data={result as EmployeePerfRow[]} 
                  metric={sortField as 'TotalOrdersHandled' | 'TotalSales' | 'TotalHoursWorked' | 'SalesPerHour'}
                />
              )}
              
              {/* Table */}
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

              {/* Raw Data Source Section for Employees */}
              <div style={{ marginTop: '2rem', borderTop: '2px solid #e5e7eb', paddingTop: '1.5rem' }}>
                <button 
                  onClick={toggleRawDataEmployees}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#374151',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    marginBottom: '1rem'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#e5e7eb';
                    e.currentTarget.style.borderColor = '#9ca3af';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{showRawDataEmployees ? '🔼' : '🔽'}</span>
                  {showRawDataEmployees ? 'Hide' : 'Show'} Database Source Records
                  {showRawDataEmployees && rawDataEmployeesPagination.total > 0 && (
                    <span style={{ 
                      marginLeft: '8px', 
                      padding: '2px 8px', 
                      backgroundColor: '#dbeafe', 
                      color: '#1e40af', 
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 700
                    }}>
                      {rawDataEmployeesPagination.total} total
                    </span>
                  )}
                </button>

                {showRawDataEmployees && (
                  <div style={{ 
                    backgroundColor: '#fafafa', 
                    padding: '1rem', 
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <h4 style={{ 
                      margin: '0 0 1rem 0', 
                      fontSize: '16px', 
                      fontWeight: 600,
                      color: '#1f2937',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      📊 Raw Database Timecard Records
                      <span style={{ 
                        fontSize: '13px', 
                        fontWeight: 400, 
                        color: '#6b7280' 
                      }}>
                        (Individual employee shifts from database)
                      </span>
                    </h4>
                    
                    {/* Technical Details */}
                    <div style={{ 
                      marginBottom: '1rem', 
                      padding: '12px', 
                      backgroundColor: '#f0f9ff', 
                      border: '1px solid #bae6fd',
                      borderRadius: '6px',
                      fontSize: '12px',
                      lineHeight: '1.6'
                    }}>
                      <div style={{ fontWeight: 600, color: '#0369a1', marginBottom: '6px' }}>
                        🗄️ Data Source:
                      </div>
                      <div style={{ color: '#0c4a6e', fontFamily: 'monospace' }}>
                        This data is extracted from the <strong>`timecard`</strong> table, joined with the <strong>`staff`</strong> table 
                        for employee details, and aggregated with the <strong>`order`</strong> table to count orders and sales handled during each shift. 
                        Each row represents one employee shift with clock in/out times and performance metrics during that shift.
                      </div>
                      <div style={{ marginTop: '8px', color: '#64748b', fontSize: '11px', fontStyle: 'italic' }}>
                        💡 The summary table above aggregates these individual shifts by employee to calculate total orders, sales, hours, and sales per hour.
                      </div>
                    </div>
                    
                    {rawDataEmployeesLoading ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                        Loading timecard records...
                      </div>
                    ) : rawDataEmployeesError ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
                        <strong>Error:</strong> {rawDataEmployeesError}
                      </div>
                    ) : filteredRawDataEmployees.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                        {keyword ? 'No timecard records match your search criteria' : 'No timecard records found for this date range'}
                      </div>
                    ) : (
                      <>
                        {keyword && (
                          <div style={{ 
                            marginBottom: '1rem', 
                            padding: '8px 12px', 
                            backgroundColor: '#dbeafe', 
                            color: '#1e40af',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: 500
                          }}>
                            📌 Showing {filteredRawDataEmployees.length} of {rawDataEmployees.length} timecard records matching "{keyword}"
                          </div>
                        )}
                        
                        <div style={{ overflowX: 'auto' }}>
                          <table className="rtable" style={{ fontSize: '13px' }}>
                            <thead>
                              <tr style={{ backgroundColor: '#f9fafb' }}>
                                <th>Timecard ID</th>
                                <th>Employee ID</th>
                                <th>Employee Name</th>
                                <th>Role</th>
                                <th>Date</th>
                                <th>Clock In</th>
                                <th>Clock Out</th>
                                <th style={{ textAlign: 'right' }}>Hours Worked</th>
                                <th>Location</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredRawDataEmployees.map((row, i) => (
                                <tr key={`raw-emp-${row.TimecardID}-${i}`} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                                  <td>#{row.TimecardID}</td>
                                  <td>#{row.EmployeeID}</td>
                                  <td>{row.EmployeeName || 'N/A'}</td>
                                  <td>{row.Role || 'N/A'}</td>
                                  <td>{row.ShiftDate ? new Date(row.ShiftDate).toLocaleDateString() : 'N/A'}</td>
                                  <td>{row.ClockInTime ? new Date(row.ClockInTime).toLocaleTimeString() : 'N/A'}</td>
                                  <td>{row.ClockOutTime ? new Date(row.ClockOutTime).toLocaleTimeString() : 'Not Clocked Out'}</td>
                                  <td style={{ textAlign: 'right' }}>
                                    {row.HoursWorked ? Number(row.HoursWorked).toFixed(2) : '0.00'}
                                  </td>
                                  <td>{row.LocationName || 'N/A'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination */}
                        {rawDataEmployeesPagination.pages > 1 && (
                          <div style={{ 
                            marginTop: '1rem', 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            gap: '8px',
                            flexWrap: 'wrap'
                          }}>
                            <button
                              onClick={() => fetchRawDataEmployees(rawDataEmployeesPagination.page - 1)}
                              disabled={rawDataEmployeesPagination.page === 1}
                              style={{
                                padding: '6px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                backgroundColor: rawDataEmployeesPagination.page === 1 ? '#f3f4f6' : 'white',
                                color: rawDataEmployeesPagination.page === 1 ? '#9ca3af' : '#374151',
                                cursor: rawDataEmployeesPagination.page === 1 ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                fontWeight: 500
                              }}
                            >
                              ← Previous
                            </button>

                            {/* Page numbers */}
                            {Array.from({ length: Math.min(rawDataEmployeesPagination.pages, 10) }, (_, i) => {
                              let pageNum;
                              if (rawDataEmployeesPagination.pages <= 10) {
                                pageNum = i + 1;
                              } else if (rawDataEmployeesPagination.page <= 6) {
                                pageNum = i + 1;
                              } else if (rawDataEmployeesPagination.page >= rawDataEmployeesPagination.pages - 5) {
                                pageNum = rawDataEmployeesPagination.pages - 9 + i;
                              } else {
                                pageNum = rawDataEmployeesPagination.page - 5 + i;
                              }
                              
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => fetchRawDataEmployees(pageNum)}
                                  style={{
                                    padding: '6px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    backgroundColor: rawDataEmployeesPagination.page === pageNum ? '#2563eb' : 'white',
                                    color: rawDataEmployeesPagination.page === pageNum ? 'white' : '#374151',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: rawDataEmployeesPagination.page === pageNum ? 700 : 500,
                                    minWidth: '40px'
                                  }}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}

                            <button
                              onClick={() => fetchRawDataEmployees(rawDataEmployeesPagination.page + 1)}
                              disabled={rawDataEmployeesPagination.page === rawDataEmployeesPagination.pages}
                              style={{
                                padding: '6px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                backgroundColor: rawDataEmployeesPagination.page === rawDataEmployeesPagination.pages ? '#f3f4f6' : 'white',
                                color: rawDataEmployeesPagination.page === rawDataEmployeesPagination.pages ? '#9ca3af' : '#374151',
                                cursor: rawDataEmployeesPagination.page === rawDataEmployeesPagination.pages ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                fontWeight: 500
                              }}
                            >
                              Next →
                            </button>

                            <span style={{ 
                              marginLeft: '12px', 
                              fontSize: '13px', 
                              color: '#6b7280' 
                            }}>
                              Page {rawDataEmployeesPagination.page} of {rawDataEmployeesPagination.pages}
                            </span>
                          </div>
                        )}

                        <p style={{ 
                          marginTop: '1rem', 
                          fontSize: '12px', 
                          color: '#6b7280',
                          fontStyle: 'italic'
                        }}>
                          💡 These are actual individual employee shifts from the database for the selected date range. 
                          Each row represents one timecard with clock in/out times and orders/sales handled during that shift. The summary table above aggregates these shifts by employee.
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="report-footer">Generated on {new Date().toLocaleString()}</div>
        </div>
      )}
    </div>
  );
}
