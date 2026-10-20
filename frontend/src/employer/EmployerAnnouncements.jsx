import { useEffect, useState } from "react";
import {
    Megaphone,
    Search,
    RefreshCw,
    CalendarDays,
    Clock,
    Eye,
    X,
    Loader2,
    AlertCircle,
    Bell,
} from "lucide-react";
import "./EmployerAnnouncements.css";

const API_BASE = "http://127.0.0.1:8000/api";

function EmployerAnnouncements() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

    const fetchAnnouncements = async () => {
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("pesoToken");

            if (!token) {
                throw new Error("Your session has expired. Please log in again.");
            }

            const response = await fetch(
                `${API_BASE}/employer/announcements`,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to load announcements."
                );
            }

            setAnnouncements(
                Array.isArray(data.announcements)
                    ? data.announcements
                    : []
            );
        } catch (err) {
            setError(err.message || "Unable to load announcements.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const filteredAnnouncements = announcements.filter((announcement) => {
        const keyword = search.toLowerCase();

        return (
            (announcement.title || "").toLowerCase().includes(keyword) ||
            (announcement.content || "").toLowerCase().includes(keyword)
        );
    });

    const formatDate = (date) => {
        if (!date) return "Date not specified";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "Date not specified";
        }

        return parsedDate.toLocaleDateString("en-PH", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="employer-announcements-page">
            <div className="employer-announcements-header">
                <div className="employer-announcements-heading">
                    <div className="employer-announcements-icon">
                        <Megaphone size={25} />
                    </div>

                    <div>
                        <h1>Announcements</h1>
                        <p>
                            Stay updated with the latest PESO announcements
                            and employment opportunities.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    className="employer-announcements-refresh"
                    onClick={fetchAnnouncements}
                    disabled={loading}
                >
                    {loading ? (
                        <Loader2 size={17} className="ea-spin" />
                    ) : (
                        <RefreshCw size={17} />
                    )}
                    Refresh
                </button>
            </div>

            <div className="employer-announcements-summary">
                <div className="ea-summary-icon">
                    <Bell size={23} />
                </div>
                <div>
                    <span className="ea-summary-label">
                        Available Announcements
                    </span>
                    <strong>{announcements.length}</strong>
                    <small>
                        Published updates for employers
                    </small>
                </div>
            </div>

            <div className="employer-announcements-toolbar">
                <div className="ea-search-box">
                    <Search size={19} />
                    <input
                        type="text"
                        placeholder="Search announcements..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch("")}
                            aria-label="Clear search"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                <span className="ea-results-count">
                    {filteredAnnouncements.length}{" "}
                    {filteredAnnouncements.length === 1
                        ? "announcement"
                        : "announcements"}
                </span>
            </div>

            {error && (
                <div className="ea-error-message">
                    <AlertCircle size={19} />
                    <span>{error}</span>
                    <button type="button" onClick={fetchAnnouncements}>
                        Try again
                    </button>
                </div>
            )}

            {loading ? (
                <div className="ea-state-container">
                    <Loader2 size={35} className="ea-spin" />
                    <h3>Loading announcements...</h3>
                    <p>Please wait while we retrieve the latest updates.</p>
                </div>
            ) : error ? null : filteredAnnouncements.length === 0 ? (
                <div className="ea-state-container">
                    <div className="ea-empty-icon">
                        <Megaphone size={35} />
                    </div>
                    <h3>
                        {search
                            ? "No matching announcements"
                            : "No announcements available yet"}
                    </h3>
                    <p>
                        {search
                            ? "Try a different keyword."
                            : "Published announcements for employers will appear here once the PESO administrator posts them."}
                    </p>
                    {search && (
                        <button
                            type="button"
                            className="ea-secondary-button"
                            onClick={() => setSearch("")}
                        >
                            Clear search
                        </button>
                    )}
                </div>
            ) : (
                <div className="ea-announcements-list">
                    {filteredAnnouncements.map((announcement) => (
                        <article
                            className="ea-announcement-card"
                            key={announcement.id}
                        >
                            <div className="ea-announcement-card-top">
                                <div className="ea-card-megaphone">
                                    <Megaphone size={21} />
                                </div>

                                <span className="ea-published-badge">
                                    Published
                                </span>
                            </div>

                            <h2>{announcement.title}</h2>

                            <p className="ea-announcement-preview">
                                {announcement.content}
                            </p>

                            <div className="ea-announcement-meta">
                                <span>
                                    <CalendarDays size={16} />
                                    {formatDate(
                                        announcement.publish_at ||
                                        announcement.created_at
                                    )}
                                </span>
                            </div>

                            <button
                                type="button"
                                className="ea-read-more-button"
                                onClick={() =>
                                    setSelectedAnnouncement(announcement)
                                }
                            >
                                <Eye size={17} />
                                Read announcement
                            </button>
                        </article>
                    ))}
                </div>
            )}

            {selectedAnnouncement && (
                <div
                    className="ea-modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setSelectedAnnouncement(null);
                        }
                    }}
                >
                    <div
                        className="ea-announcement-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="ea-modal-title"
                    >
                        <div className="ea-modal-header">
                            <div className="ea-modal-title-icon">
                                <Megaphone size={22} />
                            </div>

                            <button
                                type="button"
                                className="ea-modal-close"
                                onClick={() => setSelectedAnnouncement(null)}
                                aria-label="Close announcement"
                            >
                                <X size={21} />
                            </button>
                        </div>

                        <span className="ea-published-badge">
                            Published announcement
                        </span>

                        <h2 id="ea-modal-title">
                            {selectedAnnouncement.title}
                        </h2>

                        <div className="ea-modal-date">
                            <Clock size={16} />
                            {formatDate(
                                selectedAnnouncement.publish_at ||
                                selectedAnnouncement.created_at
                            )}
                        </div>

                        <div className="ea-modal-content">
                            {selectedAnnouncement.content}
                        </div>

                        <button
                            type="button"
                            className="ea-modal-done-button"
                            onClick={() => setSelectedAnnouncement(null)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EmployerAnnouncements;