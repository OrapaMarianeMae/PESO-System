import { useEffect, useState } from "react";

function Announcements() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("pesoToken");

            const response = await fetch(
                "http://127.0.0.1:8000/api/jobseeker/announcements",
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
                        "Unable to load announcements."
                );
            }

            setAnnouncements(
                Array.isArray(data.announcements)
                    ? data.announcements
                    : []
            );
        } catch (err) {
            console.error(
                "Unable to load announcements:",
                err
            );

            setError(
                err.message ||
                    "Unable to load announcements."
            );

            setAnnouncements([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

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

    return (
        <div className="jobseeker-dashboard">
            <section className="dashboard-welcome">
                <div>
                    <span className="dashboard-section-label">
                        OFFICIAL UPDATES
                    </span>

                    <h2>Announcements</h2>

                    <p>
                        Stay informed about the latest announcements,
                        employment opportunities, activities, and important
                        updates from the Public Employment Service Office.
                    </p>
                </div>
            </section>

            <section className="dashboard-panel">
                <div className="dashboard-panel-header">
                    <div>
                        <span>PESO INFORMATION</span>

                        <h3>Latest Announcements</h3>
                    </div>

                    <span className="jobs-count">
                        {loading
                            ? "Loading..."
                            : `${announcements.length} ${
                                  announcements.length === 1
                                      ? "announcement"
                                      : "announcements"
                              }`}
                    </span>
                </div>

                {loading ? (
                    <div className="dashboard-empty-state">
                        <h4>
                            Loading announcements...
                        </h4>

                        <p>
                            Please wait while we retrieve the
                            latest PESO announcements.
                        </p>
                    </div>
                ) : error ? (
                    <div className="dashboard-empty-state">
                        <h4>
                            Unable to load announcements
                        </h4>

                        <p>{error}</p>
                    </div>
                ) : announcements.length === 0 ? (
                    <div className="dashboard-empty-state">
                        <div className="empty-state-number">
                            00
                        </div>

                        <h4>
                            No announcements yet
                        </h4>

                        <p>
                            Official PESO announcements and important
                            employment updates will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="peso-announcements-list">
                        {announcements.map((announcement) => (
                            <article
                                className="peso-announcement-card"
                                key={announcement.id}
                            >
                                <div className="peso-announcement-content">
                                    <span className="dashboard-section-label">
                                        PESO ANNOUNCEMENT
                                    </span>

                                    <h4>
                                        {announcement.title ||
                                            "PESO Announcement"}
                                    </h4>

                                    <p>
                                        {announcement.content ||
                                            "No announcement details available."}
                                    </p>

                                    <span className="peso-announcement-date">
                                        Published{" "}
                                        {formatDate(
                                            announcement.publish_at ||
                                                announcement.created_at
                                        )}
                                    </span>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Announcements;