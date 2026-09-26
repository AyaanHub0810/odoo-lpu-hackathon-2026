import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000/api";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [dashboard, setDashboard] = useState(null);
  const [stock, setStock] = useState([]);
  const [products, setProducts] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const [
        dashboardRes,
        stockRes,
        productsRes,
        receiptsRes,
        deliveriesRes,
        transfersRes,
        adjustmentsRes,
      ] = await Promise.all([
        fetch(`${API}/dashboard`),
        fetch(`${API}/stock`),
        fetch(`${API}/products`),
        fetch(`${API}/receipts`),
        fetch(`${API}/deliveries`),
        fetch(`${API}/transfers`),
        fetch(`${API}/adjustments`),
      ]);

      setDashboard(await dashboardRes.json());
      setStock(await stockRes.json());
      setProducts(await productsRes.json());
      setReceipts(await receiptsRes.json());
      setDeliveries(await deliveriesRes.json());
      setTransfers(await transfersRes.json());
      setAdjustments(await adjustmentsRes.json());
    } catch (error) {
      console.error("Frontend data loading error:", error);
    } finally {
      setLoading(false);
    }
  }

  const navItems = [
    { name: "Dashboard", icon: "▦" },
    { name: "Products", icon: "□" },
    { name: "Operations", icon: "⇄" },
  ];

  return (
    <div className="app">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">S</div>
          <div>
            <h2>StockSense</h2>
            <span>Inventory Management</span>
          </div>
        </div>

        <nav>
          {navItems.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${activePage === item.name ? "active" : ""
                }`}
              onClick={() => setActivePage(item.name)}
            >
              <span>{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="user-box">
            <div className="avatar">AI</div>
            <div>
              <strong>Inventory Manager</strong>
              <small>Admin</small>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">INVENTORY MANAGEMENT</p>
            <h1>{activePage}</h1>
          </div>

          <div className="top-actions">
            <button className="refresh-btn" onClick={loadData}>
              ↻ Refresh
            </button>
            <div className="profile">AI</div>
          </div>
        </header>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading StockSense...</p>
          </div>
        ) : (
          <>
            {activePage === "Dashboard" && (
              <Dashboard
                dashboard={dashboard}
                stock={stock}
                onRefresh={loadData}
              />
            )}

            {activePage === "Products" && (
              <Products products={products} stock={stock} />
            )}

            {activePage === "Operations" && (
              <Operations
                receipts={receipts}
                deliveries={deliveries}
                transfers={transfers}
                adjustments={adjustments}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}


/* ================= DASHBOARD ================= */

function Dashboard({ dashboard, stock }) {
  const stats = dashboard?.stock || {};
  const pending = dashboard?.pending || {};
  const movements = dashboard?.recent_movements || [];

  return (
    <div className="page-content">
      <div className="welcome">
        <div>
          <h2>Inventory Overview</h2>
          <p>
            Monitor your stock, warehouse activity and recent movements.
          </p>
        </div>
        <div className="live-badge">
          <span></span> Live data
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="stats-grid">
        <StatCard
          title="Total Stock"
          value={`${stats.total_stock || 0} kg`}
          subtitle="Across all locations"
          icon="▣"
        />

        <StatCard
          title="Low Stock"
          value={stats.low_stock_items || 0}
          subtitle="Items need attention"
          icon="!"
          warning
        />

        <StatCard
          title="Out of Stock"
          value={stats.out_of_stock_items || 0}
          subtitle="Currently unavailable"
          icon="×"
          danger
        />

        <StatCard
          title="Pending Operations"
          value={
            (pending.receipts || 0) +
            (pending.deliveries || 0) +
            (pending.transfers || 0)
          }
          subtitle="Awaiting validation"
          icon="◷"
        />
      </div>

      {/* STOCK BY LOCATION */}
      <div className="section-header">
        <div>
          <h2>Stock by Location</h2>
          <p>Current inventory across warehouses</p>
        </div>
      </div>

      <div className="location-grid">
        {stock.map((item) => (
          <div className="location-card" key={item.id}>
            <div className="location-top">
              <div className="location-icon">⌂</div>
              <span className="status-pill">{item.stock_status}</span>
            </div>

            <h3>{item.location_name}</h3>
            <p>{item.warehouse_name}</p>

            <div className="location-stock">
              <strong>{Number(item.quantity).toFixed(2)}</strong>
              <span>{item.unit_of_measure}</span>
            </div>

            <div className="stock-progress">
              <div
                style={{
                  width: `${Math.min(
                    (Number(item.quantity) /
                      Math.max(Number(item.reorder_level) * 5, 1)) *
                    100,
                    100
                  )}%`,
                }}
              ></div>
            </div>

            <small>
              Reorder level: {Number(item.reorder_level).toFixed(0)}{" "}
              {item.unit_of_measure}
            </small>
          </div>
        ))}
      </div>

      {/* RECENT MOVEMENTS */}
      <div className="section-header movement-header">
        <div>
          <h2>Recent Stock Movements</h2>
          <p>Latest inventory activity</p>
        </div>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Movement</th>
              <th>Quantity</th>
              <th>Reference</th>
            </tr>
          </thead>

          <tbody>
            {movements.map((movement) => (
              <tr key={movement.id}>
                <td>
                  <strong>{movement.product_name}</strong>
                </td>
                <td>{movement.sku}</td>
                <td>
                  <span
                    className={`movement-badge ${movement.movement_type
                      .toLowerCase()
                      .replace("_", "-")}`}
                  >
                    {movement.movement_type.replace("_", " ")}
                  </span>
                </td>
                <td>{Number(movement.quantity).toFixed(2)} kg</td>
                <td>
                  #{movement.reference_id}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


/* ================= PRODUCTS ================= */

function Products({ products, stock }) {
  return (
    <div className="page-content">
      <div className="welcome">
        <div>
          <h2>Products</h2>
          <p>Manage and monitor your inventory items.</p>
        </div>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Unit</th>
              <th>Stock</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => {
              const productStock = stock
                .filter((s) => s.product_id === product.id)
                .reduce(
                  (sum, s) => sum + Number(s.quantity),
                  0
                );

              return (
                <tr key={product.id}>
                  <td>
                    <strong>{product.name}</strong>
                  </td>
                  <td>{product.sku}</td>
                  <td>
                    {product.category_name || "General"}
                  </td>
                  <td>{product.unit_of_measure}</td>
                  <td>
                    <strong>{productStock.toFixed(2)}</strong>
                  </td>
                  <td>
                    <span className="status-pill">
                      {productStock > 0
                        ? "In Stock"
                        : "Out of Stock"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}


/* ================= OPERATIONS ================= */

function Operations({
  receipts,
  deliveries,
  transfers,
  adjustments,
}) {
  return (
    <div className="page-content">
      <div className="welcome">
        <div>
          <h2>Operations</h2>
          <p>Track all inventory operations and their status.</p>
        </div>
      </div>

      <div className="operation-cards">
        <OperationCard
          title="Receipts"
          count={receipts.length}
          description="Incoming stock"
          icon="↓"
        />

        <OperationCard
          title="Deliveries"
          count={deliveries.length}
          description="Outgoing stock"
          icon="↑"
        />

        <OperationCard
          title="Transfers"
          count={transfers.length}
          description="Internal movements"
          icon="⇄"
        />

        <OperationCard
          title="Adjustments"
          count={adjustments.length}
          description="Stock corrections"
          icon="±"
        />
      </div>

      <div className="operation-summary">
        <h2>Operation Summary</h2>

        <div className="summary-list">
          <SummaryRow
            name="Receipts"
            value={receipts.length}
          />
          <SummaryRow
            name="Deliveries"
            value={deliveries.length}
          />
          <SummaryRow
            name="Internal Transfers"
            value={transfers.length}
          />
          <SummaryRow
            name="Inventory Adjustments"
            value={adjustments.length}
          />
        </div>
      </div>
    </div>
  );
}


/* ================= COMPONENTS ================= */

function StatCard({
  title,
  value,
  subtitle,
  icon,
  warning,
  danger,
}) {
  return (
    <div
      className={`stat-card ${warning ? "warning" : ""} ${danger ? "danger" : ""
        }`}
    >
      <div className="stat-top">
        <div className="stat-icon">{icon}</div>
      </div>

      <h3>{title}</h3>
      <div className="stat-value">{value}</div>
      <p>{subtitle}</p>
    </div>
  );
}


function OperationCard({
  title,
  count,
  description,
  icon,
}) {
  return (
    <div className="operation-card">
      <div className="operation-icon">{icon}</div>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <strong>{count}</strong>
    </div>
  );
}


function SummaryRow({ name, value }) {
  return (
    <div className="summary-row">
      <span>{name}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default App;