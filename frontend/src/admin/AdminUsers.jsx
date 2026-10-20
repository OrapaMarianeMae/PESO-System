
import { useEffect, useState } from "react";
import {
    Users,
    Search,
    RefreshCw,
    UserRound,
    Building2,
    ShieldCheck,
} from "lucide-react";
import "./AdminUsers.css";

const API_BASE = "http://127.0.0.1:8000/api";

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function loadUsers() {
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("pesoToken");

            if (!token) {
                throw new Error("Please log in as an administrator.");
            }

            const response = await fetch(`${API_BASE}/admin/users`, {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to load user accounts."
                );
            }

            if (!Array.isArray(data.users)) {
                throw new Error("The user list response is invalid.");
            }

            setUsers(data.users);
        } catch (err) {
            setError(err.message || "Unable to connect to the server.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadUsers();
    }, []);

    async function handleStatusChange(userId, verificationStatus) {
        setUpdatingId(userId);
        setError("");
        setSuccess("");

        try {
            const token = localStorage.getItem("pesoToken");

            const response = await fetch(
                `${API_BASE}/admin/users/${userId}/status`,
                {
                    method: "PUT",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        verification_status: verificationStatus,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to update account status."
                );
            }

            setUsers((currentUsers) =>
                currentUsers.map((user) =>
                    user.id === userId
                        ? {
                              ...user,
                              verification_status:
                                  data.user?.verification_status ??
                                  verificationStatus,
                          }
                        : user
                )
            );

            setSuccess(data.message || "Account status updated successfully.");
        } catch (err) {
            setError(err.message || "Unable to update account status.");
        } finally {
            setUpdatingId(null);
        }
    }

    const filteredUsers = users.filter((user) => {
        const roleMatches =
            roleFilter === "all" || user.role === roleFilter;

        const name =
            [
                user.first_name,
                user.middle_name,
                user.surname,
                user.name_extension,
            ]
                .filter(Boolean)
                .join(" ") ||
            user.name ||
            "";

        const searchText = search.toLowerCase();

        const searchMatches = [
            name,
            user.email,
            user.role,
            user.verification_status,
        ]
            .filter(Boolean)
            .some((value) =>
                String(value).toLowerCase().includes(searchText)
            );

        return roleMatches && searchMatches;
    });

    function getDisplayName(user) {
        return (
            [
                user.first_name,
                user.middle_name,
                user.surname,
                user.name_extension,
            ]
                .filter(Boolean)
                .join(" ") ||
            user.name ||
            "Unnamed User"
        );
    }

    function formatStatus(status) {
        if (!status) return "Unknown";

        return status.charAt(0).toUpperCase() + status.slice(1);
    }

    return (
        <div className="admin-users-page">
            <div className="admin-users-header">
                <div>
                    <span className="admin-users-eyebrow">
                        ADMINISTRATION
                    </span>
                    <h1>User Management</h1>
                    <p>
                        View and manage registered jobseekers and employers
                        in PESO Danao.
                    </p>
                </div>

                <button
                    className="admin-users-refresh"
                    onClick={loadUsers}
                    disabled={loading}
                >
                    <RefreshCw size={17} />
                    Refresh
                </button>
            </div>

            <div className="admin-users-summary">
                <div className="admin-users-summary-icon">
                    <Users size={23} />
                </div>
                <div>
                    <span>Total Accounts</span>
                    <strong>{loading ? "..." : users.length}</strong>
                </div>
                <div className="admin-users-summary-divider" />
                <div>
                    <span>Jobseekers</span>
                    <strong>
                        {loading
                            ? "..."
                            : users.filter((user) => user.role === "jobseeker")
                                  .length}
                    </strong>
                </div>
                <div className="admin-users-summary-divider" />
                <div>
                    <span>Employers</span>
                    <strong>
                        {loading
                            ? "..."
                            : users.filter((user) => user.role === "employer")
                                  .length}
                    </strong>
                </div>
            </div>

            {error && (
                <div className="admin-users-error" role="alert">
                    {error}
                </div>
            )}

            {success && (
                <div className="admin-users-success" role="status">
                    <ShieldCheck size={17} />
                    {success}
                </div>
            )}

            <div className="admin-users-toolbar">
                <div className="admin-users-search">
                    <Search size={18} />
                    <input
                        type="search"
                        placeholder="Search by name, email, or status..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </div>

                <select
                    value={roleFilter}
                    onChange={(event) => setRoleFilter(event.target.value)}
                    aria-label="Filter users by role"
                >
                    <option value="all">All Accounts</option>
                    <option value="jobseeker">Jobseekers</option>
                    <option value="employer">Employers</option>
                </select>
            </div>

            <div className="admin-users-table-card">
                <div className="admin-users-table-heading">
                    <div>
                        <h2>Registered Accounts</h2>
                        <p>
                            {loading
                                ? "Loading accounts..."
                                : `${filteredUsers.length} account(s) found`}
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="admin-users-empty">
                        Loading user accounts...
                    </div>
                ) : error && users.length === 0 ? (
                    <div className="admin-users-empty">
                        Unable to display accounts. Please check the API
                        connection and administrator login.
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="admin-users-empty">
                        <Users size={32} />
                        <h3>No accounts found</h3>
                        <p>Try another search term or filter.</p>
                    </div>
                ) : (
                    <div className="admin-users-table-wrap">
                        <table className="admin-users-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Email Address</th>
                                    <th>Account Type</th>
                                    <th>Verification Status</th>
                                    <th>Manage Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="admin-users-person">
                                                <span className="admin-users-avatar">
                                                    {user.role === "employer" ? (
                                                        <Building2 size={19} />
                                                    ) : (
                                                        <UserRound size={19} />
                                                    )}
                                                </span>
                                                <div>
                                                    <strong>
                                                        {getDisplayName(user)}
                                                    </strong>
                                                    <small>ID: {user.id}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{user.email || "—"}</td>
                                        <td>
                                            <span
                                                className={`admin-users-role ${user.role}`}
                                            >
                                                {user.role === "jobseeker"
                                                    ? "Jobseeker"
                                                    : user.role === "employer"
                                                      ? "Employer"
                                                      : user.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className={`admin-users-status ${user.verification_status || "unknown"}`}
                                            >
                                                {formatStatus(
                                                    user.verification_status
                                                )}
                                            </span>
                                        </td>
                                        <td>
                                            <select
                                                className="admin-users-status-select"
                                                value={
                                                    user.verification_status ||
                                                    "pending"
                                                }
                                                disabled={
                                                    updatingId === user.id
                                                }
                                                onChange={(event) =>
                                                    handleStatusChange(
                                                        user.id,
                                                        event.target.value
                                                    )
                                                }
                                                aria-label={`Change status for ${getDisplayName(user)}`}
                                            >
                                                <option value="pending">
                                                    Pending
                                                </option>
                                                <option value="approved">
                                                    Approved
                                                </option>
                                                <option value="suspended">
                                                    Suspended
                                                </option>
                                                <option value="rejected">
                                                    Rejected
                                                </option>
                                            </select>
                                            {updatingId === user.id && (
                                                <small className="admin-users-updating">
                                                    Saving...
                                                </small>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminUsers;
