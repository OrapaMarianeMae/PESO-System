
import { useEffect, useState } from "react";
import {
    BarChart3,
    BriefcaseBusiness,
    Users,
    Clock,
    CheckCircle2,
    XCircle,
    UserCheck,
    RefreshCw,
    AlertCircle,
    FileText,
} from "lucide-react";
import "./EmployerReports.css";

const API_BASE = "http://127.0.0.1:8000/api";

function EmployerReports() {
    const [reports, setReports] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchReports = async () => {
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("pesoToken");

            const response = await fetch(`${API_BASE}/employer/reports`, {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to load reports.");
            }

            setReports(data);
        } catch (err) {
            setError(err.message || "Something went wrong while loading reports.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const jobStats = reports?.jobs;
    const applicationStats = reports?.applications;

    const cards = [
        {
            label: "Total Job Posts",
            value: jobStats?.total ?? 0,
            icon: BriefcaseBusiness,
            color: "navy",
        },
        {
            label: "Pending Approval",
            value: jobStats?.pending ?? 0,
            icon: Clock,
            color: "gold",
        },
        {
            label: "Approved Jobs",
            value: jobStats?.approved ?? 0,
            icon: CheckCircle2,
            color: "green",
        },
        {
            label: "Total Applicants",
            value: applicationStats?.total ?? 0,
            icon: Users,
            color: "sky",
        },
    ];

    const applicationStatuses = [
        { label: "Submitted", key: "submitted", icon: FileText },
        { label: "Reviewing", key: "reviewing", icon: Clock },
        { label: "Shortlisted", key: "shortlisted", icon: UserCheck },
        { label: "For Interview", key: "interview", icon: Users },
        { label: "Hired", key: "hired", icon: CheckCircle2 },
        { label: "Rejected", key: "rejected", icon: XCircle },
    ];

    if (loading) {
        return (
            <div className="employer-reports-page">
                <div className="employer-reports-state">
                    <RefreshCw className="reports-spin" size={30} />
                    <p>Loading your reports...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="employer-reports-page">
            <div className="employer-reports-header">
                <div>
                    <span className="reports-eyebrow">ANALYTICS & INSIGHTS</span>
                    <h1>
                        <BarChart3 size={29} />
                        Employer Reports
                    </h1>
                    <p>
                        Review your job posting activity and applicant progress.
                    </p>
                </div>

                <button
                    type="button"
                    className="reports-refresh-button"
                    onClick={fetchReports}
                    disabled={loading}
                >
                    <RefreshCw size={17} />
                    Refresh Reports
                </button>
            </div>

            {error && (
                <div className="reports-error">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                    <button type="button" onClick={fetchReports}>
                        Try again
                    </button>
                </div>
            )}

            {!error && reports && (
                <>
                    <div className="reports-summary-grid">
                        {cards.map((card) => {
                            const Icon = card.icon;

                            return (
                                <div
                                    className="reports-summary-card"
                                    key={card.label}
                                >
                                    <div className={`reports-card-icon ${card.color}`}>
                                        <Icon size={23} />
                                    </div>
                                    <div>
                                        <p>{card.label}</p>
                                        <h2>{card.value}</h2>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="reports-content-grid">
                        <section className="reports-panel">
                            <div className="reports-panel-heading">
                                <div className="reports-panel-icon">
                                    <BriefcaseBusiness size={20} />
                                </div>
                                <div>
                                    <h2>Job Posting Overview</h2>
                                    <p>Current status of your job postings</p>
                                </div>
                            </div>

                            <div className="reports-status-list">
                                {[
                                    { label: "Pending Approval", key: "pending", color: "gold" },
                                    { label: "Approved", key: "approved", color: "green" },
                                    { label: "Rejected", key: "rejected", color: "red" },
                                    { label: "Closed", key: "closed", color: "gray" },
                                ].map((item) => {
                                    const count = jobStats?.[item.key] ?? 0;
                                    const total = jobStats?.total ?? 0;
                                    const percentage = total
                                        ? Math.round((count / total) * 100)
                                        : 0;

                                    return (
                                        <div className="reports-status-item" key={item.key}>
                                            <div className="reports-status-label">
                                                <span className={`reports-status-dot ${item.color}`} />
                                                <span>{item.label}</span>
                                                <strong>{count}</strong>
                                            </div>
                                            <div className="reports-progress-track">
                                                <div
                                                    className={`reports-progress-fill ${item.color}`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        <section className="reports-panel">
                            <div className="reports-panel-heading">
                                <div className="reports-panel-icon gold">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <h2>Applicant Progress</h2>
                                    <p>Current status of applications received</p>
                                </div>
                            </div>

                            <div className="reports-applicant-total">
                                <span>Total Applications</span>
                                <strong>{applicationStats?.total ?? 0}</strong>
                            </div>

                            <div className="reports-status-list">
                                {applicationStatuses.map((item) => {
                                    const Icon = item.icon;
                                    const count = applicationStats?.[item.key] ?? 0;

                                    return (
                                        <div
                                            className="reports-applicant-row"
                                            key={item.key}
                                        >
                                            <div className="reports-applicant-label">
                                                <Icon size={17} />
                                                <span>{item.label}</span>
                                            </div>
                                            <strong>{count}</strong>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>

                    <div className="reports-note">
                        <AlertCircle size={18} />
                        <p>
                            These statistics reflect the job postings and applications
                            associated with your employer account.
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}

export default EmployerReports;
