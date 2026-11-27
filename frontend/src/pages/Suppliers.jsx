
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

const emptyForm = {
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    is_active: true,
};

function Suppliers() {
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

    const fetchSuppliers = async () => {
        setLoading(true);
        setError("");

        try {
            const params = { page };

            if (search.trim()) {
                params.search = search.trim();
            }

            if (status !== "") {
                params.is_active = status;
            }

            const response = await api.get("suppliers/", { params });

            setSuppliers(response.data.results || response.data);
            setNextPage(response.data.next || null);
            setPreviousPage(response.data.previous || null);
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                "Unable to load suppliers."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, [search, status, page]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const openCreateForm = () => {
        setForm(emptyForm);
        setEditingId(null);
        setError("");
        setMessage("");
        setShowForm(true);
    };

    const openEditForm = (supplier) => {
        setForm({
            name: supplier.name || "",
            contact_person: supplier.contact_person || "",
            email: supplier.email || "",
            phone: supplier.phone || "",
            address: supplier.address || "",
            is_active: supplier.is_active,
        });

        setEditingId(supplier.id);
        setError("");
        setMessage("");
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSaving(true);
        setError("");
        setMessage("");

        try {
            if (editingId) {
                await api.put(`suppliers/${editingId}/`, form);
                setMessage("Supplier updated successfully.");
            } else {
                await api.post("suppliers/", form);
                setMessage("Supplier created successfully.");
            }

            setShowForm(false);
            setForm(emptyForm);
            setEditingId(null);
            setPage(1);

            await fetchSuppliers();
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
                    : "Unable to save supplier."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleToggleStatus = async (supplier) => {
        setError("");
        setMessage("");

        try {
            await api.patch(`suppliers/${supplier.id}/`, {
                is_active: !supplier.is_active,
            });

            setMessage(
                `Supplier ${supplier.is_active ? "deactivated" : "activated"} successfully.`
            );

            await fetchSuppliers();
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                "Unable to update supplier status."
            );
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <main className="dashboard-container">
                <h1>Suppliers</h1>
                <p>Manage your inventory suppliers.</p>

                <button onClick={openCreateForm}>
                    Add Supplier
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
                        <h2>
                            {editingId ? "Edit Supplier" : "Add Supplier"}
                        </h2>

                        <input
                            name="name"
                            placeholder="Supplier name"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />

                        <input
                            name="contact_person"
                            placeholder="Contact person"
                            value={form.contact_person}
                            onChange={handleChange}
                        />

                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={handleChange}
                        />

                        <input
                            name="phone"
                            placeholder="Phone"
                            value={form.phone}
                            onChange={handleChange}
                        />

                        <textarea
                            name="address"
                            placeholder="Address"
                            value={form.address}
                            onChange={handleChange}
                        />

                        <label>
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={form.is_active}
                                onChange={(e) =>
                                    setForm((previous) => ({
                                        ...previous,
                                        is_active: e.target.checked,
                                    }))
                                }
                            />
                            Active supplier
                        </label>

                        <button type="submit" disabled={saving}>
                            {saving
                                ? "Saving..."
                                : editingId
                                    ? "Update Supplier"
                                    : "Create Supplier"}
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
                        placeholder="Search suppliers..."
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
                        <option value="">All Suppliers</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>
                </div>

                {loading ? (
                    <p>Loading suppliers...</p>
                ) : (
                    <div className="products-table-container">
                        <table className="products-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Contact Person</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {suppliers.length === 0 ? (
                                    <tr>
                                        <td colSpan="7">
                                            No suppliers found.
                                        </td>
                                    </tr>
                                ) : (
                                    suppliers.map((supplier) => (
                                        <tr key={supplier.id}>
                                            <td>{supplier.id}</td>
                                            <td>{supplier.name}</td>
                                            <td>{supplier.contact_person || "N/A"}</td>
                                            <td>{supplier.email || "N/A"}</td>
                                            <td>{supplier.phone || "N/A"}</td>
                                            <td>
                                                {supplier.is_active
                                                    ? "Active"
                                                    : "Inactive"}
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() =>
                                                        openEditForm(supplier)
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleToggleStatus(supplier)
                                                    }
                                                >
                                                    {supplier.is_active
                                                        ? "Deactivate"
                                                        : "Activate"}
                                                </button>
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

export default Suppliers;
    