"use client";

import { useState } from "react";

// --- Inventory Section with all 8 features ---
function InventorySection() {
  const [products, setProducts] = useState([
     { id: 1, name: "Apple", price: 50.0, stock: 100, unit: "pcs" },
     { id: 2, name: "Banana", price: 30.0, stock: 80, unit: "pcs" },
     { id: 4, name: "Onion", price: 80.0, stock: 10, unit: "kg" },
     { id: 5, name: "Potato", price: 60.0, stock: 70, unit: "kg" },
  ]);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState<any>(null);
  const [imported, setImported] = useState("");

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleAdd(newProduct: any) {
    setProducts([...products, { ...newProduct, id: Date.now() }]);
    setShowAdd(false);
  }
  function handleEdit(updated: any) {
    setProducts(products.map(p => p.id === updated.id ? updated : p));
    setShowEdit(null);
  }
  function adjustStock(id: number, delta: number) {
    setProducts(products.map(p => p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p));
  }

  return (
    <section>
      <h2 style={{ color: "#059669", fontWeight: 800, fontSize: 26, marginBottom: 24 }}>Inventory Management</h2>
      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px #bbf7d0", padding: 24, minHeight: 400 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 18, alignItems: "center" }}>
          <input
            type="text"
            placeholder="Search product..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #16a34a", fontSize: 16, minWidth: 180 }}
          />
          <button onClick={() => setShowAdd(true)} style={{ background: "linear-gradient(90deg, #059669 0%, #16a34a 100%)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 700, cursor: "pointer" }}>Add Product</button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ color: "#16a34a", fontWeight: 700, fontSize: 16 }}>
                <th style={{ padding: 8, borderBottom: "2px solid #bbf7d0" }}>Name</th>
                <th style={{ padding: 8, borderBottom: "2px solid #bbf7d0" }}>Price</th>
                <th style={{ padding: 8, borderBottom: "2px solid #bbf7d0" }}>Stock</th>
                <th style={{ padding: 8, borderBottom: "2px solid #bbf7d0" }}>Unit</th>
                <th style={{ padding: 8, borderBottom: "2px solid #bbf7d0" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr
                  key={p.id}
                  style={{
                    textAlign: "center",
                    color: p.stock < 20 ? "#b91c1c" : "#111",
                    background: p.stock < 20 ? "#fef2f2" : undefined,
                    fontWeight: 600
                  }}
                >
                  <td style={{ padding: 8 }}>{p.name}</td>
                  <td style={{ padding: 8 }}>Ksh {p.price.toFixed(2)}</td>
                  <td style={{ padding: 8 }}>{p.stock}</td>
                  <td style={{ padding: 8 }}>{p.unit}</td>
                  <td style={{ padding: 8 }}>
                    <button onClick={() => setShowEdit(p)} style={{ color: "#059669", border: "none", background: "none", fontWeight: 700, cursor: "pointer" }}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {showAdd && (
          <ProductModal
            onClose={() => setShowAdd(false)}
            onSave={handleAdd}
            title="Add Product"
          />
        )}
        {showEdit && (
          <ProductModal
            onClose={() => setShowEdit(null)}
            onSave={handleEdit}
            product={showEdit}
            title="Edit Product"
          />
        )}
      </div>
    </section>
  );
}

function ProductModal({ onClose, onSave, product, title }: { onClose: () => void; onSave: (product: any) => void; product?: any; title: string }) {
  const [form, setForm] = useState<any>(product || { name: "", price: "", stock: "", unit: "pcs" });
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    // For stock, ensure only upward adjustment if editing
    if (e.target.name === "stock" && product) {
      const newStock = parseInt(e.target.value);
      if (newStock < product.stock) return; // Block downward adjustment
    }
    setForm({ ...form, [e.target.name]: e.target.value });
  }
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name || !form.price || !form.stock) return;
    onSave({ ...form, price: parseFloat(form.price), stock: parseInt(form.stock), unit: form.unit, id: product?.id || Date.now(), low: 10 });
  }
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
      <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px #bbf7d0", padding: 32, minWidth: 320, display: "flex", flexDirection: "column", gap: 16 }}>
        <h3 style={{ color: "#059669", fontWeight: 800, fontSize: 22, marginBottom: 8 }}>{title}</h3>
        <label style={{ color: "#059669", fontWeight: 600 }}>Product Name
          <input name="name" value={form.name} onChange={handleChange} placeholder="Product Name" style={{ padding: 10, borderRadius: 8, border: "1px solid #16a34a", fontSize: 16, color: "#111", marginTop: 4, marginBottom: 10, width: "100%" }} required />
        </label>
        <label style={{ color: "#059669", fontWeight: 600 }}>Price
          <input name="price" value={form.price} onChange={handleChange} placeholder="Price" type="number" min="0" step="0.01" style={{ padding: 10, borderRadius: 8, border: "1px solid #16a34a", fontSize: 16, color: "#111", marginTop: 4, marginBottom: 10, width: "100%" }} required />
        </label>
        <label style={{ color: "#059669", fontWeight: 600 }}>Stock
          <input
            name="stock"
            value={form.stock}
            onChange={handleChange}
            placeholder="Stock"
            type="number"
            min={product ? product.stock : 0}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #16a34a", fontSize: 16, color: "#111", marginTop: 4, marginBottom: 10, width: "100%" }}
            required
          />
        </label>
        <label style={{ color: "#059669", fontWeight: 600 }}>Unit
          <select name="unit" value={form.unit} onChange={handleChange} style={{ padding: 10, borderRadius: 8, border: "1px solid #16a34a", fontSize: 16, color: "#111", marginTop: 4, marginBottom: 10, width: "100%" }}>
            <option value="pcs">pcs</option>
            <option value="kg">kg</option>
          </select>
        </label>
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <button
            type="submit"
            style={{ background: "linear-gradient(90deg, #059669 0%, #16a34a 100%)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 700, cursor: "pointer" }}
            disabled={product && Number(form.stock) < product.stock}
            title={product && Number(form.stock) < product.stock ? "Stock can only be increased" : undefined}
          >
            Save
          </button>
          <button type="button" onClick={onClose} style={{ background: "#fff", color: "#059669", border: "1.5px solid #16a34a", borderRadius: 8, padding: "8px 18px", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

const SECTIONS = [
  "Dashboard",
  "Inventory",
  "Report"
];

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState(SECTIONS[0]);

  return (
    <div
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        height: "100vh",
        width: "100vw",
        background: "#f0fdf4",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Montserrat', 'Segoe UI', Arial, sans-serif",
        margin: 0,
        padding: 0,
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 100,
      }}
    >
      <header
        style={{
          width: "100%",
          height: 64,
          background: "linear-gradient(90deg, #059669 0%, #16a34a 100%)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 900,
          fontSize: 28,
          letterSpacing: 2,
          boxShadow: "0 2px 8px #bbf7d0",
          position: "relative",
        }}
      >
        ESIT GROCERIES
      </header>
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <aside style={{ width: 240, background: "#fff", borderRight: "2px solid #bbf7d0", padding: "2rem 1rem", display: "flex", flexDirection: "column", gap: 24, justifyContent: "space-between", height: "100vh" }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 28, color: "#059669", marginBottom: 32, letterSpacing: 2, textAlign: "center" }}>
              Admin Panel
            </div>
            {SECTIONS.map(section => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                style={{
                  background: activeSection === section ? "linear-gradient(90deg, #059669 0%, #16a34a 100%)" : "#fff",
                  color: activeSection === section ? "#fff" : "#059669",
                  fontWeight: 700,
                  border: activeSection === section ? "none" : "1.5px solid #bbf7d0",
                  borderRadius: 10,
                  padding: "0.9rem 1.2rem",
                  marginBottom: 6,
                  cursor: "pointer",
                  fontSize: 17,
                  boxShadow: activeSection === section ? "0 2px 8px #bbf7d0" : "none",
                  transition: "all 0.2s"
                }}
              >
                {section}
              </button>
            ))}
          </div>
          <button
            title="Logout"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "#fff",
              color: "#b91c1c",
              border: "1.5px solid #b91c1c",
              borderRadius: 10,
              padding: "0.9rem 1.2rem",
              fontWeight: 700,
              fontSize: 17,
              cursor: "pointer",
              marginTop: 8,
              marginBottom: 32
            }}
            onClick={() => alert('Logged out!')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"/></svg>
            Logout
          </button>
        </aside>
        <main style={{ flex: 1, padding: "2.5rem 3.5rem", background: "#f0fdf4", minHeight: 0, overflow: "auto" }}>
          {activeSection === "Dashboard" && (
            <section>
              <h2 style={{ color: "#059669", fontWeight: 800, fontSize: 26, marginBottom: 24 }}>Dashboard Overview</h2>
              <div style={{ display: "flex", gap: 32, marginBottom: 32 }}>
                <div style={{ flex: 1, background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px #bbf7d0", padding: 32, textAlign: "center" }}>
                  <div style={{ color: "#059669", fontWeight: 700, fontSize: 20, marginBottom: 12 }}>Today's Sales</div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: "#16a34a" }}>Ksh 2,500.00</div>
                  <div style={{ color: "#64748b", fontSize: 15, marginTop: 8 }}>45 transactions</div>
                </div>
                <div style={{ flex: 1, background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px #bbf7d0", padding: 32, textAlign: "center" }}>
                  <div style={{ color: "#059669", fontWeight: 700, fontSize: 20, marginBottom: 12 }}>This Week's Sales</div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: "#16a34a" }}>Ksh 15,800.00</div>
                  <div style={{ color: "#64748b", fontSize: 15, marginTop: 8 }}>320 transactions</div>
                </div>
                <div style={{ flex: 1, background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px #bbf7d0", padding: 32, textAlign: "center" }}>
                  <div style={{ color: "#059669", fontWeight: 700, fontSize: 20, marginBottom: 12 }}>This Month's Sales</div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: "#16a34a" }}>Ksh 62,400.00</div>
                  <div style={{ color: "#64748b", fontSize: 15, marginTop: 8 }}>1,250 transactions</div>
                </div>
              </div>
              {/* Transaction List */}
              <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px #bbf7d0", padding: 24 }}>
                <h3 style={{ color: "#059669", fontWeight: 700, fontSize: 20, marginBottom: 18 }}>Recent Transactions</h3>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "2px solid #059669", color: "#059669", fontWeight: 700, fontSize: 16 }}>
                  <span style={{ flex: 1, textAlign: "left" }}>Date & Time</span>
                  <span style={{ flex: 1, textAlign: "left" }}>Amount</span>
                  <span style={{ flex: 1, textAlign: "left" }}>Transaction Code</span>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {[
                    { id: 1, date: "2026-01-23 15:42", amount: 1200, code: "MPESA123ABC" },
                    { id: 2, date: "2026-01-23 14:10", amount: 800, code: "Cash" },
                    { id: 3, date: "2026-01-23 13:55", amount: 500, code: "MPESA456DEF" },
                    { id: 4, date: "2026-01-23 12:30", amount: 300, code: "Cash" },
                  ].map(tx => (
                    <li key={tx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #bbf7d0", color: "#111", fontSize: 16 }}>
                      <span style={{ flex: 1, fontWeight: 700, textAlign: "left" }}>{tx.date}</span>
                      <span style={{ flex: 1, textAlign: "left" }}>Ksh {tx.amount.toFixed(2)}</span>
                      <span style={{ flex: 1, textAlign: "left" }}>{tx.code}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}
          {activeSection === "Inventory" && <InventorySection />}
          {activeSection === "Report" && (
            <section>
              <h2 style={{ color: "#059669", fontWeight: 800, fontSize: 26, marginBottom: 24 }}>Sales & Inventory Report</h2>
              {/* Sales Summary Charts (placeholder) */}
              <div style={{ display: "flex", gap: 32, marginBottom: 32 }}>
                <div style={{ flex: 1, background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px #bbf7d0", padding: 24, textAlign: "center" }}>
                  <div style={{ color: "#059669", fontWeight: 700, fontSize: 20, marginBottom: 12 }}>Top-Selling Products</div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "#111", fontSize: 16 }}>
                    <li>Apple - 120 pcs sold</li>
                    <li>Banana - 80 pcs sold</li>
                    <li>Potato - 70 kg sold</li>
                  </ul>
                </div>
                <div style={{ flex: 1, background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px #bbf7d0", padding: 24, textAlign: "center" }}>
                  <div style={{ color: "#059669", fontWeight: 700, fontSize: 20, marginBottom: 12 }}>Payment Breakdown</div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "#111", fontSize: 16 }}>
                    <li>Mpesa: Ksh 8,500.00</li>
                    <li>Cash: Ksh 7,300.00</li>
                  </ul>
                </div>
              </div>
              {/* Filterable Sales Table (placeholder) */}
              <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px #bbf7d0", padding: 24, marginBottom: 32 }}>
                <h3 style={{ color: "#059669", fontWeight: 700, fontSize: 20, marginBottom: 18, textAlign: "left" }}>Sales Table</h3>
                <input type="text" placeholder="Filter by product or date..." style={{ padding: 8, borderRadius: 8, border: "1px solid #16a34a", fontSize: 15, marginBottom: 12, minWidth: 180 }} />
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ color: "#16a34a", fontWeight: 700, fontSize: 16, textAlign: "left" }}>
                      <th style={{ padding: 8, borderBottom: "2px solid #bbf7d0", textAlign: "left" }}>Date</th>
                      <th style={{ padding: 8, borderBottom: "2px solid #bbf7d0", textAlign: "left" }}>Product</th>
                      <th style={{ padding: 8, borderBottom: "2px solid #bbf7d0", textAlign: "left" }}>Amount</th>
                      <th style={{ padding: 8, borderBottom: "2px solid #bbf7d0", textAlign: "left" }}>Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ color: "#111", fontSize: 15 }}>
                      <td style={{ padding: 8 }}>2026-01-23</td>
                      <td style={{ padding: 8 }}>Apple</td>
                      <td style={{ padding: 8 }}>Ksh 500.00</td>
                      <td style={{ padding: 8 }}>Mpesa</td>
                    </tr>
                    <tr style={{ color: "#111", fontSize: 15 }}>
                      <td style={{ padding: 8 }}>2026-01-23</td>
                      <td style={{ padding: 8 }}>Banana</td>
                      <td style={{ padding: 8 }}>Ksh 300.00</td>
                      <td style={{ padding: 8 }}>Cash</td>
                    </tr>
                  </tbody>
                </table>
                <button style={{ marginTop: 16, background: "#059669", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 700, cursor: "pointer" }}>Export to PDF</button>
              </div>
              {/* Low Stock Alerts */}
              <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px #bbf7d0", padding: 24, marginBottom: 32 }}>
                <h3 style={{ color: "#b91c1c", fontWeight: 700, fontSize: 20, marginBottom: 18 }}>Low Stock Alerts</h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "#b91c1c", fontSize: 16 }}>
                  <li>Onion: 8 left</li>
                  <li>Potato: 12 left</li>
                </ul>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
