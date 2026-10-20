import { useEffect, useState } from "react";

function Reports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        reported_user_id: "",
        job_posting_id: "",
        reason: "",
        details: "",
    });

    const fetchReports = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("pesoToken");

            const response = await fetch(
                "http://127.0.0.1:8000/api/jobseeker/reports",
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
                    data.message || "Unable to load reports."
                );
            }

            setReports(
                Array.isArray(data.reports)
                    ? data.reports
                    : []
            );
        } catch (err) {
            console.error(
                "Unable to load reports:",
                err
            );

            setError(
                err.message ||
                    "Unable to load reports."
            );

            setReports([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setSubmitting(true);
            setError("");
            setSuccess("");

            const token = localStorage.getItem("pesoToken");

            const response = await fetch(
                "http://127.0.0.1:8000/api/jobseeker/reports",
                {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        reported_user_id:
                            Number(form.reported_user_id),
                        job_posting_id:
                            form.job_posting_id
                                ? Number(form.job_posting_id)
                                : null,
                        reason: form.reason,
                        details: form.details || null,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Unable to submit report."
                );
            }

            setSuccess(
                data.message ||
                    "Employer report submitted successfully."
            );

            setForm({
                reported_user_id: "",
                job_posting_id: "",
                reason: "",
                details: "",
            });

            await fetchReports();
        } catch (err) {
            console.error(
                "Unable to submit report:",
                err
            );

            setError(
                err.message ||
                    "Unable to submit report."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (date) => {
        if (!date) {
            return "Date not available";
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

    const formatStatus = (status) => {
        if (!status) {
            return "New";
        }

        return status
            .replace(/_/g, " ")
            .replace(/\b\w/g, (letter) =>
                letter.toUpperCase()
            );
    };

    return (
        <div className="jobseeker-dashboard">
            <section className="dashboard-welcome">
                <div>
                    <span className="dashboard-section-label">
                        EMPLOYMENT RECORDS
                    </span>

                    <h2>Reports</h2>

                    <p>
                        Report concerns involving employers or job
                        postings and monitor the status of your
                        submitted reports through the Danao PESO
                        system.
                    </p>
                </div>
            </section>

            {success && (
                <div className="dashboard-success-message">
                    {success}
                </div>
            )}

            {error && (
                <div className="dashboard-error-message">
                    {error}
                </div>
            )}

            <section className="dashboard-panel">
                <div className="dashboard-panel-header">
                    <div>
                        <span>
                            PRIVATE EMPLOYER REPORTING
                        </span>

                        <h3>Submit a Report</h3>
                    </div>
                </div>

                <form
                    className="report-form"
                    onSubmit={handleSubmit}
                >
                    <div className="report-form-grid">
                        <div className="form-group">
                            <label htmlFor="reported_user_id">
                                Employer User ID
                            </label>

                       <input
                            id="reported_user_id"
                            name="reported_user_id"
                            type="number"
                            min="0"
                            step="1"
                            value={form.reported_user_id}
                            onChange={handleChange}
                            placeholder="Enter employer user ID"
                            required
                        />
                        </div>

                        <div className="form-group">
                            <label htmlFor="job_posting_id">
                                Job Posting ID
                            </label>

                            <input
                                id="job_posting_id"
                                name="job_posting_id"
                                type="number"
                                min="0"
                                step="1"
                                value={form.job_posting_id}
                                onChange={handleChange}
                                placeholder="Optional"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="reason">
                            Reason for Report
                        </label>

                        <input
                            id="reason"
                            name="reason"
                            type="text"
                            value={form.reason}
                            onChange={handleChange}
                            placeholder="Enter the reason for your report"
                            maxLength={255}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="details">
                            Additional Details
                        </label>

                        <textarea
                            id="details"
                            name="details"
                            value={form.details}
                            onChange={handleChange}
                            placeholder="Provide additional information about your concern..."
                            rows="5"
                        />
                    </div>

                    <button
                        type="submit"
                        className="report-submit-button"
                        disabled={submitting}
                    >
                        {submitting
                            ? "Submitting..."
                            : "Submit Report"}
                    </button>
                </form>
            </section>

            <section className="dashboard-panel">
                <div className="dashboard-panel-header">
                    <div>
                        <span>MY SUBMITTED REPORTS</span>

                        <h3>Report History</h3>
                    </div>

                    <span className="jobs-count">
                        {loading
                            ? "Loading..."
                            : `${reports.length} ${
                                  reports.length === 1
                                      ? "report"
                                      : "reports"
                              }`}
                    </span>
                </div>

                {loading ? (
                    <div className="dashboard-empty-state">
                        <h4>
                            Loading reports...
                        </h4>

                        <p>
                            Please wait while we retrieve your
                            submitted reports.
                        </p>
                    </div>
                ) : reports.length === 0 ? (
                    <div className="dashboard-empty-state">
                        <div className="empty-state-number">
                            00
                        </div>

                        <h4>
                            No reports available
                        </h4>

                        <p>
                            Your submitted employer reports will
                            appear here.
                        </p>
                    </div>
                ) : (
                    <div className="reports-list">
                        {reports.map((report) => (
                            <article
                                className="report-card"
                                key={report.id}
                            >
                                <div className="report-card-header">
                                    <div>
                                        <span className="dashboard-section-label">
                                            EMPLOYER REPORT
                                        </span>

                                        <h4>
                                            {report.reason ||
                                                "Employer Report"}
                                        </h4>
                                    </div>

                                    <span className="report-status">
                                        {formatStatus(
                                            report.status
                                        )}
                                    </span>
                                </div>

                                {report.reported_user && (
                                    <p>
                                        <strong>
                                            Reported Employer:
                                        </strong>{" "}
                                        {[
                                            report.reported_user
                                                .first_name,
                                            report.reported_user
                                                .middle_name,
                                            report.reported_user
                                                .surname,
                                        ]
                                            .filter(Boolean)
                                            .join(" ")}
                                    </p>
                                )}

                                {report.job_posting && (
                                    <p>
                                        <strong>
                                            Job Posting:
                                        </strong>{" "}
                                        {
                                            report.job_posting
                                                .job_title
                                        }
                                    </p>
                                )}

                                {report.details && (
                                    <p>
                                        <strong>
                                            Details:
                                        </strong>{" "}
                                        {report.details}
                                    </p>
                                )}

                                <span className="report-date">
                                    Submitted{" "}
                                    {formatDate(
                                        report.created_at
                                    )}
                                </span>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Reports;