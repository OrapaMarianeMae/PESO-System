import { useEffect, useState } from "react";

function FindJobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [location, setLocation] = useState("");
    const [employmentType, setEmploymentType] = useState("");
    const [industry, setIndustry] = useState("");

    const [selectedJob, setSelectedJob] = useState(null);

    // Save Job
    const [savingJob, setSavingJob] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");
    const [saveError, setSaveError] = useState("");

    // Application
    const [showApplicationForm, setShowApplicationForm] = useState(false);
    const [coverLetter, setCoverLetter] = useState("");
    const [resume, setResume] = useState(null);
    const [loadingResume, setLoadingResume] = useState(false);
    const [submittingApplication, setSubmittingApplication] =
        useState(false);
    const [applicationMessage, setApplicationMessage] =
        useState("");
    const [applicationError, setApplicationError] =
        useState("");

    const fetchJobs = async () => {
        try {
            setLoading(true);
            setError("");

            const params = new URLSearchParams();

            if (search.trim()) {
                params.append("search", search.trim());
            }

            if (location.trim()) {
                params.append("location", location.trim());
            }

            if (employmentType) {
                params.append(
                    "employment_type",
                    employmentType
                );
            }

            if (industry) {
                params.append("industry", industry);
            }

            const queryString = params.toString();

            const response = await fetch(
                `http://127.0.0.1:8000/api/jobseeker/jobs${
                    queryString ? `?${queryString}` : ""
                }`,
                {
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${localStorage.getItem(
                            "pesoToken"
                        )}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to load jobs."
                );
            }

            setJobs(
                Array.isArray(data.jobs)
                    ? data.jobs
                    : []
            );
        } catch (err) {
            console.error(
                "Unable to load jobs:",
                err
            );

            setError(
                "Unable to load job opportunities."
            );

            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchResume = async () => {
        try {
            setLoadingResume(true);

            const token =
                localStorage.getItem("pesoToken");

            const response = await fetch(
                "http://127.0.0.1:8000/api/jobseeker/profile",
                {
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Unable to load your profile."
                );
            }

            setResume(data.profile?.resume || null);
        } catch (err) {
            console.error(
                "Unable to load resume:",
                err
            );

            setResume(null);
        } finally {
            setLoadingResume(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleSearch = (event) => {
        event.preventDefault();
        fetchJobs();
    };

    const handleViewJob = (job) => {
        setSelectedJob(job);

        setSaveMessage("");
        setSaveError("");

        setApplicationMessage("");
        setApplicationError("");

        setShowApplicationForm(false);
        setCoverLetter("");

        setResume(null);
    };

    const closeJobDetails = () => {
        setSelectedJob(null);

        setSaveMessage("");
        setSaveError("");

        setApplicationMessage("");
        setApplicationError("");

        setShowApplicationForm(false);
        setCoverLetter("");

        setResume(null);
    };

    const handleSaveJob = async () => {
        if (!selectedJob) {
            return;
        }

        try {
            setSavingJob(true);
            setSaveMessage("");
            setSaveError("");

            const response = await fetch(
                `http://127.0.0.1:8000/api/jobseeker/jobs/${selectedJob.id}/save`,
                {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${localStorage.getItem(
                            "pesoToken"
                        )}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 409) {
                    setSaveMessage(
                        "This job is already saved."
                    );
                    return;
                }

                throw new Error(
                    data.message ||
                        "Unable to save this job."
                );
            }

            setSaveMessage(
                data.message ||
                    "Job saved successfully."
            );
        } catch (err) {
            console.error(
                "Unable to save job:",
                err
            );

            setSaveError(
                err.message ||
                    "Unable to save this job."
            );
        } finally {
            setSavingJob(false);
        }
    };

    const handleOpenApplicationForm = async () => {
        setSaveMessage("");
        setSaveError("");

        setApplicationMessage("");
        setApplicationError("");

        setCoverLetter("");
        setShowApplicationForm(true);

        await fetchResume();
    };

    const handleCancelApplication = () => {
        if (submittingApplication) {
            return;
        }

        setShowApplicationForm(false);
        setCoverLetter("");

        setApplicationMessage("");
        setApplicationError("");

        setResume(null);
    };

    const handleSubmitApplication = async () => {
        if (!selectedJob) {
            return;
        }

        try {
            setSubmittingApplication(true);

            setApplicationMessage("");
            setApplicationError("");

            const token =
                localStorage.getItem("pesoToken");

            const response = await fetch(
                `http://127.0.0.1:8000/api/jobseeker/jobs/${selectedJob.id}/apply`,
                {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        cover_letter:
                            coverLetter.trim() || null,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 409) {
                    setApplicationError(
                        "You have already applied for this job."
                    );
                    return;
                }

                if (response.status === 400) {
                    setApplicationError(
                        data.message ||
                            "You cannot apply for this job."
                    );
                    return;
                }

                throw new Error(
                    data.message ||
                        "Unable to submit your application."
                );
            }

            setApplicationMessage(
                data.message ||
                    "Application submitted successfully."
            );

            setCoverLetter("");
        } catch (err) {
            console.error(
                "Unable to submit application:",
                err
            );

            setApplicationError(
                err.message ||
                    "Unable to submit your application."
            );
        } finally {
            setSubmittingApplication(false);
        }
    };

    const resumeFileName = resume
        ? resume.split("/").pop()
        : null;

    const resumeUrl = resume
        ? `http://127.0.0.1:8000/storage/${resume}`
        : null;

    return (
        <div className="jobseeker-dashboard">
            {/* Page Header */}
            <section className="dashboard-welcome">
                <div>
                    <span className="dashboard-section-label">
                        EMPLOYMENT OPPORTUNITIES
                    </span>

                    <h2>Find Jobs</h2>

                    <p>
                        Discover employment opportunities from
                        employers connected with the Public
                        Employment Service Office of Danao.
                    </p>
                </div>
            </section>

            {/* Search */}
            <section className="job-search-panel">
                <form
                    className="job-search-main"
                    onSubmit={handleSearch}
                >
                    <input
                        type="text"
                        placeholder="Search job title, company, or keyword"
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                    />

                    <input
                        type="text"
                        placeholder="Location"
                        value={location}
                        onChange={(event) =>
                            setLocation(event.target.value)
                        }
                    />

                    <button type="submit">
                        Search
                    </button>
                </form>

                <div className="job-search-filters">
                    <select
                        value={employmentType}
                        onChange={(event) =>
                            setEmploymentType(
                                event.target.value
                            )
                        }
                    >
                        <option value="">
                            All Employment Types
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
                    </select>

                    <select
                        value={industry}
                        onChange={(event) =>
                            setIndustry(
                                event.target.value
                            )
                        }
                    >
                        <option value="">
                            All Industries
                        </option>

                        <option value="Administrative">
                            Administrative
                        </option>

                        <option value="Customer Service">
                            Customer Service
                        </option>

                        <option value="Information Technology">
                            Information Technology
                        </option>

                        <option value="Retail">
                            Retail
                        </option>

                        <option value="Healthcare">
                            Healthcare
                        </option>
                    </select>
                </div>
            </section>

            {/* Results */}
            <section className="jobs-results-section">
                <div className="jobs-results-header">
                    <div>
                        <span>AVAILABLE OPPORTUNITIES</span>

                        <h3>
                            Job Opportunities
                        </h3>
                    </div>

                    <span className="jobs-count">
                        {loading
                            ? "Loading..."
                            : `${jobs.length} ${
                                  jobs.length === 1
                                      ? "job"
                                      : "jobs"
                              }`}
                    </span>
                </div>

                {loading ? (
                    <div className="dashboard-empty-state">
                        <h4>
                            Loading job opportunities...
                        </h4>

                        <p>
                            Please wait while we retrieve the
                            latest approved job postings.
                        </p>
                    </div>
                ) : error ? (
                    <div className="dashboard-empty-state">
                        <h4>
                            Unable to load jobs
                        </h4>

                        <p>{error}</p>
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="dashboard-empty-state">
                        <div className="empty-state-number">
                            00
                        </div>

                        <h4>
                            No job opportunities available yet
                        </h4>

                        <p>
                            Approved job postings from employers
                            will appear here once they become
                            available.
                        </p>
                    </div>
                ) : (
                    <div className="jobs-list">
                        {jobs.map((job) => (
                            <article
                                className="job-card"
                                key={job.id}
                            >
                                <div className="job-card-main">
                                    <div className="job-company-logo">
                                        {job.company_name
                                            ?.charAt(0)
                                            ?.toUpperCase() ||
                                            "C"}
                                    </div>

                                    <div className="job-card-details">
                                        <h4>
                                            {job.job_title}
                                        </h4>

                                        <p className="job-company">
                                            {job.company_name}
                                        </p>

                                        <div className="job-meta">
                                            <span>
                                                📍{" "}
                                                {job.location ||
                                                    "Danao, Bohol"}
                                            </span>

                                            {job.employment_type && (
                                                <span>
                                                    •{" "}
                                                    {
                                                        job.employment_type
                                                    }
                                                </span>
                                            )}

                                            {job.industry && (
                                                <span>
                                                    •{" "}
                                                    {job.industry}
                                                </span>
                                            )}
                                        </div>

                                        <p className="job-description">
                                            {job.description}
                                        </p>

                                        {job.salary && (
                                            <strong className="job-salary">
                                                {job.salary}
                                            </strong>
                                        )}
                                    </div>
                                </div>

                                <div className="job-card-actions">
                                    <button
                                        type="button"
                                        className="job-view-button"
                                        onClick={() =>
                                            handleViewJob(
                                                job
                                            )
                                        }
                                    >
                                        View Job
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            {/* View Job Modal */}
            {selectedJob &&
                !showApplicationForm && (
                    <div
                        className="job-details-overlay"
                        onClick={closeJobDetails}
                    >
                        <div
                            className="job-details-modal"
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                        >
                            <div className="job-details-header">
                                <div>
                                    <span>
                                        JOB OPPORTUNITY
                                    </span>

                                    <h2>
                                        {selectedJob.job_title}
                                    </h2>

                                    <p>
                                        {
                                            selectedJob.company_name
                                        }
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="job-details-close"
                                    onClick={
                                        closeJobDetails
                                    }
                                    aria-label="Close job details"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="job-details-body">
                                <div className="job-details-grid">
                                    <div className="job-detail-item">
                                        <span>
                                            LOCATION
                                        </span>

                                        <strong>
                                            {selectedJob.location ||
                                                "Danao, Bohol"}
                                        </strong>
                                    </div>

                                    <div className="job-detail-item">
                                        <span>
                                            EMPLOYMENT TYPE
                                        </span>

                                        <strong>
                                            {selectedJob.employment_type ||
                                                "Not specified"}
                                        </strong>
                                    </div>

                                    <div className="job-detail-item">
                                        <span>
                                            INDUSTRY
                                        </span>

                                        <strong>
                                            {selectedJob.industry ||
                                                "Not specified"}
                                        </strong>
                                    </div>

                                    <div className="job-detail-item">
                                        <span>
                                            SALARY
                                        </span>

                                        <strong>
                                            {selectedJob.salary ||
                                                "Not specified"}
                                        </strong>
                                    </div>

                                    <div className="job-detail-item">
                                        <span>
                                            VACANCIES
                                        </span>

                                        <strong>
                                            {selectedJob.vacancies ??
                                                "Not specified"}
                                        </strong>
                                    </div>

                                    <div className="job-detail-item">
                                        <span>
                                            APPLICATION DEADLINE
                                        </span>

                                        <strong>
                                            {selectedJob.application_deadline ||
                                                "Not specified"}
                                        </strong>
                                    </div>
                                </div>

                                <div className="job-detail-section">
                                    <span>
                                        JOB DESCRIPTION
                                    </span>

                                    <p>
                                        {selectedJob.description ||
                                            "No job description provided."}
                                    </p>
                                </div>

                                <div className="job-detail-section">
                                    <span>
                                        REQUIREMENTS
                                    </span>

                                    <p>
                                        {selectedJob.requirements ||
                                            "No requirements provided."}
                                    </p>
                                </div>

                                <div className="job-detail-section">
                                    <span>
                                        SKILLS
                                    </span>

                                    <p>
                                        {selectedJob.skills ||
                                            "No specific skills listed."}
                                    </p>
                                </div>

                                <div className="job-detail-section">
                                    <span>
                                        COMPANY
                                    </span>

                                    <p>
                                        {selectedJob.company_name ||
                                            "Company information unavailable."}
                                    </p>

                                    {selectedJob.company_address && (
                                        <p>
                                            {
                                                selectedJob.company_address
                                            }
                                        </p>
                                    )}
                                </div>

                                {saveMessage && (
                                    <div className="job-save-message success">
                                        {saveMessage}
                                    </div>
                                )}

                                {saveError && (
                                    <div className="job-save-message error">
                                        {saveError}
                                    </div>
                                )}
                            </div>

                            <div className="job-details-footer">
                                <button
                                    type="button"
                                    className="job-details-secondary"
                                    onClick={
                                        closeJobDetails
                                    }
                                >
                                    Close
                                </button>

                                <button
                                    type="button"
                                    className="job-save-button"
                                    onClick={
                                        handleSaveJob
                                    }
                                    disabled={
                                        savingJob
                                    }
                                >
                                    {savingJob
                                        ? "Saving..."
                                        : "Save Job"}
                                </button>

                                <button
                                    type="button"
                                    className="job-details-primary"
                                    onClick={
                                        handleOpenApplicationForm
                                    }
                                >
                                    Apply Now
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            {/* Application Form Modal */}
            {selectedJob &&
                showApplicationForm && (
                    <div
                        className="job-details-overlay"
                        onClick={
                            handleCancelApplication
                        }
                    >
                        <div
                            className="job-details-modal application-modal"
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                        >
                            <div className="job-details-header">
                                <div>
                                    <span>
                                        JOB APPLICATION
                                    </span>

                                    <h2>
                                        Apply for{" "}
                                        {
                                            selectedJob.job_title
                                        }
                                    </h2>

                                    <p>
                                        {
                                            selectedJob.company_name
                                        }
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="job-details-close"
                                    onClick={
                                        handleCancelApplication
                                    }
                                    disabled={
                                        submittingApplication
                                    }
                                    aria-label="Close application form"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="job-details-body">
                                <div className="application-notice">
                                    <strong>
                                        Before you submit
                                    </strong>

                                    <p>
                                        Please review the job
                                        information carefully before
                                        submitting your application.
                                    </p>
                                </div>

                                <div className="application-job-summary">
                                    <div>
                                        <span>
                                            POSITION
                                        </span>

                                        <strong>
                                            {
                                                selectedJob.job_title
                                            }
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            COMPANY
                                        </span>

                                        <strong>
                                            {
                                                selectedJob.company_name
                                            }
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            LOCATION
                                        </span>

                                        <strong>
                                            {selectedJob.location ||
                                                "Danao, Bohol"}
                                        </strong>
                                    </div>
                                </div>

                                {/* Resume */}
                                <div className="application-resume-section">
                                    <div className="application-resume-header">
                                        <div>
                                            <span>
                                                RESUME / CV
                                            </span>

                                            <h3>
                                                Your Resume
                                            </h3>

                                            <p>
                                                Your saved resume
                                                will be included with
                                                this application.
                                            </p>
                                        </div>
                                    </div>

                                    {loadingResume ? (
                                        <div className="application-resume-status">
                                            Loading your resume...
                                        </div>
                                    ) : resumeFileName ? (
                                        <div className="application-resume-card">
                                            <div className="application-resume-file">
                                                <span className="application-resume-icon">
                                                    CV
                                                </span>

                                                <div>
                                                    <strong>
                                                        {
                                                            resumeFileName
                                                        }
                                                    </strong>

                                                    <small>
                                                        Saved in your
                                                        Jobseeker
                                                        Profile
                                                    </small>
                                                </div>
                                            </div>

                                            {resumeUrl && (
                                                <a
                                                    href={
                                                        resumeUrl
                                                    }
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="application-resume-view"
                                                >
                                                    View CV
                                                </a>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="application-resume-missing">
                                            <strong>
                                                No resume uploaded
                                            </strong>

                                            <p>
                                                Please upload a resume
                                                from{" "}
                                                <strong>
                                                    My Profile
                                                </strong>{" "}
                                                before applying for
                                                this job.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Cover Letter */}
                                <div className="application-form-group">
                                    <label htmlFor="cover-letter">
                                        Cover Letter
                                        <span>
                                            Optional
                                        </span>
                                    </label>

                                    <textarea
                                        id="cover-letter"
                                        rows="8"
                                        placeholder="Introduce yourself and explain why you are interested in this position..."
                                        value={coverLetter}
                                        onChange={(
                                            event
                                        ) =>
                                            setCoverLetter(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        disabled={
                                            submittingApplication
                                        }
                                    />

                                    <small>
                                        You may leave this blank if
                                        you do not want to include a
                                        cover letter.
                                    </small>
                                </div>

                                {applicationMessage && (
                                    <div className="application-result-message success">
                                        {applicationMessage}
                                    </div>
                                )}

                                {applicationError && (
                                    <div className="application-result-message error">
                                        {applicationError}
                                    </div>
                                )}
                            </div>

                            <div className="job-details-footer">
                                <button
                                    type="button"
                                    className="job-details-secondary"
                                    onClick={
                                        handleCancelApplication
                                    }
                                    disabled={
                                        submittingApplication
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="job-details-primary"
                                    onClick={
                                        handleSubmitApplication
                                    }
                                    disabled={
                                        submittingApplication ||
                                        loadingResume ||
                                        !resume
                                    }
                                >
                                    {submittingApplication
                                        ? "Submitting..."
                                        : "Submit Application"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
}

export default FindJobs;