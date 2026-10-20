
import { useCallback, useEffect, useState } from "react";
import {
    UserRound,
    Mail,
    Pencil,
    Save,
    X,
    Loader2,
    CheckCircle2,
    AlertCircle,
    ShieldCheck,
    RefreshCw,
} from "lucide-react";
import "./AdminProfile.css";

const API_BASE = "http://127.0.0.1:8000/api";

const emptyProfile = {
    first_name: "",
    middle_name: "",
    surname: "",
    name_extension: "",
    email: "",
};

function AdminProfile() {
    const [profile, setProfile] = useState(emptyProfile);
    const [form, setForm] = useState(emptyProfile);
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [validationErrors, setValidationErrors] = useState({});

    const loadProfile = useCallback(async () => {
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const token = localStorage.getItem("pesoToken");

            if (!token) {
                throw new Error("Please log in again to view your profile.");
            }

            const response = await fetch(`${API_BASE}/admin/profile`, {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to load your profile.");
            }

            const user = data.profile || {};
            const loadedProfile = {
                first_name: user.first_name || "",
                middle_name: user.middle_name || "",
                surname: user.surname || "",
                name_extension: user.name_extension || "",
                email: user.email || "",
            };

            setProfile(loadedProfile);
            setForm(loadedProfile);
        } catch (err) {
            setError(err.message || "Something went wrong while loading your profile.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));

        setValidationErrors((current) => ({
            ...current,
            [name]: "",
        }));

        setError("");
        setSuccess("");
    };

    const handleCancel = () => {
        setForm(profile);
        setEditing(false);
        setError("");
        setSuccess("");
        setValidationErrors({});
    };

    const handleSave = async (event) => {
        event.preventDefault();

        setSaving(true);
        setError("");
        setSuccess("");
        setValidationErrors({});

        try {
            const token = localStorage.getItem("pesoToken");

            if (!token) {
                throw new Error("Your session has expired. Please log in again.");
            }

            const response = await fetch(`${API_BASE}/admin/profile`, {
                method: "PUT",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    first_name: form.first_name.trim(),
                    middle_name: form.middle_name.trim() || null,
                    surname: form.surname.trim(),
                    name_extension: form.name_extension.trim() || null,
                    email: form.email.trim(),
                }),
            });

            const data = await response.json();

            if (response.status === 422) {
                setValidationErrors(data.errors || {});
                throw new Error(
                    data.message || "Please check the information you entered."
                );
            }

            if (!response.ok) {
                throw new Error(data.message || "Unable to save your profile.");
            }

            const updatedUser = data.profile || {};
            const updatedProfile = {
                first_name: updatedUser.first_name || "",
                middle_name: updatedUser.middle_name || "",
                surname: updatedUser.surname || "",
                name_extension: updatedUser.name_extension || "",
                email: updatedUser.email || "",
            };

            setProfile(updatedProfile);
            setForm(updatedProfile);
            setEditing(false);
            setSuccess(data.message || "Edited profile successfully.");

            // Keep the saved email and name in the existing local user data.
            try {
                const savedUser = JSON.parse(
                    localStorage.getItem("pesoUser") || "{}"
                );

                localStorage.setItem(
                    "pesoUser",
                    JSON.stringify({
                        ...savedUser,
                        ...updatedUser,
                    })
                );
            } catch {
                // The profile was saved on the server even if local data is invalid.
            }
        } catch (err) {
            setError(err.message || "Unable to save your profile.");

            if (err.message === "Failed to fetch") {
                setError(
                    "Cannot connect to the server. Please check that Laravel is running."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    const fullName =
        [
            profile.first_name,
            profile.middle_name,
            profile.surname,
            profile.name_extension,
        ]
            .filter(Boolean)
            .join(" ") || "Administrator";

    const initials =
        `${profile.first_name.charAt(0)}${profile.surname.charAt(0)}`.toUpperCase() ||
        "A";

    if (loading) {
        return (
            <div className="admin-profile-page">
                <div className="admin-profile-state">
                    <Loader2 className="admin-profile-spin" size={32} />
                    <p>Loading administrator profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-profile-page">
            <div className="admin-profile-heading">
                <div>
                    <span className="admin-profile-eyebrow">
                        ACCOUNT MANAGEMENT
                    </span>
                    <h1>My Profile</h1>
                    <p>View and manage your administrator information.</p>
                </div>

                <button
                    type="button"
                    className="admin-profile-refresh"
                    onClick={loadProfile}
                    disabled={saving}
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {success && (
                <div className="admin-profile-alert success" role="status">
                    <CheckCircle2 size={19} />
                    <span>{success}</span>
                    <button
                        type="button"
                        aria-label="Dismiss success message"
                        onClick={() => setSuccess("")}
                    >
                        <X size={17} />
                    </button>
                </div>
            )}

            {error && (
                <div className="admin-profile-alert error" role="alert">
                    <AlertCircle size={19} />
                    <span>{error}</span>
                    <button
                        type="button"
                        aria-label="Dismiss error message"
                        onClick={() => setError("")}
                    >
                        <X size={17} />
                    </button>
                </div>
            )}

            <div className="admin-profile-layout">
                <section className="admin-profile-summary">
                    <div className="admin-profile-banner">
                        <div className="admin-profile-avatar">
                            {initials}
                        </div>
                    </div>

                    <div className="admin-profile-summary-content">
                        <h2>{fullName}</h2>
                        <p className="admin-profile-summary-email">
                            <Mail size={15} />
                            {profile.email || "No email available"}
                        </p>

                        <span className="admin-profile-role">
                            <ShieldCheck size={15} />
                            PESO Administrator
                        </span>

                        <div className="admin-profile-summary-divider" />

                        <div className="admin-profile-summary-detail">
                            <span>Account role</span>
                            <strong>Administrator</strong>
                        </div>

                        <div className="admin-profile-summary-detail">
                            <span>Account access</span>
                            <strong className="admin-profile-active">
                                Active
                            </strong>
                        </div>
                    </div>
                </section>

                <section className="admin-profile-form-card">
                    <div className="admin-profile-form-heading">
                        <div className="admin-profile-form-title">
                            <div className="admin-profile-form-icon">
                                <UserRound size={21} />
                            </div>
                            <div>
                                <h2>Personal Information</h2>
                                <p>
                                    Update the information associated with
                                    your administrator account.
                                </p>
                            </div>
                        </div>

                        {!editing && (
                            <button
                                type="button"
                                className="admin-profile-edit-button"
                                onClick={() => {
                                    setForm(profile);
                                    setEditing(true);
                                    setError("");
                                    setSuccess("");
                                }}
                            >
                                <Pencil size={16} />
                                Edit Profile
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSave}>
                        <div className="admin-profile-fields">
                            <div className="admin-profile-field">
                                <label htmlFor="admin-first-name">
                                    First Name <span>*</span>
                                </label>
                                <input
                                    id="admin-first-name"
                                    name="first_name"
                                    value={form.first_name}
                                    onChange={handleChange}
                                    disabled={!editing || saving}
                                    required
                                    maxLength={255}
                                    autoComplete="given-name"
                                />
                                {validationErrors.first_name && (
                                    <small className="admin-profile-field-error">
                                        {validationErrors.first_name[0]}
                                    </small>
                                )}
                            </div>

                            <div className="admin-profile-field">
                                <label htmlFor="admin-middle-name">
                                    Middle Name
                                </label>
                                <input
                                    id="admin-middle-name"
                                    name="middle_name"
                                    value={form.middle_name}
                                    onChange={handleChange}
                                    disabled={!editing || saving}
                                    maxLength={255}
                                    autoComplete="additional-name"
                                />
                                {validationErrors.middle_name && (
                                    <small className="admin-profile-field-error">
                                        {validationErrors.middle_name[0]}
                                    </small>
                                )}
                            </div>

                            <div className="admin-profile-field">
                                <label htmlFor="admin-surname">
                                    Surname <span>*</span>
                                </label>
                                <input
                                    id="admin-surname"
                                    name="surname"
                                    value={form.surname}
                                    onChange={handleChange}
                                    disabled={!editing || saving}
                                    required
                                    maxLength={255}
                                    autoComplete="family-name"
                                />
                                {validationErrors.surname && (
                                    <small className="admin-profile-field-error">
                                        {validationErrors.surname[0]}
                                    </small>
                                )}
                            </div>

                            <div className="admin-profile-field">
                                <label htmlFor="admin-name-extension">
                                    Name Extension
                                </label>
                                <input
                                    id="admin-name-extension"
                                    name="name_extension"
                                    value={form.name_extension}
                                    onChange={handleChange}
                                    disabled={!editing || saving}
                                    maxLength={50}
                                    placeholder="e.g. Jr., III"
                                />
                                {validationErrors.name_extension && (
                                    <small className="admin-profile-field-error">
                                        {validationErrors.name_extension[0]}
                                    </small>
                                )}
                            </div>

                            <div className="admin-profile-field full">
                                <label htmlFor="admin-email">
                                    Email Address <span>*</span>
                                </label>
                                <div className="admin-profile-input-with-icon">
                                    <Mail size={17} />
                                    <input
                                        id="admin-email"
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        disabled={!editing || saving}
                                        required
                                        maxLength={255}
                                        autoComplete="email"
                                    />
                                </div>
                                {validationErrors.email && (
                                    <small className="admin-profile-field-error">
                                        {validationErrors.email[0]}
                                    </small>
                                )}
                            </div>
                        </div>

                        {editing && (
                            <div className="admin-profile-form-actions">
                                <button
                                    type="button"
                                    className="admin-profile-cancel-button"
                                    onClick={handleCancel}
                                    disabled={saving}
                                >
                                    <X size={17} />
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="admin-profile-save-button"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <Loader2
                                            size={17}
                                            className="admin-profile-spin"
                                        />
                                    ) : (
                                        <Save size={17} />
                                    )}
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        )}
                    </form>
                </section>
            </div>

            <div className="admin-profile-security-note">
                <ShieldCheck size={19} />
                <div>
                    <strong>Your account is protected</strong>
                    <p>
                        Only authenticated administrators can access and update
                        this profile. Password changes will be handled in
                        Account Settings.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default AdminProfile;
