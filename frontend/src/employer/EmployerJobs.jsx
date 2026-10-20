
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    AlertCircle,
    BriefcaseBusiness,
    CalendarDays,
    CheckCircle2,
    Clock3,
    MapPin,
    Plus,
    RefreshCw,
    Search,
    Send,
    Users,
    X,
} from "lucide-react";
import "./EmployerJobs.css";

const API_URL = "http://127.0.0.1:8000/api";

const EMPTY_FORM = {
  job_title: "",
  description: "",
  location: "",
  employment_type: "",
  industry: "",
  salary: "",
  salary_period: "",
  educational_attainment: "",
  work_experience: "",
  work_arrangement: "",
  requirements: "",
  skills: "",
  benefits: "",
  application_instructions: "",
  vacancies: "1",
  application_deadline: "",
};

const STATUS_OPTIONS = [
    { value: "all", label: "All statuses" },
    { value: "pending", label: "Pending approval" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "draft", label: "Draft" },
    { value: "closed", label: "Closed" },
];

function getLocalDateString() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function normalizeStatus(status) {
    return String(status || "unknown")
        .toLowerCase()
        .replaceAll("_", " ")
        .replaceAll("-", " ")
        .trim();
}

function formatStatus(status) {
    return normalizeStatus(status).replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
    );
}

function formatDate(value) {
    if (!value) return "Not specified";

    const datePart = String(value).slice(0, 10);
    const date = new Date(`${datePart}T12:00:00`);

    if (Number.isNaN(date.getTime())) return "Not specified";

    return date.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function getErrorMessage(data, fallback) {
    if (data?.message) return data.message;
    return fallback;
}

function EmployerJobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");
    const [validationErrors, setValidationErrors] = useState({});
    const [success, setSuccess] = useState("");

    const loadJobs = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("pesoToken");

            if (!token) {
                throw new Error("Your session has expired. Please log in again.");
            }

            const response = await fetch(`${API_URL}/employer/jobs`, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    getErrorMessage(data, "Unable to load your job postings.")
                );
            }

            if (!Array.isArray(data.jobs)) {
                throw new Error(
                    "The server response did not contain a valid job list."
                );
            }

            setJobs(data.jobs);
        } catch (err) {
            setError(
                err.message ||
                    "Unable to connect to the server. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadJobs();
    }, [loadJobs]);

    useEffect(() => {
        if (!showCreateForm) return undefined;

        const handleEscape = (event) => {
            if (event.key === "Escape" && !submitting) {
                setShowCreateForm(false);
            }
        };

        document.addEventListener("keydown", handleEscape);

        return () => document.removeEventListener("keydown", handleEscape);
    }, [showCreateForm, submitting]);

    const filteredJobs = useMemo(() => {
        const query = search.trim().toLowerCase();

        return jobs.filter((job) => {
            const matchesSearch =
                !query ||
                [
                    job.job_title,
                    job.location,
                    job.industry,
                    job.employment_type,
                    job.description,
                ].some((value) =>
                    String(value || "").toLowerCase().includes(query)
                );

            const matchesStatus =
                statusFilter === "all" ||
                normalizeStatus(job.status) === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [jobs, search, statusFilter]);

    const countStatus = (...statuses) =>
        jobs.filter((job) => statuses.includes(normalizeStatus(job.status)))
            .length;

    const openCreateForm = () => {
        setForm({ ...EMPTY_FORM });
        setFormError("");
        setValidationErrors({});
        setSuccess("");
        setShowCreateForm(true);
    };

    const closeCreateForm = () => {
        if (submitting) return;

        setShowCreateForm(false);
        setFormError("");
        setValidationErrors({});
    };

    const handleFormChange = (event) => {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));

        setValidationErrors((current) => ({
            ...current,
            [name]: undefined,
        }));

        setFormError("");
    };

    const getFieldError = (field) => {
        const messages = validationErrors[field];

        if (Array.isArray(messages)) return messages[0] || "";
        if (typeof messages === "string") return messages;

        return "";
    };

    const handleCreateSubmit = async (event) => {
        event.preventDefault();

        setFormError("");
        setValidationErrors({});
        setSuccess("");

        const token = localStorage.getItem("pesoToken");

        if (!token) {
            setFormError("Your session has expired. Please log in again.");
            return;
        }

        if (!form.job_title.trim()) {
            setValidationErrors({
                job_title: ["Please enter a job title."],
            });
            return;
        }

        const vacancies = Number(form.vacancies);

        if (!Number.isInteger(vacancies) || vacancies < 1) {
            setValidationErrors({
                vacancies: ["Enter a whole number of at least 1."],
            });
            return;
        }

        if (
            form.application_deadline &&
            form.application_deadline < getLocalDateString()
        ) {
            setValidationErrors({
                application_deadline: [
                    "The application deadline cannot be in the past.",
                ],
            });
            return;
        }

        const payload = {
            job_title: form.job_title.trim(),
            description: form.description.trim() || null,
            location: form.location.trim() || null,
            employment_type: form.employment_type || null,
            industry: form.industry.trim() || null,
            salary: form.salary.trim() || null,
            requirements: form.requirements.trim() || null,
            skills: form.skills.trim() || null,
            vacancies,
            application_deadline: form.application_deadline || null,
            salary_period: form.salary_period || null,
            educational_attainment: form.educational_attainment || null,
            work_experience: form.work_experience || null,
            work_arrangement: form.work_arrangement || null,
            benefits: form.benefits.trim() || null,
            application_instructions: form.application_instructions.trim() || null,
        };

        setSubmitting(true);

        try {
            const response = await fetch(`${API_URL}/employer/jobs`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                if (response.status === 422 && data.errors) {
                    setValidationErrors(data.errors);
                    setFormError(
                        data.message ||
                            "Please check the highlighted fields and try again."
                    );
                    return;
                }

                if (response.status === 401) {
                    throw new Error(
                        "Your session has expired. Please log in again."
                    );
                }

                if (response.status === 403) {
                    throw new Error(
                        data.message ||
                            "Your account is not authorized to create job posts."
                    );
                }

                throw new Error(
                    getErrorMessage(data, "Unable to create the job post.")
                );
            }

            setShowCreateForm(false);
            setForm({ ...EMPTY_FORM });
            setValidationErrors({});
            setFormError("");
            setSuccess(
                data.message ||
                    "Job post submitted successfully for PESO approval."
            );

            await loadJobs();
        } catch (err) {
            setFormError(
                err.message ||
                    "Unable to connect to the server. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="employer-jobs-page">
            <section className="employer-jobs-welcome">
                <div className="employer-jobs-welcome-content">
                    <span className="employer-jobs-eyebrow">
                        EMPLOYER WORKSPACE
                    </span>
                    <h1>My Job Posts</h1>
                    <p>
                        Create and manage your job opportunities through the
                        Municipality of Danao PESO.
                    </p>
                </div>

                <button
                    type="button"
                    className="employer-jobs-primary-button"
                    onClick={openCreateForm}
                >
                    <Plus size={19} />
                    <span>Create Job Post</span>
                </button>
            </section>

            {success && (
                <div className="employer-jobs-success" role="status">
                    <CheckCircle2 size={20} />
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

            <section className="employer-jobs-summary">
                <article className="employer-jobs-summary-card">
                    <div className="employer-jobs-summary-icon">
                        <BriefcaseBusiness size={21} />
                    </div>
                    <span>Total Job Posts</span>
                    <strong>{loading ? "—" : jobs.length}</strong>
                    <small>All your submitted postings</small>
                </article>

                <article className="employer-jobs-summary-card">
                    <div className="employer-jobs-summary-icon pending-icon">
                        <Clock3 size={21} />
                    </div>
                    <span>Pending</span>
                    <strong>
                        {loading ? "—" : countStatus("pending", "draft")}
                    </strong>
                    <small>Awaiting review or submission</small>
                </article>

                <article className="employer-jobs-summary-card">
                    <div className="employer-jobs-summary-icon approved-icon">
                        <CheckCircle2 size={21} />
                    </div>
                    <span>Approved</span>
                    <strong>{loading ? "—" : countStatus("approved")}</strong>
                    <small>Approved job postings</small>
                </article>

                <article className="employer-jobs-summary-card">
                    <div className="employer-jobs-summary-icon closed-icon">
                        <X size={21} />
                    </div>
                    <span>Closed</span>
                    <strong>{loading ? "—" : countStatus("closed")}</strong>
                    <small>No longer accepting applicants</small>
                </article>
            </section>

            <section className="employer-jobs-panel">
                <div className="employer-jobs-panel-heading">
                    <div>
                        <span className="employer-jobs-section-label">
                            POSTINGS OVERVIEW
                        </span>
                        <h2>All Job Postings</h2>
                        <p>
                            Review your vacancies and monitor their approval
                            status.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="employer-jobs-refresh"
                        onClick={loadJobs}
                        disabled={loading}
                    >
                        <RefreshCw
                            size={16}
                            className={loading ? "employer-job-spin" : ""}
                        />
                        Refresh
                    </button>
                </div>

                <div className="employer-jobs-toolbar">
                    <label className="employer-jobs-search">
                        <Search size={18} />
                        <input
                            type="search"
                            placeholder="Search job title, location, industry..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </label>

                    <select
                        aria-label="Filter by job status"
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(event.target.value)
                        }
                    >
                        {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {error && (
                    <div className="employer-jobs-error" role="alert">
                        <AlertCircle size={19} />
                        <p>{error}</p>
                        <button type="button" onClick={loadJobs}>
                            Try Again
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="employer-jobs-state">
                        <RefreshCw
                            size={30}
                            className="employer-job-spin"
                        />
                        <h3>Loading your job posts</h3>
                        <p>Please wait while we retrieve your postings.</p>
                    </div>
                ) : !error && filteredJobs.length === 0 ? (
                    <div className="employer-jobs-state">
                        <div className="employer-jobs-empty-icon">
                            <BriefcaseBusiness size={32} />
                        </div>
                        <h3>
                            {jobs.length === 0
                                ? "No job posts yet"
                                : "No matching job posts"}
                        </h3>
                        <p>
                            {jobs.length === 0
                                ? "Create your first job post to get started."
                                : "Try a different search term or status filter."}
                        </p>
                        {jobs.length === 0 && (
                            <button
                                type="button"
                                className="employer-jobs-primary-button"
                                onClick={openCreateForm}
                            >
                                <Plus size={18} />
                                Create Your First Job Post
                            </button>
                        )}
                    </div>
                ) : !error ? (
                    <div className="employer-jobs-list">
                        {filteredJobs.map((job) => (
                            <article
                                className="employer-job-card"
                                key={job.id}
                            >
                                <div className="employer-job-card-main">
                                    <div className="employer-job-icon">
                                        <BriefcaseBusiness size={23} />
                                    </div>

                                    <div className="employer-job-details">
                                        <h3>{job.job_title}</h3>

                                        <p className="employer-job-location">
                                            <MapPin size={15} />
                                            {job.location ||
                                                "Location not specified"}
                                        </p>

                                        <div className="employer-job-meta">
                                            <span>
                                                {job.employment_type ||
                                                    "Type not specified"}
                                            </span>
                                            <span>
                                                {job.industry ||
                                                    "Industry not specified"}
                                            </span>
                                            <span>
                                                <Users size={14} />
                                                {job.vacancies ?? 1}{" "}
                                                {Number(job.vacancies) === 1
                                                    ? "vacancy"
                                                    : "vacancies"}
                                            </span>
                                        </div>

                                        <p className="employer-job-deadline">
                                            <CalendarDays size={14} />
                                            Application deadline:{" "}
                                            {formatDate(
                                                job.application_deadline
                                            )}
                                        </p>

                                        {job.salary && (
                                            <p className="employer-job-salary">
                                                Salary: {job.salary}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="employer-job-card-side">
                                    <span
                                        className={`employer-job-status status-${normalizeStatus(
                                            job.status
                                        ).replaceAll(" ", "-")}`}
                                    >
                                        {formatStatus(job.status)}
                                    </span>

                                    {normalizeStatus(job.status) ===
                                        "rejected" &&
                                        job.rejection_reason && (
                                            <p className="employer-job-rejection">
                                                <strong>Reason:</strong>{" "}
                                                {job.rejection_reason}
                                            </p>
                                        )}

                                    <small>
                                        Created {formatDate(job.created_at)}
                                    </small>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : null}
            </section>

            {showCreateForm && (
                <div
                    className="employer-job-modal-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeCreateForm();
                        }
                    }}
                >
                    <section
                        className="employer-job-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="employer-job-form-title"
                    >
                        <div className="employer-job-modal-header">
                            <div>
                                <span className="employer-jobs-eyebrow">
                                    EMPLOYER WORKSPACE
                                </span>
                                <h2 id="employer-job-form-title">
                                    Create Job Post
                                </h2>
                                <p>
                                    Complete the details below to submit a
                                    vacancy for PESO approval.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="employer-job-modal-close"
                                onClick={closeCreateForm}
                                disabled={submitting}
                                aria-label="Close form"
                            >
                                <X size={21} />
                            </button>
                        </div>

                        <form
                            className="employer-job-form"
                            onSubmit={handleCreateSubmit}
                            noValidate
                        >
                            {formError && (
                                <div
                                    className="employer-jobs-error employer-job-form-error"
                                    role="alert"
                                >
                                    <AlertCircle size={19} />
                                    <p>{formError}</p>
                                </div>
                            )}

                            <div className="employer-job-form-grid">
                                <label className="employer-job-form-field employer-job-form-full">
                                    <span>Job Title <b>*</b></span>
                                    <input
                                        name="job_title"
                                        value={form.job_title}
                                        onChange={handleFormChange}
                                        maxLength={255}
                                        required
                                        aria-invalid={Boolean(
                                            getFieldError("job_title")
                                        )}
                                        placeholder="e.g. Administrative Assistant"
                                    />
                                    {getFieldError("job_title") && (
                                        <small className="employer-job-field-error">
                                            {getFieldError("job_title")}
                                        </small>
                                    )}
                                </label>

                                <label className="employer-job-form-field employer-job-form-full">
                                    <span>Job Description</span>
                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={handleFormChange}
                                        rows={4}
                                        placeholder="Describe the role, duties, and responsibilities..."
                                    />
                                    {getFieldError("description") && (
                                        <small className="employer-job-field-error">
                                            {getFieldError("description")}
                                        </small>
                                    )}
                                </label>

                                <label className="employer-job-form-field">
                                    <span>Work Location</span>
                                    <input
                                        name="location"
                                        value={form.location}
                                        onChange={handleFormChange}
                                        maxLength={255}
                                        placeholder="e.g. Danao, Bohol"
                                    />
                                    {getFieldError("location") && (
                                        <small className="employer-job-field-error">
                                            {getFieldError("location")}
                                        </small>
                                    )}
                                </label>

                                <label className="employer-job-form-field">
                                    <span>Employment Type</span>
                                    <select
                                        name="employment_type"
                                        value={form.employment_type}
                                        onChange={handleFormChange}
                                    >
                                        <option value="">
                                            Select employment type
                                        </option>
                                        <option value="Full-time">
                                            Full-time
                                        </option>
                                        <option value="Part-time">
                                            Part-time
                                        </option>
                                        <option value="Contract">
                                            Contract
                                        </option>
                                        <option value="Temporary">
                                            Temporary
                                        </option>
                                        <option value="Internship">
                                            Internship
                                        </option>
                                        <option value="Project-based">
                                            Project-based
                                        </option>
                                    </select>
                                    {getFieldError("employment_type") && (
                                        <small className="employer-job-field-error">
                                            {getFieldError("employment_type")}
                                        </small>
                                    )}
                                </label>

                                <label className="employer-job-form-field">
                                    <span>Industry</span>
                                    <input
                                        name="industry"
                                        value={form.industry}
                                        onChange={handleFormChange}
                                        maxLength={255}
                                        placeholder="e.g. Information Technology"
                                    />
                                    {getFieldError("industry") && (
                                        <small className="employer-job-field-error">
                                            {getFieldError("industry")}
                                        </small>
                                    )}
                                </label>

                                <label className="employer-job-form-field">
                                    <span>Educational Attainment</span>
                                    <select
                                        name="educational_attainment"
                                        value={form.educational_attainment}
                                        onChange={handleFormChange}
                                    >
                                        <option value="">Select educational attainment</option>
                                        <option value="No specific requirement">No specific requirement</option>
                                        <option value="High school graduate">High school graduate</option>
                                        <option value="Senior high school graduate">
                                            Senior high school graduate
                                        </option>
                                        <option value="Vocational/Technical">Vocational / Technical</option>
                                        <option value="College level">College level</option>
                                        <option value="Bachelor's degree">Bachelor's degree</option>
                                        <option value="Postgraduate degree">Postgraduate degree</option>
                                    </select>
                                </label>
                                
                                <label className="employer-job-form-field">
                                    <span>Work Experience</span>
                                    <select
                                        name="work_experience"
                                        value={form.work_experience}
                                        onChange={handleFormChange}
                                    >
                                        <option value="">Select work experience</option>
                                        <option value="No experience required">
                                            No experience required
                                        </option>
                                        <option value="Less than 1 year">
                                            Less than 1 year
                                        </option>
                                        <option value="1–2 years">1–2 years</option>
                                        <option value="3–5 years">3–5 years</option>
                                        <option value="5+ years">5+ years</option>
                                    </select>
                                </label>

                                <label className="employer-job-form-field">
                                    <span>Work Arrangement</span>
                                    <select
                                        name="work_arrangement"
                                        value={form.work_arrangement}
                                        onChange={handleFormChange}
                                    >
                                        <option value="">Select work arrangement</option>
                                        <option value="On-site">On-site</option>
                                        <option value="Remote">Remote</option>
                                        <option value="Hybrid">Hybrid</option>
                                    </select>
                                </label>

                                <label className="employer-job-form-field">
                                    <span>Salary / Salary Range</span>
                                    <input
                                        name="salary"
                                        value={form.salary}
                                        onChange={handleFormChange}
                                        maxLength={255}
                                        placeholder="e.g. ₱15,000–₱20,000/month"
                                    />
                                    {getFieldError("salary") && (
                                        <small className="employer-job-field-error">
                                            {getFieldError("salary")}
                                        </small>
                                    )}
                                </label>
                                
                                <label className="employer-job-form-field">
                                    <span>Salary Period</span>
                                    <select
                                        name="salary_period"
                                        value={form.salary_period}
                                        onChange={handleFormChange}
                                    >
                                        <option value="">Select salary period</option>
                                        <option value="Daily">Daily</option>
                                        <option value="Weekly">Weekly</option>
                                        <option value="Monthly">Monthly</option>
                                        <option value="Annual">Annual</option>
                                        <option value="Negotiable">Negotiable</option>
                                    </select>
                                </label>

                                <label className="employer-job-form-field employer-job-form-full">
                                    <span>Job Requirements</span>
                                    <textarea
                                        name="requirements"
                                        value={form.requirements}
                                        onChange={handleFormChange}
                                        rows={3}
                                        placeholder="Education, experience, and other qualifications..."
                                    />
                                    {getFieldError("requirements") && (
                                        <small className="employer-job-field-error">
                                            {getFieldError("requirements")}
                                        </small>
                                    )}
                                </label>

                                <label className="employer-job-form-field employer-job-form-full">
                                    <span>Benefits</span>
                                    <textarea
                                        name="benefits"
                                        value={form.benefits}
                                        onChange={handleFormChange}
                                        rows={3}
                                        placeholder="e.g. SSS, PhilHealth, Pag-IBIG, paid leave, health insurance..."
                                    />
                                </label>
                                
                                <label className="employer-job-form-field employer-job-form-full">
                                    <span>Application Instructions</span>
                                    <textarea
                                        name="application_instructions"
                                        value={form.application_instructions}
                                        onChange={handleFormChange}
                                        rows={3}
                                        placeholder="Explain how applicants should apply and what documents they need to submit..."
                                    />
                                </label>

                                <label className="employer-job-form-field employer-job-form-full">
                                    <span>Required Skills</span>
                                    <textarea
                                        name="skills"
                                        value={form.skills}
                                        onChange={handleFormChange}
                                        rows={2}
                                        placeholder="e.g. Communication, Microsoft Office, Customer Service"
                                    />
                                    {getFieldError("skills") && (
                                        <small className="employer-job-field-error">
                                            {getFieldError("skills")}
                                        </small>
                                    )}
                                </label>

                                <label className="employer-job-form-field">
                                    <span>Number of Vacancies <b>*</b></span>
                                    <input
                                        type="number"
                                        name="vacancies"
                                        value={form.vacancies}
                                        onChange={handleFormChange}
                                        min="1"
                                        step="1"
                                        required
                                        aria-invalid={Boolean(
                                            getFieldError("vacancies")
                                        )}
                                    />
                                    {getFieldError("vacancies") && (
                                        <small className="employer-job-field-error">
                                            {getFieldError("vacancies")}
                                        </small>
                                    )}
                                </label>

                                <label className="employer-job-form-field">
                                    <span>Application Deadline</span>
                                    <input
                                        type="date"
                                        name="application_deadline"
                                        value={form.application_deadline}
                                        onChange={handleFormChange}
                                        min={getLocalDateString()}
                                        aria-invalid={Boolean(
                                            getFieldError(
                                                "application_deadline"
                                            )
                                        )}
                                    />
                                    {getFieldError("application_deadline") && (
                                        <small className="employer-job-field-error">
                                            {getFieldError(
                                                "application_deadline"
                                            )}
                                        </small>
                                    )}
                                </label>
                            </div>

                            <div className="employer-job-form-note">
                                <AlertCircle size={19} />
                                <p>
                                    After submission, your job post will be
                                    marked as <strong>Pending</strong> until it
                                    is reviewed and approved by PESO.
                                </p>
                            </div>

                            <div className="employer-job-form-actions">
                                <button
                                    type="button"
                                    className="employer-job-cancel-button"
                                    onClick={closeCreateForm}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="employer-jobs-primary-button"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <RefreshCw
                                                size={17}
                                                className="employer-job-spin"
                                            />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={17} />
                                            Submit for Approval
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </main>
    );
}

export default EmployerJobs;
