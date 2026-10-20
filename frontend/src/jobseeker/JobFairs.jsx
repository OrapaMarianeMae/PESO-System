import { useEffect, useState } from "react";

function JobFairs() {
    const [jobFairs, setJobFairs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [registeringId, setRegisteringId] = useState(null);
    const [registerMessage, setRegisterMessage] = useState("");

    const fetchJobFairs = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("pesoToken");

            const response = await fetch(
                "http://127.0.0.1:8000/api/jobseeker/job-fairs",
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
                    data.message || "Unable to load job fairs."
                );
            }

            setJobFairs(
                Array.isArray(data.job_fairs)
                    ? data.job_fairs
                    : []
            );
        } catch (err) {
            console.error("Unable to load job fairs:", err);

            setError(
                err.message || "Unable to load job fairs."
            );

            setJobFairs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobFairs();
    }, []);

    const handleRegister = async (jobFairId) => {
        try {
            setRegisteringId(jobFairId);
            setRegisterMessage("");
            setError("");

            const token = localStorage.getItem("pesoToken");

            const response = await fetch(
                `http://127.0.0.1:8000/api/jobseeker/job-fairs/${jobFairId}/register`,
                {
                    method: "POST",
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
                        "Unable to register for this job fair."
                );
            }

            setRegisterMessage(
                data.message ||
                    "Successfully registered for the job fair."
            );

            setJobFairs((currentFairs) =>
                currentFairs.map((jobFair) =>
                    jobFair.id === jobFairId
                        ? {
                              ...jobFair,
                              is_registered: true,
                          }
                        : jobFair
                )
            );
        } catch (err) {
            console.error(
                "Unable to register for job fair:",
                err
            );

            setError(
                err.message ||
                    "Unable to register for this job fair."
            );
        } finally {
            setRegisteringId(null);
        }
    };

    const formatDate = (date) => {
        if (!date) {
            return "Date not specified";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return date;
        }

        return parsedDate.toLocaleDateString("en-PH", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatDateRange = (startDate, endDate) => {
        if (!startDate) {
            return "Date not specified";
        }

        if (!endDate) {
            return formatDate(startDate);
        }

        return `${formatDate(startDate)} – ${formatDate(endDate)}`;
    };

    return (
        <div className="jobseeker-dashboard">
            <section className="dashboard-welcome">
                <div>
                    <span className="dashboard-section-label">
                        EMPLOYMENT EVENTS
                    </span>

                    <h2>Job Fairs</h2>

                    <p>
                        Discover upcoming job fairs organized or
                        supported by the Public Employment Service
                        Office of Danao.
                    </p>
                </div>
            </section>

            <section className="dashboard-panel">
                <div className="dashboard-panel-header">
                    <div>
                        <span>UPCOMING OPPORTUNITIES</span>
                        <h3>Job Fairs</h3>
                    </div>

                    <span className="jobs-count">
                        {loading
                            ? "Loading..."
                            : `${jobFairs.length} ${
                                  jobFairs.length === 1
                                      ? "job fair"
                                      : "job fairs"
                              }`}
                    </span>
                </div>

                {registerMessage && (
                    <div className="job-fair-message success">
                        {registerMessage}
                    </div>
                )}

                {loading ? (
                    <div className="dashboard-empty-state">
                        <h4>Loading job fairs...</h4>

                        <p>
                            Please wait while we retrieve the
                            latest job fair information.
                        </p>
                    </div>
                ) : error ? (
                    <div className="dashboard-empty-state">
                        <h4>Unable to load job fairs</h4>

                        <p>{error}</p>
                    </div>
                ) : jobFairs.length === 0 ? (
                    <div className="dashboard-empty-state">
                        <div className="empty-state-number">
                            00
                        </div>

                        <h4>No upcoming job fairs</h4>

                        <p>
                            Upcoming job fairs, participating
                            employers, and available vacancies
                            will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="job-fairs-list">
                        {jobFairs.map((jobFair) => (
                            <article
                                className="job-fair-card"
                                key={jobFair.id}
                            >
                                <div className="job-fair-date">
                                    <span>JOB FAIR</span>

                                    <strong>
                                        {jobFair.start_date
                                            ? new Date(
                                                  jobFair.start_date
                                              ).toLocaleDateString(
                                                  "en-PH",
                                                  {
                                                      month: "short",
                                                      day: "numeric",
                                                  }
                                              )
                                            : "--"}
                                    </strong>
                                </div>

                                <div className="job-fair-info">
                                    <span className="job-fair-label">
                                        EMPLOYMENT OPPORTUNITY
                                    </span>

                                    <h4>
                                        {jobFair.title ||
                                            "Job Fair"}
                                    </h4>

                                    <p>
                                        {jobFair.description ||
                                            "No description available."}
                                    </p>

                                    <div className="job-fair-meta">
                                        <span>
                                            📍{" "}
                                            {jobFair.venue ||
                                                "Venue to be announced"}
                                        </span>

                                        <span>
                                            📅{" "}
                                            {formatDateRange(
                                                jobFair.start_date,
                                                jobFair.end_date
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="job-fair-status">
                                    <span>STATUS</span>

                                    {jobFair.is_registered ? (
                                        <strong className="job-fair-registered">
                                            Registered
                                        </strong>
                                    ) : (
                                        <button
                                            type="button"
                                            className="job-fair-register"
                                            onClick={() =>
                                                handleRegister(
                                                    jobFair.id
                                                )
                                            }
                                            disabled={
                                                registeringId ===
                                                jobFair.id
                                            }
                                        >
                                            {registeringId ===
                                            jobFair.id
                                                ? "Registering..."
                                                : "Register"}
                                        </button>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default JobFairs;