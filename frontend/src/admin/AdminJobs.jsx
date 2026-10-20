
import { useEffect, useMemo, useState } from "react";
import {
    BriefcaseBusiness,
    Search,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Clock,
    Eye,
    Building2,
    X,
} from "lucide-react";
import "./AdminJobs.css";

const API_BASE = "http://127.0.0.1:8000/api";

function AdminJobs() {
    const [jobs, setJobs] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [selectedJob, setSelectedJob] = useState(null);
    const [rejectingJob, setRejectingJob] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");

    async function loadJobs() {
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("pesoToken");

            if (!token) {
                throw new Error("Please log in as an administrator.");
            }

            const response = await fetch(`${API_BASE}/admin/jobs`, {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to load job posts.");
            }

            if (!Array.isArray(data.jobs)) {
                throw new Error("The job list response is invalid.");
            }

            setJobs(data.jobs);
        } catch (err) {
            setError(err.message || "Unable to connect to the server.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadJobs();
    }, []);

    async function updateJobStatus(job, action, reason = "") {
        setProcessingId(job.id);
        setError("");
        setSuccess("");

        try {
            const token = localStorage.getItem("pesoToken");
            const isRejecting = action === "reject";

            const response = await fetch(
                `${API_BASE}/admin/jobs/${job.id}/${action}`,
                {
                    method: "PUT",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    ...(isRejecting
                        ? {
                              body: JSON.stringify({
                                  rejection_reason: reason.trim(),
                              }),
                          }
                        : {}),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to update this job post."
                );
            }

            setJobs((currentJobs) =>
                currentJobs.map((item) =>
                    item.id === job.id
                        ? {
                              ...item,
                              ...data.job,
                              status: data.job?.status || action === "approve"
                                  ? data.job?.status || "approved"
                                  : "rejected",
                              rejection_reason: isRejecting
                                  ? reason.trim()
                                  : item.rejection_reason,
                          }
                        : item
                )
            );

            setSelectedJob((current) =>
                current?.id === job.id
                    ? {
                          ...current,
                          ...data.job,
                          status: data.job?.status || (isRejecting ? "rejected" : "approved"),
                          rejection_reason: isRejecting
                              ? reason.trim()
                              : current.rejection_reason,
                      }
                    : current
            );

            setSuccess(
                data.message ||
                    `Job post ${isRejecting ? "rejected" : "approved"} successfully.`
            );
            setRejectingJob(null);
            setRejectionReason("");
        } catch (err) {
            setError(err.message || "Unable to update this job post.");
        } finally {
            setProcessingId(null);
        }
    }

    const filteredJobs = useMemo(() => {
        const term = search.trim().toLowerCase();

        return jobs.filter((job) => {
            const employer = job.employer || {};
            const employerName =
                [
                    employer.first_name,
                    employer.middle_name,
                    employer.surname,
                ]
                    .filter(Boolean)
                    .join(" ") ||
                employer.company_name ||
                "";

            const matchesSearch = [
                job.title,
                job.position,
                job.company_name,
                employerName,
                job.location,
                job.status,
            ]
                .filter(Boolean)
                .some((value) =>
                    String(value).toLowerCase().includes(term)
                );

            const matchesStatus =
                statusFilter === "all" || job.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [jobs, search, statusFilter]);

    function formatDate(dateValue) {
        if (!dateValue) return "—";

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) return "—";

        return date.toLocaleDateString("en-PH", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }

    function getEmployerName(job) {
        const employer = job.employer || {};

        return (
            [
                employer.first_name,
                employer.middle_name,
                employer.surname,
            ]
                .filter(Boolean)
                .join(" ") ||
            employer.company_name ||
            job.company_name ||
            "Employer"
        );
    }

    return (
        <div className="admin-jobs-page">
            <header className="admin-jobs-header">
                <div>
                    <span className="admin-jobs-eyebrow">
                        ADMINISTRATION
                    </span>
                    <h1>Job Post Management</h1>
                    <p>
                        Review employer job posts and manage their approval
                        status for PESO Danao.
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-jobs-refresh"
                    onClick={loadJobs}
                    disabled={loading}
                >
                    <RefreshCw size={17} />
                    Refresh
                </button>
            </header>

            <section className="admin-jobs-stats">
                <div className="admin-jobs-stat-card">
                    <span className="admin-jobs-stat-icon total">
                        <BriefcaseBusiness size={21} />
                    </span>
                    <div>
                        <span>Total Job Posts</span>
                        <strong>{loading ? "..." : jobs.length}</strong>
                    </div>
                </div>

                <div className="admin-jobs-stat-card">
                    <span className="admin-jobs-stat-icon pending">
                        <Clock size={21} />
                    </span>
                    <div>
                        <span>Pending Review</span>
                        <strong>
                            {loading
                                ? "..."
                                : jobs.filter((job) => job.status === "pending")
                                      .length}
                        </strong>
                    </div>
                </div>

                <div className="admin-jobs-stat-card">
                    <span className="admin-jobs-stat-icon approved">
                        <CheckCircle2 size={21} />
                    </span>
                    <div>
                        <span>Approved</span>
                        <strong>
                            {loading
                                ? "..."
                                : jobs.filter((job) => job.status === "approved")
                                      .length}
                        </strong>
                    </div>
                </div>

                <div className="admin-jobs-stat-card">
                    <span className="admin-jobs-stat-icon rejected">
                        <XCircle size={21} />
                    </span>
                    <div>
                        <span>Rejected</span>
                        <strong>
                            {loading
                                ? "..."
                                : jobs.filter((job) => job.status === "rejected")
                                      .length}
                        </strong>
                    </div>
                </div>
            </section>

            {error && (
                <div className="admin-jobs-alert error" role="alert">
                    {error}
                </div>
            )}

            {success && (
                <div className="admin-jobs-alert success" role="status">
                    {success}
                </div>
            )}

            <section className="admin-jobs-card">
                <div className="admin-jobs-card-heading">
                    <div>
                        <h2>Submitted Job Posts</h2>
                        <p>
                            {loading
                                ? "Loading job posts..."
                                : `${filteredJobs.length} job post(s) found`}
                        </p>
                    </div>
                </div>

                <div className="admin-jobs-toolbar">
                    <div className="admin-jobs-search">
                        <Search size={18} />
                        <input
                            type="search"
                            placeholder="Search job title, employer, or location..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(event.target.value)
                        }
                        aria-label="Filter job posts by status"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>

                {loading ? (
                    <div className="admin-jobs-empty">
                        Loading job posts...
                    </div>
                ) : jobs.length === 0 && !error ? (
                    <div className="admin-jobs-empty">
                        <BriefcaseBusiness size={34} />
                        <h3>No job posts yet</h3>
                        <p>
                            Job posts submitted by employers will appear here.
                        </p>
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="admin-jobs-empty">
                        <Search size={30} />
                        <h3>No matching job posts</h3>
                        <p>Try another search term or status filter.</p>
                    </div>
                ) : (
                    <div className="admin-jobs-table-wrap">
                        <table className="admin-jobs-table">
                            <thead>
                                <tr>
                                    <th>Job Post</th>
                                    <th>Employer</th>
                                    <th>Location</th>
                                    <th>Posted</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredJobs.map((job) => (
                                    <tr key={job.id}>
                                        <td>
                                            <div className="admin-jobs-title">
                                                <strong>
                                                    {job.title ||
                                                        job.position ||
                                                        "Untitled Job"}
                                                </strong>
                                                <small>
                                                    Job ID: {job.id}
                                                </small>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="admin-jobs-employer">
                                                <Building2 size={16} />
                                                <span>{getEmployerName(job)}</span>
                                            </div>
                                        </td>
                                        <td>{job.location || "—"}</td>
                                        <td>{formatDate(job.created_at)}</td>
                                        <td>
                                            <span
                                                className={`admin-jobs-status ${job.status || "unknown"}`}
                                            >
                                                {job.status
                                                    ? job.status
                                                          .charAt(0)
                                                          .toUpperCase() +
                                                      job.status.slice(1)
                                                    : "Unknown"}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="admin-jobs-actions">
                                                <button
                                                    type="button"
                                                    className="admin-jobs-action view"
                                                    title="View job details"
                                                    aria-label="View job details"
                                                    onClick={() =>
                                                        setSelectedJob(job)
                                                    }
                                                >
                                                    <Eye size={16} />
                                                </button>

                                                {job.status === "pending" && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className="admin-jobs-action approve"
                                                            title="Approve job post"
                                                            aria-label="Approve job post"
                                                            disabled={
                                                                processingId ===
                                                                job.id
                                                            }
                                                            onClick={() =>
                                                                updateJobStatus(
                                                                    job,
                                                                    "approve"
                                                                )
                                                            }
                                                        >
                                                            <CheckCircle2 size={16} />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="admin-jobs-action reject"
                                                            title="Reject job post"
                                                            aria-label="Reject job post"
                                                            disabled={
                                                                processingId ===
                                                                job.id
                                                            }
                                                            onClick={() => {
                                                                setRejectingJob(job);
                                                                setRejectionReason("");
                                                            }}
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {selectedJob && (
                <div
                    className="admin-jobs-modal-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setSelectedJob(null);
                        }
                    }}
                >
                    <section
                        className="admin-jobs-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="admin-job-details-title"
                    >
                        <div className="admin-jobs-modal-header">
                            <div>
                                <span className="admin-jobs-eyebrow">
                                    JOB POST DETAILS
                                </span>
                                <h2 id="admin-job-details-title">
                                    {selectedJob.title ||
                                        selectedJob.position ||
                                        "Untitled Job"}
                                </h2>
                            </div>
                            <button
                                type="button"
                                className="admin-jobs-modal-close"
                                aria-label="Close job details"
                                onClick={() => setSelectedJob(null)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="admin-jobs-details">
                            <div>
                                <span>Employer</span>
                                <strong>{getEmployerName(selectedJob)}</strong>
                            </div>
                            <div>
                                <span>Location</span>
                                <strong>{selectedJob.location || "—"}</strong>
                            </div>
                            <div>
                                <span>Job Type</span>
                                <strong>
                                    {selectedJob.employment_type ||
                                        selectedJob.job_type ||
                                        "—"}
                                </strong>
                            </div>
                            <div>
                                <span>Vacancies</span>
                                <strong>{selectedJob.vacancies ?? "—"}</strong>
                            </div>
                            <div>
                                <span>Application Deadline</span>
                                <strong>
                                    {formatDate(selectedJob.application_deadline)}
                                </strong>
                            </div>
                            <div>
                                <span>Status</span>
                                <strong>{selectedJob.status || "Unknown"}</strong>
                            </div>
                            <div className="full">
                                <span>Description</span>
                                <p>
                                    {selectedJob.description ||
                                        "No description provided."}
                                </p>
                            </div>
                            {selectedJob.rejection_reason && (
                                <div className="full">
                                    <span>Rejection Reason</span>
                                    <p>{selectedJob.rejection_reason}</p>
                                </div>
                            )}
                        </div>

                        {selectedJob.status === "pending" && (
                            <div className="admin-jobs-modal-actions">
                                <button
                                    type="button"
                                    className="admin-jobs-button approve"
                                    disabled={processingId === selectedJob.id}
                                    onClick={() =>
                                        updateJobStatus(selectedJob, "approve")
                                    }
                                >
                                    <CheckCircle2 size={17} />
                                    Approve Job
                                </button>
                                <button
                                    type="button"
                                    className="admin-jobs-button reject"
                                    onClick={() => {
                                        setRejectingJob(selectedJob);
                                        setRejectionReason("");
                                    }}
                                >
                                    <XCircle size={17} />
                                    Reject Job
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            )}

            {rejectingJob && (
                <div
                    className="admin-jobs-modal-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setRejectingJob(null);
                        }
                    }}
                >
                    <section
                        className="admin-jobs-modal admin-jobs-reject-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="admin-reject-title"
                    >
                        <div className="admin-jobs-modal-header">
                            <div>
                                <span className="admin-jobs-eyebrow">
                                    MODERATION
                                </span>
                                <h2 id="admin-reject-title">
                                    Reject Job Post
                                </h2>
                            </div>
                            <button
                                type="button"
                                className="admin-jobs-modal-close"
                                aria-label="Close rejection form"
                                onClick={() => setRejectingJob(null)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <p className="admin-jobs-reject-intro">
                            Please provide a reason for rejecting{" "}
                            <strong>
                                {rejectingJob.title ||
                                    rejectingJob.position ||
                                    "this job post"}
                            </strong>
                            . The reason will be submitted to the backend.
                        </p>

                        <label
                            className="admin-jobs-reject-label"
                            htmlFor="rejection-reason"
                        >
                            Rejection reason
                        </label>
                        <textarea
                            id="rejection-reason"
                            value={rejectionReason}
                            onChange={(event) =>
                                setRejectionReason(event.target.value)
                            }
                            placeholder="Explain what needs to be corrected..."
                            rows={5}
                            maxLength={2000}
                        />
                        <small className="admin-jobs-character-count">
                            {rejectionReason.length}/2000 characters
                        </small>

                        <div className="admin-jobs-modal-actions">
                            <button
                                type="button"
                                className="admin-jobs-button cancel"
                                onClick={() => setRejectingJob(null)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="admin-jobs-button reject"
                                disabled={
                                    !rejectionReason.trim() ||
                                    processingId === rejectingJob.id
                                }
                                onClick={() =>
                                    updateJobStatus(
                                        rejectingJob,
                                        "reject",
                                        rejectionReason
                                    )
                                }
                            >
                                <XCircle size={17} />
                                Confirm Rejection
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}

export default AdminJobs;
