
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    CalendarDays,
    MapPin,
    Clock,
    Search,
    RefreshCw,
    BriefcaseBusiness,
    ClipboardCheck,
    Building2,
    X,
    LoaderCircle,
    CheckCircle2,
    AlertCircle,
    Users,
    CalendarClock,
} from "lucide-react";
import "./EmployerJobFairs.css";

const API_BASE = "http://127.0.0.1:8000/api";

function getToken() {
    return localStorage.getItem("pesoToken");
}

async function apiRequest(path, options = {}) {
    const token = getToken();

    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const validationMessage = data.errors
            ? Object.values(data.errors).flat().join(" ")
            : "";

        throw new Error(
            validationMessage ||
            data.message ||
            `Request failed (${response.status}).`
        );
    }

    return data;
}

function formatDate(value) {
    if (!value) return "Date to be announced";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function formatDateTime(value) {
    if (!value) return "Not specified";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function getErrorMessage(error) {
    return error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.";
}

function getStatusClass(status) {
    return String(status || "unknown")
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-");
}

function EmployerJobFairs() {
    const [jobFairs, setJobFairs] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [approvedJobs, setApprovedJobs] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState(null);

    const [activeTab, setActiveTab] = useState("available");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedFair, setSelectedFair] = useState(null);

    const [registeringId, setRegisteringId] = useState(null);
    const [vacancyFair, setVacancyFair] = useState(null);
    const [vacancyJobId, setVacancyJobId] = useState("");
    const [vacanciesOffered, setVacanciesOffered] = useState("1");
    const [submittingVacancy, setSubmittingVacancy] = useState(false);

    const loadData = useCallback(async (showRefresh = false) => {
        if (!getToken()) {
            setError("Your session token was not found. Please log in again.");
            setLoading(false);
            setRefreshing(false);
            return;
        }

        if (showRefresh) setRefreshing(true);
        else setLoading(true);

        setError("");

        const results = await Promise.allSettled([
            apiRequest("/employer/job-fairs"),
            apiRequest("/employer/job-fairs/my"),
            apiRequest("/employer/jobs"),
        ]);

        const [fairsResult, registrationsResult, jobsResult] = results;
        const errors = [];

        if (fairsResult.status === "fulfilled") {
            const fairs = fairsResult.value.job_fairs;
            setJobFairs(Array.isArray(fairs) ? fairs : []);
        } else {
            setJobFairs([]);
            errors.push(
                `Job fairs: ${getErrorMessage(fairsResult.reason)}`
            );
        }

        if (registrationsResult.status === "fulfilled") {
            const items = registrationsResult.value.registrations;
            setRegistrations(Array.isArray(items) ? items : []);
        } else {
            setRegistrations([]);
            errors.push(
                `My registrations: ${getErrorMessage(registrationsResult.reason)}`
            );
        }

        if (jobsResult.status === "fulfilled") {
            const jobs = jobsResult.value.jobs;
            setApprovedJobs(
                Array.isArray(jobs)
                    ? jobs.filter(
                        (job) =>
                            String(job.status || "").toLowerCase() === "approved"
                    )
                    : []
            );
        } else {
            setApprovedJobs([]);
            errors.push(
                `Approved job postings: ${getErrorMessage(jobsResult.reason)}`
            );
        }

        setError(errors.join(" "));
        setLoading(false);
        setRefreshing(false);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const registeredFairIds = useMemo(
        () =>
            new Set(
                registrations
                    .map((registration) =>
                        Number(registration.job_fair_id ?? registration.job_fair?.id)
                    )
                    .filter(Number.isFinite)
            ),
        [registrations]
    );

    const filteredFairs = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        return jobFairs.filter((fair) => {
            const matchesSearch =
                !normalizedSearch ||
                [
                    fair.title,
                    fair.description,
                    fair.venue,
                ].some((value) =>
                    String(value || "").toLowerCase().includes(normalizedSearch)
                );

            const matchesStatus =
                statusFilter === "all" ||
                String(fair.status || "").toLowerCase() === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [jobFairs, search, statusFilter]);

    const registeredFairs = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        return registrations.filter((registration) => {
            const fair = registration.job_fair || {};
            const matchesSearch =
                !normalizedSearch ||
                [
                    fair.title,
                    fair.description,
                    fair.venue,
                ].some((value) =>
                    String(value || "").toLowerCase().includes(normalizedSearch)
                );

            const matchesStatus =
                statusFilter === "all" ||
                String(registration.status || "").toLowerCase() === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [registrations, search, statusFilter]);

    async function handleRegister(fair) {
        if (registeredFairIds.has(Number(fair.id))) {
            setNotice({
                type: "error",
                text: "Your company is already registered for this job fair.",
            });
            return;
        }

        const confirmed = window.confirm(
            `Register your company for "${fair.title}"?`
        );

        if (!confirmed) return;

        setRegisteringId(fair.id);
        setNotice(null);

        try {
            const data = await apiRequest(
                `/employer/job-fairs/${fair.id}/register`,
                { method: "POST" }
            );

            setNotice({
                type: "success",
                text: data.message || "Successfully registered for the job fair.",
            });

            await loadData(true);
        } catch (requestError) {
            setNotice({
                type: "error",
                text: getErrorMessage(requestError),
            });
        } finally {
            setRegisteringId(null);
        }
    }

    function openVacancyForm(fair) {
        if (!registeredFairIds.has(Number(fair.id))) {
            setNotice({
                type: "error",
                text: "Register for this job fair before submitting vacancies.",
            });
            return;
        }

        setVacancyFair(fair);
        setVacancyJobId("");
        setVacanciesOffered("1");
        setNotice(null);
    }

    async function handleSubmitVacancy(event) {
        event.preventDefault();

        if (!vacancyFair) return;

        const count = Number(vacanciesOffered);

        if (!vacancyJobId) {
            setNotice({
                type: "error",
                text: "Please select an approved job posting.",
            });
            return;
        }

        if (!Number.isInteger(count) || count < 1) {
            setNotice({
                type: "error",
                text: "Vacancies offered must be a whole number of at least 1.",
            });
            return;
        }

        setSubmittingVacancy(true);
        setNotice(null);

        try {
            const data = await apiRequest(
                `/employer/job-fairs/${vacancyFair.id}/vacancies`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        job_posting_id: Number(vacancyJobId),
                        vacancies_offered: count,
                    }),
                }
            );

            setNotice({
                type: "success",
                text: data.message || "Vacancies submitted successfully.",
            });

            setVacancyFair(null);
            await loadData(true);
        } catch (requestError) {
            setNotice({
                type: "error",
                text: getErrorMessage(requestError),
            });
        } finally {
            setSubmittingVacancy(false);
        }
    }

    function showDetails(fair) {
        setSelectedFair(fair);
    }

    function closeDialogs() {
        setSelectedFair(null);
        setVacancyFair(null);
    }

    if (loading) {
        return (
            <div className="employer-fairs-page">
                <div className="ef-loading">
                    <LoaderCircle className="ef-spin" size={34} />
                    <h2>Loading job fairs...</h2>
                    <p>Fetching events and your employer participation.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="employer-fairs-page">
            <section className="ef-hero">
                <div className="ef-hero-copy">
                    <span className="ef-eyebrow">
                        PUBLIC EMPLOYMENT SERVICE OFFICE
                    </span>
                    <h1>Job Fairs</h1>
                    <p>
                        Discover employment events, register your company,
                        and submit approved vacancies for jobseekers.
                    </p>
                </div>

                <div className="ef-hero-icon" aria-hidden="true">
                    <CalendarDays size={54} />
                </div>
            </section>

            {error && (
                <div className="ef-alert ef-alert-error" role="alert">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                    <button
                        type="button"
                        onClick={() => loadData(true)}
                        className="ef-alert-action"
                    >
                        Retry
                    </button>
                </div>
            )}

            {notice && (
                <div
                    className={`ef-alert ${
                        notice.type === "success"
                            ? "ef-alert-success"
                            : "ef-alert-error"
                    }`}
                    role="status"
                >
                    {notice.type === "success" ? (
                        <CheckCircle2 size={20} />
                    ) : (
                        <AlertCircle size={20} />
                    )}
                    <span>{notice.text}</span>
                    <button
                        type="button"
                        className="ef-alert-close"
                        aria-label="Dismiss message"
                        onClick={() => setNotice(null)}
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            <section className="ef-stats">
                <div className="ef-stat-card">
                    <span className="ef-stat-icon ef-stat-blue">
                        <CalendarDays size={22} />
                    </span>
                    <div>
                        <span className="ef-stat-label">Available Job Fairs</span>
                        <strong>{jobFairs.length}</strong>
                    </div>
                </div>

                <div className="ef-stat-card">
                    <span className="ef-stat-icon ef-stat-green">
                        <ClipboardCheck size={22} />
                    </span>
                    <div>
                        <span className="ef-stat-label">My Registrations</span>
                        <strong>{registrations.length}</strong>
                    </div>
                </div>

                <div className="ef-stat-card">
                    <span className="ef-stat-icon ef-stat-gold">
                        <BriefcaseBusiness size={22} />
                    </span>
                    <div>
                        <span className="ef-stat-label">Approved Job Posts</span>
                        <strong>{approvedJobs.length}</strong>
                    </div>
                </div>
            </section>

            <section className="ef-content-card">
                <div className="ef-content-heading">
                    <div>
                        <h2>Explore Job Fairs</h2>
                        <p>Find an event that fits your hiring needs.</p>
                    </div>

                    <button
                        type="button"
                        className="ef-refresh-button"
                        onClick={() => loadData(true)}
                        disabled={refreshing}
                    >
                        <RefreshCw
                            size={16}
                            className={refreshing ? "ef-spin" : ""}
                        />
                        Refresh
                    </button>
                </div>

                <div className="ef-tabs" role="tablist">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeTab === "available"}
                        className={activeTab === "available" ? "active" : ""}
                        onClick={() => setActiveTab("available")}
                    >
                        <CalendarDays size={17} />
                        Available Fairs
                        <span>{jobFairs.length}</span>
                    </button>

                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeTab === "registered"}
                        className={activeTab === "registered" ? "active" : ""}
                        onClick={() => setActiveTab("registered")}
                    >
                        <ClipboardCheck size={17} />
                        My Registrations
                        <span>{registrations.length}</span>
                    </button>
                </div>

                <div className="ef-toolbar">
                    <label className="ef-search">
                        <Search size={18} />
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search title, venue, or description..."
                        />
                    </label>

                    <select
                        aria-label="Filter job fairs by status"
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                    >
                        <option value="all">All statuses</option>
                        {activeTab === "available" ? (
                            <>
                                <option value="upcoming">Upcoming</option>
                                <option value="ongoing">Ongoing</option>
                            </>
                        ) : (
                            <>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </>
                        )}
                    </select>
                </div>

                {activeTab === "available" ? (
                    filteredFairs.length === 0 ? (
                        <div className="ef-empty">
                            <span className="ef-empty-icon">
                                <CalendarDays size={32} />
                            </span>
                            <h3>No job fairs found</h3>
                            <p>
                                {jobFairs.length === 0
                                    ? "There are currently no upcoming or ongoing job fairs. Please check again later."
                                    : "Try a different search or status filter."}
                            </p>
                        </div>
                    ) : (
                        <div className="ef-fair-grid">
                            {filteredFairs.map((fair) => {
                                const registered = registeredFairIds.has(
                                    Number(fair.id)
                                );

                                return (
                                    <article
                                        className="ef-fair-card"
                                        key={fair.id}
                                    >
                                        <div className="ef-fair-card-top">
                                            <span className="ef-fair-icon">
                                                <CalendarDays size={24} />
                                            </span>
                                            <span
                                                className={`ef-status-badge ef-status-${getStatusClass(
                                                    fair.status
                                                )}`}
                                            >
                                                {fair.status || "Available"}
                                            </span>
                                        </div>

                                        <h3>{fair.title}</h3>

                                        <p className="ef-fair-description">
                                            {fair.description ||
                                                "No event description provided."}
                                        </p>

                                        <div className="ef-fair-meta">
                                            <span>
                                                <CalendarClock size={17} />
                                                {formatDate(fair.start_date)}
                                                {fair.end_date &&
                                                formatDate(fair.end_date) !==
                                                    formatDate(fair.start_date)
                                                    ? ` – ${formatDate(fair.end_date)}`
                                                    : ""}
                                            </span>
                                            <span>
                                                <MapPin size={17} />
                                                {fair.venue || "Venue to be announced"}
                                            </span>
                                        </div>

                                        <div className="ef-card-actions">
                                            <button
                                                type="button"
                                                className="ef-button ef-button-outline"
                                                onClick={() => showDetails(fair)}
                                            >
                                                View Details
                                            </button>

                                            {registered ? (
                                                <button
                                                    type="button"
                                                    className="ef-button ef-button-success"
                                                    onClick={() =>
                                                        openVacancyForm(fair)
                                                    }
                                                >
                                                    <BriefcaseBusiness size={16} />
                                                    Submit Vacancies
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="ef-button ef-button-primary"
                                                    disabled={
                                                        registeringId === fair.id
                                                    }
                                                    onClick={() =>
                                                        handleRegister(fair)
                                                    }
                                                >
                                                    {registeringId === fair.id ? (
                                                        <LoaderCircle
                                                            size={17}
                                                            className="ef-spin"
                                                        />
                                                    ) : (
                                                        <ClipboardCheck size={17} />
                                                    )}
                                                    Register
                                                </button>
                                            )}
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )
                ) : registeredFairs.length === 0 ? (
                    <div className="ef-empty">
                        <span className="ef-empty-icon">
                            <ClipboardCheck size={32} />
                        </span>
                        <h3>No registrations yet</h3>
                        <p>
                            Register for an available job fair and your
                            participation will appear here.
                        </p>
                        <button
                            type="button"
                            className="ef-button ef-button-primary"
                            onClick={() => setActiveTab("available")}
                        >
                            Browse Job Fairs
                        </button>
                    </div>
                ) : (
                    <div className="ef-registration-list">
                        {registeredFairs.map((registration) => {
                            const fair = registration.job_fair || {};
                            const vacancies = Array.isArray(fair.vacancies)
                                ? fair.vacancies
                                : [];

                            return (
                                <article
                                    className="ef-registration-card"
                                    key={registration.id}
                                >
                                    <div className="ef-registration-main">
                                        <span className="ef-fair-icon">
                                            <Building2 size={23} />
                                        </span>
                                        <div>
                                            <h3>{fair.title || "Job Fair"}</h3>
                                            <p>
                                                <CalendarDays size={15} />
                                                {formatDate(fair.start_date)}
                                            </p>
                                            <p>
                                                <MapPin size={15} />
                                                {fair.venue || "Venue to be announced"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="ef-registration-side">
                                        <span
                                            className={`ef-status-badge ef-status-${getStatusClass(
                                                registration.status
                                            )}`}
                                        >
                                            {registration.status || "pending"}
                                        </span>
                                        <span className="ef-vacancy-count">
                                            <BriefcaseBusiness size={16} />
                                            {vacancies.length} submitted{" "}
                                            {vacancies.length === 1
                                                ? "posting"
                                                : "postings"}
                                        </span>
                                        <button
                                            type="button"
                                            className="ef-button ef-button-primary"
                                            onClick={() =>
                                                fair.id
                                                    ? openVacancyForm(fair)
                                                    : setNotice({
                                                        type: "error",
                                                        text: "Job fair details are unavailable for this registration.",
                                                    })
                                            }
                                        >
                                            Submit Vacancies
                                        </button>
                                    </div>

                                    {vacancies.length > 0 && (
                                        <div className="ef-registration-vacancies">
                                            <strong>Submitted vacancies</strong>
                                            {vacancies.map((vacancy) => (
                                                <div
                                                    className="ef-vacancy-row"
                                                    key={vacancy.id}
                                                >
                                                    <span>
                                                        {vacancy.job_posting
                                                            ?.job_title ||
                                                            `Job posting #${vacancy.job_posting_id}`}
                                                    </span>
                                                    <span>
                                                        {vacancy.vacancies_offered}{" "}
                                                        {Number(
                                                            vacancy.vacancies_offered
                                                        ) === 1
                                                            ? "vacancy"
                                                            : "vacancies"}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>

            {selectedFair && (
                <div
                    className="ef-modal-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setSelectedFair(null);
                        }
                    }}
                >
                    <section
                        className="ef-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="ef-details-title"
                    >
                        <div className="ef-modal-header">
                            <div>
                                <span className="ef-eyebrow">
                                    JOB FAIR DETAILS
                                </span>
                                <h2 id="ef-details-title">
                                    {selectedFair.title}
                                </h2>
                            </div>
                            <button
                                type="button"
                                className="ef-icon-button"
                                onClick={() => setSelectedFair(null)}
                                aria-label="Close details"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="ef-modal-body">
                            <p className="ef-details-description">
                                {selectedFair.description ||
                                    "No event description provided."}
                            </p>

                            <div className="ef-detail-item">
                                <CalendarDays size={19} />
                                <div>
                                    <strong>Event dates</strong>
                                    <span>
                                        {formatDateTime(selectedFair.start_date)}
                                        {" – "}
                                        {formatDateTime(selectedFair.end_date)}
                                    </span>
                                </div>
                            </div>

                            <div className="ef-detail-item">
                                <MapPin size={19} />
                                <div>
                                    <strong>Venue</strong>
                                    <span>
                                        {selectedFair.venue ||
                                            "Venue to be announced"}
                                    </span>
                                </div>
                            </div>

                            <div className="ef-detail-item">
                                <Clock size={19} />
                                <div>
                                    <strong>Registration period</strong>
                                    <span>
                                        {formatDateTime(
                                            selectedFair.registration_start
                                        )}
                                        {" – "}
                                        {formatDateTime(
                                            selectedFair.registration_end
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="ef-modal-footer">
                            <button
                                type="button"
                                className="ef-button ef-button-outline"
                                onClick={() => setSelectedFair(null)}
                            >
                                Close
                            </button>

                            {!registeredFairIds.has(
                                Number(selectedFair.id)
                            ) && (
                                <button
                                    type="button"
                                    className="ef-button ef-button-primary"
                                    disabled={
                                        registeringId === selectedFair.id
                                    }
                                    onClick={() => handleRegister(selectedFair)}
                                >
                                    {registeringId === selectedFair.id
                                        ? "Registering..."
                                        : "Register for Job Fair"}
                                </button>
                            )}
                        </div>
                    </section>
                </div>
            )}

            {vacancyFair && (
                <div
                    className="ef-modal-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setVacancyFair(null);
                        }
                    }}
                >
                    <section
                        className="ef-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="ef-vacancy-title"
                    >
                        <div className="ef-modal-header">
                            <div>
                                <span className="ef-eyebrow">
                                    EMPLOYER PARTICIPATION
                                </span>
                                <h2 id="ef-vacancy-title">
                                    Submit Vacancies
                                </h2>
                                <p>{vacancyFair.title}</p>
                            </div>
                            <button
                                type="button"
                                className="ef-icon-button"
                                onClick={() => setVacancyFair(null)}
                                aria-label="Close vacancy form"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmitVacancy}
                            className="ef-vacancy-form"
                        >
                            <label>
                                Approved Job Posting
                                <select
                                    required
                                    value={vacancyJobId}
                                    onChange={(event) =>
                                        setVacancyJobId(event.target.value)
                                    }
                                >
                                    <option value="">
                                        Select an approved job posting
                                    </option>
                                    {approvedJobs.map((job) => (
                                        <option
                                            key={job.id}
                                            value={job.id}
                                        >
                                            {job.job_title}
                                            {job.location
                                                ? ` — ${job.location}`
                                                : ""}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Number of Vacancies Offered
                                <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    required
                                    value={vacanciesOffered}
                                    onChange={(event) =>
                                        setVacanciesOffered(event.target.value)
                                    }
                                />
                            </label>

                            {approvedJobs.length === 0 && (
                                <div className="ef-inline-warning">
                                    <AlertCircle size={18} />
                                    <span>
                                        You don't have an approved job posting
                                        available. A job must be approved before
                                        it can be submitted to a job fair.
                                    </span>
                                </div>
                            )}

                            <div className="ef-modal-footer">
                                <button
                                    type="button"
                                    className="ef-button ef-button-outline"
                                    onClick={() => setVacancyFair(null)}
                                    disabled={submittingVacancy}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="ef-button ef-button-primary"
                                    disabled={
                                        submittingVacancy ||
                                        approvedJobs.length === 0
                                    }
                                >
                                    {submittingVacancy ? (
                                        <>
                                            <LoaderCircle
                                                size={17}
                                                className="ef-spin"
                                            />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <BriefcaseBusiness size={17} />
                                            Submit Vacancies
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </div>
    );
}

export default EmployerJobFairs;
