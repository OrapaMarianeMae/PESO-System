
import { useCallback, useEffect, useState } from "react";
import {
    CalendarDays,
    MapPin,
    Plus,
    Search,
    Users,
    Building2,
    Briefcase,
    CheckCircle2,
    XCircle,
    Clock,
    Pencil,
    X,
    Loader2,
    RefreshCw,
    Eye,
    CalendarCheck,
} from "lucide-react";
import "./AdminJobFairs.css";

const API_BASE = "http://127.0.0.1:8000/api";

const emptyForm = {
    title: "",
    description: "",
    venue: "",
    start_date: "",
    end_date: "",
    registration_start: "",
    registration_end: "",
    status: "draft",
};

const statusOptions = [
    "draft",
    "upcoming",
    "ongoing",
    "completed",
    "cancelled",
];

function getToken() {
    return localStorage.getItem("pesoToken");
}

function formatDate(value) {
    if (!value) return "Not set";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function toDateInput(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value).slice(0, 10);
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getEmployerName(registration) {
    const employer = registration?.employer;

    if (!employer) return "Employer";

    const profile = employer.employer_profile || employer.employerProfile;

    return (
        profile?.company_name ||
        employer.company_name ||
        [
            employer.first_name,
            employer.middle_name,
            employer.surname,
        ]
            .filter(Boolean)
            .join(" ") ||
        employer.name ||
        employer.email ||
        "Employer"
    );
}

function AdminJobFairs() {
    const [jobFairs, setJobFairs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [showForm, setShowForm] = useState(false);
    const [editingFair, setEditingFair] = useState(null);
    const [form, setForm] = useState(emptyForm);

    const [selectedFair, setSelectedFair] = useState(null);
    const [updatingRegistration, setUpdatingRegistration] = useState(null);

    const request = useCallback(async (url, options = {}) => {
        const response = await fetch(`${API_BASE}${url}`, {
            ...options,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}`,
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
                throw new Error(firstError || "Please check the form fields.");
            }

            throw new Error(
                data.message || "The request could not be completed."
            );
        }

        return data;
    }, []);

    const loadJobFairs = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await request("/admin/job-fairs");
            setJobFairs(Array.isArray(data.job_fairs) ? data.job_fairs : []);
        } catch (err) {
            setError(err.message || "Unable to load job fairs.");
        } finally {
            setLoading(false);
        }
    }, [request]);

    useEffect(() => {
        loadJobFairs();
    }, [loadJobFairs]);

    const openCreateForm = () => {
        setEditingFair(null);
        setForm(emptyForm);
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const openEditForm = (fair) => {
        setEditingFair(fair);
        setForm({
            title: fair.title || "",
            description: fair.description || "",
            venue: fair.venue || "",
            start_date: toDateInput(fair.start_date),
            end_date: toDateInput(fair.end_date),
            registration_start: toDateInput(fair.registration_start),
            registration_end: toDateInput(fair.registration_end),
            status: fair.status || "draft",
        });
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingFair(null);
        setForm(emptyForm);
    };

    const handleFormChange = (event) => {
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

            const isEditing = Boolean(editingFair);
            const endpoint = isEditing
                ? `/admin/job-fairs/${editingFair.id}`
                : "/admin/job-fairs";

            const data = await request(endpoint, {
                method: isEditing ? "PUT" : "POST",
                body: JSON.stringify(payload),
            });

            setSuccess(
                data.message ||
                    (isEditing
                        ? "Job fair updated successfully."
                        : "Job fair created successfully.")
            );

            closeForm();
            await loadJobFairs();
        } catch (err) {
            setError(err.message || "Unable to save the job fair.");
        } finally {
            setSaving(false);
        }
    };

    const updateEmployerStatus = async (registration, status) => {
        if (!registration?.id) {
            setError("The employer registration ID is missing.");
            return;
        }

        setUpdatingRegistration(registration.id);
        setError("");
        setSuccess("");

        try {
            const data = await request(
                `/admin/job-fairs/employers/${registration.id}/status`,
                {
                    method: "PUT",
                    body: JSON.stringify({ status }),
                }
            );

            setSuccess(data.message || "Employer participation updated.");
            await loadJobFairs();

            if (selectedFair) {
                const refreshed = await request("/admin/job-fairs");
                const fairs = Array.isArray(refreshed.job_fairs)
                    ? refreshed.job_fairs
                    : [];

                setJobFairs(fairs);
                setSelectedFair(
                    fairs.find((fair) => fair.id === selectedFair.id) || null
                );
            }
        } catch (err) {
            setError(err.message || "Unable to update employer participation.");
        } finally {
            setUpdatingRegistration(null);
        }
    };

    const filteredFairs = jobFairs.filter((fair) => {
        const searchText = [
            fair.title,
            fair.venue,
            fair.description,
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        const matchesSearch = searchText.includes(search.toLowerCase());
        const matchesStatus =
            statusFilter === "all" || fair.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const totalEmployers = jobFairs.reduce(
        (total, fair) =>
            total +
            Number(
                fair.employer_registrations_count ??
                    fair.employerRegistrations?.length ??
                    0
            ),
        0
    );

    const totalJobseekers = jobFairs.reduce(
        (total, fair) =>
            total +
            Number(
                fair.jobseeker_registrations_count ??
                    fair.jobseekerRegistrations?.length ??
                    0
            ),
        0
    );

    const upcomingCount = jobFairs.filter(
        (fair) => fair.status === "upcoming"
    ).length;

    const pendingRegistrations = jobFairs.reduce(
        (total, fair) =>
            total +
            (fair.employer_registrations || fair.employerRegistrations || [])
                .filter((registration) => registration.status === "pending")
                .length,
        0
    );

    const getEmployerRegistrations = (fair) =>
        fair?.employer_registrations || fair?.employerRegistrations || [];

    const getJobseekerRegistrations = (fair) =>
        fair?.jobseeker_registrations || fair?.jobseekerRegistrations || [];

    return (
        <div className="admin-job-fairs">
            <div className="ajf-page-header">
                <div>
                    <div className="ajf-eyebrow">EVENT MANAGEMENT</div>
                    <h1>Job Fair Management</h1>
                    <p>
                        Create job fairs, manage schedules, and review employer
                        participation.
                    </p>
                </div>

                <button
                    type="button"
                    className="ajf-primary-button"
                    onClick={openCreateForm}
                >
                    <Plus size={18} />
                    Create Job Fair
                </button>
            </div>

            {error && (
                <div className="ajf-alert ajf-alert-error" role="alert">
                    <XCircle size={18} />
                    <span>{error}</span>
                    <button
                        type="button"
                        aria-label="Dismiss error"
                        onClick={() => setError("")}
                    >
                        <X size={17} />
                    </button>
                </div>
            )}

            {success && (
                <div className="ajf-alert ajf-alert-success" role="status">
                    <CheckCircle2 size={18} />
                    <span>{success}</span>
                    <button
                        type="button"
                        aria-label="Dismiss message"
                        onClick={() => setSuccess("")}
                    >
                        <X size={17} />
                    </button>
                </div>
            )}

            <div className="ajf-stat-grid">
                <div className="ajf-stat-card">
                    <div className="ajf-stat-icon navy">
                        <CalendarDays size={22} />
                    </div>
                    <div>
                        <span>Total Job Fairs</span>
                        <strong>{jobFairs.length}</strong>
                    </div>
                </div>

                <div className="ajf-stat-card">
                    <div className="ajf-stat-icon gold">
                        <CalendarCheck size={22} />
                    </div>
                    <div>
                        <span>Upcoming</span>
                        <strong>{upcomingCount}</strong>
                    </div>
                </div>

                <div className="ajf-stat-card">
                    <div className="ajf-stat-icon green">
                        <Building2 size={22} />
                    </div>
                    <div>
                        <span>Employer Registrations</span>
                        <strong>{totalEmployers}</strong>
                    </div>
                </div>

                <div className="ajf-stat-card">
                    <div className="ajf-stat-icon blue">
                        <Users size={22} />
                    </div>
                    <div>
                        <span>Jobseeker Registrations</span>
                        <strong>{totalJobseekers}</strong>
                    </div>
                </div>
            </div>

            <div className="ajf-toolbar">
                <div className="ajf-search">
                    <Search size={18} />
                    <input
                        type="search"
                        placeholder="Search job fairs or venues..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    aria-label="Filter by job fair status"
                >
                    <option value="all">All statuses</option>
                    {statusOptions.map((status) => (
                        <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                    ))}
                </select>

                <button
                    type="button"
                    className="ajf-icon-button"
                    onClick={loadJobFairs}
                    title="Refresh job fairs"
                    aria-label="Refresh job fairs"
                >
                    <RefreshCw size={17} />
                </button>
            </div>

            {loading ? (
                <div className="ajf-state">
                    <Loader2 className="ajf-spinner" size={30} />
                    <p>Loading job fairs...</p>
                </div>
            ) : filteredFairs.length === 0 ? (
                <div className="ajf-state ajf-empty">
                    <CalendarDays size={42} />
                    <h3>No job fairs found</h3>
                    <p>
                        {jobFairs.length === 0
                            ? "Create your first job fair to get started."
                            : "Try another search term or status filter."}
                    </p>
                    {jobFairs.length === 0 && (
                        <button
                            type="button"
                            className="ajf-primary-button"
                            onClick={openCreateForm}
                        >
                            <Plus size={18} />
                            Create Job Fair
                        </button>
                    )}
                </div>
            ) : (
                <div className="ajf-table-wrap">
                    <table className="ajf-table">
                        <thead>
                            <tr>
                                <th>Job Fair</th>
                                <th>Schedule</th>
                                <th>Venue</th>
                                <th>Participants</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFairs.map((fair) => {
                                const employerCount =
                                    fair.employer_registrations_count ??
                                    fair.employerRegistrations?.length ??
                                    0;

                                const jobseekerCount =
                                    fair.jobseeker_registrations_count ??
                                    fair.jobseekerRegistrations?.length ??
                                    0;

                                return (
                                    <tr key={fair.id}>
                                        <td>
                                            <div className="ajf-fair-title">
                                                {fair.title}
                                            </div>
                                            <div className="ajf-fair-id">
                                                Fair #{fair.id}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="ajf-date-range">
                                                <CalendarDays size={15} />
                                                <span>
                                                    {formatDate(fair.start_date)}
                                                </span>
                                            </div>
                                            <div className="ajf-subtext">
                                                to {formatDate(fair.end_date)}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="ajf-venue">
                                                <MapPin size={15} />
                                                {fair.venue || "Not specified"}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="ajf-participant-count">
                                                <span>
                                                    <Building2 size={14} />
                                                    {employerCount} employers
                                                </span>
                                                <span>
                                                    <Users size={14} />
                                                    {jobseekerCount} jobseekers
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span
                                                className={`ajf-status status-${fair.status}`}
                                            >
                                                {fair.status || "unknown"}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="ajf-actions">
                                                <button
                                                    type="button"
                                                    className="ajf-icon-button"
                                                    title="View participants"
                                                    aria-label={`View ${fair.title}`}
                                                    onClick={() =>
                                                        setSelectedFair(fair)
                                                    }
                                                >
                                                    <Eye size={17} />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="ajf-icon-button"
                                                    title="Edit job fair"
                                                    aria-label={`Edit ${fair.title}`}
                                                    onClick={() =>
                                                        openEditForm(fair)
                                                    }
                                                >
                                                    <Pencil size={17} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="ajf-footer-note">
                <Clock size={16} />
                Pending employer registrations: <strong>{pendingRegistrations}</strong>
            </div>

            {showForm && (
                <div
                    className="ajf-modal-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) closeForm();
                    }}
                >
                    <section
                        className="ajf-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="ajf-form-title"
                    >
                        <div className="ajf-modal-header">
                            <div>
                                <h2 id="ajf-form-title">
                                    {editingFair ? "Edit Job Fair" : "Create Job Fair"}
                                </h2>
                                <p>
                                    Enter the job fair information and schedule.
                                </p>
                            </div>
                            <button
                                type="button"
                                className="ajf-icon-button"
                                onClick={closeForm}
                                aria-label="Close form"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="ajf-form-body">
                                <label>
                                    Job Fair Title *
                                    <input
                                        name="title"
                                        value={form.title}
                                        onChange={handleFormChange}
                                        required
                                        maxLength={255}
                                        placeholder="e.g. Danao City Job Fair 2026"
                                    />
                                </label>

                                <label>
                                    Venue *
                                    <input
                                        name="venue"
                                        value={form.venue}
                                        onChange={handleFormChange}
                                        required
                                        maxLength={255}
                                        placeholder="Enter the venue"
                                    />
                                </label>

                                <label>
                                    Description
                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={handleFormChange}
                                        rows={3}
                                        placeholder="Describe the job fair..."
                                    />
                                </label>

                                <div className="ajf-form-grid">
                                    <label>
                                        Start Date *
                                        <input
                                            type="date"
                                            name="start_date"
                                            value={form.start_date}
                                            onChange={handleFormChange}
                                            required
                                        />
                                    </label>
                                    <label>
                                        End Date *
                                        <input
                                            type="date"
                                            name="end_date"
                                            value={form.end_date}
                                            onChange={handleFormChange}
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
                                            onChange={handleFormChange}
                                        />
                                    </label>
                                    <label>
                                        Registration Closes
                                        <input
                                            type="date"
                                            name="registration_end"
                                            value={form.registration_end}
                                            onChange={handleFormChange}
                                            min={
                                                form.registration_start || undefined
                                            }
                                        />
                                    </label>
                                </div>

                                <label>
                                    Status *
                                    <select
                                        name="status"
                                        value={form.status}
                                        onChange={handleFormChange}
                                        required
                                    >
                                        {statusOptions.map((status) => (
                                            <option key={status} value={status}>
                                                {status.charAt(0).toUpperCase() +
                                                    status.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            <div className="ajf-modal-footer">
                                <button
                                    type="button"
                                    className="ajf-secondary-button"
                                    onClick={closeForm}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="ajf-primary-button"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <Loader2
                                            size={17}
                                            className="ajf-spinner"
                                        />
                                    ) : (
                                        <CheckCircle2 size={17} />
                                    )}
                                    {saving
                                        ? "Saving..."
                                        : editingFair
                                          ? "Save Changes"
                                          : "Create Job Fair"}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}

            {selectedFair && (
                <div
                    className="ajf-modal-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setSelectedFair(null);
                        }
                    }}
                >
                    <section
                        className="ajf-modal ajf-participants-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="ajf-participants-title"
                    >
                        <div className="ajf-modal-header">
                            <div>
                                <h2 id="ajf-participants-title">
                                    {selectedFair.title}
                                </h2>
                                <p>
                                    <MapPin size={14} />
                                    {selectedFair.venue} ·{" "}
                                    {formatDate(selectedFair.start_date)}
                                </p>
                            </div>
                            <button
                                type="button"
                                className="ajf-icon-button"
                                onClick={() => setSelectedFair(null)}
                                aria-label="Close participants"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="ajf-participants-body">
                            <h3>
                                <Building2 size={18} />
                                Employer Registrations
                            </h3>

                            {getEmployerRegistrations(selectedFair).length === 0 ? (
                                <p className="ajf-no-participants">
                                    No employer registrations found.
                                </p>
                            ) : (
                                <div className="ajf-registration-list">
                                    {getEmployerRegistrations(selectedFair).map(
                                        (registration) => (
                                            <div
                                                className="ajf-registration"
                                                key={registration.id}
                                            >
                                                <div className="ajf-registration-info">
                                                    <strong>
                                                        {getEmployerName(registration)}
                                                    </strong>
                                                    <span>
                                                        {registration.employer?.email ||
                                                            "No email provided"}
                                                    </span>
                                                    <span
                                                        className={`ajf-status status-${registration.status}`}
                                                    >
                                                        {registration.status}
                                                    </span>
                                                </div>

                                                <div className="ajf-registration-actions">
                                                    <select
                                                        value={registration.status}
                                                        disabled={
                                                            updatingRegistration ===
                                                            registration.id
                                                        }
                                                        aria-label={`Status for ${getEmployerName(registration)}`}
                                                        onChange={(event) =>
                                                            updateEmployerStatus(
                                                                registration,
                                                                event.target.value
                                                            )
                                                        }
                                                    >
                                                        {[
                                                            "pending",
                                                            "approved",
                                                            "rejected",
                                                            "cancelled",
                                                        ].map((status) => (
                                                            <option
                                                                key={status}
                                                                value={status}
                                                            >
                                                                {status
                                                                    .charAt(0)
                                                                    .toUpperCase() +
                                                                    status.slice(1)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}

                            <h3 className="ajf-jobseeker-heading">
                                <Users size={18} />
                                Jobseeker Registrations
                            </h3>

                            {getJobseekerRegistrations(selectedFair).length === 0 ? (
                                <p className="ajf-no-participants">
                                    No jobseeker registrations found.
                                </p>
                            ) : (
                                <div className="ajf-registration-list">
                                    {getJobseekerRegistrations(selectedFair).map(
                                        (registration) => (
                                            <div
                                                className="ajf-registration"
                                                key={registration.id}
                                            >
                                                <div className="ajf-registration-info">
                                                    <strong>
                                                        {registration.jobseeker?.first_name ||
                                                            registration.first_name ||
                                                            registration.jobseeker?.name ||
                                                            "Registered jobseeker"}
                                                        {" "}
                                                        {registration.jobseeker?.surname ||
                                                            registration.surname ||
                                                            ""}
                                                    </strong>
                                                    <span>
                                                        {registration.jobseeker?.email ||
                                                            registration.email ||
                                                            "No email provided"}
                                                    </span>
                                                </div>
                                                <span
                                                    className={`ajf-status status-${registration.status || "pending"}`}
                                                >
                                                    {registration.status || "registered"}
                                                </span>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}

                            <h3 className="ajf-jobseeker-heading">
                                <Briefcase size={18} />
                                Vacancies
                            </h3>

                            {(selectedFair.vacancies || []).length === 0 ? (
                                <p className="ajf-no-participants">
                                    No vacancies linked to this job fair.
                                </p>
                            ) : (
                                <div className="ajf-vacancy-list">
                                    {selectedFair.vacancies.map((vacancy) => (
                                        <div key={vacancy.id}>
                                            <strong>
                                                {vacancy.title ||
                                                    vacancy.position ||
                                                    `Vacancy #${vacancy.id}`}
                                            </strong>
                                            <span>
                                                {vacancy.vacancies ??
                                                    vacancy.slots ??
                                                    0}{" "}
                                                positions
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="ajf-modal-footer">
                            <button
                                type="button"
                                className="ajf-secondary-button"
                                onClick={() => setSelectedFair(null)}
                            >
                                Close
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}

export default AdminJobFairs;
