function JobseekerDashboard() {
    return (
        <div className="jobseeker-dashboard">

            {/* Welcome */}
            <section className="dashboard-welcome">
                <div>
                    <span className="dashboard-section-label">
                        JOBSEEKER DASHBOARD
                    </span>

                    <h2>
                        Welcome to your PESO dashboard.
                    </h2>

                    <p>
                        Manage your applications, discover new opportunities,
                        and stay connected with employment services in Danao.
                    </p>
                </div>
            </section>


            {/* Statistics */}
            <section className="dashboard-stats">

                <div className="dashboard-stat-card">
                    <span>Applications</span>
                    <strong>0</strong>
                    <small>Total applications submitted</small>
                </div>

                <div className="dashboard-stat-card">
                    <span>Under Review</span>
                    <strong>0</strong>
                    <small>Applications being reviewed</small>
                </div>

                <div className="dashboard-stat-card">
                    <span>Shortlisted</span>
                    <strong>0</strong>
                    <small>Applications shortlisted</small>
                </div>

                <div className="dashboard-stat-card">
                    <span>Saved Jobs</span>
                    <strong>0</strong>
                    <small>Jobs saved for later</small>
                </div>

            </section>


            {/* Main Grid */}
            <section className="dashboard-grid">

                {/* Recommended Jobs */}
                <div className="dashboard-panel">

                    <div className="dashboard-panel-header">
                        <div>
                            <span>OPPORTUNITIES</span>
                            <h3>Recommended Jobs</h3>
                        </div>

                        <button type="button">
                            View All
                        </button>
                    </div>

                    <div className="dashboard-empty-state">
                        <div className="empty-state-number">
                            01
                        </div>

                        <h4>
                            No recommended jobs yet
                        </h4>

                        <p>
                            Job recommendations will appear here based on
                            your profile and preferences.
                        </p>
                    </div>

                </div>


                {/* Application Updates */}
                <div className="dashboard-panel">

                    <div className="dashboard-panel-header">
                        <div>
                            <span>APPLICATIONS</span>
                            <h3>Recent Updates</h3>
                        </div>

                        <button type="button">
                            View All
                        </button>
                    </div>

                    <div className="dashboard-empty-state">
                        <div className="empty-state-number">
                            02
                        </div>

                        <h4>
                            No application updates
                        </h4>

                        <p>
                            Updates about your submitted applications
                            will appear here.
                        </p>
                    </div>

                </div>

            </section>


            {/* Bottom Section */}
            <section className="dashboard-grid">

                {/* Job Fairs */}
                <div className="dashboard-panel">

                    <div className="dashboard-panel-header">
                        <div>
                            <span>PESO SERVICES</span>
                            <h3>Upcoming Job Fairs</h3>
                        </div>

                        <button type="button">
                            View All
                        </button>
                    </div>

                    <div className="dashboard-empty-state compact">
                        <h4>
                            No upcoming job fairs
                        </h4>

                        <p>
                            Upcoming PESO job fairs will be displayed here.
                        </p>
                    </div>

                </div>


                {/* Announcements */}
                <div className="dashboard-panel">

                    <div className="dashboard-panel-header">
                        <div>
                            <span>MUNICIPALITY OF DANAO</span>
                            <h3>Announcements</h3>
                        </div>

                        <button type="button">
                            View All
                        </button>
                    </div>

                    <div className="dashboard-empty-state compact">
                        <h4>
                            No announcements
                        </h4>

                        <p>
                            Important PESO announcements will appear here.
                        </p>
                    </div>

                </div>

            </section>

        </div>
    );
}

export default JobseekerDashboard;