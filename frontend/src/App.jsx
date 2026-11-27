
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import { useEffect, useState } from "react";

import { AuthProvider, useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/register";

import Sidebar from "./components/Sidebar";
import api from "./services/api";

import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Suppliers from "./pages/Suppliers";
import Transactions from "./pages/Transactions";
import LowStock from "./pages/LowStock";

function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <p>Checking authentication...</p>;
    }

    return isAuthenticated
        ? children
        : <Navigate to="/login" replace />;
}

function Dashboard() {
    const { user } = useAuth();

    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get("dashboard/summary/");
                setDashboardData(response.data);
            } catch (err) {
                setError(
                    err.response?.data?.detail ||
                    "Unable to load dashboard statistics."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <p>Loading dashboard...</p>;

    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <main className="dashboard-container">
                <h1>Inventory Management Dashboard</h1>

                <p>Welcome, {user?.username}!</p>

                <h2>Inventory Overview</h2>

                <div className="dashboard-stats">
                    <div>
                        <h3>Total Products</h3>
                        <p>{dashboardData.total_products}</p>
                    </div>

                    <div>
                        <h3>Total Categories</h3>
                        <p>{dashboardData.total_categories}</p>
                    </div>

                    <div>
                        <h3>Total Suppliers</h3>
                        <p>{dashboardData.total_suppliers}</p>
                    </div>

                    <div>
                        <h3>Low Stock Products</h3>
                        <p>{dashboardData.low_stock_count}</p>
                    </div>

                    <div>
                        <h3>Total Stock Units</h3>
                        <p>{dashboardData.total_stock_units}</p>
                    </div>
                </div>

                <h2>Recent Stock Transactions</h2>

                {dashboardData.recent_transactions.length === 0 ? (
                    <p>No transactions available.</p>
                ) : (
                    <ul>
                        {dashboardData.recent_transactions.map((transaction) => (
                            <li key={transaction.id}>
                                {transaction.product_name} —{" "}
                                {transaction.transaction_type_display} —{" "}
                                {transaction.quantity} units
                            </li>
                        ))}
                    </ul>
                )}
            </main>
        </div>
    );
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/products"
                element={
                    <ProtectedRoute>
                        <Products />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/categories"
                element={
                    <ProtectedRoute>
                        <Categories />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/suppliers"
                element={
                    <ProtectedRoute>
                        <Suppliers />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/transactions"
                element={
                    <ProtectedRoute>
                        <Transactions />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/low-stock"
                element={
                    <ProtectedRoute>
                        <LowStock />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/"
                element={<Navigate to="/dashboard" replace />}
            />

            <Route
                path="*"
                element={<Navigate to="/dashboard" replace />}
            />
        </Routes>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
