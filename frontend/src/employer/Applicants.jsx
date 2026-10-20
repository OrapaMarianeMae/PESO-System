
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Users,
    UserRound,
    Search,
    Eye,
    X,
    BriefcaseBusiness,
    MapPin,
    CalendarDays,
    Mail,
    Clock,
    CheckCircle2,
    UserCheck,
    RefreshCw,
    LoaderCircle,
    ClipboardList,
    Filter,
    ChevronDown,
    AlertCircle,
    FileText,
    GraduationCap,
    BookOpen,
    Phone,
} from "lucide-react";
import "./Applicants.css";

const API_BASE = "http://127.0.0.1:8000/api";

const STATUS_OPTIONS = [
    { value: "submitted", label: "Submitted" },
    { value: "reviewing", label: "Reviewing" },
    { value: "shortlisted", label: "Shortlisted" },
    { value: "interview", label: "For Interview" },
    { value: "hired", label: "Hired" },
    { value: "rejected", label: "Rejected" },
];

function getToken() {
    return localStorage.getItem("pesoToken");
}

function getApplicantName(applicant) {
    if (!applicant) return "Unknown Applicant";

    const fullName = [
        applicant.first_name,
        applicant.middle_name,
        applicant.surname,
        applicant.name_extension,
    ]
        .filter(Boolean)
        .join(" ")
        .trim();

    return (
        fullName ||
        applicant.name ||
        applicant.full_name ||
        "Unknown Applicant"
    );
}

function formatDate(value) {
    if (!value) return "Not provided";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Not provided";

    return date.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function formatDetailValue(value) {
    if (value === null || value === undefined || value === "") {
        return "Not provided";
    }

    if (Array.isArray(value)) {
        return value.length ? value.join(", ") : "Not provided";
    }

    if (typeof value === "object") {
        return Object.values(value).filter(Boolean).join(", ") || "Not provided";
    }

    return String(value);
}

function getStatusLabel(status) {
    return (
        STATUS_OPTIONS.find(
            (option) => option.value === String(status || "").toLowerCase()
        )?.label || status || "Unknown"
    );
}

function getStatusClass(status) {
    const normalized = String(status || "").toLowerCase();

    return STATUS_OPTIONS.some((option) => option.value === normalized)
        ? normalized
        : "unknown";
}

function getProfileValue(profile, keys) {
    if (!profile) return "";

    for (const key of keys) {
        const value = profile[key];

        if (value !== null && value !== undefined && value !== "") {
            return value;
        }
    }

    return "";
}

function getApplicationDate(application) {
    return (
        application.applied_at ||
        application.created_at ||
        application.application_date ||
        null
    );
}

function getApplicationId(application) {
    return application?.id ?? application?.application_id;
}

function getJobseeker(application) {
    return application?.jobseeker || application?.user || {};
}

function getJobPosting(application) {
    return application?.job_posting || application?.jobPosting || {};
}

function getApiError(data, fallback) {
    if (data?.errors) {
        return Object.values(data.errors).flat().join(" ");
    }

    return data?.message || fallback;
}

function StatusBadge({ status }) {
    return (
        <span
            className={`applicant-status applicant-status--${getStatusClass(
                status
            )}`}
        >
            <span className="applicant-status-dot" />
            {getStatusLabel(status)}
        </span>
    );
}

function StatCard({ title, count, icon: Icon, color, description }) {
    return (
        <div className="applicant-stat-card">
            <div
                className={`applicant-stat-icon applicant-stat-icon--${color}`}
            >
                <Icon size={23} />
            </div>

            <div className="applicant-stat-content">
                <span className="applicant-stat-title">{title}</span>
                <strong className="applicant-stat-count">{count}</strong>
                <span className="applicant-stat-description">
                    {description}
                </span>
            </div>
        </div>
    );
}

function DetailItem({ icon: Icon, label, value }) {
    return (
        <div className="applicants-detail-item">
            <Icon size={17} />
            <div>
                <span>{label}</span>
                <strong>{formatDetailValue(value)}</strong>
            </div>
        </div>
    );
}

function Applicants() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [selectedApplication, setSelectedApplication] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [detailsUpdating, setDetailsUpdating] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);
    const [resumeLoading, setResumeLoading] = useState(false);

    const fetchApplications = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        setError("");

        try {
            const token = getToken();

            if (!token) {
                throw new Error(
                    "Your session has expired. Please log in again."
                );
            }

            const response = await fetch(
                `${API_BASE}/employer/applications`,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    getApiError(data, "Unable to load applicants.")
                );
            }

            if (!Array.isArray(data.applications)) {
                throw new Error(
                    "The server returned an unexpected applications response."
                );
            }

            setApplications(data.applications);
        } catch (err) {
            setError(
                err.message ||
                    "Unable to load applicants. Check your connection and try again."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const handleViewResume = async (application) => {
        const applicationId = getApplicationId(application);

        if (!applicationId) {
            setError("Unable to identify this application.");
            return;
        }

        const token = getToken();

        if (!token) {
            setError("Your session has expired. Please log in again.");
            return;
        }

        setError("");
        setSuccess("");
        setResumeLoading(true);

        // Open the tab directly from the button click to reduce popup blocking.
        const resumeWindow = window.open("about:blank", "_blank");

        if (!resumeWindow) {
            setResumeLoading(false);
            setError("Please allow pop-ups to view the applicant's resume.");
            return;
        }

        resumeWindow.opener = null;
        resumeWindow.document.title = "Loading applicant resume...";
        resumeWindow.document.body.innerHTML =
            "<p style='font-family:Arial,sans-serif;padding:24px'>Loading resume...</p>";

        let pdfUrl = null;

        try {
            const response = await fetch(
                `${API_BASE}/employer/applications/${applicationId}/resume`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/pdf, application/json",
                    },
                }
            );

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));

                throw new Error(
                    getApiError(
                        data,
                        "Unable to open this applicant's resume."
                    )
                );
            }

            const blob = await response.blob();

            if (
                blob.type &&
                blob.type !== "application/pdf" &&
                !blob.type.includes("octet-stream")
            ) {
                throw new Error(
                    "The server did not return a PDF resume that can be viewed."
                );
            }

            pdfUrl = URL.createObjectURL(blob);
            resumeWindow.location.href = pdfUrl;

            // Revoke the temporary URL after the viewing tab is closed.
            const cleanup = () => {
                if (pdfUrl) {
                    URL.revokeObjectURL(pdfUrl);
                    pdfUrl = null;
                }
            };

            resumeWindow.addEventListener("pagehide", cleanup, {
                once: true,
            });
        } catch (err) {
            if (!resumeWindow.closed) {
                resumeWindow.close();
            }

            setError(
                err.message ||
                    "Unable to open this applicant's resume. Please try again."
            );
        } finally {
            setResumeLoading(false);
        }
    };

    const stats = useMemo(() => {
        const total = applications.length;

        const countStatus = (status) =>
            applications.filter(
                (application) =>
                    String(application.status || "").toLowerCase() === status
            ).length;

        return {
            total,
            submitted: countStatus("submitted"),
            shortlisted: countStatus("shortlisted"),
            hired: countStatus("hired"),
        };
    }, [applications]);

    const filteredApplications = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        return applications.filter((application) => {
            const applicant = getJobseeker(application);
            const job = getJobPosting(application);

            const name = getApplicantName(applicant).toLowerCase();
            const email = String(applicant.email || "").toLowerCase();
            const jobTitle = String(job.job_title || "").toLowerCase();
            const location = String(job.location || "").toLowerCase();

            const matchesSearch =
                !query ||
                name.includes(query) ||
                email.includes(query) ||
                jobTitle.includes(query) ||
                location.includes(query);

            const matchesStatus =
                statusFilter === "all" ||
                String(application.status || "").toLowerCase() ===
                    statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [applications, searchTerm, statusFilter]);

    const openDetails = (application) => {
        setSelectedApplication(application);
        setSelectedStatus(
            String(application.status || "submitted").toLowerCase()
        );
        setSuccess("");
        setError("");
    };

    const closeDetails = () => {
        if (detailsUpdating || resumeLoading) return;

        setSelectedApplication(null);
        setSelectedStatus("");
    };

    const updateApplicationStatus = async (application, nextStatus) => {
        const applicationId = getApplicationId(application);

        if (!applicationId) {
            setError("This application does not have a valid ID.");
            return false;
        }

        if (
            !STATUS_OPTIONS.some((option) => option.value === nextStatus)
        ) {
            setError("Please select a valid application status.");
            return false;
        }

        const currentStatus = String(application.status || "").toLowerCase();

        if (currentStatus === nextStatus) {
            setSuccess("The application already has this status.");
            return true;
        }

        setUpdatingId(applicationId);
        setDetailsUpdating(true);
        setError("");
        setSuccess("");

        try {
            const token = getToken();

            if (!token) {
                throw new Error(
                    "Your session has expired. Please log in again."
                );
            }

            const response = await fetch(
                `${API_BASE}/employer/applications/${applicationId}/status`,
                {
                    method: "PUT",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ status: nextStatus }),
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    getApiError(data, "Unable to update applicant status.")
                );
            }

            const updatedApplication = {
                ...application,
                ...(data.application || {}),
                status: data.application?.status || nextStatus,
            };

            setApplications((previous) =>
                previous.map((item) =>
                    String(getApplicationId(item)) ===
                    String(applicationId)
                        ? { ...item, ...updatedApplication }
                        : item
                )
            );

            setSelectedApplication((previous) => {
                if (
                    previous &&
                    String(getApplicationId(previous)) ===
                        String(applicationId)
                ) {
                    return { ...previous, ...updatedApplication };
                }

                return previous;
            });

            setSelectedStatus(updatedApplication.status);
            setSuccess(
                data.message || "Applicant status updated successfully."
            );

            return true;
        } catch (err) {
            setError(
                err.message ||
                    "Unable to update the applicant status. Please try again."
            );
            return false;
        } finally {
            setUpdatingId(null);
            setDetailsUpdating(false);
        }
    };

    const handleRowStatusChange = async (application, nextStatus) => {
        await updateApplicationStatus(application, nextStatus);
    };

    const handleDetailsStatusSave = async () => {
        if (!selectedApplication) return;

        await updateApplicationStatus(selectedApplication, selectedStatus);
    };

    const selectedApplicant = selectedApplication
        ? getJobseeker(selectedApplication)
        : null;

    const selectedJob = selectedApplication
        ? getJobPosting(selectedApplication)
        : null;

    const selectedProfile = selectedApplicant
        ? selectedApplicant.jobseeker_profile ||
          selectedApplicant.jobseekerProfile ||
          {}
        : {};

    const resumeAvailable = Boolean(selectedProfile.resume);

    return (
        <div className="employer-applicants-page">
            <div className="applicants-page-header">
                <div>
                    <div className="applicants-eyebrow">
                        EMPLOYER WORKSPACE
                    </div>
                    <h1>Applicants</h1>
                    <p>
                        Review applications, learn about candidates, and
                        manage your recruitment process.
                    </p>
                </div>

                <button
                    type="button"
                    className="applicants-refresh-button"
                    onClick={() => fetchApplications(true)}
                    disabled={loading || refreshing}
                >
                    <RefreshCw
                        size={17}
                        className={refreshing ? "applicants-spin" : ""}
                    />
                    {refreshing ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            {success && (
                <div className="applicants-alert applicants-alert--success">
                    <CheckCircle2 size={19} />
                    <span>{success}</span>
                    <button
                        type="button"
                        aria-label="Dismiss success message"
                        onClick={() => setSuccess("")}
                    >
                        <X size={17} />
                    </button>
                </div>
            )}

            {error && (
                <div className="applicants-alert applicants-alert--error">
                    <AlertCircle size={19} />
                    <span>{error}</span>
                    <button
                        type="button"
                        aria-label="Dismiss error message"
                        onClick={() => setError("")}
                    >
                        <X size={17} />
                    </button>
                </div>
            )}

            <div className="applicants-stats-grid">
                <StatCard
                    title="Total Applicants"
                    count={stats.total}
                    icon={Users}
                    color="navy"
                    description="All applications"
                />
                <StatCard
                    title="Submitted"
                    count={stats.submitted}
                    icon={ClipboardList}
                    color="gold"
                    description="Awaiting review"
                />
                <StatCard
                    title="Shortlisted"
                    count={stats.shortlisted}
                    icon={UserCheck}
                    color="blue"
                    description="Potential candidates"
                />
                <StatCard
                    title="Hired"
                    count={stats.hired}
                    icon={CheckCircle2}
                    color="green"
                    description="Successfully hired"
                />
            </div>

            <section className="applicants-content-card">
                <div className="applicants-section-heading">
                    <div>
                        <h2>Applications</h2>
                        <p>
                            {loading
                                ? "Loading applications..."
                                : `${filteredApplications.length} ${
                                      filteredApplications.length === 1
                                          ? "application"
                                          : "applications"
                                  } found`}
                        </p>
                    </div>

                    <span className="applicants-section-icon">
                        <Users size={21} />
                    </span>
                </div>

                <div className="applicants-toolbar">
                    <label className="applicants-search">
                        <Search size={19} />
                        <input
                            type="search"
                            placeholder="Search applicant, email, job title, or location..."
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                aria-label="Clear search"
                                onClick={() => setSearchTerm("")}
                            >
                                <X size={16} />
                            </button>
                        )}
                    </label>

                    <label className="applicants-status-filter">
                        <Filter size={17} />
                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(event.target.value)
                            }
                            aria-label="Filter applications by status"
                        >
                            <option value="all">All statuses</option>
                            {STATUS_OPTIONS.map((option) => (
                                <option
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown
                            size={16}
                            className="applicants-filter-chevron"
                        />
                    </label>
                </div>

                {loading ? (
                    <div className="applicants-state">
                        <LoaderCircle
                            size={38}
                            className="applicants-spin applicants-state-icon"
                        />
                        <h3>Loading applicants</h3>
                        <p>Please wait while we retrieve your applications.</p>
                    </div>
                ) : applications.length === 0 ? (
                    <div className="applicants-state">
                        <div className="applicants-empty-icon">
                            <Users size={32} />
                        </div>
                        <h3>No applicants yet</h3>
                        <p>
                            Applications for your job postings will appear
                            here once jobseekers apply.
                        </p>
                        <button
                            type="button"
                            className="applicants-secondary-button"
                            onClick={() => fetchApplications(true)}
                            disabled={refreshing}
                        >
                            <RefreshCw size={16} />
                            Check again
                        </button>
                    </div>
                ) : filteredApplications.length === 0 ? (
                    <div className="applicants-state applicants-state--compact">
                        <div className="applicants-empty-icon">
                            <Search size={28} />
                        </div>
                        <h3>No matching applications</h3>
                        <p>
                            Try a different search term or change the status
                            filter.
                        </p>
                        <button
                            type="button"
                            className="applicants-secondary-button"
                            onClick={() => {
                                setSearchTerm("");
                                setStatusFilter("all");
                            }}
                        >
                            Clear filters
                        </button>
                    </div>
                ) : (
                    <div className="applicants-table-wrap">
                        <table className="applicants-table">
                            <thead>
                                <tr>
                                    <th>Applicant</th>
                                    <th>Job Position</th>
                                    <th>Applied On</th>
                                    <th>Status</th>
                                    <th>Update Status</th>
                                    <th>Details</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredApplications.map(
                                    (application, index) => {
                                        const applicant =
                                            getJobseeker(application);
                                        const job = getJobPosting(application);
                                        const applicationId =
                                            getApplicationId(application);
                                        const applicantName =
                                            getApplicantName(applicant);
                                        const status = String(
                                            application.status || "submitted"
                                        ).toLowerCase();

                                        return (
                                            <tr
                                                key={
                                                    applicationId ??
                                                    `application-${index}`
                                                }
                                            >
                                                <td>
                                                    <div className="applicants-person-cell">
                                                        <div className="applicants-avatar">
                                                            {applicantName
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </div>
                                                        <div className="applicants-person-info">
                                                            <strong>
                                                                {applicantName}
                                                            </strong>
                                                            <span>
                                                                {applicant.email ||
                                                                    "No email provided"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>
                                                    <div className="applicants-job-cell">
                                                        <strong>
                                                            {job.job_title ||
                                                                "Job title unavailable"}
                                                        </strong>
                                                        <span>
                                                            <MapPin size={13} />
                                                            {job.location ||
                                                                "Location not specified"}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="applicants-date-cell">
                                                    <CalendarDays size={15} />
                                                    {formatDate(
                                                        getApplicationDate(
                                                            application
                                                        )
                                                    )}
                                                </td>

                                                <td>
                                                    <StatusBadge
                                                        status={status}
                                                    />
                                                </td>

                                                <td>
                                                    <label className="applicants-row-status">
                                                        <span className="sr-only">
                                                            Update status for{" "}
                                                            {applicantName}
                                                        </span>
                                                        <select
                                                            value={status}
                                                            onChange={(event) =>
                                                                handleRowStatusChange(
                                                                    application,
                                                                    event.target
                                                                        .value
                                                                )
                                                            }
                                                            disabled={
                                                                updatingId !==
                                                                null
                                                            }
                                                            aria-label={`Update status for ${applicantName}`}
                                                        >
                                                            {STATUS_OPTIONS.map(
                                                                (option) => (
                                                                    <option
                                                                        key={
                                                                            option.value
                                                                        }
                                                                        value={
                                                                            option.value
                                                                        }
                                                                    >
                                                                        {
                                                                            option.label
                                                                        }
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>
                                                        {updatingId ===
                                                            applicationId && (
                                                            <LoaderCircle
                                                                size={15}
                                                                className="applicants-spin"
                                                            />
                                                        )}
                                                    </label>
                                                </td>

                                                <td>
                                                    <button
                                                        type="button"
                                                        className="applicants-view-button"
                                                        onClick={() =>
                                                            openDetails(
                                                                application
                                                            )
                                                        }
                                                        aria-label={`View ${applicantName}'s details`}
                                                    >
                                                        <Eye size={16} />
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    }
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {selectedApplication && selectedApplicant && (
                <div
                    className="applicants-modal-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeDetails();
                        }
                    }}
                >
                    <section
                        className="applicants-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="applicants-modal-title"
                    >
                        <div className="applicants-modal-header">
                            <div>
                                <span className="applicants-modal-eyebrow">
                                    CANDIDATE PROFILE
                                </span>
                                <h2 id="applicants-modal-title">
                                    Applicant Details
                                </h2>
                            </div>

                            <button
                                type="button"
                                className="applicants-modal-close"
                                onClick={closeDetails}
                                disabled={detailsUpdating || resumeLoading}
                                aria-label="Close applicant details"
                            >
                                <X size={21} />
                            </button>
                        </div>

                        <div className="applicants-modal-body">
                            <div className="applicants-profile-summary">
                                <div className="applicants-profile-avatar">
                                    {getApplicantName(selectedApplicant)
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>
                                <div>
                                    <h3>
                                        {getApplicantName(selectedApplicant)}
                                    </h3>
                                    <p>
                                        {selectedJob?.job_title ||
                                            "Job title unavailable"}
                                    </p>
                                    <StatusBadge
                                        status={selectedApplication.status}
                                    />
                                </div>
                            </div>

                            <div className="applicants-detail-section">
                                <h4>Contact Information</h4>

                                <div className="applicants-detail-grid">
                                    <DetailItem
                                        icon={Mail}
                                        label="Email Address"
                                        value={selectedApplicant.email}
                                    />
                                    <DetailItem
                                        icon={Phone}
                                        label="Phone Number"
                                        value={getProfileValue(
                                            selectedProfile,
                                            ["phone", "contact_number", "mobile"]
                                        ) || selectedApplicant.phone}
                                    />
                                    <DetailItem
                                        icon={MapPin}
                                        label="Address"
                                        value={getProfileValue(
                                            selectedProfile,
                                            [
                                                "address",
                                                "current_address",
                                                "permanent_address",
                                            ]
                                        ) || selectedApplicant.address}
                                    />
                                    <DetailItem
                                        icon={UserRound}
                                        label="Gender"
                                        value={getProfileValue(
                                            selectedProfile,
                                            ["gender"]
                                        )}
                                    />
                                    <DetailItem
                                        icon={CalendarDays}
                                        label="Birth Date"
                                        value={formatDate(
                                            getProfileValue(selectedProfile, [
                                                "birth_date",
                                                "date_of_birth",
                                                "birthday",
                                            ])
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="applicants-detail-section">
                                <h4>Education</h4>

                                <div className="applicants-detail-grid">
                                    <DetailItem
                                        icon={GraduationCap}
                                        label="Highest Education"
                                        value={getProfileValue(
                                            selectedProfile,
                                            ["education"]
                                        )}
                                    />
                                    <DetailItem
                                        icon={BookOpen}
                                        label="Course / Degree"
                                        value={getProfileValue(
                                            selectedProfile,
                                            ["course"]
                                        )}
                                    />
                                    <DetailItem
                                        icon={GraduationCap}
                                        label="School"
                                        value={getProfileValue(
                                            selectedProfile,
                                            ["school"]
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="applicants-detail-section">
                                <h4>Skills</h4>
                                <p className="applicants-status-help">
                                    {formatDetailValue(
                                        getProfileValue(selectedProfile, [
                                            "skills",
                                        ])
                                    )}
                                </p>
                            </div>

                            <div className="applicants-detail-section">
                                <h4>Work Experience</h4>
                                <p className="applicants-status-help">
                                    {formatDetailValue(
                                        getProfileValue(selectedProfile, [
                                            "work_experience",
                                        ])
                                    )}
                                </p>
                            </div>

                            <div className="applicants-detail-section">
                                <h4>Application Information</h4>

                                <div className="applicants-detail-grid">
                                    <DetailItem
                                        icon={BriefcaseBusiness}
                                        label="Job Position"
                                        value={selectedJob?.job_title}
                                    />
                                    <DetailItem
                                        icon={MapPin}
                                        label="Job Location"
                                        value={selectedJob?.location}
                                    />
                                    <DetailItem
                                        icon={Clock}
                                        label="Employment Type"
                                        value={selectedJob?.employment_type}
                                    />
                                    <DetailItem
                                        icon={CalendarDays}
                                        label="Date Applied"
                                        value={formatDate(
                                            getApplicationDate(
                                                selectedApplication
                                            )
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="applicants-detail-section">
                                <h4>Resume / CV</h4>
                                <p className="applicants-status-help">
                                    View the applicant's uploaded PDF resume.
                                </p>

                                <button
                                    type="button"
                                    className="applicants-secondary-button"
                                    onClick={() =>
                                        handleViewResume(selectedApplication)
                                    }
                                    disabled={resumeLoading}
                                >
                                    {resumeLoading ? (
                                        <>
                                            <LoaderCircle
                                                size={17}
                                                className="applicants-spin"
                                            />
                                            Opening Resume...
                                        </>
                                    ) : (
                                        <>
                                            <FileText size={17} />
                                            View Resume (PDF)
                                        </>
                                    )}
                                </button>

                                {!resumeAvailable && (
                                    <p className="applicants-status-help">
                                        Resume availability will be confirmed
                                        by the server when you click the button.
                                    </p>
                                )}
                            </div>

                            <div className="applicants-detail-section">
                                <h4>Update Application Status</h4>
                                <p className="applicants-status-help">
                                    Select the candidate's current recruitment
                                    stage, then save your change.
                                </p>

                                <label className="applicants-modal-status-label">
                                    Application Status
                                    <select
                                        value={selectedStatus}
                                        onChange={(event) =>
                                            setSelectedStatus(
                                                event.target.value
                                            )
                                        }
                                        disabled={detailsUpdating}
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
                            </div>
                        </div>

                        <div className="applicants-modal-footer">
                            <button
                                type="button"
                                className="applicants-secondary-button"
                                onClick={closeDetails}
                                disabled={detailsUpdating || resumeLoading}
                            >
                                Close
                            </button>

                            <button
                                type="button"
                                className="applicants-primary-button"
                                onClick={handleDetailsStatusSave}
                                disabled={detailsUpdating}
                            >
                                {detailsUpdating ? (
                                    <>
                                        <LoaderCircle
                                            size={17}
                                            className="applicants-spin"
                                        />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={17} />
                                        Save Status
                                    </>
                                )}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}

export default Applicants;
