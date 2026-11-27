
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <aside className="sidebar">
            <h2 className="sidebar-title">
                Inventory System
            </h2>

            <nav className="sidebar-nav">
                <NavLink to="/dashboard">
                    Dashboard
                </NavLink>

                <NavLink to="/products">
                    Products
                </NavLink>

                <NavLink to="/categories">
                    Categories
                </NavLink>

                <NavLink to="/suppliers">
                    Suppliers
                </NavLink>

                <NavLink to="/transactions">
                    Stock Transactions
                </NavLink>

                <NavLink to="/low-stock">
                    Low Stock
                </NavLink>
            </nav>

            <button
                className="sidebar-logout"
                onClick={handleLogout}
            >
                Logout
            </button>
        </aside>
    );
}

export default Sidebar;
