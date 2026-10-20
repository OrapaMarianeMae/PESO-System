
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    UserRound,
    ShieldCheck,
    Bell,
    ChevronDown,
    ChevronUp,
    ArrowRight,
    Loader2,
    CheckCircle2,
    AlertCircle,
    BriefcaseBusiness,
    FileCheck,
    Megaphone,
    Save,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000/api";

const DEFAULT_PREFERENCES = {
    job_alerts: true,
    application_updates: true,
    peso_announcements: true,
};

function Settings() {
    const navigate = useNavigate();

    const [activeSection, setActiveSection] = useState(null);

    // Password state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPasswords, setShowPasswords] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState("");
    const [passwordError, setPasswordError] = useState("");

    // Notification state
    const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
    const [savedPreferences, setSavedPreferences] = useState(DEFAULT_PREFERENCES);
    const [notificationLoading, setNotificationLoading] = useState(false);
    const [notificationSaving, setNotificationSaving] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState("");
    const [notificationError, setNotificationError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadPreferences() {
            const token = localStorage.getItem("pesoToken");

            if (!token) {
                if (!cancelled) {
                    setNotificationError(
                        "Your session has expired. Please log in again."
                    );
                }
                return;
            }

            setNotificationLoading(true);
            setNotificationError("");

            try {
                const response = await fetch(
                    `${API_URL}/jobseeker/notification-preferences`,
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
                    const firstError = data.errors
                        ? Object.values(data.errors).flat()[0]
                        : null;

                    throw new Error(
                        firstError ||
                        data.message ||
                        "Unable to load notification preferences."
                    );
                }

                const loaded = {
                    ...DEFAULT_PREFERENCES,
                    ...(data.preferences || {}),
                };

                if (!cancelled) {
                    setPreferences({
                        job_alerts: Boolean(loaded.job_alerts),
                        application_updates: Boolean(loaded.application_updates),
                        peso_announcements: Boolean(loaded.peso_announcements),
                    });

                    setSavedPreferences({
                        job_alerts: Boolean(loaded.job_alerts),
                        application_updates: Boolean(loaded.application_updates),
                        peso_announcements: Boolean(loaded.peso_announcements),
                    });
                }
            } catch (error) {
                if (!cancelled) {
                    setNotificationError(
                        error.message ||
                        "Unable to load notification preferences."
                    );
                }
            } finally {
                if (!cancelled) {
                    setNotificationLoading(false);
                }
            }
        }

        loadPreferences();

        return () => {
            cancelled = true;
        };
    }, []);

    const toggleSection = (section) => {
        setActiveSection((current) =>
            current === section ? null : section
        );

        setPasswordMessage("");
        setPasswordError("");
        setNotificationMessage("");
        setNotificationError("");
    };

    const handlePasswordChange = async (event) => {
        event.preventDefault();

        setPasswordMessage("");
        setPasswordError("");

        if (newPassword !== confirmPassword) {
            setPasswordError("The new passwords do not match.");
            return;
        }

        if (newPassword.length < 8) {
            setPasswordError(
                "Your new password must be at least 8 characters."
            );
            return;
        }

        const token = localStorage.getItem("pesoToken");

        if (!token) {
            setPasswordError("Your session has expired. Please log in again.");
            return;
        }

        setPasswordLoading(true);

        try {
            const response = await fetch(`${API_URL}/account/password`, {
                method: "PUT",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    password: newPassword,
                    password_confirmation: confirmPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                const firstValidationError = data.errors
                    ? Object.values(data.errors).flat()[0]
                    : null;

                throw new Error(
                    firstValidationError ||
                    data.message ||
                    "Unable to update your password."
                );
            }

            setPasswordMessage(
                data.message || "Password updated successfully."
            );

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            setPasswordError(
                error.message || "Something went wrong. Please try again."
            );
        } finally {
            setPasswordLoading(false);
        }
    };

    const handlePreferenceToggle = (key) => {
        setPreferences((current) => ({
            ...current,
            [key]: !current[key],
        }));

        setNotificationMessage("");
        setNotificationError("");
    };

    const handleSavePreferences = async (event) => {
        event.preventDefault();

        setNotificationMessage("");
        setNotificationError("");

        const token = localStorage.getItem("pesoToken");

        if (!token) {
            setNotificationError(
                "Your session has expired. Please log in again."
            );
            return;
        }

        setNotificationSaving(true);

        try {
            const response = await fetch(
                `${API_URL}/jobseeker/notification-preferences`,
                {
                    method: "PUT",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(preferences),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                const firstValidationError = data.errors
                    ? Object.values(data.errors).flat()[0]
                    : null;

                throw new Error(
                    firstValidationError ||
                    data.message ||
                    "Unable to save notification preferences."
                );
            }

            const saved = {
                ...DEFAULT_PREFERENCES,
                ...(data.preferences || preferences),
            };

            const normalized = {
                job_alerts: Boolean(saved.job_alerts),
                application_updates: Boolean(saved.application_updates),
                peso_announcements: Boolean(saved.peso_announcements),
            };

            setPreferences(normalized);
            setSavedPreferences(normalized);
            setNotificationMessage(
                data.message || "Notification preferences saved successfully."
            );
        } catch (error) {
            setNotificationError(
                error.message || "Unable to save your preferences."
            );
        } finally {
            setNotificationSaving(false);
        }
    };

    const settingsItems = [
        {
            id: "account",
            title: "Account Information",
            description: "Manage your registered account information.",
            icon: UserRound,
        },
        {
            id: "security",
            title: "Password & Security",
            description: "Manage your password and account security.",
            icon: ShieldCheck,
        },
        {
            id: "notifications",
            title: "Email Notifications",
            description:
                "Manage notifications related to your PESO account and employment activities.",
            icon: Bell,
        },
    ];

    const notificationOptions = [
        {
            key: "job_alerts",
            title: "New Job Alerts",
            description: "Receive email updates about new job opportunities.",
            icon: BriefcaseBusiness,
        },
        {
            key: "application_updates",
            title: "Application Updates",
            description: "Receive updates about your job applications.",
            icon: FileCheck,
        },
        {
            key: "peso_announcements",
            title: "PESO Announcements",
            description: "Receive important PESO announcements by email.",
            icon: Megaphone,
        },
    ];

    const preferencesChanged = Object.keys(preferences).some(
        (key) => preferences[key] !== savedPreferences[key]
    );

    return (
        <div className="jobseeker-dashboard">
            <section className="dashboard-welcome">
                <div>
                    <span className="dashboard-section-label">
                        ACCOUNT PREFERENCES
                    </span>
                    <h2>Settings</h2>
                    <p>
                        Manage your account preferences and security settings
                        for your Danao PESO account.
                    </p>
                </div>
            </section>

            <section className="dashboard-panel">
                <div className="dashboard-panel-header">
                    <div>
                        <span>ACCOUNT SETTINGS</span>
                        <h3>Settings</h3>
                    </div>
                    <span className="jobs-count">Jobseeker Account</span>
                </div>

                <div className="settings-list">
                    {settingsItems.map((item) => {
                        const Icon = item.icon;
                        const isOpen = activeSection === item.id;

                        return (
                            <div
                                className={`settings-item settings-item-expandable ${
                                    isOpen ? "settings-item-open" : ""
                                }`}
                                key={item.id}
                            >
                                <div className="settings-item-main">
                                    <div className="settings-item-icon">
                                        <Icon size={21} />
                                    </div>

                                    <div className="settings-item-text">
                                        <h4>{item.title}</h4>
                                        <p>{item.description}</p>
                                    </div>

                                    <button
                                        type="button"
                                        className="settings-manage-button"
                                        onClick={() => {
                                            if (item.id === "account") {
                                                navigate("/dashboard/my-profile");
                                            } else {
                                                toggleSection(item.id);
                                            }
                                        }}
                                        aria-expanded={
                                            item.id === "account"
                                                ? undefined
                                                : isOpen
                                        }
                                    >
                                        {item.id === "account" ? (
                                            <>
                                                Manage <ArrowRight size={15} />
                                            </>
                                        ) : (
                                            <>
                                                {isOpen ? "Close" : "Manage"}
                                                {isOpen ? (
                                                    <ChevronUp size={16} />
                                                ) : (
                                                    <ChevronDown size={16} />
                                                )}
                                            </>
                                        )}
                                    </button>
                                </div>

                                {isOpen && item.id === "security" && (
                                    <div className="settings-expanded-content">
                                        <h4>Change Password</h4>
                                        <p className="settings-form-description">
                                            Choose a strong password that you
                                            don't use for other accounts.
                                        </p>

                                        {passwordMessage && (
                                            <div className="settings-message settings-message-success">
                                                <CheckCircle2 size={18} />
                                                <span>{passwordMessage}</span>
                                            </div>
                                        )}

                                        {passwordError && (
                                            <div className="settings-message settings-message-error">
                                                <AlertCircle size={18} />
                                                <span>{passwordError}</span>
                                            </div>
                                        )}

                                        <form
                                            className="settings-password-form"
                                            onSubmit={handlePasswordChange}
                                        >
                                            <label>
                                                Current Password
                                                <input
                                                    type={
                                                        showPasswords
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    value={currentPassword}
                                                    onChange={(event) =>
                                                        setCurrentPassword(
                                                            event.target.value
                                                        )
                                                    }
                                                    autoComplete="current-password"
                                                    required
                                                />
                                            </label>

                                            <label>
                                                New Password
                                                <input
                                                    type={
                                                        showPasswords
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    value={newPassword}
                                                    onChange={(event) =>
                                                        setNewPassword(
                                                            event.target.value
                                                        )
                                                    }
                                                    autoComplete="new-password"
                                                    minLength={8}
                                                    required
                                                />
                                            </label>

                                            <label>
                                                Confirm New Password
                                                <input
                                                    type={
                                                        showPasswords
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    value={confirmPassword}
                                                    onChange={(event) =>
                                                        setConfirmPassword(
                                                            event.target.value
                                                        )
                                                    }
                                                    autoComplete="new-password"
                                                    minLength={8}
                                                    required
                                                />
                                            </label>

                                            <label className="settings-show-password">
                                                <input
                                                    type="checkbox"
                                                    checked={showPasswords}
                                                    onChange={(event) =>
                                                        setShowPasswords(
                                                            event.target.checked
                                                        )
                                                    }
                                                />
                                                Show passwords
                                            </label>

                                            <button
                                                type="submit"
                                                className="settings-save-button"
                                                disabled={passwordLoading}
                                            >
                                                {passwordLoading ? (
                                                    <>
                                                        <Loader2
                                                            size={17}
                                                            className="settings-spinner"
                                                        />
                                                        Updating...
                                                    </>
                                                ) : (
                                                    "Update Password"
                                                )}
                                            </button>
                                        </form>
                                    </div>
                                )}

                                {isOpen && item.id === "notifications" && (
                                    <div className="settings-expanded-content">
                                        <div className="settings-notification-heading">
                                            <div>
                                                <h4>Email notification preferences</h4>
                                                <p className="settings-form-description">
                                                    Choose which updates you'd
                                                    like to receive by email.
                                                </p>
                                            </div>
                                            <Bell size={23} />
                                        </div>

                                        {notificationMessage && (
                                            <div className="settings-message settings-message-success">
                                                <CheckCircle2 size={18} />
                                                <span>{notificationMessage}</span>
                                            </div>
                                        )}

                                        {notificationError && (
                                            <div className="settings-message settings-message-error">
                                                <AlertCircle size={18} />
                                                <span>{notificationError}</span>
                                            </div>
                                        )}

                                        {notificationLoading ? (
                                            <div className="settings-notification-loading">
                                                <Loader2
                                                    size={20}
                                                    className="settings-spinner"
                                                />
                                                Loading your preferences...
                                            </div>
                                        ) : (
                                            <form
                                                className="settings-notification-form"
                                                onSubmit={handleSavePreferences}
                                            >
                                                {notificationOptions.map((option) => {
                                                    const OptionIcon = option.icon;

                                                    return (
                                                        <div
                                                            className="settings-notification-option"
                                                            key={option.key}
                                                        >
                                                            <div className="settings-notification-option-icon">
                                                                <OptionIcon size={20} />
                                                            </div>

                                                            <div className="settings-notification-option-text">
                                                                <h5>{option.title}</h5>
                                                                <p>{option.description}</p>
                                                            </div>

                                                            <label className="settings-switch">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={preferences[option.key]}
                                                                    onChange={() =>
                                                                        handlePreferenceToggle(
                                                                            option.key
                                                                        )
                                                                    }
                                                                    aria-label={option.title}
                                                                />
                                                                <span className="settings-switch-slider" />
                                                            </label>
                                                        </div>
                                                    );
                                                })}

                                                <div className="settings-notification-actions">
                                                    <span className="settings-unsaved-note">
                                                        {preferencesChanged
                                                            ? "You have unsaved changes."
                                                            : "Your preferences are up to date."}
                                                    </span>

                                                    <button
                                                        type="submit"
                                                        className="settings-save-button"
                                                        disabled={
                                                            notificationSaving ||
                                                            !preferencesChanged
                                                        }
                                                    >
                                                        {notificationSaving ? (
                                                            <>
                                                                <Loader2
                                                                    size={17}
                                                                    className="settings-spinner"
                                                                />
                                                                Saving...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Save size={17} />
                                                                Save Preferences
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}

export default Settings;
