import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const loadUser = () => {
            const storedUser = localStorage.getItem("pesoUser");

            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (error) {
                    console.error("Unable to read saved user:", error);
                }
            }
        };

        loadUser();
        window.addEventListener("storage", loadUser);

        return () => window.removeEventListener("storage", loadUser);
    }, []);

    const role = user?.role || "jobseeker";

    const dashboardPath =
        role === "employer"
            ? "/employer/dashboard"
            : role === "admin" || role === "administrator"
            ? "/admin/dashboard"
            : "/dashboard";

    const navigation = {
        jobseeker: [
            "Dashboard",
            "Find Jobs",
            "Applications",
            "Saved Jobs",
            "Job Fairs",
            "PESO Events",
            "Announcements",
            "Reports",
            "My Profile",
            "Settings",
        ],

        employer: [
            "Dashboard",
            "My Job Posts",
            "Applicants",
            "Job Fairs",
            "Announcements",
            "Reports",
            "Company Profile",
            "Settings",
        ],

        admin: [
            "Dashboard",
            "User Management",
            "Job Management",
            "Job Fair Management",
            "Event Management",
            "Announcements",
            "Reports",
            "Statistics",
            "My Profile",
            "Settings",
        ],

        administrator: [
            "Dashboard",
            "User Management",
            "Job Management",
            "Job Fair Management",
            "Event Management",
            "Announcements",
            "Reports",
            "Statistics",
            "My Profile",
            "Settings",
        ],
    };

    const currentNavigation = navigation[role] || navigation.jobseeker;

    const getItemPath = (item) => {
        const paths = {
            jobseeker: {
                Dashboard: "/dashboard",
                "Find Jobs": "/dashboard/find-jobs",
                Applications: "/dashboard/applications",
                "Saved Jobs": "/dashboard/saved-jobs",
                "Job Fairs": "/dashboard/job-fairs",
                "PESO Events": "/dashboard/peso-events",
                Announcements: "/dashboard/announcements",
                Reports: "/dashboard/reports",
                "My Profile": "/dashboard/my-profile",
                Settings: "/dashboard/settings",
            },

            employer: {
                Dashboard: "/employer/dashboard",
                "My Job Posts": "/employer/jobs",
                Applicants: "/employer/applicants",
                "Job Fairs": "/employer/job-fairs",
                Announcements: "/employer/announcements",
                Reports: "/employer/reports",
                "Company Profile": "/employer/company-profile",
                Settings: "/employer/settings",
            },

            admin: {
                Dashboard: "/admin/dashboard",
                "User Management": "/admin/users",
                "Job Management": "/admin/jobs",
                "Job Fair Management": "/admin/job-fairs",
                "Event Management": "/admin/events",
                Announcements: "/admin/announcements",
                Reports: "/admin/reports",
                Statistics: "/admin/statistics",
                "My Profile": "/admin/my-profile",
                Settings: "/admin/settings",
            },

            administrator: {
                Dashboard: "/admin/dashboard",
                "User Management": "/admin/users",
                "Job Management": "/admin/jobs",
                "Job Fair Management": "/admin/job-fairs",
                "Event Management": "/admin/events",
                Announcements: "/admin/announcements",
                Reports: "/admin/reports",
                Statistics: "/admin/statistics",
                "My Profile": "/admin/my-profile",
                Settings: "/admin/settings",
            },
        };

        return paths[role]?.[item] || dashboardPath;
    };

    const handleLogout = () => {
        localStorage.removeItem("pesoToken");
        localStorage.removeItem("pesoUser");
        window.location.href = "/";
    };

    return (
        <aside className="dashboard-sidebar">
            <div className="sidebar-brand">
                <img
                    src="/images/danao-logo.jpg"
                    alt="Municipality of Danao"
                />

                <div>
                    <strong>DANAO PESO</strong>
                    <span>Public Employment Service Office</span>
                </div>
            </div>

            <div className="sidebar-role">
                <span>ACCOUNT</span>
                <strong>
                    {role === "admin" || role === "administrator"
                        ? "Administrator"
                        : role === "employer"
                        ? "Employer"
                        : "Jobseeker"}
                </strong>
            </div>

            <nav className="sidebar-navigation">
                {currentNavigation.map((item) => {
                    const itemPath = getItemPath(item);

                    const isActive =
                        location.pathname === itemPath ||
                        (itemPath !== dashboardPath &&
                            location.pathname.startsWith(`${itemPath}/`));

                    return (
                        <button
                            key={item}
                            type="button"
                            className={
                                isActive
                                    ? "sidebar-nav-item active"
                                    : "sidebar-nav-item"
                            }
                            onClick={() => navigate(itemPath)}
                        >
                            <span>{item}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="sidebar-bottom">
                <button
                    type="button"
                    className="sidebar-logout"
                    onClick={handleLogout}
                >
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;
