
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

const emptyForm = {
    product: "",
    transaction_type: "IN",
    quantity: "",
    note: "",
};

function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [products, setProducts] = useState([]);

    const [search, setSearch] = useState("");
    const [type, setType] = useState("");
    const [page, setPage] = useState(1);

    const [nextPage, setNextPage] = useState(null);
    const [previousPage, setPreviousPage] = useState(null);

    const [form, setForm] = useState(emptyForm);
    const [showForm, setShowForm] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const fetchTransactions = async () => {
        setLoading(true);
        setError("");

        try {
            const params = { page };

            if (search.trim()) {
                params.search = search.trim();
            }

            if (type) {
                params.transaction_type = type;
            }

            const response = await api.get("transactions/", { params });

            setTransactions(response.data.results || response.data);
            setNextPage(response.data.next || null);
            setPreviousPage(response.data.previous || null);
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                "Unable to load transactions."
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await api.get("products/", {
                params: { page_size: 100 },
            });

            setProducts(
                (response.data.results || response.data).filter(
                    (product) => product.is_active
                )
            );
        } catch {
            setError("Unable to load products.");
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [search, type, page]);

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSaving(true);
        setError("");
        setMessage("");

        try {
            await api.post("transactions/", {
                product: Number(form.product),
                transaction_type: form.transaction_type,
                quantity: Number(form.quantity),
                note: form.note,
            });

            setMessage("Stock transaction recorded successfully.");
            setForm(emptyForm);
            setShowForm(false);
            setPage(1);

            await fetchTransactions();
        } catch (err) {
            const data = err.response?.data;

            setError(
                typeof data === "object"
                    ? Object.entries(data)
                        .map(([field, errors]) =>
                            `${field}: ${Array.isArray(errors)
                                ? errors.join(", ")
                                : errors}`
                        )
                        .join(" | ")
                    : "Unable to record transaction."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <main className="dashboard-container">
                <h1>Stock Transactions</h1>
                <p>Manage stock movements and transaction history.</p>

                <button
                    onClick={() => {
                        setForm(emptyForm);
                        setError("");
                        setMessage("");
                        setShowForm(true);
                    }}
                >
                    Record Stock Transaction
                </button>

                {message && (
                    <p className="success-message">{message}</p>
                )}

                {error && (
                    <p className="error-message">{error}</p>
                )}

                {showForm && (
                    <form
                        className="category-form"
                        onSubmit={handleSubmit}
                    >
                        <h2>New Stock Transaction</h2>

                        <label>Product</label>

                        <select
                            name="product"
                            value={form.product}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Product</option>

                            {products.map((product) => (
                                <option
                                    key={product.id}
                                    value={product.id}
                                >
                                    {product.name} — {product.sku}
                                    {" "} (Stock: {product.stock_quantity})
                                </option>
                            ))}
                        </select>

                        <label>Transaction Type</label>

                        <select
                            name="transaction_type"
                            value={form.transaction_type}
                            onChange={handleChange}
                            required
                        >
                            <option value="IN">Stock In</option>
                            <option value="OUT">Stock Out</option>
                            <option value="ADJUSTMENT">Adjustment</option>
                        </select>

                        <label>
                            {form.transaction_type === "ADJUSTMENT"
                                ? "Actual Stock Quantity"
                                : "Quantity"}
                        </label>

                        <input
                            type="number"
                            name="quantity"
                            min="1"
                            value={form.quantity}
                            onChange={handleChange}
                            placeholder="Enter quantity"
                            required
                        />

                        <label>Note</label>

                        <textarea
                            name="note"
                            value={form.note}
                            onChange={handleChange}
                            placeholder="Transaction notes"
                        />

                        <button type="submit" disabled={saving}>
                            {saving ? "Saving..." : "Submit Transaction"}
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                        >
                            Cancel
                        </button>
                    </form>
                )}

                <div className="category-search">
                    <input
                        placeholder="Search transactions..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />

                    <select
                        value={type}
                        onChange={(e) => {
                            setType(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">All Transactions</option>
                        <option value="IN">Stock In</option>
                        <option value="OUT">Stock Out</option>
                        <option value="ADJUSTMENT">Adjustment</option>
                    </select>
                </div>

                {loading ? (
                    <p>Loading transactions...</p>
                ) : (
                    <div className="products-table-container">
                        <table className="products-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Product</th>
                                    <th>Type</th>
                                    <th>Quantity</th>
                                    <th>Created By</th>
                                    <th>Date</th>
                                    <th>Note</th>
                                </tr>
                            </thead>

                            <tbody>
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="7">
                                            No transactions found.
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((transaction) => (
                                        <tr key={transaction.id}>
                                            <td>{transaction.id}</td>
                                            <td>{transaction.product_name}</td>
                                            <td>
                                                {transaction.transaction_type_display}
                                            </td>
                                            <td>{transaction.quantity}</td>
                                            <td>
                                                {transaction.created_by_username || "N/A"}
                                            </td>
                                            <td>
                                                {transaction.created_at
                                                    ? new Date(
                                                        transaction.created_at
                                                    ).toLocaleString()
                                                    : "N/A"}
                                            </td>
                                            <td>{transaction.note || "N/A"}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="pagination-controls">
                    <button
                        disabled={!previousPage || loading}
                        onClick={() => setPage((p) => p - 1)}
                    >
                        Previous
                    </button>

                    <span>Page {page}</span>

                    <button
                        disabled={!nextPage || loading}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Next
                    </button>
                </div>
            </main>
        </div>
    );
}

export default Transactions;
