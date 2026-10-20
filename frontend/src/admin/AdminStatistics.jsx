
import { useCallback, useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import {
    Users,
    Building2,
    BriefcaseBusiness,
    ClipboardList,
    CalendarDays,
    UserCheck,
    RefreshCw,
    TrendingUp,
    BarChart3,
    Loader2,
    AlertCircle,
} from "lucide-react";
import "./AdminStatistics.css";

const API_BASE = "http://127.0.0.1:8000/api";

const STAT_CARDS = [
    {
        key: "total_jobseekers",
        title: "Total Jobseekers",
        icon: Users,
        color: "blue",
    },
    {
        key: "total_employers",
        title: "Total Employers",
        icon: Building2,
        color: "gold",
    },
    {
        key: "active_vacancies",
        title: "Active Vacancies",
        icon: BriefcaseBusiness,
        color: "green",
    },
    {
        key: "pending_job_posts",
        title: "Pending Job Posts",
        icon: ClipboardList,
        color: "orange",
    },
    {
        key: "total_applications",
        title: "Total Applications",
        icon: UserCheck,
        color: "purple",
    },
    {
        key: "upcoming_job_fairs",
        title: "Upcoming Job Fairs",
        icon: CalendarDays,
        color: "sky",
    },
    {
        key: "job_fair_employer_participants",
        title: "Employer Registrations",
        icon: Building2,
        color: "teal",
    },
    {
        key: "job_fair_jobseeker_participants",
        title: "Job Fair Jobseekers",
        icon: Users,
        color: "indigo",
    },
    {
        key: "total_placements",
        title: "Successful Placements",
        icon: TrendingUp,
        color: "green",
    },
];

const formatNumber = (value) =>
    Number(value ?? 0).toLocaleString("en-PH");

function AdminStatistics() {
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const loadStatistics = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        setError("");

        try {
            const token = localStorage.getItem("pesoToken");

            const response = await fetch(
                `${API_BASE}/admin/statistics`,
                {
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to load employment statistics."
                );
            }

            setStatistics(data.statistics || {});
        } catch (err) {
            setError(
                err.message ||
                    "Unable to connect to the server. Please try again."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadStatistics();
    }, [loadStatistics]);

    const overviewData = statistics
        ? [
              {
                  name: "Jobseekers",
                  count: Number(statistics.total_jobseekers || 0),
              },
              {
                  name: "Employers",
                  count: Number(statistics.total_employers || 0),
              },
              {
                  name: "Vacancies",
                  count: Number(statistics.active_vacancies || 0),
              },
              {
                  name: "Applications",
                  count: Number(statistics.total_applications || 0),
              },
              {
                  name: "Placements",
                  count: Number(statistics.total_placements || 0),
              },
          ]
        : [];

    const participationData = statistics
        ? [
              {
                  name: "Employer Registrations",
                  value: Number(
                      statistics.job_fair_employer_participants || 0
                  ),
              },
              {
                  name: "Jobseeker Registrations",
                  value: Number(
                      statistics.job_fair_jobseeker_participants || 0
                  ),
              },
          ]
        : [];

    const pieColors = ["#d4a72c", "#1f557d"];

    return (
        <div className="admin-statistics-page">
            <div className="admin-statistics-header">
                <div>
                    <span className="admin-statistics-eyebrow">
                        PESO ADMINISTRATION
                    </span>
                    <h1>Statistics &amp; Reports</h1>
                    <p>
                        Monitor employment activity, job opportunities,
                        applications, and job fair participation.
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-statistics-refresh"
                    onClick={() => loadStatistics(true)}
                    disabled={loading || refreshing}
                >
                    <RefreshCw
                        size={17}
                        className={refreshing ? "admin-statistics-spinning" : ""}
                    />
                    {refreshing ? "Refreshing..." : "Refresh Data"}
                </button>
            </div>

            {error && (
                <div className="admin-statistics-error" role="alert">
                    <AlertCircle size={19} />
                    <span>{error}</span>
                    <button
                        type="button"
                        onClick={() => loadStatistics(true)}
                    >
                        Try Again
                    </button>
                </div>
            )}

            {loading ? (
                <div className="admin-statistics-loading">
                    <Loader2 size={32} className="admin-statistics-spinning" />
                    <p>Loading employment statistics...</p>
                </div>
            ) : (
                <>
                    <div className="admin-statistics-section-heading">
                        <div>
                            <h2>Employment Overview</h2>
                            <p>
                                Summary of the current records in your PESO
                                system.
                            </p>
                        </div>
                        <span className="admin-statistics-live-label">
                            <span />
                            Current Data
                        </span>
                    </div>

                    <div className="admin-statistics-cards">
                        {STAT_CARDS.map((card) => {
                            const Icon = card.icon;

                            return (
                                <div
                                    className="admin-statistics-card"
                                    key={card.key}
                                >
                                    <div
                                        className={`admin-statistics-card-icon ${card.color}`}
                                    >
                                        <Icon size={22} />
                                    </div>
                                    <div className="admin-statistics-card-info">
                                        <p>{card.title}</p>
                                        <h3>
                                            {formatNumber(
                                                statistics?.[card.key]
                                            )}
                                        </h3>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="admin-statistics-charts">
                        <section className="admin-statistics-chart-panel">
                            <div className="admin-statistics-chart-heading">
                                <div className="admin-statistics-chart-icon">
                                    <BarChart3 size={20} />
                                </div>
                                <div>
                                    <h2>Employment Metrics</h2>
                                    <p>Comparison of key system totals</p>
                                </div>
                            </div>

                            <div className="admin-statistics-chart">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={overviewData}
                                        margin={{
                                            top: 12,
                                            right: 12,
                                            left: -12,
                                            bottom: 8,
                                        }}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            vertical={false}
                                            stroke="#e2e8f0"
                                        />
                                        <XAxis
                                            dataKey="name"
                                            tick={{
                                                fontSize: 11,
                                                fill: "#64748b",
                                            }}
                                            interval={0}
                                            angle={-15}
                                            textAnchor="end"
                                            height={55}
                                        />
                                        <YAxis
                                            allowDecimals={false}
                                            tick={{
                                                fontSize: 11,
                                                fill: "#64748b",
                                            }}
                                        />
                                        <Tooltip
                                            formatter={(value) => [
                                                formatNumber(value),
                                                "Total",
                                            ]}
                                            contentStyle={{
                                                borderRadius: 10,
                                                border: "1px solid #e2e8f0",
                                            }}
                                        />
                                        <Bar
                                            dataKey="count"
                                            name="Total"
                                            fill="#1f557d"
                                            radius={[6, 6, 0, 0]}
                                            maxBarSize={55}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </section>

                        <section className="admin-statistics-chart-panel">
                            <div className="admin-statistics-chart-heading">
                                <div className="admin-statistics-chart-icon gold">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <h2>Job Fair Participation</h2>
                                    <p>Employer and jobseeker registrations</p>
                                </div>
                            </div>

                            <div className="admin-statistics-chart pie">
                                {participationData.some(
                                    (item) => item.value > 0
                                ) ? (
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <PieChart>
                                            <Pie
                                                data={participationData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="45%"
                                                outerRadius={95}
                                                innerRadius={48}
                                                paddingAngle={3}
                                                label={({ value }) =>
                                                    formatNumber(value)
                                                }
                                            >
                                                {participationData.map(
                                                    (entry, index) => (
                                                        <Cell
                                                            key={entry.name}
                                                            fill={
                                                                pieColors[
                                                                    index %
                                                                        pieColors.length
                                                                ]
                                                            }
                                                        />
                                                    )
                                                )}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value) =>
                                                    formatNumber(value)
                                                }
                                            />
                                            <Legend
                                                verticalAlign="bottom"
                                                iconType="circle"
                                                wrapperStyle={{
                                                    fontSize: 11,
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="admin-statistics-empty-chart">
                                        <Users size={32} />
                                        <p>
                                            No job fair participation records
                                            yet.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    <div className="admin-statistics-note">
                        <AlertCircle size={18} />
                        <p>
                            These figures show the current totals returned by
                            your database. The charts compare available totals;
                            they do not represent monthly trends.
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}

export default AdminStatistics;
