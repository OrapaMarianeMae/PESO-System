
import { useEffect, useState } from "react";
import {
    Settings,
    ShieldCheck,
    LockKeyhole,
    Mail,
    CalendarDays,
    UserRound,
    Eye,
    EyeOff,
    RefreshCw,
    Save,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";
import "./AdminSettings.css";

const API_BASE = "http://127.0.0.1:8000/api";

function AdminSettings() {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [passwords, setPasswords] = useState({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const token = localStorage.getItem("pesoToken");

    async function loadSettings() {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${API_BASE}/admin/settings`, {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to load admin settings.");
            }

            setSettings(data.settings);
        } catch (err) {
            setError(err.message || "Unable to connect to the server.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadSettings();
    }, []);

    function handlePasswordChange(event) {
        const { name, value } = event.target;

        setPasswords((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    async function handlePasswordSubmit(event) {
        event.preventDefault();
        setMessage("");
        setError("");

        if (passwords.password.length < 8) {
            setError("Your new password must contain at least 8 characters.");
            return;
        }

        if (passwords.password !== passwords.password_confirmation) {
            setError("The new password and confirmation do not match.");
            return;
        }

        setSaving(true);

        try {
            const response = await fetch(
                `${API_BASE}/admin/settings/password`,
                {
                    method: "PUT",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(passwords),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                const validationErrors = data.errors
                    ? Object.values(data.errors).flat().join(" ")
                    : "";

                throw new Error(
                    validationErrors ||
                    data.message ||
                    "Unable to change your password."
                );
            }

            setMessage(data.message || "Password changed successfully.");

            setPasswords({
                current_password: "",
                password: "",
                password_confirmation: "",
            });
        } catch (err) {
            setError(err.message || "Unable to connect to the server.");
        } finally {
            setSaving(false);
        }
    }

    function formatDate(date) {
        if (!date) return "Not available";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "Not available";
        }

        return parsedDate.toLocaleDateString("en-PH", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }

    if (loading) {
        return (
            <div className="admin-settings-page">
                <div className="admin-settings-state">
                    <RefreshCw className="admin-settings-spinner" size={28} />
                    <p>Loading administrator settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-settings-page">
            <div className="admin-settings-heading">
                <div className="admin-settings-heading-icon">
                    <Settings size={27} />
                </div>

                <div>
                    <h1>Admin Settings</h1>
                    <p>
                        Manage your administrator account and security
                        preferences.
                    </p>
                </div>
            </div>

            {message && (
                <div className="admin-settings-alert success">
                    <CheckCircle2 size={19} />
                    <span>{message}</span>
                </div>
            )}

            {error && (
                <div className="admin-settings-alert error">
                    <AlertCircle size={19} />
                    <span>{error}</span>
                </div>
            )}

            <div className="admin-settings-grid">
                <section className="admin-settings-card">
                    <div className="admin-settings-card-heading">
                        <div className="admin-settings-section-icon">
                            <ShieldCheck size={22} />
                        </div>
                        <div>
                            <h2>Account Information</h2>
                            <p>Your administrator account details.</p>
                        </div>
                    </div>

                    {settings ? (
                        <div className="admin-settings-info-list">
                            <div className="admin-settings-info-item">
                                <div className="admin-settings-info-icon">
                                    <Mail size={19} />
                                </div>
                                <div>
                                    <span>Email Address</span>
                                    <strong>{settings.email || "Not available"}</strong>
                                </div>
                            </div>

                            <div className="admin-settings-info-item">
                                <div className="admin-settings-info-icon">
                                    <UserRound size={19} />
                                </div>
                                <div>
                                    <span>Account Role</span>
                                    <strong>
                                        {(settings.account_role || "admin").toUpperCase()}
                                    </strong>
                                </div>
                            </div>

                            <div className="admin-settings-info-item">
                                <div className="admin-settings-info-icon">
                                    <ShieldCheck size={19} />
                                </div>
                                <div>
                                    <span>Email Verification</span>
                                    <strong
                                        className={
                                            settings.email_verified
                                                ? "admin-settings-verified"
                                                : "admin-settings-unverified"
                                        }
                                    >
                                        {settings.email_verified
                                            ? "Verified"
                                            : "Not verified"}
                                    </strong>
                                </div>
                            </div>

                            <div className="admin-settings-info-item">
                                <div className="admin-settings-info-icon">
                                    <CalendarDays size={19} />
                                </div>
                                <div>
                                    <span>Account Created</span>
                                    <strong>{formatDate(settings.created_at)}</strong>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="admin-settings-muted">
                            Account information is unavailable.
                        </p>
                    )}

                    <button
                        type="button"
                        className="admin-settings-refresh"
                        onClick={loadSettings}
                    >
                        <RefreshCw size={16} />
                        Refresh Information
                    </button>
                </section>

                <section className="admin-settings-card">
                    <div className="admin-settings-card-heading">
                        <div className="admin-settings-section-icon gold">
                            <LockKeyhole size={22} />
                        </div>
                        <div>
                            <h2>Change Password</h2>
                            <p>Keep your administrator account secure.</p>
                        </div>
                    </div>

                    <form
                        className="admin-settings-password-form"
                        onSubmit={handlePasswordSubmit}
                    >
                        <div className="admin-settings-field">
                            <label htmlFor="current_password">
                                Current Password
                            </label>
                            <div className="admin-settings-password-input">
                                <input
                                    id="current_password"
                                    name="current_password"
                                    type={showCurrent ? "text" : "password"}
                                    value={passwords.current_password}
                                    onChange={handlePasswordChange}
                                    autoComplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrent(!showCurrent)}
                                    aria-label={
                                        showCurrent
                                            ? "Hide current password"
                                            : "Show current password"
                                    }
                                >
                                    {showCurrent ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="admin-settings-field">
                            <label htmlFor="password">New Password</label>
                            <div className="admin-settings-password-input">
                                <input
                                    id="password"
                                    name="password"
                                    type={showNew ? "text" : "password"}
                                    value={passwords.password}
                                    onChange={handlePasswordChange}
                                    autoComplete="new-password"
                                    minLength={8}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew(!showNew)}
                                    aria-label={
                                        showNew
                                            ? "Hide new password"
                                            : "Show new password"
                                    }
                                >
                                    {showNew ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>
                            <small>Use at least 8 characters.</small>
                        </div>

                        <div className="admin-settings-field">
                            <label htmlFor="password_confirmation">
                                Confirm New Password
                            </label>
                            <div className="admin-settings-password-input">
                                <input
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    type={showConfirm ? "text" : "password"}
                                    value={passwords.password_confirmation}
                                    onChange={handlePasswordChange}
                                    autoComplete="new-password"
                                    minLength={8}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    aria-label={
                                        showConfirm
                                            ? "Hide confirmation password"
                                            : "Show confirmation password"
                                    }
                                >
                                    {showConfirm ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="admin-settings-save-button"
                            disabled={saving}
                        >
                            {saving ? (
                                <RefreshCw
                                    size={18}
                                    className="admin-settings-spinner"
                                />
                            ) : (
                                <Save size={18} />
                            )}
                            {saving ? "Updating Password..." : "Update Password"}
                        </button>
                    </form>
                </section>
            </div>

            <div className="admin-settings-security-note">
                <ShieldCheck size={22} />
                <div>
                    <strong>Security Reminder</strong>
                    <p>
                        Never share your administrator password. Use a unique
                        password and sign out when using a shared computer.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default AdminSettings;
