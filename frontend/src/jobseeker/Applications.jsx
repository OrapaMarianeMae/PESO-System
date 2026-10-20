import { useEffect, useState } from "react";

function Applications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchApplications = async () => {
        try {
            setLoading(true);
            setError("");

            const token =
                localStorage.getItem("pesoToken");

            const response = await fetch(
                "http://127.0.0.1:8000/api/jobseeker/applications",
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
                        "Unable to load applications."
                );
            }

            setApplications(
                Array.isArray(data.applications)
                    ? data.applications
                    : []
            );
        } catch (err) {
            console.error(
                "Unable to load applications:",
                err
            );

            setError(
                err.message ||
                    "Unable to load your applications."
            );

            setApplications([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const getStatusLabel = (status) => {
        switch (status) {
            case "submitted":
                return "Submitted";

            case "under_review":
                return "Under Review";

            case "shortlisted":
                return "Shortlisted";

            case "interview":
                return "Interview";

            case "accepted":
                return "Accepted";

            case "rejected":
                return "Rejected";

            default:
                return status
                    ? status.replace(/_/g, " ")
                    : "Unknown";
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "submitted":
                return "application-status submitted";

            case "under_review":
                return "application-status review";

            case "shortlisted":
                return "application-status shortlisted";

            case "interview":
                return "application-status interview";

            case "accepted":
                return "application-status accepted";

            case "rejected":
                return "application-status rejected";

            default:
                return "application-status";
        }
    };

    const formatDate = (date) => {
        if (!date) {
            return "Not available";
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
                        MY APPLICATIONS
                    </span>

                    <h2>Applications</h2>

                    <p>
                        Track the status of your job applications
                        submitted through the Danao Public
                        Employment Service Office.
                    </p>
                </div>
            </section>

            <section className="dashboard-panel">
                <div className="dashboard-panel-header">
                    <div>
                        <span>
                            APPLICATION HISTORY
                        </span>

                        <h3>Your Applications</h3>
                    </div>

                    <span className="jobs-count">
                        {loading
                            ? "Loading..."
                            : `${applications.length} ${
                                  applications.length === 1
                                      ? "application"
                                      : "applications"
                              }`}
                    </span>
                </div>

                {loading ? (
                    <div className="dashboard-empty-state">
                        <h4>
                            Loading your applications...
                        </h4>

                        <p>
                            Please wait while we retrieve your
                            application history.
                        </p>
                    </div>
                ) : error ? (
                    <div className="dashboard-empty-state">
                        <h4>
                            Unable to load applications
                        </h4>

                        <p>{error}</p>
                    </div>
                ) : applications.length === 0 ? (
                    <div className="dashboard-empty-state">
                        <div className="empty-state-number">
                            00
                        </div>

                        <h4>
                            No applications yet
                        </h4>

                        <p>
                            When you apply for a job, your
                            application and its current status
                            will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="applications-list">
                        {applications.map(
                            (application) => {
                                const job =
                                    application.job_posting;

                                const employer =
                                    job?.employer;

                                const companyName =
                                    employer
                                        ?.employer_profile
                                        ?.company_name ||
                                    "Employer";

                                return (
                                    <article
                                        className="application-card"
                                        key={
                                            application.id
                                        }
                                    >
                                        <div className="application-card-main">
                                            <div className="application-company-logo">
                                                {companyName
                                                    .charAt(
                                                        0
                                                    )
                                                    .toUpperCase()}
                                            </div>

                                            <div className="application-card-info">
                                                <span className="application-label">
                                                    APPLICATION
                                                </span>

                                                <h4>
                                                    {job?.job_title ||
                                                        "Job Position"}
                                                </h4>

                                                <p className="application-company">
                                                    {
                                                        companyName
                                                    }
                                                </p>

                                                <div className="application-meta">
                                                    <span>
                                                        📍{" "}
                                                        {job?.location ||
                                                            "Danao, Bohol"}
                                                    </span>

                                                    <span>
                                                        Applied{" "}
                                                        {formatDate(
                                                            application.applied_at
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="application-card-status">
                                            <span>
                                                STATUS
                                            </span>

                                            <strong
                                                className={getStatusClass(
                                                    application.status
                                                )}
                                            >
                                                {getStatusLabel(
                                                    application.status
                                                )}
                                            </strong>
                                        </div>
                                    </article>
                                );
                            }
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Applications;