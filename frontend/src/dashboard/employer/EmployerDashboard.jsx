
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    BriefcaseBusiness,
    Users,
    Clock3,
    CheckCircle2,
    CalendarDays,
    Building2,
    ArrowRight,
    LoaderCircle,
    RefreshCw,
} from "lucide-react";

import "./EmployerDashboard.css";

const API_URL = "http://127.0.0.1:8000/api";

/* =========================================
   API RESPONSE HELPERS
========================================= */

function getArray(data, possibleKeys = []) {
    if (Array.isArray(data)) return data;
    if (!data || typeof data !== "object") return [];

    for (const key of possibleKeys) {
        const value = data[key];

        if (Array.isArray(value)) return value;

        if (value && typeof value === "object") {
            const nested = getArray(value, possibleKeys);

            if (nested.length > 0) return nested;
        }
    }

    if (data.data && typeof data.data === "object") {
        return getArray(data.data, possibleKeys);
    }

    return [];
}

function normalizeStatus(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ");
}

function getStatus(item) {
    return normalizeStatus(
        item?.status ??
        item?.application_status ??
        item?.approval_status ??
        ""
    );
}

function formatDate(value) {
    if (!value) return "Date not specified";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function getTimestamp(value) {
    if (!value) return 0;

    const timestamp = new Date(value).getTime();

    return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getJobTitle(job) {
    return (
        job?.title ||
        job?.job_title ||
        job?.position ||
        job?.name ||
        "Untitled job"
    );
}

function getApplicantName(application) {
    const applicant =
        application?.jobseeker ||
        application?.user ||
        application?.applicant ||
        {};

    const fullName = [
        applicant?.first_name,
        applicant?.middle_name,
        applicant?.surname,
        applicant?.name_extension,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        applicant?.name ||
        applicant?.full_name ||
        fullName ||
        application?.applicant_name ||
        "Applicant"
    );
}

function getStatusClass(status) {
    const normalized = normalizeStatus(status);

    if (
        [
            "approved",
            "active",
            "published",
            "open",
            "hired",
            "shortlisted",
            "interview",
        ].includes(normalized)
    ) {
        return "employer-status-success";
    }

    if (
        [
            "pending",
            "pending approval",
            "submitted",
            "under review",
            "reviewing",
            "applied",
        ].includes(normalized)
    ) {
        return "employer-status-pending";
    }

    if (
        [
            "rejected",
            "closed",
            "cancelled",
            "canceled",
        ].includes(normalized)
    ) {
        return "employer-status-danger";
    }

    return "employer-status-neutral";
}

function formatStatus(status) {
    if (!status) return "Unknown";

    return status.replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
    );
}

function getFairTitle(fair) {
    return (
        fair?.title ||
        fair?.name ||
        fair?.event_name ||
        "PESO Job Fair"
    );
}

function getFairDate(fair) {
    return (
        fair?.start_date ||
        fair?.event_date ||
        fair?.date ||
        fair?.scheduled_at ||
        null
    );
}

function getErrorMessage(payload, fallback) {
    return (
        payload?.message ||
        payload?.error ||
        fallback
    );
}

/* =========================================
   EMPLOYER DASHBOARD
========================================= */

function EmployerDashboard() {
    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [jobFairs, setJobFairs] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Track each endpoint separately so a failed request
    // is not mistaken for a successful empty result.
    const [loaded, setLoaded] = useState({
        jobs: false,
        applications: false,
        jobFairs: false,
    });

    const loadDashboard = useCallback(async () => {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("pesoToken");

        if (!token) {
            setError(
                "Your session could not be found. Please log in again."
            );
            setLoading(false);
            return;
        }

        const headers = {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        };

        const endpoints = [
            {
                key: "jobs",
                url: `${API_URL}/employer/jobs`,
                keys: ["jobs", "job_posts", "data"],
                setter: setJobs,
            },
            {
                key: "applications",
                url: `${API_URL}/employer/applications`,
                keys: ["applications", "data"],
                setter: setApplications,
            },
            {
                key: "jobFairs",
                url: `${API_URL}/employer/job-fairs`,
                keys: ["job_fairs", "jobFairs", "data"],
                setter: setJobFairs,
            },
        ];

        const results = await Promise.all(
            endpoints.map(async (endpoint) => {
                try {
                    const response = await fetch(endpoint.url, {
                        method: "GET",
                        headers,
                    });

                    let payload = null;

                    try {
                        payload = await response.json();
                    } catch {
                        payload = null;
                    }

                    if (!response.ok) {
                        return {
                            ...endpoint,
                            success: false,
                            message: getErrorMessage(
                                payload,
                                `${endpoint.key} could not be loaded (HTTP ${response.status}).`
                            ),
                        };
                    }

                    if (
                        payload &&
                        typeof payload === "object" &&
                        payload.success === false
                    ) {
                        return {
                            ...endpoint,
                            success: false,
                            message: getErrorMessage(
                                payload,
                                `${endpoint.key} could not be loaded.`
                            ),
                        };
                    }

                    return {
                        ...endpoint,
                        success: true,
                        data: getArray(payload, endpoint.keys),
                    };
                } catch {
                    return {
                        ...endpoint,
                        success: false,
                        message: `Unable to connect to the ${endpoint.key} endpoint.`,
                    };
                }
            })
        );

        const nextLoaded = {
            jobs: false,
            applications: false,
            jobFairs: false,
        };

        const failures = [];

        for (const result of results) {
            if (result.success) {
                result.setter(result.data);
                nextLoaded[result.key] = true;
            } else {
                failures.push(result.message);
            }
        }

        setLoaded(nextLoaded);

        if (failures.length > 0) {
            setError(
                `Some dashboard information could not be loaded. ${failures.join(" ")}`
            );
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    /* =========================================
       DERIVED DASHBOARD DATA
    ========================================= */

    const isActiveJob = (job) => {
        const status = getStatus(job);

        return [
            "approved",
            "active",
            "published",
            "open",
        ].includes(status);
    };

    const isPendingJob = (job) => {
        const status = getStatus(job);

        return [
            "pending",
            "pending approval",
            "submitted",
            "under review",
        ].includes(status);
    };

    const activeJobs = jobs.filter(isActiveJob);
    const pendingJobs = jobs.filter(isPendingJob);

    const recentJobs = [...jobs]
        .sort(
            (a, b) =>
                getTimestamp(b?.created_at || b?.createdAt) -
                getTimestamp(a?.created_at || a?.createdAt)
        )
        .slice(0, 5);

    const recentApplications = [...applications]
        .sort(
            (a, b) =>
                getTimestamp(
                    b?.created_at ||
                    b?.applied_at ||
                    b?.createdAt
                ) -
                getTimestamp(
                    a?.created_at ||
                    a?.applied_at ||
                    a?.createdAt
                )
        )
        .slice(0, 5);

    const stats = [
        {
            label: "Total Job Posts",
            value: loaded.jobs ? jobs.length : "—",
            description: "All your submitted vacancies",
            icon: BriefcaseBusiness,
        },
        {
            label: "Active Jobs",
            value: loaded.jobs ? activeJobs.length : "—",
            description: "Approved or published vacancies",
            icon: CheckCircle2,
        },
        {
            label: "Pending Approval",
            value: loaded.jobs ? pendingJobs.length : "—",
            description: "Posts awaiting review",
            icon: Clock3,
        },
        {
            label: "Total Applicants",
            value: loaded.applications
                ? applications.length
                : "—",
            description: "Applications received",
            icon: Users,
        },
    ];

    /* =========================================
       LOADING STATE
    ========================================= */

    if (loading) {
        return (
            <div className="employer-dashboard">
                <div className="dashboard-panel">
                    <div className="dashboard-empty-state">
                        <LoaderCircle
                            size={34}
                            className="employer-loading-icon"
                        />

                        <h4>Loading Employer Dashboard</h4>

                        <p>
                            Please wait while we retrieve your
                            recruitment information.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    /* =========================================
       DASHBOARD VIEW
    ========================================= */

    return (
        <div className="employer-dashboard">
            <section className="dashboard-welcome">
                <span className="dashboard-section-label">
                    EMPLOYER PORTAL
                </span>

                <h2>Employer Dashboard</h2>

                <p>
                    Welcome to your recruitment workspace. Manage
                    your job vacancies, review applicants, and
                    participate in PESO employment programs.
                </p>

                <div className="employer-welcome-actions">
                    <button
                        type="button"
                        className="employer-primary-button"
                        onClick={() => navigate("/employer/jobs")}
                    >
                        <BriefcaseBusiness size={17} />
                        Post a Job
                    </button>

                    <button
                        type="button"
                        className="employer-secondary-button"
                        onClick={() =>
                            navigate("/employer/company-profile")
                        }
                    >
                        <Building2 size={17} />
                        Company Profile
                    </button>
                </div>
            </section>

            {error && (
                <div
                    className="employer-dashboard-alert"
                    role="alert"
                >
                    <span>{error}</span>

                    <button
                        type="button"
                        onClick={loadDashboard}
                        aria-label="Refresh dashboard"
                    >
                        <RefreshCw size={16} />
                        Retry
                    </button>
                </div>
            )}

            {/* Statistics */}
            <section
                className="dashboard-stats"
                aria-label="Recruitment statistics"
            >
                {stats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <article
                            className="dashboard-stat-card"
                            key={stat.label}
                        >
                            <div className="employer-stat-heading">
                                <span>{stat.label}</span>

                                <div className="employer-stat-icon">
                                    <Icon size={20} />
                                </div>
                            </div>

                            <strong>{stat.value}</strong>

                            <small>{stat.description}</small>
                        </article>
                    );
                })}
            </section>

            {/* Recent jobs and applicants */}
            <section className="dashboard-grid">
                <div className="dashboard-panel">
                    <div className="dashboard-panel-header">
                        <div>
                            <span>RECRUITMENT</span>
                            <h3>Recent Job Posts</h3>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate("/employer/jobs")}
                        >
                            View All
                            <ArrowRight size={14} />
                        </button>
                    </div>

                    {!loaded.jobs ? (
                        <div className="dashboard-empty-state compact">
                            <h4>Job posts unavailable</h4>
                            <p>
                                We couldn't retrieve your job posts.
                                Please try refreshing the dashboard.
                            </p>
                        </div>
                    ) : recentJobs.length > 0 ? (
                        <div className="employer-list">
                            {recentJobs.map((job, index) => {
                                const status =
                                    getStatus(job) || "unknown";

                                return (
                                    <div
                                        className="employer-list-item"
                                        key={job.id ?? index}
                                    >
                                        <div className="employer-item-icon">
                                            <BriefcaseBusiness size={19} />
                                        </div>

                                        <div className="employer-item-content">
                                            <h4>{getJobTitle(job)}</h4>

                                            <p>
                                                Posted{" "}
                                                {formatDate(
                                                    job.created_at ||
                                                    job.createdAt
                                                )}
                                            </p>

                                            <span
                                                className={`employer-status ${getStatusClass(status)}`}
                                            >
                                                {formatStatus(status)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="dashboard-empty-state compact">
                            <div className="empty-state-number">01</div>
                            <h4>No job posts yet</h4>
                            <p>
                                Your job vacancies will appear here
                                once you create your first job post.
                            </p>

                            <button
                                type="button"
                                className="employer-text-button"
                                onClick={() =>
                                    navigate("/employer/jobs")
                                }
                            >
                                Create your first job post
                                <ArrowRight size={15} />
                            </button>
                        </div>
                    )}
                </div>

                <div className="dashboard-panel">
                    <div className="dashboard-panel-header">
                        <div>
                            <span>YOUR CANDIDATES</span>
                            <h3>Recent Applicants</h3>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/employer/applicants")
                            }
                        >
                            View All
                            <ArrowRight size={14} />
                        </button>
                    </div>

                    {!loaded.applications ? (
                        <div className="dashboard-empty-state compact">
                            <h4>Applicants unavailable</h4>
                            <p>
                                We couldn't retrieve your applications.
                                Please try refreshing the dashboard.
                            </p>
                        </div>
                    ) : recentApplications.length > 0 ? (
                        <div className="employer-list">
                            {recentApplications.map(
                                (application, index) => {
                                    const status =
                                        getStatus(application) || "applied";

                                    const job =
                                        application.job ||
                                        application.job_post ||
                                        {
                                            title:
                                                application.job_title ||
                                                application.job?.title,
                                        };

                                    return (
                                        <div
                                            className="employer-list-item"
                                            key={application.id ?? index}
                                        >
                                            <div className="employer-item-icon">
                                                <Users size={19} />
                                            </div>

                                            <div className="employer-item-content">
                                                <h4>
                                                    {getApplicantName(
                                                        application
                                                    )}
                                                </h4>

                                                <p>{getJobTitle(job)}</p>

                                                <span
                                                    className={`employer-status ${getStatusClass(status)}`}
                                                >
                                                    {formatStatus(status)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    ) : (
                        <div className="dashboard-empty-state compact">
                            <div className="empty-state-number">02</div>
                            <h4>No applicants yet</h4>
                            <p>
                                Applications will appear here when
                                jobseekers apply to your vacancies.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* Job fairs */}
            <section className="dashboard-panel employer-fairs-panel">
                <div className="dashboard-panel-header">
                    <div>
                        <span>PESO EMPLOYMENT PROGRAMS</span>
                        <h3>Job Fairs</h3>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/employer/job-fairs")
                        }
                    >
                        Explore Job Fairs
                        <ArrowRight size={14} />
                    </button>
                </div>

                {!loaded.jobFairs ? (
                    <div className="dashboard-empty-state compact">
                        <h4>Job fairs unavailable</h4>
                        <p>
                            We couldn't retrieve job fair information.
                            Please try refreshing the dashboard.
                        </p>
                    </div>
                ) : jobFairs.length > 0 ? (
                    <div className="employer-fairs-list">
                        {jobFairs.slice(0, 3).map((fair, index) => {
                            const status =
                                getStatus(fair) || "available";

                            return (
                                <div
                                    className="employer-fair-item"
                                    key={fair.id ?? index}
                                >
                                    <div className="employer-item-icon">
                                        <CalendarDays size={20} />
                                    </div>

                                    <div className="employer-item-content">
                                        <h4>{getFairTitle(fair)}</h4>

                                        <p>
                                            {formatDate(getFairDate(fair))}
                                        </p>
                                    </div>

                                    <span
                                        className={`employer-status ${getStatusClass(status)}`}
                                    >
                                        {formatStatus(status)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="dashboard-empty-state compact">
                        <div className="empty-state-number">03</div>
                        <h4>No job fairs to display</h4>
                        <p>
                            Available job fairs will appear here when
                            information is published by PESO.
                        </p>

                        <button
                            type="button"
                            className="employer-text-button"
                            onClick={() =>
                                navigate("/employer/job-fairs")
                            }
                        >
                            View Job Fairs
                            <ArrowRight size={15} />
                        </button>
                    </div>
                )}
            </section>

            {/* Quick actions */}
            <section className="employer-quick-actions">
                <div className="employer-quick-actions-heading">
                    <span className="dashboard-section-label">
                        QUICK ACCESS
                    </span>

                    <h3>What would you like to do?</h3>
                </div>

                <div className="employer-quick-actions-grid">
                    <button
                        type="button"
                        className="employer-quick-action"
                        onClick={() => navigate("/employer/jobs")}
                    >
                        <BriefcaseBusiness size={21} />

                        <span>
                            <strong>Manage Job Posts</strong>
                            <small>Create and manage vacancies</small>
                        </span>

                        <ArrowRight size={16} />
                    </button>

                    <button
                        type="button"
                        className="employer-quick-action"
                        onClick={() =>
                            navigate("/employer/applicants")
                        }
                    >
                        <Users size={21} />

                        <span>
                            <strong>Review Applicants</strong>
                            <small>View your job applicants</small>
                        </span>

                        <ArrowRight size={16} />
                    </button>

                    <button
                        type="button"
                        className="employer-quick-action"
                        onClick={() =>
                            navigate("/employer/job-fairs")
                        }
                    >
                        <CalendarDays size={21} />

                        <span>
                            <strong>Join a Job Fair</strong>
                            <small>Explore PESO employment events</small>
                        </span>

                        <ArrowRight size={16} />
                    </button>

                    <button
                        type="button"
                        className="employer-quick-action"
                        onClick={() =>
                            navigate("/employer/company-profile")
                        }
                    >
                        <Building2 size={21} />

                        <span>
                            <strong>Update Company Profile</strong>
                            <small>
                                Keep your company information current
                            </small>
                        </span>

                        <ArrowRight size={16} />
                    </button>
                </div>
            </section>
        </div>
    );
}

export default EmployerDashboard;
