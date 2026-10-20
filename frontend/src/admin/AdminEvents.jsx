
import { useCallback, useEffect, useState } from "react";
import {
    CalendarDays,
    MapPin,
    Plus,
    Search,
    Users,
    CheckCircle2,
    XCircle,
    Clock,
    Pencil,
    X,
    Loader2,
    RefreshCw,
    Eye,
    CalendarCheck,
    ClipboardList,
} from "lucide-react";
import "./AdminEvents.css";

const API_BASE = "http://127.0.0.1:8000/api";

const EMPTY_FORM = {
    title: "",
    description: "",
    venue: "",
    start_date: "",
    end_date: "",
    registration_start: "",
    registration_end: "",
    status: "draft",
};

const STATUSES = [
    "draft",
    "upcoming",
    "ongoing",
    "completed",
    "cancelled",
];

function getDateInput(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value).slice(0, 10);
    }

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
    ].join("-");
}

function formatDate(value) {
    if (!value) return "Not set";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function AdminEvents() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [showForm, setShowForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
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
                throw new Error("Your session expired. Please log in again.");
            }

            if (response.status === 422 && data.errors) {
                const firstError = Object.values(data.errors).flat()[0];
                throw new Error(firstError || "Please check your form.");
            }

            throw new Error(data.message || "The request failed.");
        }

        return data;
    }, []);

    const loadEvents = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await request("/admin/events");
            setEvents(Array.isArray(data.events) ? data.events : []);
        } catch (err) {
            setError(err.message || "Unable to load events.");
        } finally {
            setLoading(false);
        }
    }, [request]);

    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    const openCreateForm = () => {
        setEditingEvent(null);
        setForm(EMPTY_FORM);
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const openEditForm = (event) => {
        setEditingEvent(event);
        setForm({
            title: event.title || "",
            description: event.description || "",
            venue: event.venue || "",
            start_date: getDateInput(event.start_date),
            end_date: getDateInput(event.end_date),
            registration_start: getDateInput(event.registration_start),
            registration_end: getDateInput(event.registration_end),
            status: event.status || "draft",
        });
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingEvent(null);
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
                registration_start: form.registration_start || null,
                registration_end: form.registration_end || null,
            };

            const isEditing = Boolean(editingEvent);
            const endpoint = isEditing
                ? `/admin/events/${editingEvent.id}`
                : "/admin/events";

            const data = await request(endpoint, {
                method: isEditing ? "PUT" : "POST",
                body: JSON.stringify(payload),
            });

            closeForm();
            setSuccess(
                data.message ||
                    (isEditing
                        ? "Event updated successfully."
                        : "Event created successfully.")
            );

            await loadEvents();
        } catch (err) {
            setError(err.message || "Unable to save event.");
        } finally {
            setSaving(false);
        }
    };

    const filteredEvents = events.filter((event) => {
        const searchContent = [
            event.title,
            event.description,
            event.venue,
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        const matchesSearch = searchContent.includes(search.toLowerCase());
        const matchesStatus =
            statusFilter === "all" || event.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const upcomingCount = events.filter(
        (event) => event.status === "upcoming"
    ).length;

    const ongoingCount = events.filter(
        (event) => event.status === "ongoing"
    ).length;

    const totalRegistrations = events.reduce(
        (total, event) =>
            total + Number(event.registrations_count ?? 0),
        0
    );

    return (
        <div className="admin-events">
            <header className="ae-page-header">
                <div>
                    <div className="ae-eyebrow">MUNICIPAL PESO</div>
                    <h1>Event Management</h1>
                    <p>
                        Organize employment seminars, career guidance sessions,
                        livelihood orientations, and community activities.
                    </p>
                </div>

                <button
                    type="button"
                    className="ae-primary-button"
                    onClick={openCreateForm}
                >
                    <Plus size={18} />
                    Create Event
                </button>
            </header>

            {error && (
                <div className="ae-alert ae-alert-error" role="alert">
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
                <div className="ae-alert ae-alert-success" role="status">
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

            <section className="ae-stat-grid">
                <div className="ae-stat-card">
                    <div className="ae-stat-icon ae-navy">
                        <CalendarDays size={22} />
                    </div>
                    <div>
                        <span>Total Events</span>
                        <strong>{events.length}</strong>
                    </div>
                </div>

                <div className="ae-stat-card">
                    <div className="ae-stat-icon ae-gold">
                        <CalendarCheck size={22} />
                    </div>
                    <div>
                        <span>Upcoming Events</span>
                        <strong>{upcomingCount}</strong>
                    </div>
                </div>

                <div className="ae-stat-card">
                    <div className="ae-stat-icon ae-green">
                        <Clock size={22} />
                    </div>
                    <div>
                        <span>Ongoing Events</span>
                        <strong>{ongoingCount}</strong>
                    </div>
                </div>

                <div className="ae-stat-card">
                    <div className="ae-stat-icon ae-blue">
                        <Users size={22} />
                    </div>
                    <div>
                        <span>Total Registrations</span>
                        <strong>{totalRegistrations}</strong>
                    </div>
                </div>
            </section>

            <section className="ae-toolbar">
                <div className="ae-search">
                    <Search size={18} />
                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search events or venues..."
                        aria-label="Search events"
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    aria-label="Filter events by status"
                >
                    <option value="all">All statuses</option>
                    {STATUSES.map((status) => (
                        <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                    ))}
                </select>

                <button
                    type="button"
                    className="ae-icon-button"
                    onClick={loadEvents}
                    title="Refresh events"
                    aria-label="Refresh events"
                >
                    <RefreshCw size={17} />
                </button>
            </section>

            {loading ? (
                <div className="ae-state">
                    <Loader2 className="ae-spinner" size={30} />
                    <p>Loading events...</p>
                </div>
            ) : filteredEvents.length === 0 ? (
                <div className="ae-state">
                    <CalendarDays size={42} />
                    <h3>No events found</h3>
                    <p>
                        {events.length === 0
                            ? "Create your first municipal PESO event."
                            : "Try a different search or status filter."}
                    </p>
                    {events.length === 0 && (
                        <button
                            type="button"
                            className="ae-primary-button"
                            onClick={openCreateForm}
                        >
                            <Plus size={18} />
                            Create Event
                        </button>
                    )}
                </div>
            ) : (
                <div className="ae-table-wrap">
                    <table className="ae-table">
                        <thead>
                            <tr>
                                <th>Event</th>
                                <th>Schedule</th>
                                <th>Venue</th>
                                <th>Registrations</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredEvents.map((event) => (
                                <tr key={event.id}>
                                    <td>
                                        <div className="ae-event-title">
                                            {event.title}
                                        </div>
                                        <div className="ae-event-id">
                                            Event #{event.id}
                                        </div>
                                    </td>

                                    <td>
                                        <div className="ae-date">
                                            <CalendarDays size={15} />
                                            {formatDate(event.start_date)}
                                        </div>
                                        <div className="ae-subtext">
                                            to {formatDate(event.end_date)}
                                        </div>
                                    </td>

                                    <td>
                                        <div className="ae-venue">
                                            <MapPin size={15} />
                                            {event.venue || "Not specified"}
                                        </div>
                                    </td>

                                    <td>
                                        <span className="ae-registration-count">
                                            <Users size={15} />
                                            {Number(event.registrations_count ?? 0)}
                                            {" "}
                                            {Number(event.registrations_count ?? 0) === 1
                                                ? "participant"
                                                : "participants"}
                                        </span>
                                    </td>

                                    <td>
                                        <span
                                            className={`ae-status ae-status-${event.status}`}
                                        >
                                            {event.status || "unknown"}
                                        </span>
                                    </td>

                                    <td>
                                        <div className="ae-actions">
                                            <button
                                                type="button"
                                                className="ae-icon-button"
                                                title="View event details"
                                                aria-label={`View ${event.title}`}
                                                onClick={() =>
                                                    setSelectedEvent(event)
                                                }
                                            >
                                                <Eye size={17} />
                                            </button>

                                            <button
                                                type="button"
                                                className="ae-icon-button"
                                                title="Edit event"
                                                aria-label={`Edit ${event.title}`}
                                                onClick={() =>
                                                    openEditForm(event)
                                                }
                                            >
                                                <Pencil size={17} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="ae-footer-note">
                <ClipboardList size={16} />
                Showing {filteredEvents.length} of {events.length} events
            </div>

            {showForm && (
                <div
                    className="ae-modal-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeForm();
                        }
                    }}
                >
                    <section
                        className="ae-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="ae-form-title"
                    >
                        <header className="ae-modal-header">
                            <div>
                                <h2 id="ae-form-title">
                                    {editingEvent ? "Edit Event" : "Create Event"}
                                </h2>
                                <p>
                                    Provide the event details and schedule.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="ae-icon-button"
                                onClick={closeForm}
                                aria-label="Close form"
                            >
                                <X size={20} />
                            </button>
                        </header>

                        <form onSubmit={handleSubmit}>
                            <div className="ae-form-body">
                                <label>
                                    Event Title *
                                    <input
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        required
                                        maxLength={255}
                                        placeholder="e.g. Career Guidance Seminar"
                                    />
                                </label>

                                <label>
                                    Venue *
                                    <input
                                        name="venue"
                                        value={form.venue}
                                        onChange={handleChange}
                                        required
                                        maxLength={255}
                                        placeholder="Enter event venue"
                                    />
                                </label>

                                <label>
                                    Description
                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        rows={4}
                                        placeholder="Describe the event and its purpose..."
                                    />
                                </label>

                                <div className="ae-form-grid">
                                    <label>
                                        Start Date *
                                        <input
                                            type="date"
                                            name="start_date"
                                            value={form.start_date}
                                            onChange={handleChange}
                                            required
                                        />
                                    </label>

                                    <label>
                                        End Date *
                                        <input
                                            type="date"
                                            name="end_date"
                                            value={form.end_date}
                                            onChange={handleChange}
                                            min={form.start_date || undefined}
                                            required
                                        />
                                    </label>

                                    <label>
                                        Registration Opens
                                        <input
                                            type="date"
                                            name="registration_start"
                                            value={form.registration_start}
                                            onChange={handleChange}
                                        />
                                    </label>

                                    <label>
                                        Registration Closes
                                        <input
                                            type="date"
                                            name="registration_end"
                                            value={form.registration_end}
                                            onChange={handleChange}
                                            min={
                                                form.registration_start ||
                                                undefined
                                            }
                                        />
                                    </label>
                                </div>

                                <label>
                                    Event Status *
                                    <select
                                        name="status"
                                        value={form.status}
                                        onChange={handleChange}
                                        required
                                    >
                                        {STATUSES.map((status) => (
                                            <option key={status} value={status}>
                                                {status.charAt(0).toUpperCase() +
                                                    status.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            <footer className="ae-modal-footer">
                                <button
                                    type="button"
                                    className="ae-secondary-button"
                                    onClick={closeForm}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="ae-primary-button"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <Loader2
                                            size={17}
                                            className="ae-spinner"
                                        />
                                    ) : (
                                        <CheckCircle2 size={17} />
                                    )}
                                    {saving
                                        ? "Saving..."
                                        : editingEvent
                                          ? "Save Changes"
                                          : "Create Event"}
                                </button>
                            </footer>
                        </form>
                    </section>
                </div>
            )}

            {selectedEvent && (
                <div
                    className="ae-modal-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setSelectedEvent(null);
                        }
                    }}
                >
                    <section
                        className="ae-modal ae-details-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="ae-details-title"
                    >
                        <header className="ae-modal-header">
                            <div>
                                <h2 id="ae-details-title">
                                    {selectedEvent.title}
                                </h2>
                                <p>Event #{selectedEvent.id}</p>
                            </div>

                            <button
                                type="button"
                                className="ae-icon-button"
                                onClick={() => setSelectedEvent(null)}
                                aria-label="Close event details"
                            >
                                <X size={20} />
                            </button>
                        </header>

                        <div className="ae-details-body">
                            <div className="ae-detail-row">
                                <CalendarDays size={18} />
                                <div>
                                    <span>Schedule</span>
                                    <strong>
                                        {formatDate(selectedEvent.start_date)}
                                        {" — "}
                                        {formatDate(selectedEvent.end_date)}
                                    </strong>
                                </div>
                            </div>

                            <div className="ae-detail-row">
                                <MapPin size={18} />
                                <div>
                                    <span>Venue</span>
                                    <strong>
                                        {selectedEvent.venue || "Not specified"}
                                    </strong>
                                </div>
                            </div>

                            <div className="ae-detail-row">
                                <Users size={18} />
                                <div>
                                    <span>Registrations</span>
                                    <strong>
                                        {Number(
                                            selectedEvent.registrations_count ?? 0
                                        )}
                                        {" "}
                                        participants
                                    </strong>
                                </div>
                            </div>

                            <div className="ae-detail-row">
                                <CalendarCheck size={18} />
                                <div>
                                    <span>Status</span>
                                    <strong className="ae-detail-status">
                                        {selectedEvent.status}
                                    </strong>
                                </div>
                            </div>

                            <div className="ae-description">
                                <h3>Description</h3>
                                <p>
                                    {selectedEvent.description ||
                                        "No description provided."}
                                </p>
                            </div>
                        </div>

                        <footer className="ae-modal-footer">
                            <button
                                type="button"
                                className="ae-secondary-button"
                                onClick={() => setSelectedEvent(null)}
                            >
                                Close
                            </button>

                            <button
                                type="button"
                                className="ae-primary-button"
                                onClick={() => {
                                    const event = selectedEvent;
                                    setSelectedEvent(null);
                                    openEditForm(event);
                                }}
                            >
                                <Pencil size={17} />
                                Edit Event
                            </button>
                        </footer>
                    </section>
                </div>
            )}
        </div>
    );
}

export default AdminEvents;
