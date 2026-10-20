
import { useEffect, useRef, useState } from "react";
import {
    Bell,
    ChevronDown,
    User,
    Check,
    CheckCheck,
    Loader2,
    X,
    Settings,
    LogOut,
} from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";

function DashboardLayout() {
    const navigate = useNavigate();
    const profileMenuRef = useRef(null);

    const [user, setUser] = useState(null);
    const [profileOpen, setProfileOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notificationsLoading, setNotificationsLoading] = useState(false);
    const [notificationActionLoading, setNotificationActionLoading] =
        useState("");
    const [notificationError, setNotificationError] = useState("");

    // Read the saved user and keep the header synchronized with profile updates.
    useEffect(() => {
        const syncUser = () => {
            const storedUser = localStorage.getItem("pesoUser");

            if (!storedUser) {
                setUser(null);
                return;
            }

            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Unable to read saved user:", error);
                setUser(null);
            }
        };

        syncUser();

        window.addEventListener("pesoUserUpdated", syncUser);
        window.addEventListener("storage", syncUser);

        return () => {
            window.removeEventListener("pesoUserUpdated", syncUser);
            window.removeEventListener("storage", syncUser);
        };
    }, []);

    // Close the profile menu when clicking outside or pressing Escape.
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                profileMenuRef.current &&
                !profileMenuRef.current.contains(event.target)
            ) {
                setProfileOpen(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setProfileOpen(false);
                setNotificationsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    const role = user?.role || "jobseeker";

    const getRoleLabel = () => {
        if (role === "admin" || role === "administrator") {
            return "Administrator";
        }

        if (role === "employer") return "Employer";

        return "Jobseeker";
    };

    const fullName = [
        user?.first_name,
        user?.middle_name,
        user?.surname,
        user?.name_extension,
    ]
        .filter(Boolean)
        .join(" ");

    const displayName = fullName || user?.name || "User";

    const handleLogout = () => {
        localStorage.removeItem("pesoToken");
        localStorage.removeItem("pesoUser");
        setProfileOpen(false);
        setNotificationsOpen(false);
        window.location.href = "/";
    };

   
const loadNotifications = async () => {
    const token = localStorage.getItem("pesoToken");

    if (!token || !["jobseeker", "employer"].includes(role)) {
        setNotifications([]);
        setUnreadCount(0);
        return;
    }

    setNotificationsLoading(true);
    setNotificationError("");

    const endpoint =
        role === "employer"
            ? "http://127.0.0.1:8000/api/employer/notifications"
            : "http://127.0.0.1:8000/api/jobseeker/notifications";

    try {
        const response = await fetch(endpoint, {
            method: "GET",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(
                data.message || "Unable to load notifications."
            );
        }

        setNotifications(
            Array.isArray(data.notifications) ? data.notifications : []
        );
        setUnreadCount(Number(data.unread_count) || 0);
    } catch (error) {
        console.error("Unable to load notifications:", error);
        setNotificationError(
            error.message || "Unable to load notifications."
        );
    } finally {
        setNotificationsLoading(false);
    }
};


    // Preserve jobseeker notification behavior.

    useEffect(() => {
        if (user?.role === "jobseeker" || user?.role === "employer") {
            loadNotifications();
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [user?.role]);



const toggleNotifications = () => {
    const nextOpen = !notificationsOpen;

    setNotificationsOpen(nextOpen);
    setProfileOpen(false);

    if (
        nextOpen &&
        (role === "jobseeker" || role === "employer")
    ) {
        loadNotifications();
    }
};


    const markNotificationAsRead = async (notification) => {
        if (notification.read_at) {
            if (notification.url) {
                setNotificationsOpen(false);
                navigate(notification.url);
            }

            return;
        }

        const token = localStorage.getItem("pesoToken");

        if (!token) {
            setNotificationError("Please log in again to continue.");
            return;
        }

        setNotificationActionLoading(notification.id);
        setNotificationError("");

        try {
            const response = await fetch(              
                `http://127.0.0.1:8000/api/${role}/notifications/${notification.id}/read`,
                {
                    method: "PATCH",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to mark notification as read."
                );
            }

            setNotifications((current) =>
                current.map((item) =>
                    item.id === notification.id
                        ? { ...item, read_at: new Date().toISOString() }
                        : item
                )
            );

            setUnreadCount(Number(data.unread_count) || 0);

            if (notification.url) {
                setNotificationsOpen(false);
                navigate(notification.url);
            }
        } catch (error) {
            console.error("Unable to mark notification as read:", error);
            setNotificationError(
                error.message || "Unable to update notification."
            );
        } finally {
            setNotificationActionLoading("");
        }
    };

    const markAllNotificationsAsRead = async () => {
        const token = localStorage.getItem("pesoToken");

        if (!token || unreadCount === 0) return;

        setNotificationActionLoading("all");
        setNotificationError("");

        try {
            const response = await fetch(
                `http://127.0.0.1:8000/api/${role}/notifications/read-all`
                ,
                {
                    method: "PATCH",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to mark notifications as read."
                );
            }

            setNotifications((current) =>
                current.map((item) => ({
                    ...item,
                    read_at: item.read_at || new Date().toISOString(),
                }))
            );

            setUnreadCount(Number(data.unread_count) || 0);
        } catch (error) {
            console.error("Unable to mark all notifications as read:", error);
            setNotificationError(
                error.message || "Unable to update notifications."
            );
        } finally {
            setNotificationActionLoading("");
        }
    };

    const formatNotificationDate = (dateValue) => {
        if (!dateValue) return "";

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) return "";

        return date.toLocaleString("en-PH", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    };

    const getNotificationTypeLabel = (type) => {
        switch (type) {
            case "job_alert":
                return "JOB ALERT";
            case "application_update":
                return "APPLICATION UPDATE";
            case "peso_announcement":
                return "PESO ANNOUNCEMENT";
            default:
                return "NOTIFICATION";
            case "new_applicant":
                return "NEW APPLICANT";
            case "job_approval":
                return "JOB POST UPDATE";
            case "application_update":
                return "APPLICATION UPDATE";
            case "job_fair":
                return "JOB FAIR UPDATE";
            case "employer_announcement":
                return "PESO ANNOUNCEMENT";
        }
    };

    // Use the exact URLs registered in App.jsx.
    const goToProfile = () => {
        setProfileOpen(false);

        if (role === "employer") {
            navigate("/employer/company-profile");
        } else if (role === "admin" || role === "administrator") {
            navigate("/admin/dashboard/my-profile");
        } else {
            navigate("/dashboard/my-profile");
        }
    };

    const goToSettings = () => {
        setProfileOpen(false);

        if (role === "employer") {
            navigate("/employer/settings");
        } else if (role === "admin" || role === "administrator") {
            navigate("/admin/dashboard/settings");
        } else {
            navigate("/dashboard/settings");
        }
    };

    const profilePicture =
        user?.profile_picture_url ||
        (user?.profile_picture
            ? user.profile_picture.startsWith("http")
                ? user.profile_picture
                : `http://127.0.0.1:8000/storage/${user.profile_picture}`
            : null);

    return (
        <div className={`dashboard-layout dashboard-${role}`}>
            <Sidebar />

            <div className="dashboard-main-wrapper">
                <header className="dashboard-header">
                    <div className="dashboard-header-title"></div>

                    <div className="dashboard-header-actions">
                        {/* Notifications */}
                        <div
                            className="peso-notification-wrapper"
                            style={{ position: "relative" }}
                        >
                            <button
                                type="button"
                                className="dashboard-notification"
                                aria-label={`Notifications${
                                    unreadCount > 0
                                        ? `, ${unreadCount} unread`
                                        : ""
                                }`}
                                aria-expanded={notificationsOpen}
                                title="Notifications"
                                onClick={toggleNotifications}
                                style={{ position: "relative" }}
                            >
                                <Bell size={19} strokeWidth={1.8} />

                                {unreadCount > 0 && (
                                    <span
                                        style={{
                                            position: "absolute",
                                            top: "-6px",
                                            right: "-6px",
                                            minWidth: "19px",
                                            height: "19px",
                                            padding: "0 5px",
                                            borderRadius: "20px",
                                            background: "#dc2626",
                                            color: "#fff",
                                            fontSize: "11px",
                                            fontWeight: 700,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            border: "2px solid #fff",
                                            boxSizing: "content-box",
                                        }}
                                    >
                                        {unreadCount > 99 ? "99+" : unreadCount}
                                    </span>
                                )}
                            </button>

                            {notificationsOpen && (
                                <div
                                    className="peso-notification-dropdown"
                                    style={{
                                        position: "absolute",
                                        top: "calc(100% + 14px)",
                                        right: "-65px",
                                        width: "min(390px, calc(100vw - 32px))",
                                        background: "#fff",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "14px",
                                        boxShadow:
                                            "0 14px 40px rgba(15, 23, 42, 0.16)",
                                        zIndex: 1000,
                                        overflow: "hidden",
                                        color: "#1f2937",
                                    }}
                                >
                                    <div
                                        style={{
                                            padding: "16px 18px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            gap: "12px",
                                            borderBottom: "1px solid #e5e7eb",
                                        }}
                                    >
                                        <div>
                                            <h3
                                                style={{
                                                    margin: 0,
                                                    fontSize: "16px",
                                                    fontWeight: 700,
                                                }}
                                            >
                                                Notifications
                                            </h3>

                                            <p
                                                style={{
                                                    margin: "4px 0 0",
                                                    fontSize: "12px",
                                                    color: "#6b7280",
                                                }}
                                            >
                                                {`${unreadCount} unread notification${
                                                    unreadCount === 1 ? "" : "s"
                                                }`}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setNotificationsOpen(false)
                                            }
                                            aria-label="Close notifications"
                                            title="Close"
                                            style={{
                                                border: 0,
                                                background: "transparent",
                                                color: "#6b7280",
                                                cursor: "pointer",
                                                padding: "4px",
                                                display: "flex",
                                            }}
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>

                                    {role === "jobseeker" || role === "employer" ? (
                                        <>
                                            {unreadCount > 0 && (
                                                <div
                                                    style={{
                                                        padding: "10px 16px",
                                                        borderBottom:
                                                            "1px solid #f3f4f6",
                                                        display: "flex",
                                                        justifyContent:
                                                            "flex-end",
                                                    }}
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={
                                                            markAllNotificationsAsRead
                                                        }
                                                        disabled={
                                                            notificationActionLoading ===
                                                            "all"
                                                        }
                                                        style={{
                                                            border: 0,
                                                            background:
                                                                "transparent",
                                                            color: "#1d4ed8",
                                                            fontSize: "12px",
                                                            fontWeight: 600,
                                                            cursor: "pointer",
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            gap: "6px",
                                                        }}
                                                    >
                                                        <CheckCheck size={15} />
                                                        Mark all as read
                                                    </button>
                                                </div>
                                            )}

                                            <div
                                                style={{
                                                    maxHeight: "380px",
                                                    overflowY: "auto",
                                                }}
                                            >
                                                {notificationsLoading ? (
                                                    <div
                                                        style={{
                                                            padding: "32px 16px",
                                                            textAlign: "center",
                                                            color: "#6b7280",
                                                        }}
                                                    >
                                                        <Loader2
                                                            size={22}
                                                            style={{
                                                                animation:
                                                                    "pesoNotificationSpin 1s linear infinite",
                                                            }}
                                                        />
                                                        <p>
                                                            Loading
                                                            notifications...
                                                        </p>
                                                    </div>
                                                ) : notificationError &&
                                                  notifications.length === 0 ? (
                                                    <div
                                                        style={{
                                                            padding: "22px 18px",
                                                            textAlign: "center",
                                                            color: "#b91c1c",
                                                            fontSize: "13px",
                                                        }}
                                                    >
                                                        {notificationError}
                                                        <button
                                                            type="button"
                                                            onClick={
                                                                loadNotifications
                                                            }
                                                            style={{
                                                                display: "block",
                                                                margin: "12px auto 0",
                                                                border: 0,
                                                                background:
                                                                    "transparent",
                                                                color: "#1d4ed8",
                                                                cursor: "pointer",
                                                            }}
                                                        >
                                                            Try again
                                                        </button>
                                                    </div>
                                                ) : notifications.length === 0 ? (
                                                    <div
                                                        style={{
                                                            padding: "34px 18px",
                                                            textAlign: "center",
                                                            color: "#6b7280",
                                                        }}
                                                    >
                                                        <Bell
                                                            size={28}
                                                            style={{
                                                                marginBottom: "8px",
                                                                color: "#9ca3af",
                                                            }}
                                                        />
                                                        <p
                                                            style={{
                                                                margin: 0,
                                                                fontSize: "14px",
                                                                fontWeight: 600,
                                                                color: "#374151",
                                                            }}
                                                        >
                                                            You're all caught up!
                                                        </p>
                                                        <p
                                                            style={{
                                                                margin: "5px 0 0",
                                                                fontSize: "12px",
                                                            }}
                                                        >
                                                            New job alerts and
                                                            PESO updates will
                                                            appear here.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    notifications.map(
                                                        (notification) => (
                                                            <button
                                                                type="button"
                                                                key={notification.id}
                                                                onClick={() =>
                                                                    markNotificationAsRead(
                                                                        notification
                                                                    )
                                                                }
                                                                disabled={
                                                                    notificationActionLoading ===
                                                                    notification.id
                                                                }
                                                                style={{
                                                                    width: "100%",
                                                                    display: "flex",
                                                                    gap: "12px",
                                                                    alignItems:
                                                                        "flex-start",
                                                                    padding: "15px 16px",
                                                                    border: 0,
                                                                    borderBottom:
                                                                        "1px solid #f3f4f6",
                                                                    background:
                                                                        notification.read_at
                                                                            ? "#fff"
                                                                            : "#eff6ff",
                                                                    textAlign: "left",
                                                                    cursor: "pointer",
                                                                    color: "inherit",
                                                                }}
                                                            >
                                                                <span
                                                                    style={{
                                                                        width: "34px",
                                                                        height: "34px",
                                                                        flexShrink: 0,
                                                                        borderRadius: "10px",
                                                                        background: "#dbeafe",
                                                                        color: "#1d4ed8",
                                                                        display: "flex",
                                                                        alignItems:
                                                                            "center",
                                                                        justifyContent:
                                                                            "center",
                                                                    }}
                                                                >
                                                                    {notificationActionLoading ===
                                                                    notification.id ? (
                                                                        <Loader2
                                                                            size={17}
                                                                        />
                                                                    ) : notification.read_at ? (
                                                                        <Check
                                                                            size={17}
                                                                        />
                                                                    ) : (
                                                                        <Bell
                                                                            size={17}
                                                                        />
                                                                    )}
                                                                </span>

                                                                <span
                                                                    style={{
                                                                        minWidth: 0,
                                                                        flex: 1,
                                                                    }}
                                                                >
                                                                    <span
                                                                        style={{
                                                                            display: "block",
                                                                            fontSize: "10px",
                                                                            fontWeight: 700,
                                                                            letterSpacing:
                                                                                "0.5px",
                                                                            color: "#1d4ed8",
                                                                            marginBottom:
                                                                                "4px",
                                                                        }}
                                                                    >
                                                                        {getNotificationTypeLabel(
                                                                            notification.type
                                                                        )}
                                                                    </span>

                                                                    <strong
                                                                        style={{
                                                                            display: "block",
                                                                            fontSize: "13px",
                                                                            lineHeight: 1.4,
                                                                            color: "#111827",
                                                                        }}
                                                                    >
                                                                        {notification.title}
                                                                    </strong>

                                                                    <span
                                                                        style={{
                                                                            display: "block",
                                                                            marginTop: "4px",
                                                                            fontSize: "12px",
                                                                            lineHeight: 1.5,
                                                                            color: "#4b5563",
                                                                            overflowWrap:
                                                                                "anywhere",
                                                                        }}
                                                                    >
                                                                        {notification.message}
                                                                    </span>

                                                                    <span
                                                                        style={{
                                                                            display: "block",
                                                                            marginTop: "7px",
                                                                            fontSize: "10px",
                                                                            color: "#9ca3af",
                                                                        }}
                                                                    >
                                                                        {formatNotificationDate(
                                                                            notification.created_at
                                                                        )}
                                                                    </span>
                                                                </span>

                                                                {!notification.read_at && (
                                                                    <span
                                                                        title="Unread"
                                                                        style={{
                                                                            width: "8px",
                                                                            height: "8px",
                                                                            borderRadius: "50%",
                                                                            background: "#2563eb",
                                                                            flexShrink: 0,
                                                                            marginTop: "5px",
                                                                        }}
                                                                    />
                                                                )}
                                                            </button>
                                                        )
                                                    )
                                                )}
                                            </div>

                                            {notificationError &&
                                                notifications.length > 0 && (
                                                    <p
                                                        role="alert"
                                                        style={{
                                                            margin: 0,
                                                            padding: "8px 16px",
                                                            color: "#b91c1c",
                                                            fontSize: "12px",
                                                        }}
                                                    >
                                                        {notificationError}
                                                    </p>
                                                )}

                                            <div
                                                style={{
                                                    padding: "11px 16px",
                                                    textAlign: "center",
                                                    borderTop:
                                                        "1px solid #e5e7eb",
                                                    fontSize: "11px",
                                                    color: "#9ca3af",
                                                }}
                                            >
                                                {`PESO Danao · ${
                                                    role === "employer" ? "Employer" : "Jobseeker"
                                                } Notifications`}
                                            </div>
                                        </>
                                    ) : (
                                        <div
                                            style={{
                                                padding: "22px 18px",
                                                textAlign: "center",
                                                color: "#6b7280",
                                                fontSize: "13px",
                                            }}
                                        >
                                            Notifications for this account
                                            role will be configured separately.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Profile dropdown */}
                        <div
                            ref={profileMenuRef}
                            className="peso-profile-wrapper"
                            style={{ position: "relative" }}
                        >
                            <button
                                type="button"
                                className="dashboard-profile-button"
                                aria-label="Open profile menu"
                                aria-expanded={profileOpen}
                                aria-haspopup="menu"
                                onClick={() => {
                                    setProfileOpen((open) => !open);
                                    setNotificationsOpen(false);
                                }}
                            >
                                <span className="dashboard-profile-avatar">
                                    {profilePicture ? (
                                        <img
                                            src={profilePicture}
                                            alt={displayName}
                                        />
                                    ) : (
                                        <User
                                            size={18}
                                            strokeWidth={1.8}
                                        />
                                    )}
                                </span>

                                <span className="dashboard-profile-info">
                                    <strong>{displayName}</strong>
                                    <small>{getRoleLabel()}</small>
                                </span>

                                <ChevronDown
                                    className="dashboard-profile-chevron"
                                    size={16}
                                    strokeWidth={1.8}
                                    style={{
                                        transform: profileOpen
                                            ? "rotate(180deg)"
                                            : "rotate(0deg)",
                                        transition: "transform 0.2s ease",
                                    }}
                                />
                            </button>

                            {profileOpen && (
                                <div
                                    className="peso-profile-dropdown"
                                    role="menu"
                                    style={{
                                        position: "absolute",
                                        top: "calc(100% + 12px)",
                                        right: 0,
                                        width: "270px",
                                        background: "#fff",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "14px",
                                        boxShadow:
                                            "0 14px 40px rgba(15, 23, 42, 0.16)",
                                        zIndex: 1001,
                                        overflow: "hidden",
                                        color: "#1f2937",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                            padding: "18px",
                                            background: "#f8fafc",
                                            borderBottom: "1px solid #e5e7eb",
                                        }}
                                    >
                                        <span
                                            className="dashboard-profile-avatar"
                                            style={{
                                                width: "44px",
                                                height: "44px",
                                                flexShrink: 0,
                                            }}
                                        >
                                            {profilePicture ? (
                                                <img
                                                    src={profilePicture}
                                                    alt={displayName}
                                                />
                                            ) : (
                                                <User size={20} />
                                            )}
                                        </span>

                                        <div style={{ minWidth: 0 }}>
                                            <strong
                                                style={{
                                                    display: "block",
                                                    fontSize: "14px",
                                                    overflowWrap: "anywhere",
                                                }}
                                            >
                                                {displayName}
                                            </strong>

                                            <span
                                                style={{
                                                    display: "block",
                                                    marginTop: "4px",
                                                    fontSize: "12px",
                                                    color: "#64748b",
                                                }}
                                            >
                                                {getRoleLabel()}
                                            </span>

                                            {user?.email && (
                                                <span
                                                    style={{
                                                        display: "block",
                                                        marginTop: "3px",
                                                        fontSize: "11px",
                                                        color: "#64748b",
                                                        overflowWrap: "anywhere",
                                                    }}
                                                >
                                                    {user.email}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ padding: "7px" }}>
                                        <button
                                            type="button"
                                            role="menuitem"
                                            onClick={goToProfile}
                                            style={{
                                                width: "100%",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "11px",
                                                padding: "11px 12px",
                                                border: 0,
                                                borderRadius: "8px",
                                                background: "transparent",
                                                color: "#334155",
                                                fontSize: "13px",
                                                textAlign: "left",
                                                cursor: "pointer",
                                            }}
                                            onMouseEnter={(event) => {
                                                event.currentTarget.style.background =
                                                    "#f1f5f9";
                                            }}
                                            onMouseLeave={(event) => {
                                                event.currentTarget.style.background =
                                                    "transparent";
                                            }}
                                        >
                                            <User size={17} />
                                            My Profile
                                        </button>

                                        <button
                                            type="button"
                                            role="menuitem"
                                            onClick={goToSettings}
                                            style={{
                                                width: "100%",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "11px",
                                                padding: "11px 12px",
                                                border: 0,
                                                borderRadius: "8px",
                                                background: "transparent",
                                                color: "#334155",
                                                fontSize: "13px",
                                                textAlign: "left",
                                                cursor: "pointer",
                                            }}
                                            onMouseEnter={(event) => {
                                                event.currentTarget.style.background =
                                                    "#f1f5f9";
                                            }}
                                            onMouseLeave={(event) => {
                                                event.currentTarget.style.background =
                                                    "transparent";
                                            }}
                                        >
                                            <Settings size={17} />
                                            Settings
                                        </button>
                                    </div>

                                    <div
                                        style={{
                                            padding: "7px",
                                            borderTop: "1px solid #e5e7eb",
                                        }}
                                    >
                                        <button
                                            type="button"
                                            role="menuitem"
                                            onClick={handleLogout}
                                            style={{
                                                width: "100%",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "11px",
                                                padding: "11px 12px",
                                                border: 0,
                                                borderRadius: "8px",
                                                background: "transparent",
                                                color: "#dc2626",
                                                fontSize: "13px",
                                                fontWeight: 600,
                                                textAlign: "left",
                                                cursor: "pointer",
                                            }}
                                            onMouseEnter={(event) => {
                                                event.currentTarget.style.background =
                                                    "#fef2f2";
                                            }}
                                            onMouseLeave={(event) => {
                                                event.currentTarget.style.background =
                                                    "transparent";
                                            }}
                                        >
                                            <LogOut size={17} />
                                            Log Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="dashboard-content">
                    <Outlet />
                </main>

                <footer className="dashboard-footer">
                    <div className="dashboard-footer-main">
                        <strong>
                            MUNICIPALITY OF DANAO • PUBLIC EMPLOYMENT SERVICE
                            OFFICE
                        </strong>
                        <span>
                            © 2026 Municipality of Danao. All rights reserved.
                        </span>
                    </div>

                    <div className="dashboard-footer-links">
                        <button type="button">Privacy Policy</button>
                        <button type="button">Terms of Use</button>
                        <button type="button">Contact PESO</button>
                    </div>
                </footer>
            </div>

            <style>
                {`
                    @keyframes pesoNotificationSpin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }

                    @media (max-width: 480px) {
                        .peso-notification-dropdown {
                            right: -55px !important;
                        }

                        .peso-profile-dropdown {
                            max-width: calc(100vw - 24px);
                        }
                    }
                `}
            </style>
        </div>
    );
}

export default DashboardLayout;
