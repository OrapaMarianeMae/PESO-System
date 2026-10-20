import { useEffect, useRef, useState } from "react";
import {
    Building2,
    UserRound,
    Contact,
    Save,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    Pencil,
    Camera,
    X,
} from "lucide-react";
import "./EmployerCompanyProfile.css";

const API_BASE = "http://127.0.0.1:8000/api";
const STORAGE_BASE = "http://127.0.0.1:8000/storage/";

const emptyForm = {
    first_name: "",
    middle_name: "",
    surname: "",
    name_extension: "",
    company_name: "",
    company_address: "",
    company_phone: "",
    company_email: "",
    industry: "",
    company_description: "",
    website: "",
    contact_person: "",
    contact_position: "",
};

function getPictureUrl(user) {
    if (user?.profile_picture_url) {
        return user.profile_picture_url;
    }

    if (user?.profile_picture) {
        return user.profile_picture.startsWith("http")
            ? user.profile_picture
            : `${STORAGE_BASE}${user.profile_picture}`;
    }

    return "";
}

function syncStoredUser(user) {
    if (!user) return;

    try {
        const previousUser = JSON.parse(
            localStorage.getItem("pesoUser") || "{}"
        );

        const updatedUser = {
            ...previousUser,
            ...user,
            profile_picture_url:
                user.profile_picture_url ?? getPictureUrl(user),
        };

        localStorage.setItem("pesoUser", JSON.stringify(updatedUser));

        // Notify the shared dashboard header that the user information changed.
        window.dispatchEvent(new Event("pesoUserUpdated"));
    } catch (error) {
        console.error("Unable to update stored user information:", error);
    }
}

function EmployerCompanyProfile() {
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [profilePicture, setProfilePicture] = useState("");
    const [pictureFile, setPictureFile] = useState(null);
    const [picturePreview, setPicturePreview] = useState("");
    const [pictureError, setPictureError] = useState("");

    const fileInputRef = useRef(null);

    const clearPicturePreview = () => {
        setPicturePreview((previous) => {
            if (previous) URL.revokeObjectURL(previous);
            return "";
        });
    };

    const fetchProfile = async () => {
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("pesoToken");

            if (!token) {
                throw new Error("Your session has expired. Please log in again.");
            }

            const response = await fetch(`${API_BASE}/employer/profile`, {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to load company profile."
                );
            }

            const user = data.user || {};
            const profile = data.profile || {};

            setForm({
                first_name: user.first_name || "",
                middle_name: user.middle_name || "",
                surname: user.surname || "",
                name_extension: user.name_extension || "",
                company_name: profile.company_name || "",
                company_address: profile.company_address || "",
                company_phone: profile.company_phone || "",
                company_email: profile.company_email || "",
                industry: profile.industry || "",
                company_description: profile.company_description || "",
                website: profile.website || "",
                contact_person: profile.contact_person || "",
                contact_position: profile.contact_position || "",
            });

            setProfilePicture(getPictureUrl(user));
            syncStoredUser(user);
        } catch (err) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();

        return () => {
            if (picturePreview) {
                URL.revokeObjectURL(picturePreview);
            }
        };
        // Fetch the profile when this page mounts.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        setSuccess("");
        setError("");
    };

    const handlePictureChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        const maxSize = 2 * 1024 * 1024;

        if (!allowedTypes.includes(file.type)) {
            setPictureError("Please select a JPG, PNG, or WebP image.");
            event.target.value = "";
            return;
        }

        if (file.size > maxSize) {
            setPictureError("The image must not exceed 2 MB.");
            event.target.value = "";
            return;
        }

        clearPicturePreview();

        const previewUrl = URL.createObjectURL(file);

        setPictureFile(file);
        setPicturePreview(previewUrl);
        setPictureError("");
        setError("");
        setSuccess("");
    };

    const removeSelectedPicture = () => {
        clearPicturePreview();
        setPictureFile(null);
        setPictureError("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.first_name.trim() || !form.surname.trim()) {
            setError("First name and surname are required.");
            return;
        }

        if (!form.company_name.trim()) {
            setError("Company name is required.");
            return;
        }

        setSaving(true);
        setError("");
        setSuccess("");
        setPictureError("");

        try {
            const token = localStorage.getItem("pesoToken");

            if (!token) {
                throw new Error("Your session has expired. Please log in again.");
            }

            // FormData supports uploading the picture and saving the text fields
            // in the same request.
            const formData = new FormData();

            Object.entries(form).forEach(([key, value]) => {
                formData.append(key, value ?? "");
            });

            if (pictureFile) {
                formData.append("profile_picture", pictureFile);
            }

            // Laravel can process multipart form data with method spoofing.
            formData.append("_method", "PUT");

            const response = await fetch(`${API_BASE}/employer/profile`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    const firstError = Object.values(data.errors).flat()[0];
                    throw new Error(
                        firstError ||
                            data.message ||
                            "Please check your information."
                    );
                }

                throw new Error(
                    data.message || "Unable to save company profile."
                );
            }

            const user = data.user || {};
            const profile = data.profile || {};

            setForm({
                first_name: user.first_name || form.first_name,
                middle_name: user.middle_name || "",
                surname: user.surname || form.surname,
                name_extension: user.name_extension || "",
                company_name: profile.company_name || form.company_name,
                company_address: profile.company_address || "",
                company_phone: profile.company_phone || "",
                company_email: profile.company_email || "",
                industry: profile.industry || "",
                company_description: profile.company_description || "",
                website: profile.website || "",
                contact_person: profile.contact_person || "",
                contact_position: profile.contact_position || "",
            });

            setProfilePicture(getPictureUrl(user));
            syncStoredUser(user);

            setPictureFile(null);
            clearPicturePreview();

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            setEditing(false);
            setSuccess(
                data.message || "Company profile updated successfully."
            );
        } catch (err) {
            setError(err.message || "Something went wrong while saving.");
        } finally {
            setSaving(false);
        }
    };

    const field = (name, label, options = {}) => (
        <div
            className={`company-form-field ${options.full ? "full-width" : ""}`}
            key={name}
        >
            <label htmlFor={`company-${name}`}>
                {label}
                {options.required ? " *" : ""}
            </label>

            {options.multiline ? (
                <textarea
                    id={`company-${name}`}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    placeholder={
                        options.placeholder || `Enter ${label.toLowerCase()}`
                    }
                    rows={4}
                    disabled={!editing || saving}
                    required={options.required}
                />
            ) : (
                <input
                    id={`company-${name}`}
                    type={options.type || "text"}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    placeholder={
                        options.placeholder || `Enter ${label.toLowerCase()}`
                    }
                    disabled={!editing || saving}
                    required={options.required}
                />
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="company-profile-page">
                <div className="company-profile-loading">
                    <RefreshCw className="company-spin" size={30} />
                    <p>Loading company profile...</p>
                </div>
            </div>
        );
    }

    const displayedPicture = picturePreview || profilePicture;

    return (
        <div className="company-profile-page">
            <div className="company-profile-header">
                <div>
                    <span className="company-profile-eyebrow">
                        EMPLOYER ACCOUNT
                    </span>
                    <h1>
                        <Building2 size={29} /> Company Profile
                    </h1>
                    <p>Manage your company details and contact information.</p>
                </div>

                {!editing && (
                    <button
                        type="button"
                        className="company-edit-button"
                        onClick={() => {
                            setEditing(true);
                            setSuccess("");
                            setError("");
                            setPictureError("");
                        }}
                    >
                        <Pencil size={17} />
                        Edit Profile
                    </button>
                )}
            </div>

            {success && (
                <div className="company-alert success">
                    <CheckCircle2 size={20} />
                    <span>{success}</span>
                </div>
            )}

            {error && (
                <div className="company-alert error">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                    <button type="button" onClick={fetchProfile}>
                        Reload
                    </button>
                </div>
            )}

            <form className="company-profile-form" onSubmit={handleSubmit}>
                <section className="company-profile-card">
                    <div className="company-section-heading">
                        <div className="company-section-icon">
                            <UserRound size={21} />
                        </div>
                        <div>
                            <h2>Account Contact</h2>
                            <p>
                                Your personal information as the company
                                representative.
                            </p>
                        </div>
                    </div>

                    <div className="company-picture-section">
                        <div className="company-picture-preview">
                            {displayedPicture ? (
                                <img
                                    src={displayedPicture}
                                    alt="Employer profile"
                                />
                            ) : (
                                <UserRound size={42} />
                            )}
                        </div>

                        <div className="company-picture-details">
                            <h3>Profile Picture</h3>
                            <p>
                                Choose a picture to display in your dashboard
                                and account menu.
                            </p>

                            {editing && (
                                <div className="company-picture-actions">
                                    <input
                                        ref={fileInputRef}
                                        id="employer-profile-picture"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handlePictureChange}
                                        disabled={saving}
                                        hidden
                                    />

                                    <button
                                        type="button"
                                        className="company-picture-button"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        disabled={saving}
                                    >
                                        <Camera size={17} />
                                        Choose Picture
                                    </button>

                                    {picturePreview && (
                                        <button
                                            type="button"
                                            className="company-picture-remove"
                                            onClick={removeSelectedPicture}
                                            disabled={saving}
                                        >
                                            <X size={16} />
                                            Remove Selection
                                        </button>
                                    )}
                                </div>
                            )}

                            {pictureError && (
                                <p className="company-picture-error">
                                    {pictureError}
                                </p>
                            )}

                            <small>JPG, PNG, or WebP · Maximum 2 MB</small>
                        </div>
                    </div>

                    <div className="company-form-grid">
                        {field("first_name", "First Name", { required: true })}
                        {field("middle_name", "Middle Name")}
                        {field("surname", "Surname", { required: true })}
                        {field("name_extension", "Name Extension", {
                            placeholder: "e.g. Jr., III",
                        })}
                    </div>
                </section>

                <section className="company-profile-card">
                    <div className="company-section-heading">
                        <div className="company-section-icon gold">
                            <Building2 size={21} />
                        </div>
                        <div>
                            <h2>Company Information</h2>
                            <p>
                                Details that describe your business to
                                jobseekers.
                            </p>
                        </div>
                    </div>

                    <div className="company-form-grid">
                        {field("company_name", "Company Name", {
                            required: true,
                        })}
                        {field("industry", "Industry", {
                            placeholder: "e.g. Information Technology",
                        })}
                        {field("company_address", "Company Address", {
                            full: true,
                        })}
                        {field("company_phone", "Company Phone", {
                            type: "tel",
                        })}
                        {field("company_email", "Company Email", {
                            type: "email",
                        })}
                        {field("website", "Company Website", {
                            placeholder: "https://example.com",
                        })}
                        {field("company_description", "Company Description", {
                            full: true,
                            multiline: true,
                        })}
                    </div>
                </section>

                <section className="company-profile-card">
                    <div className="company-section-heading">
                        <div className="company-section-icon">
                            <Contact size={21} />
                        </div>
                        <div>
                            <h2>Contact Person</h2>
                            <p>
                                Information about the person jobseekers or PESO
                                can contact.
                            </p>
                        </div>
                    </div>

                    <div className="company-form-grid">
                        {field("contact_person", "Contact Person")}
                        {field("contact_position", "Contact Position", {
                            placeholder: "e.g. HR Manager",
                        })}
                    </div>
                </section>

                {editing && (
                    <div className="company-form-actions">
                        <button
                            type="button"
                            className="company-cancel-button"
                            disabled={saving}
                            onClick={() => {
                                setEditing(false);
                                setError("");
                                setSuccess("");
                                setPictureError("");
                                setPictureFile(null);
                                clearPicturePreview();

                                if (fileInputRef.current) {
                                    fileInputRef.current.value = "";
                                }

                                fetchProfile();
                            }}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="company-save-button"
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <RefreshCw
                                        className="company-spin"
                                        size={18}
                                    />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                )}
            </form>

            <div className="company-profile-footer">
                <Building2 size={18} />
                <span>
                    Keep your company information accurate and up to date.
                </span>
            </div>
        </div>
    );
}

export default EmployerCompanyProfile;
