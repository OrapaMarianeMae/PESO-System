import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/auth.css";

const API_BASE_URL = "http://127.0.0.1:8000/api";

function Login({ onClose, onRegister }) {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!email.trim() || !password) {
            setError("Please enter your email address and password.");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(`${API_BASE_URL}/login`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email.trim(),
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.message ||
                    "Login failed. Please check your email and password."
                );
                return;
            }

            if (!data.token || !data.user) {
                setError(
                    "Login response is incomplete. Please try again."
                );
                return;
            }

            // Save the authentication token and user information.
            localStorage.setItem("pesoToken", data.token);
            localStorage.setItem(
                "pesoUser",
                JSON.stringify(data.user)
            );

            // Redirect according to the account role.
            const role = String(data.user.role || "").toLowerCase();

            const dashboardRoutes = {
                jobseeker: "/dashboard",
                employer: "/employer/dashboard",
                admin: "/admin/dashboard",
                administrator: "/admin/dashboard",
            };

            const destination = dashboardRoutes[role];

            if (!destination) {
                localStorage.removeItem("pesoToken");
                localStorage.removeItem("pesoUser");
                setError(
                    "Your account role is not recognized. Please contact the PESO administrator."
                );
                return;
            }

            if (onClose) {
                onClose();
            }

            navigate(destination, { replace: true });
        } catch (err) {
            setError(
                "Unable to connect to the PESO server. Please make sure Laravel is running."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-modal-content">
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
                <span>WELCOME BACK</span>
                <h2>Sign in to your account</h2>
                <p>
                    Access your PESO employment services and opportunities.
                </p>
            </div>

            {error && (
                <div className="auth-error" role="alert">
                    {error}
                </div>
            )}

            <form
                className="modal-auth-form"
                onSubmit={handleSubmit}
            >
                <div className="form-group">
                    <label htmlFor="login-email">Email Address</label>
                    <input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                    />
                </div>

                <div className="form-group">
                    <div className="form-label-row">
                        <label htmlFor="login-password">Password</label>
                        <a
                            href="#"
                            onClick={(e) => e.preventDefault()}
                        >
                            Forgot password?
                        </a>
                    </div>

                    <input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="auth-submit"
                    disabled={loading}
                >
                    {loading ? "Signing In..." : "Sign In"}
                </button>
            </form>

            <div className="auth-register modal-register">
                <p>Don't have an account?</p>
                <button
                    type="button"
                    className="auth-link-button"
                    onClick={onRegister}
                >
                    Create an account
                </button>
            </div>
        </div>
    );
}

export default Login;