
import { useCallback, useEffect, useState } from "react";
import {
    Megaphone,
    Plus,
    Search,
    Eye,
    Pencil,
    X,
    Loader2,
    RefreshCw,
    CheckCircle2,
    XCircle,
    CalendarDays,
    Users,
    Building2,
    Globe,
    Clock,
} from "lucide-react";
import "./AdminAnnouncements.css";

const API_BASE = "http://127.0.0.1:8000/api";

const EMPTY_FORM = {
    title: "",
    content: "",
    visibility: "all",
    status: "draft",
    publish_at: "",
};

const STATUSES = ["draft", "published"];

const VISIBILITIES = [
    { value: "all", label: "Everyone" },
    { value: "jobseekers", label: "Jobseekers only" },
    { value: "employers", label: "Employers only" },
];

function toDateTimeInput(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatDate(value) {
    if (!value) return "Not scheduled";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function AdminAnnouncements() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [visibilityFilter, setVisibilityFilter] = useState("all");

    const [showForm, setShowForm] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);

    const request = useCallback(async (url, options = {}) => {
        const token = localStorage.getItem("pesoToken");

        const response = await fetch(`${API_BASE}${url}`, {
            ...options,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                ...options.headers,
            },
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("Your session has expired. Please log in again.");
            }

            if (response.status === 422 && data.errors) {
                const firstError = Object.values(data.errors).flat()[0];
                throw new Error(firstError || "Please check your form.");
            }

            throw new Error(data.message || "The request failed.");
        }

        return data;
    }, []);

    const loadAnnouncements = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await request("/admin/announcements");

            setAnnouncements(
                Array.isArray(data.announcements) ? data.announcements : []
            );
        } catch (err) {
            setError(err.message || "Unable to load announcements.");
        } finally {
            setLoading(false);
        }
    }, [request]);

    useEffect(() => {
        loadAnnouncements();
    }, [loadAnnouncements]);

    const openCreateForm = () => {
        setEditingAnnouncement(null);
        setForm(EMPTY_FORM);
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const openEditForm = (announcement) => {
        setEditingAnnouncement(announcement);

        setForm({
            title: announcement.title || "",
            content: announcement.content || "",
            visibility: announcement.visibility || "all",
            status: announcement.status || "draft",
            publish_at: toDateTimeInput(announcement.publish_at),
        });

        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingAnnouncement(null);
        setForm(EMPTY_FORM);
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const payload = {
                ...form,
                publish_at: form.publish_at
                    ? new Date(form.publish_at).toISOString()
                    : null,
            };

            const isEditing = Boolean(editingAnnouncement);
            const endpoint = isEditing
                ? `/admin/announcements/${editingAnnouncement.id}`
                : "/admin/announcements";

            const data = await request(endpoint, {
                method: isEditing ? "PUT" : "POST",
                body: JSON.stringify(payload),
            });

            closeForm();

            setSuccess(
                data.message ||
                    (isEditing
                        ? "Announcement updated successfully."
                        : "Announcement created successfully.")
            );

            await loadAnnouncements();
        } catch (err) {
            setError(err.message || "Unable to save announcement.");
        } finally {
            setSaving(false);
        }
    };

    const filteredAnnouncements = announcements.filter((announcement) => {
        const searchableText = [
            announcement.title,
            announcement.content,
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        const matchesSearch = searchableText.includes(search.toLowerCase());
        const matchesStatus =
            statusFilter === "all" ||
            announcement.status === statusFilter;
        const matchesVisibility =
            visibilityFilter === "all" ||
            announcement.visibility === visibilityFilter;

        return matchesSearch && matchesStatus && matchesVisibility;
    });

    const publishedCount = announcements.filter(
        (announcement) => announcement.status === "published"
    ).length;

    const draftCount = announcements.filter(
        (announcement) => announcement.status === "draft"
    ).length;

    const scheduledCount = announcements.filter(
        (announcement) =>
            announcement.publish_at &&
            new Date(announcement.publish_at).getTime() > Date.now()
    ).length;

    const getVisibilityLabel = (visibility) =>
        VISIBILITIES.find((item) => item.value === visibility)?.label ||
        visibility ||
        "Everyone";

    return (
        <div className="admin-announcements">
            <header className="aan-page-header">
                <div>
                    <div className="aan-eyebrow">MUNICIPAL PESO</div>
                    <h1>Announcements</h1>
                    <p>
                        Publish important employment updates and PESO
                        announcements for jobseekers and employers.
                    </p>
                </div>

                <button
                    type="button"
                    className="aan-primary-button"
                    onClick={openCreateForm}
                >
                    <Plus size={18} />
                    Create Announcement
                </button>
            </header>

            {error && (
                <div className="aan-alert aan-alert-error" role="alert">
                    <XCircle size={18} />
                    <span>{error}</span>
                    <button
                        type="button"
                        onClick={() => setError("")}
                        aria-label="Dismiss error"
                    >
                        <X size={17} />
                    </button>
                </div>
            )}

            {success && (
                <div className="aan-alert aan-alert-success" role="status">
                    <CheckCircle2 size={18} />
                    <span>{success}</span>
                    <button
                        type="button"
                        onClick={() => setSuccess("")}
                        aria-label="Dismiss success message"
                    >
                        <X size={17} />
                    </button>
                </div>
            )}

            <section className="aan-stat-grid">
                <div className="aan-stat-card">
                    <div className="aan-stat-icon aan-navy">
                        <Megaphone size={22} />
                    </div>
                    <div>
                        <span>Total Announcements</span>
                        <strong>{announcements.length}</strong>
                    </div>
                </div>

                <div className="aan-stat-card">
                    <div className="aan-stat-icon aan-green">
                        <CheckCircle2 size={22} />
                    </div>
                    <div>
                        <span>Published</span>
                        <strong>{publishedCount}</strong>
                    </div>
                </div>

                <div className="aan-stat-card">
                    <div className="aan-stat-icon aan-gold">
                        <Pencil size={22} />
                    </div>
                    <div>
                        <span>Drafts</span>
                        <strong>{draftCount}</strong>
                    </div>
                </div>

                <div className="aan-stat-card">
                    <div className="aan-stat-icon aan-blue">
                        <Clock size={22} />
                    </div>
                    <div>
                        <span>Future Publish Dates</span>
                        <strong>{scheduledCount}</strong>
                    </div>
                </div>
            </section>

            <section className="aan-toolbar">
                <div className="aan-search">
                    <Search size={18} />
                    <input
                        type="search"
                        placeholder="Search announcements..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        aria-label="Search announcements"
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    aria-label="Filter by publication status"
                >
                    <option value="all">All statuses</option>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                </select>

                <select
                    value={visibilityFilter}
                    onChange={(event) =>
                        setVisibilityFilter(event.target.value)
                    }
                    aria-label="Filter by audience"
                >
                    <option value="all">All audiences</option>
                    <option value="all">Everyone</option>
                    <option value="jobseekers">Jobseekers</option>
                    <option value="employers">Employers</option>
                </select>

                <button
                    type="button"
                    className="aan-icon-button"
                    onClick={loadAnnouncements}
                    title="Refresh announcements"
                    aria-label="Refresh announcements"
                >
                    <RefreshCw size={17} />
                </button>
            </section>

            {loading ? (
                <div className="aan-state">
                    <Loader2 className="aan-spinner" size={30} />
                    <p>Loading announcements...</p>
                </div>
            ) : filteredAnnouncements.length === 0 ? (
                <div className="aan-state">
                    <Megaphone size={42} />
                    <h3>No announcements found</h3>
                    <p>
                        {announcements.length === 0
                            ? "Create your first announcement to get started."
                            : "Try changing your search or filters."}
                    </p>

                    {announcements.length === 0 && (
                        <button
                            type="button"
                            className="aan-primary-button"
                            onClick={openCreateForm}
                        >
                            <Plus size={18} />
                            Create Announcement
                        </button>
                    )}
                </div>
            ) : (
                <div className="aan-list">
                    {filteredAnnouncements.map((announcement) => (
                        <article
                            className="aan-card"
                            key={announcement.id}
                        >
                            <div className="aan-card-icon">
                                <Megaphone size={22} />
                            </div>

                            <div className="aan-card-content">
                                <div className="aan-card-topline">
                                    <span
                                        className={`aan-status aan-status-${announcement.status}`}
                                    >
                                        {announcement.status}
                                    </span>

                                    <span className="aan-audience">
                                        {announcement.visibility === "all" ? (
                                            <Globe size={14} />
                                        ) : announcement.visibility ===
                                          "employers" ? (
                                            <Building2 size={14} />
                                        ) : (
                                            <Users size={14} />
                                        )}
                                        {getVisibilityLabel(
                                            announcement.visibility
                                        )}
                                    </span>
                                </div>

                                <h2>{announcement.title}</h2>

                                <p className="aan-card-preview">
                                    {announcement.content}
                                </p>

                                <div className="aan-card-meta">
                                    <span>
                                        <CalendarDays size={14} />
                                        Created{" "}
                                        {formatDate(announcement.created_at)}
                                    </span>

                                    {announcement.publish_at && (
                                        <span>
                                            <Clock size={14} />
                                            Publish date:{" "}
                                            {formatDate(announcement.publish_at)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="aan-card-actions">
                                <button
                                    type="button"
                                    className="aan-secondary-button"
                                    onClick={() =>
                                        setSelectedAnnouncement(announcement)
                                    }
                                >
                                    <Eye size={16} />
                                    View
                                </button>

                                <button
                                    type="button"
                                    className="aan-primary-button"
                                    onClick={() =>
                                        openEditForm(announcement)
                                    }
                                >
                                    <Pencil size={16} />
                                    Edit
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            <div className="aan-footer-note">
                <Megaphone size={16} />
                Showing {filteredAnnouncements.length} of{" "}
                {announcements.length} announcements
            </div>

            {showForm && (
                <div
                    className="aan-modal-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeForm();
                        }
                    }}
                >
                    <section
                        className="aan-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="aan-form-title"
                    >
                        <header className="aan-modal-header">
                            <div>
                                <h2 id="aan-form-title">
                                    {editingAnnouncement
                                        ? "Edit Announcement"
                                        : "Create Announcement"}
                                </h2>
                                <p>
                                    Write your announcement and choose its
                                    audience.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="aan-icon-button"
                                onClick={closeForm}
                                aria-label="Close form"
                            >
                                <X size={20} />
                            </button>
                        </header>

                        <form onSubmit={handleSubmit}>
                            <div className="aan-form-body">
                                <label>
                                    Announcement Title *
                                    <input
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        maxLength={255}
                                        required
                                        placeholder="Enter a clear announcement title"
                                    />
                                </label>

                                <label>
                                    Announcement Content *
                                    <textarea
                                        name="content"
                                        value={form.content}
                                        onChange={handleChange}
                                        rows={7}
                                        required
                                        placeholder="Write the announcement details here..."
                                    />
                                </label>

                                <div className="aan-form-grid">
                                    <label>
                                        Audience *
                                        <select
                                            name="visibility"
                                            value={form.visibility}
                                            onChange={handleChange}
                                            required
                                        >
                                            {VISIBILITIES.map((item) => (
                                                <option
                                                    key={item.value}
                                                    value={item.value}
                                                >
                                                    {item.label}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label>
                                        Publication Status *
                                        <select
                                            name="status"
                                            value={form.status}
                                            onChange={handleChange}
                                            required
                                        >
                                            {STATUSES.map((status) => (
                                                <option
                                                    key={status}
                                                    value={status}
                                                >
                                                    {status === "draft"
                                                        ? "Save as Draft"
                                                        : "Published"}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                </div>

                                <label>
                                    Publish Date and Time (Optional)
                                    <input
                                        type="datetime-local"
                                        name="publish_at"
                                        value={form.publish_at}
                                        onChange={handleChange}
                                    />
                                    <small>
                                        Leave blank to omit a scheduled
                                        publication time.
                                    </small>
                                </label>
                            </div>

                            <footer className="aan-modal-footer">
                                <button
                                    type="button"
                                    className="aan-secondary-button"
                                    onClick={closeForm}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="aan-primary-button"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <Loader2
                                            size={17}
                                            className="aan-spinner"
                                        />
                                    ) : (
                                        <CheckCircle2 size={17} />
                                    )}

                                    {saving
                                        ? "Saving..."
                                        : editingAnnouncement
                                          ? "Save Changes"
                                          : "Create Announcement"}
                                </button>
                            </footer>
                        </form>
                    </section>
                </div>
            )}

            {selectedAnnouncement && (
                <div
                    className="aan-modal-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setSelectedAnnouncement(null);
                        }
                    }}
                >
                    <section
                        className="aan-modal aan-details-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="aan-details-title"
                    >
                        <header className="aan-modal-header">
                            <div>
                                <span
                                    className={`aan-status aan-status-${selectedAnnouncement.status}`}
                                >
                                    {selectedAnnouncement.status}
                                </span>
                                <h2 id="aan-details-title">
                                    {selectedAnnouncement.title}
                                </h2>
                            </div>

                            <button
                                type="button"
                                className="aan-icon-button"
                                onClick={() =>
                                    setSelectedAnnouncement(null)
                                }
                                aria-label="Close announcement details"
                            >
                                <X size={20} />
                            </button>
                        </header>

                        <div className="aan-details-body">
                            <div className="aan-detail-meta">
                                <span>
                                    <Users size={15} />
                                    {getVisibilityLabel(
                                        selectedAnnouncement.visibility
                                    )}
                                </span>

                                <span>
                                    <CalendarDays size={15} />
                                    Created{" "}
                                    {formatDate(
                                        selectedAnnouncement.created_at
                                    )}
                                </span>

                                {selectedAnnouncement.publish_at && (
                                    <span>
                                        <Clock size={15} />
                                        Publish date:{" "}
                                        {formatDate(
                                            selectedAnnouncement.publish_at
                                        )}
                                    </span>
                                )}
                            </div>

                            <div className="aan-full-content">
                                {selectedAnnouncement.content}
                            </div>
                        </div>

                        <footer className="aan-modal-footer">
                            <button
                                type="button"
                                className="aan-secondary-button"
                                onClick={() =>
                                    setSelectedAnnouncement(null)
                                }
                            >
                                Close
                            </button>

                            <button
                                type="button"
                                className="aan-primary-button"
                                onClick={() => {
                                    const announcement = selectedAnnouncement;
                                    setSelectedAnnouncement(null);
                                    openEditForm(announcement);
                                }}
                            >
                                <Pencil size={16} />
                                Edit Announcement
                            </button>
                        </footer>
                    </section>
                </div>
            )}
        </div>
    );
}

export default AdminAnnouncements;
