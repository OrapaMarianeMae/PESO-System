
import { useCallback, useEffect, useState } from "react";
import {
    Search,
    RefreshCw,
    FileWarning,
    Eye,
    X,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Clock,
    UserRound,
    Briefcase,
    ClipboardCheck,
    Save,
} from "lucide-react";
import "./AdminReports.css";

const API_BASE = "http://127.0.0.1:8000/api";

const STATUS_OPTIONS = [
    { value: "new", label: "New" },
    { value: "under_review", label: "Under Review" },
    { value: "resolved", label: "Resolved" },
    { value: "dismissed", label: "Dismissed" },
];

function formatDate(value) {
    if (!value) return "Not available";

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

function getFullName(user) {
    if (!user) return "Unknown user";

    const name = [
        user.first_name,
        user.middle_name,
        user.surname,
    ]
        .filter(Boolean)
        .join(" ")
        .trim();

    return name || user.name || user.email || "Unknown user";
}

function getStatusLabel(status) {
    return (
        STATUS_OPTIONS.find((option) => option.value === status)?.label ||
        status ||
        "New"
    );
}

function AdminReports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedReport, setSelectedReport] = useState(null);
    const [editStatus, setEditStatus] = useState("new");
    const [adminNotes, setAdminNotes] = useState("");

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
                throw new Error(firstError || "Please check your input.");
            }

            throw new Error(data.message || "The request failed.");
        }

        return data;
    }, []);

    const loadReports = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await request("/admin/reports");

            setReports(Array.isArray(data.reports) ? data.reports : []);
        } catch (err) {
            setError(err.message || "Unable to load reports.");
        } finally {
            setLoading(false);
        }
    }, [request]);

    useEffect(() => {
        loadReports();
    }, [loadReports]);

    const openReport = (report) => {
        setSelectedReport(report);
        setEditStatus(report.status || "new");
        setAdminNotes(report.admin_notes || "");
        setError("");
        setSuccess("");
    };

    const closeReport = () => {
        setSelectedReport(null);
        setAdminNotes("");
        setEditStatus("new");
    };

    const handleUpdate = async (event) => {
        event.preventDefault();

        if (!selectedReport) return;

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const data = await request(
                `/admin/reports/${selectedReport.id}/status`,
                {
                    method: "PUT",
                    body: JSON.stringify({
                        status: editStatus,
                        admin_notes: adminNotes,
                    }),
                }
            );

            const updatedReport = {
                ...selectedReport,
                ...(data.report || {}),
                status: data.report?.status || editStatus,
                admin_notes:
                    data.report?.admin_notes ?? adminNotes,
            };

            setReports((current) =>
                current.map((report) =>
                    report.id === selectedReport.id
                        ? { ...report, ...updatedReport }
                        : report
                )
            );

            setSelectedReport(updatedReport);
            setSuccess(
                data.message || "Report status updated successfully."
            );
        } catch (err) {
            setError(err.message || "Unable to update report.");
        } finally {
            setSaving(false);
        }
    };

    const filteredReports = reports.filter((report) => {
        const reporter = getFullName(report.reporter);
        const reportedUser = getFullName(report.reported_user);

        const searchableText = [
            report.id,
            report.subject,
            report.title,
            report.reason,
            report.description,
            report.message,
            reporter,
            reportedUser,
            report.reporter?.email,
            report.reported_user?.email,
            report.job_posting?.job_title,
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        const matchesSearch = searchableText.includes(search.toLowerCase());

        const matchesStatus =
            statusFilter === "all" || report.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const countByStatus = (status) =>
        reports.filter((report) => report.status === status).length;

    return (
        <div className="admin-reports">
            <header className="ar-page-header">
                <div>
                    <div className="ar-eyebrow">MUNICIPAL PESO</div>
                    <h1>Reports Management</h1>
                    <p>
                        Review submitted reports, document actions, and track
                        their resolution.
                    </p>
                </div>

                <button
                    type="button"
                    className="ar-button ar-button-primary"
                    onClick={loadReports}
                    disabled={loading}
                >
                    <RefreshCw size={17} />
                    Refresh Reports
                </button>
            </header>

            {error && (
                <div className="ar-alert ar-alert-error" role="alert">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                    <button
                        type="button"
                        onClick={() => setError("")}
                        aria-label="Dismiss error"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {success && (
                <div className="ar-alert ar-alert-success" role="status">
                    <CheckCircle2 size={18} />
                    <span>{success}</span>
                    <button
                        type="button"
                        onClick={() => setSuccess("")}
                        aria-label="Dismiss success message"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            <section className="ar-stat-grid">
                <div className="ar-stat-card">
                    <div className="ar-stat-icon ar-icon-navy">
                        <FileWarning size={22} />
                    </div>
                    <div>
                        <span>Total Reports</span>
                        <strong>{reports.length}</strong>
                    </div>
                </div>

                <div className="ar-stat-card">
                    <div className="ar-stat-icon ar-icon-gold">
                        <AlertCircle size={22} />
                    </div>
                    <div>
                        <span>New</span>
                        <strong>{countByStatus("new")}</strong>
                    </div>
                </div>

                <div className="ar-stat-card">
                    <div className="ar-stat-icon ar-icon-blue">
                        <Clock size={22} />
                    </div>
                    <div>
                        <span>Under Review</span>
                        <strong>{countByStatus("under_review")}</strong>
                    </div>
                </div>

                <div className="ar-stat-card">
                    <div className="ar-stat-icon ar-icon-green">
                        <ClipboardCheck size={22} />
                    </div>
                    <div>
                        <span>Resolved</span>
                        <strong>{countByStatus("resolved")}</strong>
                    </div>
                </div>
            </section>

            <section className="ar-toolbar">
                <div className="ar-search">
                    <Search size={18} />
                    <input
                        type="search"
                        placeholder="Search reports, users, or job titles..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        aria-label="Search reports"
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    aria-label="Filter reports by status"
                >
                    <option value="all">All statuses</option>
                    {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </section>

            {loading ? (
                <div className="ar-state">
                    <Loader2 className="ar-spinner" size={30} />
                    <p>Loading reports...</p>
                </div>
            ) : filteredReports.length === 0 ? (
                <div className="ar-state">
                    <FileWarning size={42} />
                    <h3>No reports found</h3>
                    <p>
                        {reports.length === 0
                            ? "There are currently no submitted reports."
                            : "Try changing your search or status filter."}
                    </p>
                </div>
            ) : (
                <div className="ar-table-wrap">
                    <table className="ar-table">
                        <thead>
                            <tr>
                                <th>Report</th>
                                <th>Reporter</th>
                                <th>Reported User</th>
                                <th>Date Submitted</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredReports.map((report) => (
                                <tr key={report.id}>
                                    <td>
                                        <div className="ar-report-title">
                                            Report #{report.id}
                                        </div>
                                        <div className="ar-muted">
                                            {report.job_posting?.job_title ||
                                                report.subject ||
                                                report.title ||
                                                report.reason ||
                                                "General report"}
                                        </div>
                                    </td>

                                    <td>
                                        <div className="ar-user-name">
                                            {getFullName(report.reporter)}
                                        </div>
                                        <div className="ar-muted">
                                            {report.reporter?.role || "User"}
                                        </div>
                                    </td>

                                    <td>
                                        <div className="ar-user-name">
                                            {getFullName(report.reported_user)}
                                        </div>
                                        <div className="ar-muted">
                                            {report.reported_user?.role || "Not specified"}
                                        </div>
                                    </td>

                                    <td className="ar-date-cell">
                                        {formatDate(report.created_at)}
                                    </td>

                                    <td>
                                        <span
                                            className={`ar-status ar-status-${report.status || "new"}`}
                                        >
                                            {getStatusLabel(report.status)}
                                        </span>
                                    </td>

                                    <td>
                                        <button
                                            type="button"
                                            className="ar-button ar-button-secondary ar-view-button"
                                            onClick={() => openReport(report)}
                                        >
                                            <Eye size={16} />
                                            Review
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="ar-footer">
                Showing {filteredReports.length} of {reports.length} reports
            </div>

            {selectedReport && (
                <div
                    className="ar-modal-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !saving) {
                            closeReport();
                        }
                    }}
                >
                    <section
                        className="ar-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="ar-modal-title"
                    >
                        <header className="ar-modal-header">
                            <div>
                                <div className="ar-eyebrow">REPORT REVIEW</div>
                                <h2 id="ar-modal-title">
                                    Report #{selectedReport.id}
                                </h2>
                            </div>

                            <button
                                type="button"
                                className="ar-icon-button"
                                onClick={closeReport}
                                disabled={saving}
                                aria-label="Close report"
                            >
                                <X size={20} />
                            </button>
                        </header>

                        <div className="ar-modal-body">
                            <section className="ar-detail-section">
                                <h3>Report Information</h3>

                                <div className="ar-detail-grid">
                                    <div>
                                        <span>Submitted</span>
                                        <strong>
                                            {formatDate(selectedReport.created_at)}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Current Status</span>
                                        <strong>
                                            {getStatusLabel(selectedReport.status)}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Reporter</span>
                                        <strong>
                                            {getFullName(selectedReport.reporter)}
                                        </strong>
                                        <small>
                                            {selectedReport.reporter?.email || "No email"}
                                        </small>
                                    </div>

                                    <div>
                                        <span>Reported User</span>
                                        <strong>
                                            {getFullName(selectedReport.reported_user)}
                                        </strong>
                                        <small>
                                            {selectedReport.reported_user?.email || "No email"}
                                        </small>
                                    </div>

                                    <div className="ar-detail-full">
                                        <span>Related Job Posting</span>
                                        <strong>
                                            {selectedReport.job_posting?.job_title ||
                                                "No job posting linked"}
                                        </strong>
                                    </div>
                                </div>
                            </section>

                            <section className="ar-detail-section">
                                <h3>Submitted Details</h3>
                                <div className="ar-report-description">
                                    {selectedReport.description ||
                                        selectedReport.message ||
                                        selectedReport.reason ||
                                        selectedReport.content ||
                                        selectedReport.subject ||
                                        "No additional details were provided."}
                                </div>
                            </section>

                            {selectedReport.admin_notes && (
                                <section className="ar-detail-section">
                                    <h3>Previous Admin Notes</h3>
                                    <div className="ar-report-description">
                                        {selectedReport.admin_notes}
                                    </div>
                                </section>
                            )}

                            <form onSubmit={handleUpdate}>
                                <section className="ar-detail-section">
                                    <h3>Review and Update</h3>

                                    <label className="ar-form-label">
                                        Report Status
                                        <select
                                            value={editStatus}
                                            onChange={(event) =>
                                                setEditStatus(event.target.value)
                                            }
                                            required
                                        >
                                            {STATUS_OPTIONS.map((option) => (
                                                <option
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className="ar-form-label">
                                        Admin Notes
                                        <textarea
                                            value={adminNotes}
                                            onChange={(event) =>
                                                setAdminNotes(event.target.value)
                                            }
                                            rows={4}
                                            placeholder="Record findings, actions taken, or follow-up instructions..."
                                        />
                                    </label>
                                </section>

                                <footer className="ar-modal-footer">
                                    <button
                                        type="button"
                                        className="ar-button ar-button-secondary"
                                        onClick={closeReport}
                                        disabled={saving}
                                    >
                                        Close
                                    </button>

                                    <button
                                        type="submit"
                                        className="ar-button ar-button-primary"
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <Loader2
                                                size={17}
                                                className="ar-spinner"
                                            />
                                        ) : (
                                            <Save size={17} />
                                        )}
                                        {saving ? "Saving..." : "Save Review"}
                                    </button>
                                </footer>
                            </form>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}

export default AdminReports;
