
import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000/api/jobseeker/profile";

const EMPTY_FORM = {
    first_name: "",
    middle_name: "",
    surname: "",
    name_extension: "",
    phone: "",
    address: "",
    birth_date: "",
    gender: "",
    civil_status: "",
    education: "",
    course: "",
    school: "",
    skills: "",
    work_experience: "",
    preferred_job: "",
};

function getProfileForm(user, profile) {
    return {
        ...EMPTY_FORM,
        first_name: user?.first_name || "",
        middle_name: user?.middle_name || "",
        surname: user?.surname || "",
        name_extension: user?.name_extension || "",
        phone: profile?.phone || "",
        address: profile?.address || "",
        birth_date: profile?.birth_date
            ? profile.birth_date.slice(0, 10)
            : "",
        gender: profile?.gender || "",
        civil_status: profile?.civil_status || "",
        education: profile?.education || "",
        course: profile?.course || "",
        school: profile?.school || "",
        skills: profile?.skills || "",
        work_experience: profile?.work_experience || "",
        preferred_job: profile?.preferred_job || "",
    };
}

function MyProfile() {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [formData, setFormData] = useState(EMPTY_FORM);

    const [pictureFile, setPictureFile] = useState(null);
    const [picturePreview, setPicturePreview] = useState("");
    const [pictureUploading, setPictureUploading] = useState(false);
    const [pictureMessage, setPictureMessage] = useState("");
    const [pictureError, setPictureError] = useState("");

    const [resumeFile, setResumeFile] = useState(null);
    const [resumeUploading, setResumeUploading] = useState(false);
    const [resumeMessage, setResumeMessage] = useState("");
    const [resumeError, setResumeError] = useState("");

    useEffect(() => {
        loadProfile();
    }, []);

    useEffect(() => {
        return () => {
            if (picturePreview) {
                URL.revokeObjectURL(picturePreview);
            }
        };
    }, [picturePreview]);

    const loadProfile = async () => {
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("pesoToken");

            if (!token) {
                throw new Error("Please log in again to view your profile.");
            }

            const response = await fetch(API_URL, {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to load profile.");
            }

            setUser(data.user);
            setProfile(data.profile);
            setFormData(getProfileForm(data.user, data.profile));

            localStorage.setItem("pesoUser", JSON.stringify(data.user));
        } catch (err) {
            console.error("Unable to load jobseeker profile:", err);
            setError(err.message || "Unable to load your profile.");
        } finally {
            setLoading(false);
        }
    };

    const fullName = user
        ? [
              user.first_name,
              user.middle_name,
              user.surname,
              user.name_extension,
          ]
              .filter(Boolean)
              .join(" ")
        : "Jobseeker";

    const profilePictureUrl =
        user?.profile_picture_url ||
        (user?.profile_picture
            ? user.profile_picture.startsWith("http")
                ? user.profile_picture
                : `http://127.0.0.1:8000/storage/${user.profile_picture}`
            : "");

    const displayedPicture = picturePreview || profilePictureUrl;

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleEdit = () => {
        setFormData(getProfileForm(user, profile));
        setEditing(true);
        setMessage("");
        setError("");
        setPictureMessage("");
        setPictureError("");
        setResumeMessage("");
        setResumeError("");
    };

    const handleCancel = () => {
        setEditing(false);
        setFormData(getProfileForm(user, profile));
        setMessage("");
        setError("");
        setPictureFile(null);
        setPicturePreview("");
        setPictureMessage("");
        setPictureError("");
        setResumeFile(null);
        setResumeMessage("");
        setResumeError("");

        const pictureInput = document.getElementById("profile-picture-upload");
        if (pictureInput) pictureInput.value = "";

        const resumeInput = document.getElementById("resume-upload");
        if (resumeInput) resumeInput.value = "";
    };

    const createFormData = () => {
        const data = new FormData();

        Object.entries(formData).forEach(([key, value]) => {
            data.append(key, value || "");
        });

        return data;
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        setMessage("");
        setError("");

        try {
            const token = localStorage.getItem("pesoToken");
            const dataToSend = createFormData();

            const response = await fetch(API_URL, {
                method: "PUT",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: dataToSend,
            });

            const data = await response.json();

            if (!response.ok) {
                const validationMessages = data.errors
                    ? Object.values(data.errors).flat().join(" ")
                    : "";

                throw new Error(
                    validationMessages ||
                        data.message ||
                        "Unable to update your profile."
                );
            }

            setUser(data.user);
            setProfile(data.profile);
            setFormData(getProfileForm(data.user, data.profile));
            localStorage.setItem("pesoUser", JSON.stringify(data.user));

            setEditing(false);
            setMessage("Profile updated successfully.");
        } catch (err) {
            console.error("Unable to update profile:", err);
            setError(err.message || "Unable to update your profile.");
        } finally {
            setSaving(false);
        }
    };

    const handlePictureChange = (event) => {
        const file = event.target.files?.[0];

        setPictureMessage("");
        setPictureError("");

        if (!file) {
            setPictureFile(null);
            setPicturePreview("");
            return;
        }

        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

        if (!allowedTypes.includes(file.type)) {
            setPictureError("Please select a JPG, PNG, or WebP image.");
            event.target.value = "";
            setPictureFile(null);
            setPicturePreview("");
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setPictureError("The profile picture must not exceed 2 MB.");
            event.target.value = "";
            setPictureFile(null);
            setPicturePreview("");
            return;
        }

        setPictureFile(file);
        setPicturePreview(URL.createObjectURL(file));
    };

    const handlePictureUpload = async () => {
        if (!pictureFile) {
            setPictureError("Please choose a picture first.");
            return;
        }

        setPictureUploading(true);
        setPictureMessage("");
        setPictureError("");

        try {
            const token = localStorage.getItem("pesoToken");
            const uploadData = createFormData();

            uploadData.append("profile_picture", pictureFile);

            const response = await fetch(API_URL, {
                method: "PUT",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: uploadData,
            });

            const data = await response.json();

            if (!response.ok) {
                const validationMessages = data.errors
                    ? Object.values(data.errors).flat().join(" ")
                    : "";

                throw new Error(
                    validationMessages ||
                        data.message ||
                        "Unable to upload profile picture."
                );
            }

            setUser(data.user);
            setProfile(data.profile);
            setFormData(getProfileForm(data.user, data.profile));
            localStorage.setItem("pesoUser", JSON.stringify(data.user));

            setPictureFile(null);
            setPicturePreview("");
            setPictureMessage("Profile picture updated successfully.");

            const input = document.getElementById("profile-picture-upload");
            if (input) input.value = "";
        } catch (err) {
            console.error("Unable to upload profile picture:", err);
            setPictureError(err.message || "Unable to upload profile picture.");
        } finally {
            setPictureUploading(false);
        }
    };

    const handleResumeChange = (event) => {
        const file = event.target.files?.[0];

        setResumeMessage("");
        setResumeError("");

        if (!file) {
            setResumeFile(null);
            return;
        }

        const allowedExtensions = /\.(pdf|doc|docx)$/i;

        if (!allowedExtensions.test(file.name)) {
            setResumeError("Please select a PDF, DOC, or DOCX file.");
            event.target.value = "";
            setResumeFile(null);
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setResumeError("Your resume must not exceed 5 MB.");
            event.target.value = "";
            setResumeFile(null);
            return;
        }

        setResumeFile(file);
    };

    const handleResumeUpload = async () => {
        if (!resumeFile) {
            setResumeError("Please select a resume first.");
            return;
        }

        setResumeUploading(true);
        setResumeMessage("");
        setResumeError("");

        try {
            const token = localStorage.getItem("pesoToken");
            const uploadData = createFormData();

            uploadData.append("resume", resumeFile);

            const response = await fetch(API_URL, {
                method: "PUT",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: uploadData,
            });

            const data = await response.json();

            if (!response.ok) {
                const validationMessages = data.errors
                    ? Object.values(data.errors).flat().join(" ")
                    : "";

                throw new Error(
                    validationMessages ||
                        data.message ||
                        "Unable to upload your resume."
                );
            }

            setUser(data.user);
            setProfile(data.profile);
            setFormData(getProfileForm(data.user, data.profile));
            localStorage.setItem("pesoUser", JSON.stringify(data.user));

            setResumeFile(null);
            setResumeMessage("Resume uploaded successfully.");

            const input = document.getElementById("resume-upload");
            if (input) input.value = "";
        } catch (err) {
            console.error("Unable to upload resume:", err);
            setResumeError(err.message || "Unable to upload your resume.");
        } finally {
            setResumeUploading(false);
        }
    };

    const resumeFileName = profile?.resume
        ? profile.resume.split("/").pop()
        : null;

    if (loading) {
        return (
            <div className="jobseeker-dashboard">
                <section className="dashboard-panel">
                    <p>Loading your profile...</p>
                </section>
            </div>
        );
    }

    return (
        <div className="jobseeker-dashboard">
            <section className="dashboard-welcome">
                <div>
                    <span className="dashboard-section-label">
                        PERSONAL INFORMATION
                    </span>
                    <h2>My Profile</h2>
                    <p>
                        View and manage your personal information and
                        employment profile registered with Danao PESO.
                    </p>
                </div>
            </section>

            {message && (
                <div className="dashboard-success-message">{message}</div>
            )}

            {error && (
                <div className="dashboard-error-message">{error}</div>
            )}

            <section className="dashboard-panel">
                <div className="dashboard-panel-header">
                    <div>
                        <span>ACCOUNT INFORMATION</span>
                        <h3>Personal Profile</h3>
                    </div>

                    <div className="profile-action-buttons">
                        {!editing ? (
                            <button
                                type="button"
                                className="profile-edit-button"
                                onClick={handleEdit}
                            >
                                Edit Profile
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    className="profile-cancel-button"
                                    onClick={handleCancel}
                                    disabled={saving || pictureUploading || resumeUploading}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="profile-save-button"
                                    onClick={handleSaveProfile}
                                    disabled={saving || pictureUploading || resumeUploading}
                                >
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="profile-page-content">
                    <div className="profile-page-avatar">
                        {displayedPicture ? (
                            <img src={displayedPicture} alt={fullName} />
                        ) : (
                            <span>{fullName.charAt(0).toUpperCase()}</span>
                        )}
                    </div>

                    {!editing ? (
                        <div className="profile-page-info">
                            <div className="profile-info-item">
                                <span>FULL NAME</span>
                                <strong>{fullName}</strong>
                            </div>

                            <div className="profile-info-item">
                                <span>EMAIL ADDRESS</span>
                                <strong>{user?.email || "Not provided"}</strong>
                            </div>

                            <div className="profile-info-item">
                                <span>PHONE NUMBER</span>
                                <strong>{profile?.phone || "Not provided"}</strong>
                            </div>

                            <div className="profile-info-item">
                                <span>ADDRESS</span>
                                <strong>{profile?.address || "Not provided"}</strong>
                            </div>

                            <div className="profile-info-item">
                                <span>BIRTH DATE</span>
                                <strong>
                                    {profile?.birth_date
                                        ? profile.birth_date.slice(0, 10)
                                        : "Not provided"}
                                </strong>
                            </div>

                            <div className="profile-info-item">
                                <span>GENDER</span>
                                <strong>{profile?.gender || "Not provided"}</strong>
                            </div>

                            <div className="profile-info-item">
                                <span>CIVIL STATUS</span>
                                <strong>{profile?.civil_status || "Not provided"}</strong>
                            </div>

                            <div className="profile-info-item">
                                <span>EMAIL VERIFICATION</span>
                                <strong>
                                    {user?.email_verified_at ? "Verified" : "Not verified"}
                                </strong>
                            </div>
                        </div>
                    ) : (
                        <div className="profile-edit-form">
                            <div className="profile-picture-edit-section">
                                <h4>Profile Picture</h4>
                                <p>
                                    Choose a JPG, PNG, or WebP image up to 2 MB.
                                </p>

                                <div className="profile-picture-edit-preview">
                                    {displayedPicture ? (
                                        <img src={displayedPicture} alt="Profile preview" />
                                    ) : (
                                        <span>{fullName.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>

                                <div className="profile-picture-upload">
                                    <label htmlFor="profile-picture-upload">
                                        Choose Profile Picture
                                    </label>

                                    <input
                                        id="profile-picture-upload"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handlePictureChange}
                                    />

                                    <button
                                        type="button"
                                        className="profile-save-button"
                                        onClick={handlePictureUpload}
                                        disabled={!pictureFile || pictureUploading || saving}
                                    >
                                        {pictureUploading ? "Uploading..." : "Save Picture"}
                                    </button>
                                </div>

                                {pictureMessage && (
                                    <div className="dashboard-success-message">
                                        {pictureMessage}
                                    </div>
                                )}

                                {pictureError && (
                                    <div className="dashboard-error-message">
                                        {pictureError}
                                    </div>
                                )}
                            </div>

                            <div className="profile-form-section">
                                <span className="profile-form-section-label">
                                    PERSONAL INFORMATION
                                </span>

                                <div className="profile-form-grid">
                                    <div className="form-group">
                                        <label htmlFor="first_name">First Name</label>
                                        <input
                                            id="first_name"
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="middle_name">Middle Name</label>
                                        <input
                                            id="middle_name"
                                            name="middle_name"
                                            value={formData.middle_name}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="surname">Surname</label>
                                        <input
                                            id="surname"
                                            name="surname"
                                            value={formData.surname}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="name_extension">Name Extension</label>
                                        <input
                                            id="name_extension"
                                            name="name_extension"
                                            placeholder="Jr., Sr., III"
                                            value={formData.name_extension}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="phone">Phone Number</label>
                                        <input
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="birth_date">Birth Date</label>
                                        <input
                                            id="birth_date"
                                            name="birth_date"
                                            type="date"
                                            value={formData.birth_date}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="gender">Gender</label>
                                        <select
                                            id="gender"
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="civil_status">Civil Status</label>
                                        <select
                                            id="civil_status"
                                            name="civil_status"
                                            value={formData.civil_status}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select civil status</option>
                                            <option value="Single">Single</option>
                                            <option value="Married">Married</option>
                                            <option value="Widowed">Widowed</option>
                                            <option value="Separated">Separated</option>
                                        </select>
                                    </div>

                                    <div className="form-group profile-form-full">
                                        <label htmlFor="address">Address</label>
                                        <textarea
                                            id="address"
                                            name="address"
                                            rows="3"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="profile-form-section">
                                <span className="profile-form-section-label">
                                    EDUCATION
                                </span>

                                <div className="profile-form-grid">
                                    <div className="form-group">
                                        <label htmlFor="education">Education</label>
                                        <input
                                            id="education"
                                            name="education"
                                            placeholder="e.g. Bachelor's Degree"
                                            value={formData.education}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="course">Course / Program</label>
                                        <input
                                            id="course"
                                            name="course"
                                            value={formData.course}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="form-group profile-form-full">
                                        <label htmlFor="school">School</label>
                                        <input
                                            id="school"
                                            name="school"
                                            value={formData.school}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="profile-form-section">
                                <span className="profile-form-section-label">
                                    EMPLOYMENT PROFILE
                                </span>

                                <div className="profile-form-grid">
                                    <div className="form-group profile-form-full">
                                        <label htmlFor="preferred_job">Preferred Job</label>
                                        <input
                                            id="preferred_job"
                                            name="preferred_job"
                                            placeholder="e.g. IT Support, Administrative Assistant"
                                            value={formData.preferred_job}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="form-group profile-form-full">
                                        <label htmlFor="skills">Skills</label>
                                        <textarea
                                            id="skills"
                                            name="skills"
                                            rows="4"
                                            placeholder="List your skills and abilities."
                                            value={formData.skills}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="form-group profile-form-full">
                                        <label htmlFor="work_experience">Work Experience</label>
                                        <textarea
                                            id="work_experience"
                                            name="work_experience"
                                            rows="5"
                                            placeholder="Describe your previous work experience."
                                            value={formData.work_experience}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {!editing && (
                    <div className="dashboard-empty-state compact">
                        <h4>Profile management</h4>
                        <p>
                            Your personal information, education, skills,
                            work experience, preferred job, and profile
                            picture can be managed here.
                        </p>
                    </div>
                )}

                <div className="profile-resume-section">
                    <div className="profile-resume-header">
                        <div>
                            <span>CAREER DOCUMENT</span>
                            <h3>Resume / CV</h3>
                            <p>
                                Upload your latest resume or CV to use when
                                applying for job opportunities.
                            </p>
                        </div>
                    </div>

                    {resumeFileName ? (
                        <div className="profile-current-resume">
                            <div>
                                <span className="profile-resume-icon">CV</span>
                                <div>
                                    <strong>{resumeFileName}</strong>
                                    <small>Resume currently saved to your profile</small>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="profile-no-resume">
                            <strong>No resume uploaded</strong>
                            <span>Upload a PDF, DOC, or DOCX file up to 5 MB.</span>
                        </div>
                    )}

                    <div className="profile-resume-upload">
                        <label
                            htmlFor="resume-upload"
                            className="profile-resume-file-label"
                        >
                            {resumeFile ? resumeFile.name : "Choose Resume / CV"}
                        </label>

                        <input
                            id="resume-upload"
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleResumeChange}
                        />

                        <button
                            type="button"
                            className="profile-resume-upload-button"
                            onClick={handleResumeUpload}
                            disabled={!resumeFile || resumeUploading || saving}
                        >
                            {resumeUploading ? "Uploading..." : "Upload Resume"}
                        </button>
                    </div>

                    {resumeMessage && (
                        <div className="profile-resume-message success">
                            {resumeMessage}
                        </div>
                    )}

                    {resumeError && (
                        <div className="profile-resume-message error">
                            {resumeError}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

export default MyProfile;
