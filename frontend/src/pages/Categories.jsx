
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

const emptyForm = {
    name: "",
    description: "",
};

function Categories() {
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState("");
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

    const fetchCategories = async () => {
        setLoading(true);
        setError("");

        try {
            const params = { page };

            if (search.trim()) {
                params.search = search.trim();
            }

            const response = await api.get("categories/", { params });

            setCategories(response.data.results || response.data);
            setNextPage(response.data.next || null);
            setPreviousPage(response.data.previous || null);
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                "Unable to load categories."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [search, page]);

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

    const openEditForm = (category) => {
        setForm({
            name: category.name,
            description: category.description || "",
        });

        setEditingId(category.id);
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
                await api.put(`categories/${editingId}/`, form);
                setMessage("Category updated successfully.");
            } else {
                await api.post("categories/", form);
                setMessage("Category created successfully.");
            }

            setShowForm(false);
            setForm(emptyForm);
            setEditingId(null);
            setPage(1);

            await fetchCategories();
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
                    : "Unable to save category."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <main className="dashboard-container">
                <h1>Categories</h1>
                <p>Manage your product categories.</p>

                <button onClick={openCreateForm}>
                    Add Category
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
                            {editingId ? "Edit Category" : "Add Category"}
                        </h2>

                        <input
                            name="name"
                            placeholder="Category name"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />

                        <textarea
                            name="description"
                            placeholder="Category description"
                            value={form.description}
                            onChange={handleChange}
                        />

                        <button type="submit" disabled={saving}>
                            {saving
                                ? "Saving..."
                                : editingId
                                    ? "Update Category"
                                    : "Create Category"}
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
                        placeholder="Search categories..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>

                {loading ? (
                    <p>Loading categories...</p>
                ) : (
                    <div className="products-table-container">
                        <table className="products-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Category Name</th>
                                    <th>Description</th>
                                    <th>Created At</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {categories.length === 0 ? (
                                    <tr>
                                        <td colSpan="5">
                                            No categories found.
                                        </td>
                                    </tr>
                                ) : (
                                    categories.map((category) => (
                                        <tr key={category.id}>
                                            <td>{category.id}</td>
                                            <td>{category.name}</td>
                                            <td>{category.description || "N/A"}</td>
                                            <td>
                                                {category.created_at
                                                    ? new Date(
                                                        category.created_at
                                                    ).toLocaleDateString()
                                                    : "N/A"}
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() =>
                                                        openEditForm(category)
                                                    }
                                                >
                                                    Edit
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

export default Categories;
