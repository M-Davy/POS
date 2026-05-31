"use client";

import { useState, useEffect, useCallback } from "react";
import { inventoryAPI, orderAPI, productAPI } from "@/lib/api-service"; 
// Import useRouter for redirection after logout
import { useRouter } from "next/navigation"; 
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// --- Dashboard Section ---
function DashboardSection() {
  const [trendView, setTrendView] = useState<"daily" | "weekly" | "monthly">("daily");
  const [ordersForTrends, setOrdersForTrends] = useState<Array<{ createdAt: string; totalAmount: number }>>([]);
  const [stats, setStats] = useState({
    todaySales: 0,
    monthSales: 0,
    orderCount: 0,
    avgOrderValue: 0,
    topProducts: [] as any[]
  });

  const toNairobiDate = (dateValue: string) => {
    return new Date(new Date(dateValue).toLocaleString("en-US", { timeZone: "Africa/Nairobi" }));
  };

  const buildWeekRanges = (year: number, month: number) => {
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    const weeks: Array<{ label: string; start: Date; end: Date }> = [];

    const firstSundayOffset = (7 - monthStart.getDay()) % 7;
    const firstWeekEnd = new Date(monthStart);
    firstWeekEnd.setDate(monthStart.getDate() + firstSundayOffset);

    weeks.push({ label: "Week 1", start: new Date(monthStart), end: new Date(firstWeekEnd) });

    let nextWeekStart = new Date(firstWeekEnd);
    nextWeekStart.setDate(nextWeekStart.getDate() + 1);

    while (nextWeekStart <= monthEnd) {
      const weekStart = new Date(nextWeekStart);
      const weekEnd = new Date(weekStart);
      const daysUntilSunday = (7 - weekStart.getDay()) % 7;
      weekEnd.setDate(weekStart.getDate() + daysUntilSunday);
      if (weekEnd > monthEnd) {
        weekEnd.setTime(monthEnd.getTime());
      }

      weeks.push({ label: `Week ${weeks.length + 1}`, start: weekStart, end: weekEnd });

      nextWeekStart = new Date(weekEnd);
      nextWeekStart.setDate(nextWeekStart.getDate() + 1);
    }

    return weeks;
  };

  const nowInNairobi = new Date(new Date().toLocaleString("en-US", { timeZone: "Africa/Nairobi" }));

  const trendData = (() => {
    if (ordersForTrends.length === 0) {
      return [] as Array<{ label: string; value: number }>;
    }

    if (trendView === "daily") {
      const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      const monday = new Date(nowInNairobi);
      const mondayOffset = (monday.getDay() + 6) % 7;
      monday.setDate(monday.getDate() - mondayOffset);

      return dayNames.map((label, index) => {
        const start = new Date(monday);
        start.setDate(monday.getDate() + index);
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setHours(23, 59, 59, 999);

        const value = ordersForTrends.reduce((sum, order) => {
          const date = toNairobiDate(order.createdAt);
          if (date >= start && date <= end) {
            return sum + (order.totalAmount || 0);
          }
          return sum;
        }, 0);

        return { label, value };
      });
    }

    if (trendView === "weekly") {
      const weeks = buildWeekRanges(nowInNairobi.getFullYear(), nowInNairobi.getMonth());
      return weeks.map((week) => {
        const start = new Date(week.start);
        start.setHours(0, 0, 0, 0);
        const end = new Date(week.end);
        end.setHours(23, 59, 59, 999);

        const value = ordersForTrends.reduce((sum, order) => {
          const date = toNairobiDate(order.createdAt);
          if (date >= start && date <= end) {
            return sum + (order.totalAmount || 0);
          }
          return sum;
        }, 0);

        return { label: week.label, value };
      });
    }

    const rows: Array<{ label: string; value: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const monthDate = new Date(nowInNairobi.getFullYear(), nowInNairobi.getMonth() - i, 1);
      const year = monthDate.getFullYear();
      const month = monthDate.getMonth();

      const value = ordersForTrends.reduce((sum, order) => {
        const date = toNairobiDate(order.createdAt);
        if (date.getFullYear() === year && date.getMonth() === month) {
          return sum + (order.totalAmount || 0);
        }
        return sum;
      }, 0);

      rows.push({
        label: monthDate.toLocaleDateString("en-US", { month: "short" }),
        value,
      });
    }
    return rows;
  })();

  const highestValue = trendData.reduce((max, point) => (point.value > max ? point.value : max), 0);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const today = await orderAPI.getTodayTotal();
        const orders = await orderAPI.getAll();
        const monthly = await orderAPI.getMonthlyTotal(); 
        const topProd = await orderAPI.getTopSelling(); 

        const totalValue = orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

        setStats({
          todaySales: today || 0,
          monthSales: monthly || 0,
          orderCount: orders.length,
          avgOrderValue: orders.length > 0 ? totalValue / orders.length : 0,
          topProducts: topProd || []
        });
        setOrdersForTrends(
          orders.map((order: any) => ({
            createdAt: order.createdAt,
            totalAmount: order.totalAmount || 0,
          }))
        );
      } catch (err) {
        console.error("Stats load failed", err);
      }
    };
    loadStats();
  }, []);

  return (
    <section>
      <h2 style={{ color: "#059669", fontWeight: 800, fontSize: 26, marginBottom: 24 }}>Business Overview</h2>
      
      {/* --- STATS GRID --- */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 32 }}>
        <StatCard title="Today's Sales" value={`Ksh ${stats.todaySales.toLocaleString()}`} color="#059669" />
        <StatCard title="This Month" value={`Ksh ${stats.monthSales.toLocaleString()}`} color="#2563eb" />
        <StatCard title="Transactions" value={stats.orderCount.toString()} color="#1e293b" />
        <StatCard title="Avg. Ticket" value={`Ksh ${stats.avgOrderValue.toFixed(0)}`} color="#7c3aed" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
        {/* --- TOP PRODUCTS TABLE --- */}
        <div style={{ background: "#fff", padding: 24, borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "#1e293b" }}>Top Selling Products</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "#64748b", fontSize: 13, borderBottom: "1px solid #f1f5f9" }}>
                <th style={{ padding: "10px 0" }}>Product</th>
                <th>Units Sold</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {stats.topProducts.map((p, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f8fafc" }}>
                  <td style={{ padding: "12px 0", fontWeight: 600, color: "#334155" }}>{p.name}</td>
                  <td>{p.quantitySold}</td>
                  <td style={{ fontWeight: 600, color: "#059669" }}>Ksh {p.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ background: "#0f172a", padding: 24, borderRadius: 16, border: "1px solid #1f2937", boxShadow: "0 4px 12px rgba(0,0,0,0.25)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 8 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", margin: 0 }}>Sales Trends</h3>
            <div style={{ display: "flex", gap: 6 }}>
              {(["daily", "weekly", "monthly"] as const).map((mode) => {
                const active = trendView === mode;
                return (
                  <button
                    key={mode}
                    onClick={() => setTrendView(mode)}
                    style={{
                      border: "none",
                      borderRadius: 999,
                      padding: "6px 10px",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      textTransform: "capitalize",
                      background: active ? "#059669" : "#1e293b",
                      color: active ? "#ecfdf5" : "#94a3b8",
                    }}
                  >
                    {mode}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 8, right: 8, left: -6, bottom: 0 }}>
                <CartesianGrid stroke="#1f2937" strokeDasharray="4 4" />
                <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "#334155" }} tickLine={{ stroke: "#334155" }} />
                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  axisLine={{ stroke: "#334155" }}
                  tickLine={{ stroke: "#334155" }}
                  tickFormatter={(value) => `Ksh ${Number(value).toLocaleString()}`}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0b1120",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    color: "#ffffff",
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#ffffff", fontWeight: 700 }}
                  formatter={(value) => [`Ksh ${Number(value ?? 0).toLocaleString()}`, "Sales"]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#059669"
                  strokeWidth={3}
                  dot={(props) => {
                    const { cx, cy, payload } = props;
                    const isHighest = payload?.value === highestValue && highestValue > 0;
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isHighest ? 6 : 3}
                        fill={isHighest ? "#34d399" : "#059669"}
                        stroke={isHighest ? "#ecfdf5" : "#0f172a"}
                        strokeWidth={isHighest ? 2 : 1}
                      />
                    );
                  }}
                  activeDot={{ r: 7, fill: "#34d399", stroke: "#ecfdf5", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}

// Reusable Stat Card Component
function StatCard({ title, value, color }: { title: string, value: string, color: string }) {
  return (
    <div style={{ background: "#fff", padding: 24, borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", borderLeft: `6px solid ${color}` }}>
      <p style={{ color: "#64748b", fontSize: 13, fontWeight: 600, margin: 0 }}>{title}</p>
      <h3 style={{ fontSize: 24, color: "#1e293b", margin: "8px 0 0 0" }}>{value}</h3>
    </div>
  );
}

// --- Orders Section ---
function OrdersSection() {
  const [orders, setOrders] = useState<any[]>([]);
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const formatMoney = (amount: number) => `Ksh ${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  const toNairobiDate = (dateValue: string) => {
    const localLikeNairobi = new Date(
      new Date(dateValue).toLocaleString("en-US", { timeZone: "Africa/Nairobi" })
    );
    return localLikeNairobi;
  };

  const monthLabel = monthCursor.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const buildWeekRanges = (year: number, month: number) => {
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    const weeks: { label: string; start: Date; end: Date }[] = [];

    const firstSundayOffset = (7 - monthStart.getDay()) % 7;
    const firstWeekEnd = new Date(monthStart);
    firstWeekEnd.setDate(monthStart.getDate() + firstSundayOffset);

    weeks.push({
      label: "Week 1",
      start: new Date(monthStart),
      end: new Date(firstWeekEnd),
    });

    let nextWeekStart = new Date(firstWeekEnd);
    nextWeekStart.setDate(nextWeekStart.getDate() + 1);

    while (nextWeekStart <= monthEnd) {
      const weekStart = new Date(nextWeekStart);
      const weekEnd = new Date(weekStart);
      const daysUntilSunday = (7 - weekStart.getDay()) % 7;
      weekEnd.setDate(weekStart.getDate() + daysUntilSunday);
      if (weekEnd > monthEnd) {
        weekEnd.setTime(monthEnd.getTime());
      }

      weeks.push({
        label: `Week ${weeks.length + 1}`,
        start: weekStart,
        end: weekEnd,
      });

      nextWeekStart = new Date(weekEnd);
      nextWeekStart.setDate(nextWeekStart.getDate() + 1);
    }

    return weeks;
  };

  const getDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const weekRanges = buildWeekRanges(monthCursor.getFullYear(), monthCursor.getMonth());
  const selectedWeek = weekRanges[Math.min(selectedWeekIndex, weekRanges.length - 1)] || weekRanges[0];

  const weekDays: Date[] = [];
  if (selectedWeek) {
    const cursor = new Date(selectedWeek.start);
    while (cursor <= selectedWeek.end) {
      weekDays.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await orderAPI.getAll();
        const filteredByMonth = data.filter((order: any) => {
          const orderDate = toNairobiDate(order.createdAt);
          return (
            orderDate.getFullYear() === monthCursor.getFullYear() &&
            orderDate.getMonth() === monthCursor.getMonth()
          );
        });
        setOrders(filteredByMonth);
        setExpandedDays({});
        setSelectedWeekIndex(0);
      } catch (err) {
        console.error("Order fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [monthCursor]);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const matchesSearch = (order: any) => {
    if (!normalizedSearch) return true;
    return (
      String(order.id).toLowerCase().includes(normalizedSearch) ||
      String(order.paymentMethod || "").toLowerCase().includes(normalizedSearch)
    );
  };

  const ordersByDate = orders.reduce((acc: Record<string, any[]>, order: any) => {
    const dateKey = getDateKey(toNairobiDate(order.createdAt));
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(order);
    return acc;
  }, {});

  const dayRows = weekDays.map((date) => {
    const key = getDateKey(date);
    const dayOrders = (ordersByDate[key] || []).filter(matchesSearch);
    const total = dayOrders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
    return {
      key,
      date,
      orders: dayOrders,
      count: dayOrders.length,
      total,
    };
  });

  const weekTotal = dayRows.reduce((sum, row) => sum + row.total, 0);
  const weekTransactions = dayRows.reduce((sum, row) => sum + row.count, 0);
  const weekAvg = weekTransactions > 0 ? weekTotal / weekTransactions : 0;

  const shiftMonth = (direction: -1 | 1) => {
    setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  };

  const toggleDay = (key: string, count: number) => {
    if (count === 0) return;
    setExpandedDays((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) return <p>Loading Transactions...</p>;

  return (
    <section>
      <h2 style={{ color: "#059669", fontWeight: 800, fontSize: 26, marginBottom: 16 }}>Transaction History</h2>

      <div
        style={{
          background: "#0f172a",
          borderRadius: 16,
          padding: 20,
          border: "1px solid #1e293b",
          boxShadow: "0 10px 24px rgba(2, 6, 23, 0.35)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <button
            onClick={() => shiftMonth(-1)}
            style={{
              background: "#111827",
              border: "1px solid #334155",
              color: "#cbd5e1",
              borderRadius: 10,
              padding: "8px 12px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            &lt;
          </button>
          <div style={{ color: "#e2e8f0", fontSize: 18, fontWeight: 800 }}>{monthLabel}</div>
          <button
            onClick={() => shiftMonth(1)}
            style={{
              background: "#111827",
              border: "1px solid #334155",
              color: "#cbd5e1",
              borderRadius: 10,
              padding: "8px 12px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            &gt;
          </button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {weekRanges.map((week, index) => {
            const active = selectedWeekIndex === index;
            return (
              <button
                key={week.label}
                onClick={() => {
                  setSelectedWeekIndex(index);
                  setExpandedDays({});
                }}
                style={{
                  background: active ? "#064e3b" : "#111827",
                  border: active ? "1px solid #10b981" : "1px solid #334155",
                  color: active ? "#a7f3d0" : "#94a3b8",
                  borderRadius: 10,
                  padding: "8px 12px",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                {week.label}
              </button>
            );
          })}
        </div>

        <input
          type="text"
          placeholder="Search by Order ID or Payment Method..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "1px solid #334155",
            background: "#111827",
            color: "#e2e8f0",
            marginBottom: 16,
          }}
        />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 18 }}>
          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: 14 }}>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: 12, fontWeight: 700 }}>Week Total</p>
            <p style={{ margin: "8px 0 0 0", color: "#10b981", fontWeight: 800, fontSize: 20 }}>{formatMoney(weekTotal)}</p>
          </div>
          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: 14 }}>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: 12, fontWeight: 700 }}>Total Transactions</p>
            <p style={{ margin: "8px 0 0 0", color: "#e2e8f0", fontWeight: 800, fontSize: 20 }}>{weekTransactions}</p>
          </div>
          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: 14 }}>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: 12, fontWeight: 700 }}>Average per Order</p>
            <p style={{ margin: "8px 0 0 0", color: "#e2e8f0", fontWeight: 800, fontSize: 20 }}>{formatMoney(weekAvg)}</p>
          </div>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {dayRows.map((row) => {
            const canExpand = row.count > 0;
            const isOpen = !!expandedDays[row.key];
            return (
              <div key={row.key} style={{ border: "1px solid #1f2937", borderRadius: 12, overflow: "hidden" }}>
                <button
                  onClick={() => toggleDay(row.key, row.count)}
                  disabled={!canExpand}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    background: canExpand ? "#111827" : "#0b1220",
                    color: canExpand ? "#e2e8f0" : "#64748b",
                    border: "none",
                    padding: "12px 14px",
                    cursor: canExpand ? "pointer" : "not-allowed",
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 80px",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontWeight: 700 }}>
                    {row.date.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </div>
                  <div style={{ color: canExpand ? "#cbd5e1" : "#64748b" }}>
                    {row.count} {row.count === 1 ? "transaction" : "transactions"}
                  </div>
                  <div style={{ color: canExpand ? "#10b981" : "#64748b", fontWeight: 700 }}>{formatMoney(row.total)}</div>
                  <div style={{ textAlign: "right", fontWeight: 800 }}>{canExpand ? (isOpen ? "-" : "+") : "No sales"}</div>
                </button>

                {isOpen && canExpand && (
                  <div style={{ background: "#020617", borderTop: "1px solid #1f2937", padding: 12 }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", color: "#cbd5e1" }}>
                      <thead>
                        <tr style={{ textAlign: "left", borderBottom: "1px solid #1f2937", color: "#94a3b8", fontSize: 12 }}>
                          <th style={{ padding: 10 }}>Order ID</th>
                          <th style={{ padding: 10 }}>Time</th>
                          <th style={{ padding: 10 }}>Items</th>
                          <th style={{ padding: 10 }}>Payment Method</th>
                          <th style={{ padding: 10 }}>Amount</th>
                          <th style={{ padding: 10 }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {row.orders.map((order: any) => {
                          const paymentMethod = String(order.paymentMethod || "").toUpperCase();
                          const badgeColors =
                            paymentMethod === "MPESA"
                              ? { background: "#1e3a8a", color: "#bfdbfe" }
                              : paymentMethod === "CASH"
                                ? { background: "#14532d", color: "#bbf7d0" }
                                : paymentMethod === "CARD"
                                  ? { background: "#581c87", color: "#e9d5ff" }
                                  : { background: "#334155", color: "#cbd5e1" };

                          return (
                            <tr key={order.id} style={{ borderBottom: "1px solid #0f172a" }}>
                              <td style={{ padding: 10, fontWeight: 700 }}>#{order.id}</td>
                              <td style={{ padding: 10 }}>
                                {toNairobiDate(order.createdAt).toLocaleTimeString("en-GB", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </td>
                              <td style={{ padding: 10 }}>{order.orderItems?.length || 0}</td>
                              <td style={{ padding: 10 }}>
                                <span style={{ ...badgeColors, padding: "4px 8px", borderRadius: 999, fontSize: 11, fontWeight: 800 }}>
                                  {paymentMethod === "MPESA" ? "M-Pesa" : paymentMethod || "Unknown"}
                                </span>
                              </td>
                              <td style={{ padding: 10, fontWeight: 700, color: "#10b981" }}>{formatMoney(order.totalAmount || 0)}</td>
                              <td style={{ padding: 10 }}>{order.status}</td>
                            </tr>
                          );
                        })}

                        <tr style={{ background: "#111827" }}>
                          <td colSpan={3} style={{ padding: 10, fontWeight: 800, color: "#e2e8f0" }}>
                            Day Summary
                          </td>
                          <td style={{ padding: 10, color: "#94a3b8", fontWeight: 700 }}>
                            {row.count} {row.count === 1 ? "transaction" : "transactions"}
                          </td>
                          <td style={{ padding: 10, fontWeight: 800, color: "#10b981" }}>{formatMoney(row.total)}</td>
                          <td style={{ padding: 10 }} />
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// --- Inventory Section ---
function InventorySection() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState<any>(null);

  const loadInventory = useCallback(async () => {
    try {
      setLoading(true);
      const data = await inventoryAPI.getAll();
      setItems(data);
    } catch (err) {
      console.error("Failed to load inventory:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const filtered = items.filter(item =>
    item.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
    item.product?.code?.toLowerCase().includes(search.toLowerCase())
  );

  async function handleAdd(formData: any) {

    let cleanCode = formData.code;
  if (formData.type === 'WEIGHED' && cleanCode.length === 13 && cleanCode.startsWith('20')) {
    cleanCode = cleanCode.substring(2, 7);
  }
    try {

      const productData = {
        name: formData.name,
        code: cleanCode,
        type: formData.type, 
        sellingPrice: parseFloat(formData.price), 
        pricePerKg: formData.type === 'WEIGHED' ? parseFloat(formData.price) : null,
      };

      const product = await productAPI.create(productData);
      await inventoryAPI.create({
        productId: product.id,
        quantity: parseInt(formData.stock)
      });
      loadInventory();
      setShowAdd(false);
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    }
  }

  async function handleEdit(updatedData: any) {
    try {
      await inventoryAPI.update(updatedData.inventoryId, {
        quantity: parseInt(updatedData.stock)
      });
      await productAPI.update(updatedData.productId, {
        name: updatedData.name,
        code: updatedData.code, 
        sellingPrice: parseFloat(updatedData.price)
      });
      loadInventory();
      setShowEdit(null);
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  }

  if (loading) return <p style={{ color: "#059669", padding: 20 }}>Syncing with Store Database...</p>;

  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ color: "#059669", fontWeight: 800, fontSize: 26 }}>Inventory</h2>
        <button 
          onClick={() => setShowAdd(true)} 
          style={{ background: "#059669", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, cursor: "pointer" }}
        >
          + Add New Product
        </button>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", padding: 24 }}>
        <input
          type="text"
          placeholder="Search by name or code..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0", marginBottom: 20 }}
        />
        
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", color: "#64748b", borderBottom: "2px solid #f1f5f9" }}>
              <th style={{ padding: 12 }}>Code</th>
              <th style={{ padding: 12 }}>Product Name</th>
              <th style={{ padding: 12 }}>Price</th>
              <th style={{ padding: 12 }}>In Stock</th>
              <th style={{ padding: 12 }}>Status</th>
              <th style={{ padding: 12 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: 12, color: "#64748b", fontSize: 13 }}>{item.product?.code}</td>
                <td style={{ padding: 12, fontWeight: 600 }}>{item.product?.name}</td>
                <td style={{ padding: 12 }}>Ksh {item.product?.sellingPrice?.toFixed(2)}</td>
                <td style={{ padding: 12 }}>{item.quantity}</td>
                <td style={{ padding: 12 }}>
                  <span style={{ 
                    padding: "4px 8px", borderRadius: 6, fontSize: 12, fontWeight: 700,
                    background: item.quantity < 10 ? "#fee2e2" : "#dcfce7",
                    color: item.quantity < 10 ? "#991b1b" : "#166534"
                  }}>
                    {item.quantity < 10 ? "Low Stock" : "In Stock"}
                  </span>
                </td>
                <td style={{ padding: 12 }}>
                  <button 
                    onClick={() => setShowEdit({
                      inventoryId: item.id,
                      productId: item.product?.id,
                      name: item.product?.name,
                      code: item.product?.code,
                      price: item.product?.sellingPrice,
                      stock: item.quantity
                    })} 
                    style={{ color: "#059669", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && <ProductModal onClose={() => setShowAdd(false)} onSave={handleAdd} title="Add Product" />}
      {showEdit && (
        <ProductModal 
          onClose={() => setShowEdit(null)} 
          onSave={handleEdit} 
          product={showEdit} 
          title="Edit Product" 
        />
      )}
    </section>
  );
}

// --- Daily Sales Section ---
function DailySalesSection() {
  const [groupedSales, setGroupedSales] = useState<{
    date: string;
    day: string;
    total: number;
    transactions: { id: number; time: string; totalAmount: number; paymentMethod: string; status: string }[];
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAndGroup = async () => {
      try {
        setLoading(true);
        setError("");
        const orders = await orderAPI.getAll();
        // Group by date string (YYYY-MM-DD) in EAT (Africa/Nairobi)
        const grouped: Record<string, {
          total: number;
          day: string;
          transactions: { id: number; time: string; totalAmount: number; paymentMethod: string; status: string }[];
        }> = {};
        orders.forEach((order: any) => {
          const d = new Date(order.createdAt);
          // Convert to EAT (Africa/Nairobi)
          const eatDate = new Date(d.toLocaleString('en-US', { timeZone: 'Africa/Nairobi' }));
          const dateStr = eatDate.toLocaleDateString('en-CA'); // YYYY-MM-DD
          const dayStr = eatDate.toLocaleDateString('en-US', { weekday: 'long' });
          const timeStr = eatDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Nairobi' });
          if (!grouped[dateStr]) grouped[dateStr] = { total: 0, day: dayStr, transactions: [] };
          grouped[dateStr].total += order.totalAmount || 0;
          grouped[dateStr].transactions.push({
            id: order.id,
            time: timeStr,
            totalAmount: order.totalAmount || 0,
            paymentMethod: order.paymentMethod,
            status: order.status
          });
        });
        // Convert to array and sort descending by date
        const arr = Object.entries(grouped)
          .map(([date, v]) => ({ date, day: v.day, total: v.total, transactions: v.transactions }))
          .sort((a, b) => b.date.localeCompare(a.date));
        setGroupedSales(arr);
      } catch (err: any) {
        setError(err.message || "Failed to load daily sales");
      } finally {
        setLoading(false);
      }
    };
    fetchAndGroup();
  }, []);

  return (
    <section style={{ margin: "40px 0" }}>
      <h2 style={{ color: "#059669", fontWeight: 800, fontSize: 22, marginBottom: 18 }}>Daily Sales Summary</h2>
      {loading ? (
        <div style={{ color: "#64748b", padding: 12 }}>Loading daily sales...</div>
      ) : error ? (
        <div style={{ color: "#dc2626", padding: 12 }}>{error}</div>
      ) : groupedSales.length === 0 ? (
        <div style={{ color: "#64748b", padding: 16 }}>No sales data</div>
      ) : (
        groupedSales.map((day, idx) => (
          <div key={idx} style={{ marginBottom: 32, background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.03)", padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 17, color: "#059669" }}>
                {day.day}, {new Date(day.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              <div style={{ fontWeight: 700, fontSize: 17, color: "#059669" }}>
                Total: Ksh {day.total.toLocaleString()}
              </div>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
              <thead>
                <tr style={{ background: "#f0fdf4", color: "#059669", fontWeight: 700, fontSize: 15 }}>
                  <th style={{ padding: "8px 0" }}>Order ID</th>
                  <th>Time (EAT)</th>
                  <th>Amount (Ksh)</th>
                  <th>Payment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {day.transactions.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: "center", color: "#64748b", padding: 12 }}>No transactions</td></tr>
                ) : day.transactions.map((t, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "8px 0", fontWeight: 700 }}>#{t.id}</td>
                    <td>{t.time}</td>
                    <td style={{ fontWeight: 600, color: "#059669" }}>Ksh {t.totalAmount.toLocaleString()}</td>
                    <td>{t.paymentMethod}</td>
                    <td>{t.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </section>
  );
}

// --- Main Layout ---
export default function AdminPage() {
  const router = useRouter();
  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  }, [router]);

  return (
    <main style={{ background: "#f0fdf4", minHeight: "100vh", padding: "2.5rem 2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <h1 style={{ color: "#059669", fontWeight: 900, fontSize: 32, letterSpacing: 1 }}>Admin Dashboard</h1>
        <button onClick={handleLogout} style={{ padding: "10px 20px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Logout</button>
      </div>
      <DashboardSection />
      <DailySalesSection />
      <OrdersSection />
    </main>
  );
}

// --- Modal Component ---
function ProductModal({ onClose, onSave, product, title }: any) {
  const [form, setForm] = useState(product || { name: "", price: "", stock: "", code: "", type:"FIXED" });

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 50 }}>
      <div style={{ background: "#fff", padding: 32, borderRadius: 16, width: 400, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
        <h3 style={{ marginBottom: 20, fontSize: 20, fontWeight: 700 }}>{title}</h3>
        
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Selling Method</label>
        <select 
          style={{ width: "100%", padding: 10, marginBottom: 16, border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff" }}
          value={form.type}
          onChange={e => setForm({...form, type: e.target.value})}
        >
          <option value="FIXED">Fixed Price (Per Piece/Pack)</option>
          <option value="WEIGHED">Weighed (Per KG/Scale Item)</option>
        </select>

        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Item Code / SKU</label>
        <input 
          placeholder="e.g. BEV-001"
          style={{ width: "100%", padding: 10, marginBottom: 16, border: "1px solid #e2e8f0", borderRadius: 8 }} 
          value={form.code} 
          onChange={e => setForm({...form, code: e.target.value})} 
        />

        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Product Name</label>
        <input 
          style={{ width: "100%", padding: 10, marginBottom: 16, border: "1px solid #e2e8f0", borderRadius: 8 }} 
          value={form.name} 
          onChange={e => setForm({...form, name: e.target.value})} 
        />
        
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Price (Ksh)</label>
            <input 
              type="number" 
              style={{ width: "100%", padding: 10, border: "1px solid #e2e8f0", borderRadius: 8 }} 
              value={form.price} 
              onChange={e => setForm({...form, price: e.target.value})} 
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Stock Qty</label>
            <input 
              type="number" 
              style={{ width: "100%", padding: 10, border: "1px solid #e2e8f0", borderRadius: 8 }} 
              value={form.stock} 
              onChange={e => setForm({...form, stock: e.target.value})} 
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
          <button 
            onClick={() => onSave(form)} 
            disabled={!form.code || !form.name}
            style={{ 
              flex: 1, background: (!form.code || !form.name) ? "#94a3b8" : "#059669", 
              color: "#fff", border: "none", padding: 12, borderRadius: 8, cursor: "pointer", fontWeight: 700 
            }}
          >
            Save Changes
          </button>
          <button 
            onClick={onClose} 
            style={{ flex: 1, background: "#f1f5f9", color: "#64748b", border: "none", padding: 12, borderRadius: 8, cursor: "pointer" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}