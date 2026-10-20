import { useEffect, useState } from "react";

function PESOEvents() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [registeringId, setRegisteringId] = useState(null);
    const [success, setSuccess] = useState("");

    const fetchEvents = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("pesoToken");

            const response = await fetch(
                "http://127.0.0.1:8000/api/jobseeker/events",
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
                    data.message || "Unable to load PESO events."
                );
            }

            setEvents(
                Array.isArray(data.events)
                    ? data.events
                    : []
            );
        } catch (err) {
            console.error(
                "Unable to load PESO events:",
                err
            );

            setError(
                err.message ||
                    "Unable to load PESO events."
            );

            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleRegister = async (eventId) => {
        try {
            setRegisteringId(eventId);
            setError("");
            setSuccess("");

            const token = localStorage.getItem("pesoToken");

            const response = await fetch(
                `http://127.0.0.1:8000/api/jobseeker/events/${eventId}/register`,
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
                        "Unable to register for this event."
                );
            }

            setSuccess(
                data.message ||
                    "Successfully registered for the event."
            );

            setEvents((currentEvents) =>
                currentEvents.map((event) =>
                    event.id === eventId
                        ? {
                              ...event,
                              registered: true,
                          }
                        : event
                )
            );
        } catch (err) {
            console.error(
                "Unable to register for event:",
                err
            );

            setError(
                err.message ||
                    "Unable to register for this event."
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
                        PESO ACTIVITIES
                    </span>

                    <h2>PESO Events</h2>

                    <p>
                        Stay updated with employment-related
                        activities, training sessions, career
                        services, and other events organized by
                        the Public Employment Service Office.
                    </p>
                </div>
            </section>

            <section className="dashboard-panel">
                <div className="dashboard-panel-header">
                    <div>
                        <span>UPCOMING ACTIVITIES</span>

                        <h3>PESO Events</h3>
                    </div>

                    <span className="jobs-count">
                        {loading
                            ? "Loading..."
                            : `${events.length} ${
                                  events.length === 1
                                      ? "event"
                                      : "events"
                              }`}
                    </span>
                </div>

                {success && (
                    <div className="dashboard-success-message">
                        {success}
                    </div>
                )}

                {error && !loading && (
                    <div className="dashboard-error-message">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="dashboard-empty-state">
                        <h4>
                            Loading PESO events...
                        </h4>

                        <p>
                            Please wait while we retrieve the
                            latest PESO activities.
                        </p>
                    </div>
                ) : events.length === 0 ? (
                    <div className="dashboard-empty-state">
                        <div className="empty-state-number">
                            00
                        </div>

                        <h4>
                            No upcoming events
                        </h4>

                        <p>
                            PESO events, career activities,
                            training sessions, and registration
                            opportunities will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="peso-events-list">
                        {events.map((event) => (
                            <article
                                className="peso-event-card"
                                key={event.id}
                            >
                                <div className="peso-event-date">
                                    <span>
                                        PESO EVENT
                                    </span>

                                    <strong>
                                        {event.start_date
                                            ? new Date(
                                                  event.start_date
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

                                <div className="peso-event-info">
                                    <span className="peso-event-label">
                                        EMPLOYMENT SERVICE
                                    </span>

                                    <h4>
                                        {event.title ||
                                            "PESO Event"}
                                    </h4>

                                    <p>
                                        {event.description ||
                                            "No description available."}
                                    </p>

                                    <div className="peso-event-meta">
                                        <span>
                                            📍{" "}
                                            {event.venue ||
                                                "Venue to be announced"}
                                        </span>

                                        <span>
                                            📅{" "}
                                            {formatDateRange(
                                                event.start_date,
                                                event.end_date
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="peso-event-status">
                                    <span>STATUS</span>

                                    <strong>
                                        {event.status
                                            ? event.status.replace(
                                                  /_/g,
                                                  " "
                                              )
                                            : "Upcoming"}
                                    </strong>

                                    <button
                                        type="button"
                                        className="peso-event-register-button"
                                        onClick={() =>
                                            handleRegister(
                                                event.id
                                            )
                                        }
                                        disabled={
                                            registeringId ===
                                                event.id ||
                                            event.registered
                                        }
                                    >
                                        {registeringId ===
                                        event.id
                                            ? "Registering..."
                                            : event.registered
                                            ? "Registered"
                                            : "Register"}
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default PESOEvents;