import { useState } from "react";
import "../../styles/auth.css";

const API_BASE_URL = "http://127.0.0.1:8000/api";

function Register({ onClose, onLogin }) {
    const [firstName, setFirstName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [surname, setSurname] = useState("");
    const [nameExtension, setNameExtension] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPasswordRequirements, setShowPasswordRequirements] =
        useState(false);

    const [touched, setTouched] = useState({});

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [registrationComplete, setRegistrationComplete] = useState(false);

    const passwordRequirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password),
    };

    const passwordStrong =
        Object.values(passwordRequirements).every(Boolean);

    const passwordsMatch =
        password.length > 0 &&
        password === confirmPassword;

    const emailValid =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const markTouched = (field) => {
        setTouched((prev) => ({
            ...prev,
            [field]: true,
        }));
    };

    const getFieldClass = (field, isValid) => {
        if (!touched[field]) {
            return "";
        }

        return isValid ? "input-valid" : "input-invalid";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        setTouched({
            firstName: true,
            surname: true,
            email: true,
            role: true,
            password: true,
            confirmPassword: true,
        });

        if (
            !firstName.trim() ||
            !surname.trim() ||
            !emailValid ||
            !role ||
            !passwordStrong ||
            !passwordsMatch
        ) {
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `${API_BASE_URL}/register`,
                {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        first_name: firstName.trim(),
                        middle_name: middleName.trim() || null,
                        surname: surname.trim(),
                        name_extension:
                            nameExtension.trim() || null,
                        email: email.trim(),
                        password,
                        password_confirmation: confirmPassword,
                        role,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    const firstError = Object.values(
                        data.errors
                    )[0]?.[0];

                    setError(
                        firstError ||
                            data.message ||
                            "Registration failed."
                    );
                } else {
                    setError(
                        data.message ||
                            "Registration failed."
                    );
                }

                return;
            }

            /*
             * Laravel successfully created the account
             * and sent the verification email.
             */
            setRegistrationComplete(true);
        } catch (err) {
            setError(
                "Unable to connect to the PESO server. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    /*
     |--------------------------------------------------------------------------
     | Verification Screen
     |--------------------------------------------------------------------------
     */

    if (registrationComplete) {
        return (
            <div className="login-modal-content register-modal-content">
                <button
                    type="button"
                    className="auth-modal-close"
                    onClick={onClose}
                    aria-label="Close"
                >
                    ×
                </button>

                <img
                    src="/images/danao-logo.jpg"
                    alt="Municipality of Danao"
                    className="modal-auth-logo"
                />

                <div className="modal-auth-heading">
                    <span>EMAIL VERIFICATION</span>

                    <h2>Verify your email</h2>

                    <p>
                        We've sent a verification link to:
                    </p>

                    <strong className="verification-email">
                        {email}
                    </strong>
                </div>

                <div className="verification-message">
                    <div className="verification-icon">
                        ✓
                    </div>

                    <h3>Check your inbox</h3>

                    <p>
                        Please check your email and click
                        the verification link to activate
                        your PESO account.
                    </p>
                </div>

                <button
                    type="button"
                    className="auth-submit"
                    onClick={onLogin}
                >
                    Continue to Login
                </button>

                <div className="auth-register modal-register">
                    <p>
                        Didn't receive the email?
                    </p>

                    <button
                        type="button"
                        className="auth-link-button"
                        onClick={() => {
                            setError(
                                "Please use the verification email sent to your inbox. Resend will be added next."
                            );
                        }}
                    >
                        Resend Verification Email
                    </button>
                </div>

                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="login-modal-content register-modal-content">
            <button
                type="button"
                className="auth-modal-close"
                onClick={onClose}
                aria-label="Close registration"
            >
                ×
            </button>

            <img
                src="/images/danao-logo.jpg"
                alt="Municipality of Danao"
                className="modal-auth-logo"
            />

            <div className="modal-auth-heading">
                <span>CREATE ACCOUNT</span>

                <h2>Join Danao PESO</h2>

                <p>
                    Create your account to access employment
                    opportunities and PESO services.
                </p>
            </div>

            {error && (
                <div className="auth-error">
                    {error}
                </div>
            )}

            <form
                className="modal-auth-form"
                onSubmit={handleSubmit}
            >
                {/* FIRST NAME + SURNAME */}
                <div className="register-name-grid">
                    <div className="form-group">
                        <label htmlFor="register-first-name">
                            First Name
                        </label>

                        <input
                            id="register-first-name"
                            type="text"
                            placeholder="First name"
                            className={getFieldClass(
                                "firstName",
                                firstName.trim() !== ""
                            )}
                            value={firstName}
                            onFocus={() =>
                                markTouched("firstName")
                            }
                            onChange={(e) => {
                                setFirstName(e.target.value);
                                markTouched("firstName");
                            }}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="register-surname">
                            Surname
                        </label>

                        <input
                            id="register-surname"
                            type="text"
                            placeholder="Surname"
                            className={getFieldClass(
                                "surname",
                                surname.trim() !== ""
                            )}
                            value={surname}
                            onFocus={() =>
                                markTouched("surname")
                            }
                            onChange={(e) => {
                                setSurname(e.target.value);
                                markTouched("surname");
                            }}
                        />
                    </div>
                </div>

                {/* MIDDLE NAME + NAME EXTENSION */}
                <div className="register-name-grid">
                    <div className="form-group">
                        <label htmlFor="register-middle-name">
                            Middle Name
                        </label>

                        <input
                            id="register-middle-name"
                            type="text"
                            placeholder="Optional"
                            value={middleName}
                            onChange={(e) =>
                                setMiddleName(e.target.value)
                            }
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="register-extension">
                            Name Extension
                        </label>

                        <input
                            id="register-extension"
                            type="text"
                            placeholder="Jr., Sr., III"
                            value={nameExtension}
                            onChange={(e) =>
                                setNameExtension(e.target.value)
                            }
                        />
                    </div>
                </div>

                {/* EMAIL */}
                <div className="form-group">
                    <label htmlFor="register-email">
                        Email Address
                    </label>

                    <input
                        id="register-email"
                        type="email"
                        placeholder="Enter your email address"
                        className={getFieldClass(
                            "email",
                            emailValid
                        )}
                        value={email}
                        onFocus={() => markTouched("email")}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            markTouched("email");
                        }}
                    />
                </div>

                {/* ACCOUNT TYPE */}
                <div className="form-group">
                    <label htmlFor="register-role">
                        Account Type
                    </label>

                    <select
                        id="register-role"
                        className={getFieldClass(
                            "role",
                            role !== ""
                        )}
                        value={role}
                        onFocus={() => markTouched("role")}
                        onChange={(e) => {
                            setRole(e.target.value);
                            markTouched("role");
                        }}
                    >
                        <option value="" disabled>
                            Select account type
                        </option>

                        <option value="jobseeker">
                            Jobseeker
                        </option>

                        <option value="employer">
                            Employer
                        </option>
                    </select>
                </div>

                {/* PASSWORD + CONFIRM PASSWORD */}
                <div className="register-name-grid">
                    <div className="form-group password-field">
                        <label htmlFor="register-password">
                            Password
                        </label>

                        <input
                            id="register-password"
                            type="password"
                            placeholder="Create password"
                            className={getFieldClass(
                                "password",
                                passwordStrong
                            )}
                            value={password}
                            onFocus={() => {
                                setShowPasswordRequirements(
                                    true
                                );
                                markTouched("password");
                            }}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                markTouched("password");
                            }}
                        />

                        {showPasswordRequirements && (
                            <div className="password-tooltip">
                                <div className="password-tooltip-title">
                                    Password must contain:
                                </div>

                                <div
                                    className={
                                        passwordRequirements.length
                                            ? "requirement valid"
                                            : "requirement"
                                    }
                                >
                                    <span>✓</span>
                                    At least 8 characters
                                </div>

                                <div
                                    className={
                                        passwordRequirements.uppercase
                                            ? "requirement valid"
                                            : "requirement"
                                    }
                                >
                                    <span>✓</span>
                                    One uppercase letter
                                </div>

                                <div
                                    className={
                                        passwordRequirements.lowercase
                                            ? "requirement valid"
                                            : "requirement"
                                    }
                                >
                                    <span>✓</span>
                                    One lowercase letter
                                </div>

                                <div
                                    className={
                                        passwordRequirements.number
                                            ? "requirement valid"
                                            : "requirement"
                                    }
                                >
                                    <span>✓</span>
                                    One number
                                </div>

                                <div
                                    className={
                                        passwordRequirements.special
                                            ? "requirement valid"
                                            : "requirement"
                                    }
                                >
                                    <span>✓</span>
                                    One special character
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="register-confirm-password">
                            Confirm Password
                        </label>

                        <input
                            id="register-confirm-password"
                            type="password"
                            placeholder="Confirm password"
                            className={getFieldClass(
                                "confirmPassword",
                                passwordsMatch
                            )}
                            value={confirmPassword}
                            onFocus={() =>
                                setShowPasswordRequirements(
                                    false
                                )
                            }
                            onChange={(e) => {
                                setConfirmPassword(
                                    e.target.value
                                );
                                markTouched("confirmPassword");
                            }}
                        />
                    </div>
                </div>

                {/* TERMS */}
                <label className="auth-checkbox">
                    <input type="checkbox" />

                    <span>
                        I agree to the PESO terms and
                        conditions.
                    </span>
                </label>

                {/* CREATE ACCOUNT */}
                <button
                    type="submit"
                    className="auth-submit"
                    disabled={loading}
                >
                    {loading
                        ? "Creating Account..."
                        : "Create Account"}
                </button>
            </form>

            {/* LOGIN */}
            <div className="auth-register modal-register">
                <p>Already have an account?</p>

                <button
                    type="button"
                    className="auth-link-button"
                    onClick={onLogin}
                >
                    Sign in
                </button>
            </div>
        </div>
    );
}

export default Register;