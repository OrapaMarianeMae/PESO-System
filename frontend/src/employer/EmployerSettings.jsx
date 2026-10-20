
import { useEffect, useState } from "react";
import {
    Settings,
    LockKeyhole,
    Eye,
    EyeOff,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ShieldCheck,
    Bell,
    UserRound,
    Building2,
    Eye as PrivacyIcon,
    Headset,
    Save,
    RefreshCw,
} from "lucide-react";
import "./EmployerSettings.css";

const API_BASE = "http://127.0.0.1:8000/api";

const defaultPreferences = {
    preferred_contact_method: "email",
    notify_new_applicants: true,
    notify_application_updates: true,
    notify_job_approvals: true,
    notify_job_fairs: true,
    show_company_email: true,
    show_company_phone: true,
    show_company_address: true,
};

function EmployerSettings() {
    const [activeSection, setActiveSection] = useState("preferences");
    const [saving, setSaving] = useState(false);
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [loadingPreferences, setLoadingPreferences] = useState(false);

    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [user, setUser] = useState({});
    const [preferences, setPreferences] = useState(defaultPreferences);

    const [passwordForm, setPasswordForm] = useState({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const token = localStorage.getItem("pesoToken");


useEffect(() => {
    document.title = "Employer Settings | PESO Danao";

    try {
        const savedUser = JSON.parse(
            localStorage.getItem("pesoUser") || "{}"
        );
        setUser(savedUser);
    } catch {
        setUser({});
    }

    const loadPreferences = async () => {
        const savedToken = localStorage.getItem("pesoToken");

        if (!savedToken) {
            setError("Your session has expired. Please log in again.");
            return;
        }

        setLoadingPreferences(true);
        setError("");

        try {
            const response = await fetch(
                `${API_BASE}/employer/settings/preferences`,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${savedToken}`,
                    },
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to load your saved settings."
                );
            }

            if (data.preferences) {
                setPreferences((previous) => ({
                    ...previous,
                    ...data.preferences,
                }));
            }
        } catch (err) {
            setError(
                err.message || "Unable to load your saved settings."
            );
        } finally {
            setLoadingPreferences(false);
        }
    };

    loadPreferences();
}, []);


    const clearMessages = () => {
        setSuccess("");
        setError("");
    };

    const updatePreference = (name, value) => {
        setPreferences((previous) => ({
            ...previous,
            [name]: value,
        }));
        clearMessages();
    };

    const handlePasswordChange = (event) => {
        setPasswordForm((previous) => ({
            ...previous,
            [event.target.name]: event.target.value,
        }));
        setPasswordSuccess("");
        setPasswordError("");
    };

    const handlePasswordSubmit = async (event) => {
        event.preventDefault();

        setPasswordSuccess("");
        setPasswordError("");

        if (!passwordForm.current_password) {
            setPasswordError("Please enter your current password.");
            return;
        }

        if (passwordForm.password.length < 8) {
            setPasswordError(
                "Your new password must be at least 8 characters long."
            );
            return;
        }

        if (
            passwordForm.password !== passwordForm.password_confirmation
        ) {
            setPasswordError("The new passwords do not match.");
            return;
        }

        if (passwordForm.current_password === passwordForm.password) {
            setPasswordError(
                "Your new password must be different from your current password."
            );
            return;
        }

        if (!token) {
            setPasswordError(
                "Your session has expired. Please log in again."
            );
            return;
        }

        setPasswordSaving(true);

        try {
            const response = await fetch(
                `${API_BASE}/employer/settings/password`,
                {
                    method: "PUT",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(passwordForm),
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                if (data.errors) {
                    const firstError = Object.values(data.errors)
                        .flat()
                        .find(Boolean);
                    throw new Error(
                        firstError ||
                            data.message ||
                            "Unable to update your password."
                    );
                }

                throw new Error(
                    data.message ||
                        "Unable to update your password. Please try again."
                );
            }

            setPasswordSuccess(
                data.message || "Password updated successfully."
            );

            setPasswordForm({
                current_password: "",
                password: "",
                password_confirmation: "",
            });
        } catch (err) {
            setPasswordError(
                err.message ||
                    "Something went wrong while updating your password."
            );
        } finally {
            setPasswordSaving(false);
        }
    };

    const handlePreferencesSubmit = async (event) => {
        event.preventDefault();
        clearMessages();

        if (!token) {
            setError("Your session has expired. Please log in again.");
            return;
        }

        setSaving(true);

        try {
            const response = await fetch(
                `${API_BASE}/employer/settings/preferences`,
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

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Settings could not be saved. We still need to connect this feature to the backend."
                );
            }

            if (data.preferences) {
                setPreferences((previous) => ({
                    ...previous,
                    ...data.preferences,
                }));
            }

            setSuccess(data.message || "Settings saved successfully.");
        } catch (err) {
            setError(err.message || "Unable to save settings.");
        } finally {
            setSaving(false);
        }
    };

    const handleResetPreferences = () => {
        setPreferences(defaultPreferences);
        clearMessages();
        setSuccess(
            "Default values restored on this page. Click Save Settings to save them to your account."
        );
    };

    const sections = [
        {
            id: "preferences",
            label: "Account Preferences",
            icon: UserRound,
        },
        {
            id: "notifications",
            label: "Notifications",
            icon: Bell,
        },
        {
            id: "security",
            label: "Security & Password",
            icon: LockKeyhole,
        },
        {
            id: "privacy",
            label: "Privacy",
            icon: PrivacyIcon,
        },
        {
            id: "support",
            label: "Account Status & Support",
            icon: Headset,
        },
    ];

    const renderToggle = (name, title, description) => (
        <label className="employer-setting-toggle" key={name}>
            <span className="employer-setting-toggle-copy">
                <strong>{title}</strong>
                <small>{description}</small>
            </span>

            <input
                type="checkbox"
                checked={Boolean(preferences[name])}
                onChange={(event) =>
                    updatePreference(name, event.target.checked)
                }
                aria-label={title}
            />

            <span className="employer-setting-switch" />
        </label>
    );

    const renderPasswordField = (
        label,
        name,
        visible,
        setVisible,
        placeholder
    ) => (
        <div className="employer-settings-field" key={name}>
            <label htmlFor={name}>{label}</label>

            <div className="employer-settings-password-input">
                <input
                    id={name}
                    name={name}
                    type={visible ? "text" : "password"}
                    value={passwordForm[name]}
                    onChange={handlePasswordChange}
                    placeholder={placeholder}
                    autoComplete={
                        name === "current_password"
                            ? "current-password"
                            : "new-password"
                    }
                    required
                />

                <button
                    type="button"
                    onClick={() => setVisible((previous) => !previous)}
                    aria-label={
                        visible ? "Hide password" : "Show password"
                    }
                >
                    {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
        </div>
    );

    return (
        <main className="employer-settings-page">
            <header className="employer-settings-header">
                <div className="employer-settings-heading-icon">
                    <Settings size={27} />
                </div>

                <div>
                    <h1>Settings</h1>
                    <p>
                        Manage your account, notifications, security, and
                        privacy preferences.
                    </p>
                </div>
            </header>

            {success && (
                <div className="employer-settings-alert success" role="status">
                    <CheckCircle2 size={19} />
                    <span>{success}</span>
                </div>
            )}

            {error && (
                <div className="employer-settings-alert error" role="alert">
                    <AlertCircle size={19} />
                    <span>{error}</span>
                </div>
            )}

            <div className="employer-settings-layout">
                <nav
                    className="employer-settings-nav"
                    aria-label="Settings sections"
                >
                    {sections.map((section) => {
                        const Icon = section.icon;

                        return (
                            <button
                                type="button"
                                key={section.id}
                                className={
                                    activeSection === section.id
                                        ? "active"
                                        : ""
                                }
                                onClick={() => {
                                    setActiveSection(section.id);
                                    clearMessages();
                                }}
                            >
                                <Icon size={19} />
                                <span>{section.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <section className="employer-settings-content">
                    {activeSection === "preferences" && (
                        <form onSubmit={handlePreferencesSubmit}>
                            <div className="employer-settings-section-heading">
                                <UserRound size={22} />
                                <div>
                                    <h2>Account Preferences</h2>
                                    <p>
                                        Review your account information and
                                        choose how you prefer to be contacted.
                                    </p>
                                </div>
                            </div>

                            <div className="employer-settings-account-card">
                                <div className="employer-settings-account-avatar">
                                    <Building2 size={26} />
                                </div>

                                <div>
                                    <strong>
                                        {user.name ||
                                            [
                                                user.first_name,
                                                user.surname,
                                            ]
                                                .filter(Boolean)
                                                .join(" ") ||
                                            "Employer Account"}
                                    </strong>
                                    <span>{user.email || "No email available"}</span>
                                    <small>Employer account</small>
                                </div>
                            </div>

                            <div className="employer-settings-field">
                                <label htmlFor="preferred_contact_method">
                                    Preferred Contact Method
                                </label>

                                <select
                                    id="preferred_contact_method"
                                    value={
                                        preferences.preferred_contact_method
                                    }
                                    onChange={(event) =>
                                        updatePreference(
                                            "preferred_contact_method",
                                            event.target.value
                                        )
                                    }
                                >
                                    <option value="email">Email</option>
                                    <option value="phone">Phone</option>
                                </select>

                                <small>
                                    Choose how you prefer the PESO office to
                                    contact you.
                                </small>
                            </div>

                            <div className="employer-settings-form-actions">
                                <button
                                    type="button"
                                    className="employer-settings-button secondary"
                                    onClick={handleResetPreferences}
                                >
                                    <RefreshCw size={17} />
                                    Reset Defaults
                                </button>

                                <button
                                    type="submit"
                                    className="employer-settings-button primary"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <Loader2
                                            size={17}
                                            className="employer-settings-spinner"
                                        />
                                    ) : (
                                        <Save size={17} />
                                    )}
                                    {saving ? "Saving..." : "Save Settings"}
                                </button>
                            </div>
                        </form>
                    )}

                    {activeSection === "notifications" && (
                        <form onSubmit={handlePreferencesSubmit}>
                            <div className="employer-settings-section-heading">
                                <Bell size={22} />
                                <div>
                                    <h2>Notification Settings</h2>
                                    <p>
                                        Choose which updates you want to
                                        receive about your employer account.
                                    </p>
                                </div>
                            </div>

                            <div className="employer-settings-toggle-list">
                                {renderToggle(
                                    "notify_new_applicants",
                                    "New applicants",
                                    "Receive updates when jobseekers apply to your job posts."
                                )}

                                {renderToggle(
                                    "notify_application_updates",
                                    "Application updates",
                                    "Receive updates about changes to application statuses."
                                )}

                                {renderToggle(
                                    "notify_job_approvals",
                                    "Job post approval",
                                    "Receive updates when the PESO administrator reviews your job posts."
                                )}

                                {renderToggle(
                                    "notify_job_fairs",
                                    "Job fair updates",
                                    "Receive updates related to job fairs and registrations."
                                )}
                            </div>

                            <div className="employer-settings-form-actions">
                                <button
                                    type="submit"
                                    className="employer-settings-button primary"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <Loader2
                                            size={17}
                                            className="employer-settings-spinner"
                                        />
                                    ) : (
                                        <Save size={17} />
                                    )}
                                    {saving ? "Saving..." : "Save Notifications"}
                                </button>
                            </div>
                        </form>
                    )}

                    {activeSection === "security" && (
                        <form onSubmit={handlePasswordSubmit}>
                            <div className="employer-settings-section-heading">
                                <LockKeyhole size={22} />
                                <div>
                                    <h2>Security & Password</h2>
                                    <p>
                                        Keep your account secure by using a
                                        strong password.
                                    </p>
                                </div>
                            </div>

                            {passwordSuccess && (
                                <div
                                    className="employer-settings-alert success"
                                    role="status"
                                >
                                    <CheckCircle2 size={19} />
                                    <span>{passwordSuccess}</span>
                                </div>
                            )}

                            {passwordError && (
                                <div
                                    className="employer-settings-alert error"
                                    role="alert"
                                >
                                    <AlertCircle size={19} />
                                    <span>{passwordError}</span>
                                </div>
                            )}

                            <div className="employer-settings-password-fields">
                                {renderPasswordField(
                                    "Current Password",
                                    "current_password",
                                    showCurrentPassword,
                                    setShowCurrentPassword,
                                    "Enter current password"
                                )}

                                {renderPasswordField(
                                    "New Password",
                                    "password",
                                    showNewPassword,
                                    setShowNewPassword,
                                    "Enter new password"
                                )}

                                {renderPasswordField(
                                    "Confirm New Password",
                                    "password_confirmation",
                                    showConfirmPassword,
                                    setShowConfirmPassword,
                                    "Re-enter new password"
                                )}
                            </div>

                            <div className="employer-settings-security-tip">
                                <ShieldCheck size={22} />
                                <div>
                                    <strong>Password safety tips</strong>
                                    <p>
                                        Use at least 8 characters. A
                                        combination of uppercase and lowercase
                                        letters, numbers, and symbols is
                                        recommended.
                                    </p>
                                </div>
                            </div>

                            <div className="employer-settings-form-actions">
                                <button
                                    type="button"
                                    className="employer-settings-button secondary"
                                    onClick={() => {
                                        setPasswordForm({
                                            current_password: "",
                                            password: "",
                                            password_confirmation: "",
                                        });
                                        setPasswordError("");
                                        setPasswordSuccess("");
                                    }}
                                >
                                    Clear
                                </button>

                                <button
                                    type="submit"
                                    className="employer-settings-button primary"
                                    disabled={passwordSaving}
                                >
                                    {passwordSaving ? (
                                        <Loader2
                                            size={17}
                                            className="employer-settings-spinner"
                                        />
                                    ) : (
                                        <LockKeyhole size={17} />
                                    )}
                                    {passwordSaving
                                        ? "Updating..."
                                        : "Update Password"}
                                </button>
                            </div>
                        </form>
                    )}

                    {activeSection === "privacy" && (
                        <form onSubmit={handlePreferencesSubmit}>
                            <div className="employer-settings-section-heading">
                                <PrivacyIcon size={22} />
                                <div>
                                    <h2>Privacy Settings</h2>
                                    <p>
                                        Choose which company contact details
                                        may be displayed publicly.
                                    </p>
                                </div>
                            </div>

                            <div className="employer-settings-privacy-notice">
                                These are your requested visibility
                                preferences. They will only affect public
                                company information after the backend and
                                company profile display are connected.
                            </div>

                            <div className="employer-settings-toggle-list">
                                {renderToggle(
                                    "show_company_email",
                                    "Show company email",
                                    "Allow your company email to appear on public company information."
                                )}

                                {renderToggle(
                                    "show_company_phone",
                                    "Show company phone",
                                    "Allow your company phone number to appear publicly."
                                )}

                                {renderToggle(
                                    "show_company_address",
                                    "Show company address",
                                    "Allow your company address to appear on public company information."
                                )}
                            </div>

                            <div className="employer-settings-form-actions">
                                <button
                                    type="submit"
                                    className="employer-settings-button primary"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <Loader2
                                            size={17}
                                            className="employer-settings-spinner"
                                        />
                                    ) : (
                                        <Save size={17} />
                                    )}
                                    {saving ? "Saving..." : "Save Privacy Settings"}
                                </button>
                            </div>
                        </form>
                    )}

                    {activeSection === "support" && (
                        <div>
                            <div className="employer-settings-section-heading">
                                <Headset size={22} />
                                <div>
                                    <h2>Account Status & Support</h2>
                                    <p>
                                        Review your account details and learn
                                        how to request assistance.
                                    </p>
                                </div>
                            </div>

                            <div className="employer-settings-status-card">
                                <div className="employer-settings-status-icon">
                                    <ShieldCheck size={25} />
                                </div>

                                <div>
                                    <strong>Employer Account</strong>
                                    <p>
                                        Your account information is shown
                                        below. For verification status or
                                        account restrictions, please contact
                                        the PESO administrator.
                                    </p>
                                </div>
                            </div>

                            <div className="employer-settings-information-list">
                                <div>
                                    <span>Account name</span>
                                    <strong>
                                        {user.name ||
                                            [
                                                user.first_name,
                                                user.surname,
                                            ]
                                                .filter(Boolean)
                                                .join(" ") ||
                                            "Not available"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Email address</span>
                                    <strong>{user.email || "Not available"}</strong>
                                </div>

                                <div>
                                    <span>Account role</span>
                                    <strong>{user.role || "Employer"}</strong>
                                </div>

                                <div>
                                    <span>Verification status</span>
                                    <strong>
                                        {user.verification_status ||
                                            "Please confirm with PESO admin"}
                                    </strong>
                                </div>
                            </div>

                            <div className="employer-settings-support-box">
                                <Headset size={22} />
                                <div>
                                    <strong>Need help with your account?</strong>
                                    <p>
                                        Contact the PESO administrator for
                                        help with account verification,
                                        access, or company information.
                                    </p>
                                    <span>
                                        No support contact details are
                                        configured on this page yet.
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </section>employer
            </div>

            <p className="employer-settings-footer-note">
                PESO Danao Employer Portal · Keep your account information
                accurate and secure.
            </p>
        </main>
    );
}

export default EmployerSettings;
