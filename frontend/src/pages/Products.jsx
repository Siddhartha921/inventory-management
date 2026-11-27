
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

const emptyForm = {
    name: "",
    sku: "",
    description: "",
    category: "",
    supplier: "",
    cost_price: "",
    selling_price: "",
    reorder_level: 5,
    is_active: true,
};

function Products() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [nextPage, setNextPage] = useState(null);
    const [previousPage, setPreviousPage] = useState(null);

    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const fetchProducts = async () => {
        setLoading(true);
        setError("");

        try {
            const params = { page };

            if (search.trim()) params.search = search.trim();
            if (status !== "") params.is_active = status;

            const response = await api.get("products/", { params });

            setProducts(response.data.results || response.data);
            setNextPage(response.data.next || null);
            setPreviousPage(response.data.previous || null);
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                "Unable to load products."
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchFormOptions = async () => {
        try {
            const [categoryResponse, supplierResponse] =
                await Promise.all([
                    api.get("categories/"),
                    api.get("suppliers/"),
                ]);

            setCategories(
                categoryResponse.data.results || categoryResponse.data
            );

            setSuppliers(
                supplierResponse.data.results || supplierResponse.data
            );
        } catch {
            setError("Unable to load categories or suppliers.");
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [search, status, page]);

    useEffect(() => {
        fetchFormOptions();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const openCreateForm = () => {
        setForm(emptyForm);
        setEditingId(null);
        setMessage("");
        setError("");
        setShowForm(true);
    };

    const openEditForm = (product) => {
        setForm({
            name: product.name,
            sku: product.sku,
            description: product.description || "",
            category: String(product.category),
            supplier: product.supplier
                ? String(product.supplier)
                : "",
            cost_price: product.cost_price,
            selling_price: product.selling_price,
            reorder_level: product.reorder_level,
            is_active: product.is_active,
        });

        setEditingId(product.id);
        setMessage("");
        setError("");
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setMessage("");

        const payload = {
            ...form,
            category: Number(form.category),
            supplier: form.supplier
                ? Number(form.supplier)
                : null,
            cost_price: Number(form.cost_price),
            selling_price: Number(form.selling_price),
            reorder_level: Number(form.reorder_level),
        };

        try {
            if (editingId) {
                await api.put(`products/${editingId}/`, payload);
                setMessage("Product updated successfully.");
            } else {
                await api.post("products/", payload);
                setMessage("Product created successfully.");
            }

            setShowForm(false);
            setForm(emptyForm);
            setEditingId(null);
            setPage(1);
            await fetchProducts();
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
                    : "Unable to save product."
            );
        } finally {
            setSaving(false);
        }
    };

    // Activate or deactivate a product.
    const handleToggleStatus = async (product) => {
        const action = product.is_active ? "deactivate" : "activate";

        if (!window.confirm(
            `Are you sure you want to ${action} this product?`
        )) {
            return;
        }

        setError("");
        setMessage("");

        try {
            await api.patch(`products/${product.id}/`, {
                is_active: !product.is_active,
            });

            setMessage(`Product ${action}d successfully.`);
            await fetchProducts();
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                `Unable to ${action} product.`
            );
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <main className="dashboard-container">
                <h1>Products</h1>
                <p>Manage your inventory products.</p>

                <button onClick={openCreateForm}>
                    Add Product
                </button>

                {message && (
                    <p className="success-message">{message}</p>
                )}

                {error && (
                    <p className="error-message">{error}</p>
                )}

                {showForm && (
                    <form
                        className="product-form"
                        onSubmit={handleSubmit}
                    >
                        <h2>
                            {editingId ? "Edit Product" : "Add Product"}
                        </h2>

                        <input
                            name="name"
                            placeholder="Product name"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />

                        <input
                            name="sku"
                            placeholder="SKU"
                            value={form.sku}
                            onChange={handleChange}
                            required
                        />

                        <textarea
                            name="description"
                            placeholder="Description"
                            value={form.description}
                            onChange={handleChange}
                        />

                        <select
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select category</option>

                            {categories.map((category) => (
                                <option
                                    key={category.id}
                                    value={category.id}
                                >
                                    {category.name}
                                </option>
                            ))}
                        </select>

                        <select
                            name="supplier"
                            value={form.supplier}
                            onChange={handleChange}
                        >
                            <option value="">No supplier</option>

                            {suppliers.map((supplier) => (
                                <option
                                    key={supplier.id}
                                    value={supplier.id}
                                >
                                    {supplier.name}
                                </option>
                            ))}
                        </select>

                        <input
                            name="cost_price"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Cost price"
                            value={form.cost_price}
                            onChange={handleChange}
                            required
                        />

                        <input
                            name="selling_price"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Selling price"
                            value={form.selling_price}
                            onChange={handleChange}
                            required
                        />

                        <input
                            name="reorder_level"
                            type="number"
                            min="0"
                            placeholder="Reorder level"
                            value={form.reorder_level}
                            onChange={handleChange}
                            required
                        />

                        <label>
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={form.is_active}
                                onChange={handleChange}
                            />
                            Active product
                        </label>

                        <button type="submit" disabled={saving}>
                            {saving
                                ? "Saving..."
                                : editingId
                                    ? "Update Product"
                                    : "Create Product"}
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                        >
                            Cancel
                        </button>
                    </form>
                )}

                <div className="product-controls">
                    <input
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />

                    <select
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">All Products</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>
                </div>

                {loading ? (
                    <p>Loading products...</p>
                ) : (
                    <div className="products-table-container">
                        <table className="products-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>SKU</th>
                                    <th>Category</th>
                                    <th>Supplier</th>
                                    <th>Cost</th>
                                    <th>Selling</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan="9">
                                            No products found.
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((product) => (
                                        <tr key={product.id}>
                                            <td>{product.name}</td>
                                            <td>{product.sku}</td>
                                            <td>{product.category_name}</td>
                                            <td>
                                                {product.supplier_name || "N/A"}
                                            </td>
                                            <td>₹{product.cost_price}</td>
                                            <td>₹{product.selling_price}</td>
                                            <td>{product.stock_quantity}</td>
                                            <td>
                                                {product.is_active
                                                    ? "Active"
                                                    : "Inactive"}
                                            </td>
                                            <td>
                                                <div className="product-actions">
                                                    <button
                                                        onClick={() =>
                                                            openEditForm(product)
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        className="toggle-status-button"
                                                        onClick={() =>
                                                            handleToggleStatus(product)
                                                        }
                                                    >
                                                        {product.is_active
                                                            ? "Deactivate"
                                                            : "Activate"}
                                                    </button>
                                                </div>
                                            </td>
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

export default Products;
