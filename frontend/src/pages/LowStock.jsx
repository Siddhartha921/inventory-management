
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

function LowStock() {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchLowStock = async () => {
            try {
                const response = await api.get("products/low-stock/");
                setProducts(response.data.results || response.data);
            } catch (err) {
                setError(
                    err.response?.data?.detail ||
                    "Unable to load low-stock products."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchLowStock();
    }, []);

    const filteredProducts = products.filter((product) =>
        `${product.name} ${product.sku}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <main className="dashboard-container">
                <h1>Low Stock Products</h1>
                <p>Products that have reached or fallen below their reorder level.</p>

                <h2>Low Stock Items: {products.length}</h2>

                <div className="category-search">
                    <input
                        placeholder="Search by product name or SKU..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {error && <p className="error-message">{error}</p>}

                {loading ? (
                    <p>Loading low-stock products...</p>
                ) : filteredProducts.length === 0 ? (
                    <p>No low-stock products found.</p>
                ) : (
                    <div className="products-table-container">
                        <table className="products-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>SKU</th>
                                    <th>Category</th>
                                    <th>Current Stock</th>
                                    <th>Reorder Level</th>
                                    <th>Shortage</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredProducts.map((product) => (
                                    <tr key={product.id}>
                                        <td>{product.name}</td>
                                        <td>{product.sku}</td>
                                        <td>{product.category_name || "N/A"}</td>
                                        <td>{product.stock_quantity}</td>
                                        <td>{product.reorder_level}</td>
                                        <td>
                                            {Math.max(
                                                0,
                                                product.reorder_level -
                                                product.stock_quantity
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}

export default LowStock;
