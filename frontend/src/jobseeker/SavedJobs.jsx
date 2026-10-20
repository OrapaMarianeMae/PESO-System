import { useEffect, useState } from "react";

function SavedJobs() {
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [removingJobId, setRemovingJobId] = useState(null);
    const [removeMessage, setRemoveMessage] = useState("");

    const fetchSavedJobs = async () => {
        try {
            setLoading(true);
            setError("");

            const token =
                localStorage.getItem("pesoToken");

            const response = await fetch(
                "http://127.0.0.1:8000/api/jobseeker/saved-jobs",
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
                        "Unable to load saved jobs."
                );
            }

            setSavedJobs(
                Array.isArray(data.saved_jobs)
                    ? data.saved_jobs
                    : []
            );
        } catch (err) {
            console.error(
                "Unable to load saved jobs:",
                err
            );

            setError(
                err.message ||
                    "Unable to load your saved jobs."
            );

            setSavedJobs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSavedJobs();
    }, []);

    const handleRemoveSavedJob = async (jobId) => {
        try {
            setRemovingJobId(jobId);
            setRemoveMessage("");

            const token =
                localStorage.getItem("pesoToken");

            const response = await fetch(
                `http://127.0.0.1:8000/api/jobseeker/jobs/${jobId}/save`,
                {
                    method: "DELETE",
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
                        "Unable to remove saved job."
                );
            }

            setSavedJobs((currentJobs) =>
                currentJobs.filter(
                    (savedJob) =>
                        savedJob.job_posting?.id !== jobId
                )
            );

            setRemoveMessage(
                data.message ||
                    "Job removed from saved jobs."
            );
        } catch (err) {
            console.error(
                "Unable to remove saved job:",
                err
            );

            setError(
                err.message ||
                    "Unable to remove this saved job."
            );
        } finally {
            setRemovingJobId(null);
        }
    };

    const formatDate = (date) => {
        if (!date) {
            return "Not specified";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return date;
        }

        return parsedDate.toLocaleDateString(
            "en-PH",
            {
                year: "numeric",
                month: "long",
                day: "numeric",
            }
        );
    };

    return (
        <div className="jobseeker-dashboard">
            <section className="dashboard-welcome">
                <div>
                    <span className="dashboard-section-label">
                        SAVED OPPORTUNITIES
                    </span>

                    <h2>Saved Jobs</h2>

                    <p>
                        Keep track of job opportunities you
                        are interested in and want to review
                        or apply for later.
                    </p>
                </div>
            </section>

            <section className="dashboard-panel">
                <div className="dashboard-panel-header">
                    <div>
                        <span>
                            YOUR SAVED JOBS
                        </span>

                        <h3>Saved Opportunities</h3>
                    </div>

                    <span className="jobs-count">
                        {loading
                            ? "Loading..."
                            : `${savedJobs.length} ${
                                  savedJobs.length === 1
                                      ? "saved job"
                                      : "saved jobs"
                              }`}
                    </span>
                </div>

                {removeMessage && (
                    <div className="saved-job-message success">
                        {removeMessage}
                    </div>
                )}

                {loading ? (
                    <div className="dashboard-empty-state">
                        <h4>
                            Loading saved jobs...
                        </h4>

                        <p>
                            Please wait while we retrieve
                            your saved opportunities.
                        </p>
                    </div>
                ) : error ? (
                    <div className="dashboard-empty-state">
                        <h4>
                            Unable to load saved jobs
                        </h4>

                        <p>{error}</p>
                    </div>
                ) : savedJobs.length === 0 ? (
                    <div className="dashboard-empty-state">
                        <div className="empty-state-number">
                            00
                        </div>

                        <h4>
                            No saved jobs yet
                        </h4>

                        <p>
                            Jobs that you save from the Find
                            Jobs page will appear here for easy
                            access later.
                        </p>
                    </div>
                ) : (
                    <div className="saved-jobs-list">
                        {savedJobs.map((savedJob) => {
                            const job =
                                savedJob.job_posting;

                            const employer =
                                job?.employer;

                            const companyName =
                                employer
                                    ?.employer_profile
                                    ?.company_name ||
                                "Employer";

                            return (
                                <article
                                    className="saved-job-card"
                                    key={savedJob.id}
                                >
                                    <div className="saved-job-main">
                                        <div className="saved-job-company-logo">
                                            {companyName
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>

                                        <div className="saved-job-info">
                                            <span className="saved-job-label">
                                                SAVED JOB
                                            </span>

                                            <h4>
                                                {job?.job_title ||
                                                    "Job Position"}
                                            </h4>

                                            <p className="saved-job-company">
                                                {companyName}
                                            </p>

                                            <div className="saved-job-meta">
                                                <span>
                                                    📍{" "}
                                                    {job?.location ||
                                                        "Danao, Bohol"}
                                                </span>

                                                <span>
                                                    {job?.employment_type ||
                                                        "Employment type not specified"}
                                                </span>
                                            </div>

                                            {job?.application_deadline && (
                                                <small>
                                                    Application
                                                    deadline:{" "}
                                                    {formatDate(
                                                        job.application_deadline
                                                    )}
                                                </small>
                                            )}
                                        </div>
                                    </div>

                                    <div className="saved-job-actions">
                                        <button
                                            type="button"
                                            className="saved-job-remove"
                                            onClick={() =>
                                                handleRemoveSavedJob(
                                                    job?.id
                                                )
                                            }
                                            disabled={
                                                removingJobId ===
                                                job?.id
                                            }
                                        >
                                            {removingJobId ===
                                            job?.id
                                                ? "Removing..."
                                                : "Remove"}
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}

export default SavedJobs;