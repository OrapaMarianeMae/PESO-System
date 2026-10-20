import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Users,
    Building2,
    BriefcaseBusiness,
    FileClock,
    ClipboardList,
    CalendarDays,
    UserCheck,
    TrendingUp,
    ArrowRight,
    ShieldCheck,
    Bell,
    Plus,
    Eye,
} from "lucide-react";

import "./AdminDashboard.css";

const statistics = [
    {
        title: "Total Jobseekers",
        key: "total_jobseekers",
        description: "Registered jobseeker accounts",
        icon: Users,
        color: "blue",
        path: "/admin/users",
    },
    {
        title: "Total Employers",
        key: "total_employers",
        description: "Registered employer accounts",
        icon: Building2,
        color: "green",
        path: "/admin/users",
    },
    {
        title: "Active Vacancies",
        key: "active_vacancies",
        description: "Available approved positions",
        icon: BriefcaseBusiness,
        color: "gold",
        path: "/admin/jobs",
    },
    {
        title: "Pending Job Posts",
        key: "pending_job_posts",
        description: "Posts awaiting moderation",
        icon: FileClock,
        color: "orange",
        path: "/admin/jobs",
    },
    {
        title: "Applications",
        key: "total_applications",
        description: "Total submitted applications",
        icon: ClipboardList,
        color: "purple",
        path: "/admin/statistics",
    },
    {
        title: "Upcoming Job Fairs",
        key: "upcoming_job_fairs",
        description: "Scheduled employment fairs",
        icon: CalendarDays,
        color: "cyan",
        path: "/admin/job-fairs",
    },
    {
        title: "Fair Participants",
        key: "job_fair_jobseeker_participants",
        description: "Registered jobseekers",
        icon: UserCheck,
        color: "pink",
        path: "/admin/job-fairs",
    },
    {
        title: "Job Placements",
        key: "total_placements",
        description: "Recorded employment placements",
        icon: TrendingUp,
        color: "teal",
        path: "/admin/statistics",
    },
];

const quickActions = [
    {
        title: "Manage Users",
        description: "Review jobseeker and employer accounts.",
        icon: Users,
        path: "/admin/users",
    },
    {
        title: "Review Job Posts",
        description: "Approve or reject submitted vacancies.",
        icon: BriefcaseBusiness,
        path: "/admin/jobs",
    },
    {
        title: "Create Announcement",
        description: "Share important updates with users.",
        icon: Bell,
        path: "/admin/announcements",
    },
    {
        title: "Manage Job Fairs",
        description: "Organize employment fairs and participants.",
        icon: CalendarDays,
        path: "/admin/job-fairs",
    },
];

function AdminDashboard() {
    const navigate = useNavigate();
    const [statisticsData, setStatisticsData] = useState(null);
    const [statisticsLoading, setStatisticsLoading] = useState(true);
    const [statisticsError, setStatisticsError] = useState("");

        useEffect(() => {
        const loadStatistics = async () => {
            const token = localStorage.getItem("pesoToken");

            if (!token) {
                setStatisticsError("Please log in again to view statistics.");
                setStatisticsLoading(false);
                return;
            }

            try {
                const response = await fetch(
                    "http://127.0.0.1:8000/api/admin/statistics",
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
                        data.message || "Unable to load dashboard statistics."
                    );
                }

                setStatisticsData(data.statistics);
                setStatisticsError("");
            } catch (error) {
                setStatisticsError(error.message);
            } finally {
                setStatisticsLoading(false);
            }
        };

        loadStatistics();
    }, []);

    const currentDate = new Date().toLocaleDateString("en-PH", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="admin-dashboard">
            {/* Welcome section */}
            <section className="admin-welcome">
                <div className="admin-welcome-content">
                    <span className="admin-eyebrow">
                        ADMINISTRATOR PORTAL
                    </span>

                    <h1>Welcome to your PESO dashboard.</h1>

                    <p>
                        Manage employment services, monitor job vacancies,
                        review applications, and oversee municipal employment
                        programs in Danao.
                    </p>

                    <div className="admin-welcome-actions">
                        <button
                            type="button"
                            className="admin-primary-button"
                            onClick={() => navigate("/admin/jobs")}
                        >
                            <BriefcaseBusiness size={17} />
                            Review Job Posts
                        </button>

                        <button
                            type="button"
                            className="admin-secondary-button"
                            onClick={() => navigate("/admin/users")}
                        >
                            <Users size={17} />
                            Manage Users
                        </button>
                    </div>
                </div>
            </section>

            {/* Statistics */}
            <section className="admin-section">
                <div className="admin-section-heading">
                    <div>
                        <h2>Employment Overview</h2>
                        <p>
                            An overview of employment activities across PESO
                            Danao.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="admin-outline-button"
                        onClick={() => navigate("/admin/statistics")}
                    >
                        View Reports
                        <ArrowRight size={16} />
                    </button>
                </div>

                <div className="admin-statistics-grid">
                    {statistics.map((item) => {
                        const Icon = item.icon;

                        return (
                            <button
                                type="button"
                                className="admin-stat-card"
                                key={item.title}
                                onClick={() => navigate(item.path)}
                            >
                                <div className="admin-stat-top">
                                    <span
                                        className={`admin-stat-icon ${item.color}`}
                                    >
                                        <Icon size={21} />
                                    </span>

                                    <ArrowRight
                                        size={16}
                                        className="admin-stat-arrow"
                                    />
                                </div>

                                <span className="admin-stat-label">
                                    {item.title}
                                </span>

                                <span className="admin-stat-value">
                                    {statisticsLoading
                                    ? "..."
                                    : Number(statisticsData?.[item.key] ?? 0).toLocaleString("en-PH")}
                                </span>

                                <span className="admin-stat-description">
                                    {item.description}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <p className="admin-data-note" role="status">
                    {statisticsError
                        ? statisticsError
                        : statisticsLoading
                        ? "Loading employment statistics..."
                        : "Statistics are based on the current PESO system records."}
                </p>
            </section>

            {/* Quick actions and recent activity */}
            <section className="admin-dashboard-bottom">
                <div className="admin-panel">
                    <div className="admin-panel-heading">
                        <div>
                            <span className="admin-panel-eyebrow">
                                ADMINISTRATION
                            </span>
                            <h2>Quick Actions</h2>
                            <p>Frequently used administrative tools</p>
                        </div>

                        <span className="admin-panel-heading-icon">
                            <Plus size={19} />
                        </span>
                    </div>

                    <div className="admin-quick-action-list">
                        {quickActions.map((action) => {
                            const Icon = action.icon;

                            return (
                                <button
                                    type="button"
                                    className="admin-quick-action"
                                    key={action.title}
                                    onClick={() => navigate(action.path)}
                                >
                                    <span className="admin-action-icon">
                                        <Icon size={20} />
                                    </span>

                                    <span className="admin-action-text">
                                        <strong>{action.title}</strong>
                                        <small>{action.description}</small>
                                    </span>

                                    <ArrowRight
                                        size={17}
                                        className="admin-action-arrow"
                                    />
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="admin-panel">
                    <div className="admin-panel-heading">
                        <div>
                            <span className="admin-panel-eyebrow">
                                SYSTEM UPDATES
                            </span>
                            <h2>Recent Activity</h2>
                            <p>Latest updates from the PESO system</p>
                        </div>

                        <span className="admin-panel-heading-icon">
                            <Eye size={19} />
                        </span>
                    </div>

                    <div className="admin-empty-activity">
                        <span className="admin-empty-icon">
                            <ClipboardList size={28} />
                        </span>

                        <h3>No activity to display</h3>

                        <p>
                            Recent registrations, job post submissions,
                            applications, and administrative actions can
                            appear here once activity tracking is connected.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <section className="admin-dashboard-footer">
                <div className="admin-footer-icon">
                    <ShieldCheck size={20} />
                </div>

                <div className="admin-footer-content">
                    <strong>PESO Danao Administration</strong>
                    <p>
                        {currentDate} · Public Employment Service Office,
                        Municipality of Danao
                    </p>
                </div>
            </section>
        </div>
    );
}

export default AdminDashboard;
