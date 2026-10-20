import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import JobseekerDashboard from "./dashboard/jobseeker/JobseekerDashboard";
import FindJobs from "./jobseeker/FindJobs";
import Applications from "./jobseeker/Applications";
import SavedJobs from "./jobseeker/SavedJobs";
import JobFairs from "./jobseeker/JobFairs";
import PESOEvents from "./jobseeker/PESOEvents";
import Announcements from "./jobseeker/Announcements";
import Reports from "./jobseeker/Reports";
import MyProfile from "./jobseeker/MyProfile";
import Settings from "./jobseeker/Settings";
import EmployerDashboard from "./dashboard/employer/EmployerDashboard";
import EmployerJobs from "./employer/EmployerJobs";
import Applicants from "./employer/Applicants";
import EmployerJobFairs from "./employer/EmployerJobFairs";
import EmployerAnnouncements from "./employer/EmployerAnnouncements";
import EmployerReports from "./employer/EmployerReports";
import EmployerCompanyProfile from "./employer/EmployerCompanyProfile";
import EmployerSettings from "./employer/EmployerSettings";
import AdminDashboard from "./dashboard/admin/AdminDashboard";
import AdminUsers from "./admin/AdminUsers";
import AdminJobs from "./admin/AdminJobs";
import AdminJobFairs from "./admin/AdminJobFairs";
import AdminEvents from "./admin/AdminEvents";
import AdminAnnouncements from "./admin/AdminAnnouncements";
import AdminReports from "./admin/AdminReports";
import AdminStatistics from "./admin/AdminStatistics";
import AdminProfile from "./admin/AdminProfile";
import AdminSettings from "./admin/AdminSettings";

import "./App.css";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

function LandingPage() {
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);

    return (  
        <div className="landing-page">

            {/* Navigation */}
            <header className="landing-header">
                <div className="brand">
                    <img
                        src="/images/danao-logo.jpg"
                        alt="Danao Logo"
                        className="brand-logo"
                    />

                    <div className="brand-text">
                        <span className="brand-title">
                            MUNICIPALITY OF DANAO
                        </span>

                        <span className="brand-subtitle">
                            Public Employment Service Office
                        </span>
                    </div>
                </div>

                <nav className="landing-nav">
                    <a href="#home">Home</a>
                    <a href="#services">Services</a>
                    <a href="#jobs">Opportunities</a>
                    <a href="#about">About PESO</a>
                </nav>

                <div className="header-actions">
                   <button
                        className="btn-login"
                        onClick={() => {
                            setShowLogin(true);
                            setShowRegister(false);
                        }}
                    >
                        Login
                    </button>

                    <button
                        className="btn-register"
                        onClick={() => {
                            setShowRegister(true);
                            setShowLogin(false);
                        }}
                    >
                        Register
                    </button>
                </div>
            </header>


            {/* Hero */}
            <main>

                <section className="hero-section" id="home">
                    <div className="hero-content">

                        <span className="hero-label">
                            MUNICIPALITY OF DANAO • PESO
                        </span>

                        <h1>
                            Employment Opportunities,
                            <span>Closer to You.</span>
                        </h1>

                        <p>
                            The Public Employment Service Office (PESO) of the
                            Municipality of Danao connects local jobseekers with
                            employment opportunities, employers, job fairs, and
                            career services.
                        </p>

                        <div className="hero-actions">
                            <a
                                href="#jobs"
                                className="btn-primary"
                            >
                                Explore Job Opportunities
                            </a>

                            <a
                                href="#about"
                                className="btn-secondary"
                            >
                                Learn More
                            </a>
                        </div>

                        <div className="hero-trust">
                            <span className="trust-dot"></span>
                            Official Municipality of Danao Employment Service
                        </div>

                    </div>


                    <div className="hero-visual">
                        <div className="hero-card">

                            <img
                                src="/images/danao-logo.jpg"
                                alt="Municipality of Danao"
                            />

                            <div className="hero-card-content">

                                <span>
                                    MUNICIPALITY OF DANAO
                                </span>

                                <strong>
                                    Public Employment Service Office
                                </strong>

                                <p>
                                    Connecting jobseekers and employers
                                    through accessible employment services.
                                </p>

                            </div>

                        </div>
                    </div>
                </section>


                {/* Services */}
                <section
                    className="services-section"
                    id="services"
                >
                    <div className="section-heading">

                        <span>WHAT WE OFFER</span>

                        <h2>
                            Employment services made simpler.
                        </h2>

                        <p>
                            Access employment opportunities and PESO services
                            through one convenient platform.
                        </p>

                    </div>


                    <div className="services-grid">

                        <div className="service-card">
                            <div className="service-icon">01</div>

                            <h3>
                                Find Opportunities
                            </h3>

                            <p>
                                Search and explore available job opportunities
                                from participating employers.
                            </p>
                        </div>


                        <div className="service-card">
                            <div className="service-icon">02</div>

                            <h3>
                                Job Fairs
                            </h3>

                            <p>
                                Discover upcoming job fairs and connect directly
                                with participating employers.
                            </p>
                        </div>


                        <div className="service-card">
                            <div className="service-icon">03</div>

                            <h3>
                                PESO Events
                            </h3>

                            <p>
                                Stay informed about employment programs,
                                activities, and upcoming events.
                            </p>
                        </div>


                        <div className="service-card">
                            <div className="service-icon">04</div>

                            <h3>
                                Career Connection
                            </h3>

                            <p>
                                Build meaningful connections between qualified
                                jobseekers and employers.
                            </p>
                        </div>

                    </div>
                </section>


                {/* Featured Employment Opportunities */}
                <section
                    className="jobs-section"
                    id="jobs"
                >

                    <div className="section-heading">

                        <span>
                            AVAILABLE OPPORTUNITIES
                        </span>

                        <h2>
                            Find your next opportunity.
                        </h2>

                        <p>
                            Explore employment opportunities from participating
                            employers in the Municipality of Danao.
                        </p>

                    </div>


                    <div className="jobs-grid">

                        <div className="job-card">

                            <div className="job-card-top">
                                <span className="job-type">
                                    FULL-TIME
                                </span>

                                <span className="job-location">
                                    Danao, Bohol
                                </span>
                            </div>

                            <h3>
                                Administrative Assistant
                            </h3>

                            <p className="job-company">
                                Sample Company
                            </p>

                            <p className="job-description">
                                Assist with administrative tasks, document
                                preparation, and daily office operations.
                            </p>

                            <button className="job-link">
                                View Opportunity →
                            </button>

                        </div>


                        <div className="job-card">

                            <div className="job-card-top">
                                <span className="job-type">
                                    FULL-TIME
                                </span>

                                <span className="job-location">
                                    Danao, Bohol
                                </span>
                            </div>

                            <h3>
                                Customer Service Representative
                            </h3>

                            <p className="job-company">
                                Sample Company
                            </p>

                            <p className="job-description">
                                Provide customer assistance, handle inquiries,
                                and help maintain excellent customer service.
                            </p>

                            <button className="job-link">
                                View Opportunity →
                            </button>

                        </div>


                        <div className="job-card">

                            <div className="job-card-top">
                                <span className="job-type">
                                    FULL-TIME
                                </span>

                                <span className="job-location">
                                    Danao, Bohol
                                </span>
                            </div>

                            <h3>
                                Sales Representative
                            </h3>

                            <p className="job-company">
                                Sample Company
                            </p>

                            <p className="job-description">
                                Assist customers, promote products, and support
                                daily sales operations.
                            </p>

                            <button className="job-link">
                                View Opportunity →
                            </button>

                        </div>

                    </div>


                    <div className="jobs-action">
                        <button className="btn-primary">
                            Explore All Opportunities
                        </button>
                    </div>

                </section>


                {/* About */}
                <section
                    className="about-section"
                    id="about"
                >

                    <div className="about-content">

                        <span>
                            ABOUT PESO
                        </span>

                        <h2>
                            Connecting the community with
                            <strong>
                                meaningful opportunities.
                            </strong>
                        </h2>

                        <p>
                            The Public Employment Service Office of the
                            Municipality of Danao provides employment
                            facilitation and career services that help
                            jobseekers discover opportunities while helping
                            employers find qualified applicants.
                        </p>

                        <a
                            href="#home"
                            className="btn-primary"
                        >
                            Learn About PESO
                        </a>

                    </div>

                </section>

            </main>


            {/* Footer */}
            <footer className="landing-footer">

                <div>
                    <strong>
                        MUNICIPALITY OF DANAO
                    </strong>

                    <p>
                        Public Employment Service Office (PESO)
                    </p>
                </div>

                <span>
                    © 2026 Municipality of Danao • Public Employment Service Office
                </span>

            </footer>

            {showLogin && (
              <div
                  className="auth-modal-overlay"
                  onClick={() => setShowLogin(false)}
              >
                  <div
                      className="auth-modal"
                      onClick={(e) => e.stopPropagation()}
                  >
                      <Login
                          onClose={() => setShowLogin(false)}
                          onRegister={() => {
                              setShowLogin(false);
                              setShowRegister(true);
                          }}
                      />
                  </div>
              </div>
          )}

          {showRegister && (
              <div
                  className="auth-modal-overlay"
                  onClick={() => setShowRegister(false)}
              >
                  <div
                      className="auth-modal"
                      onClick={(e) => e.stopPropagation()}
                  >
                      <Register
                          onClose={() => setShowRegister(false)}
                          onLogin={() => {
                              setShowRegister(false);
                              setShowLogin(true);
                          }}
                      />
                  </div>
              </div>
          )}

        </div>
    );
}


function App() {
    return (
        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<LandingPage />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

              <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<JobseekerDashboard />} />
                     <Route path="find-jobs" element={<FindJobs />} />
                     <Route path="applications" element={<Applications />} />
                     <Route path="saved-jobs" element={<SavedJobs />} />
                     <Route path="job-fairs" element={<JobFairs />} />
                     <Route path="peso-events" element={<PESOEvents />} />
                     <Route path="announcements" element={<Announcements />} />
                     <Route path="reports" element={<Reports />} />
                     <Route path="my-profile" element={<MyProfile/>}/>
                     <Route path="settings" element={<Settings/>}/>     
                </Route>

                <Route path="/employer" element={<DashboardLayout />}>
                    <Route path="dashboard" element={<EmployerDashboard />} />
                    <Route path="jobs" element={<EmployerJobs />} />
                    <Route path="applicants" element={<Applicants />} />
                    <Route path="job-fairs" element={<EmployerJobFairs />} />
                    <Route path="announcements" element={<EmployerAnnouncements />} />
                    <Route path="reports" element={<EmployerReports />} />
                    <Route path="company-profile" element={<EmployerCompanyProfile />} />
                    <Route path="settings" element={<EmployerSettings />} />
                </Route>

                <Route path="/admin" element={<DashboardLayout />}>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsers />} />
                     <Route path="jobs" element={<AdminJobs />} />
                     <Route path="job-fairs" element={<AdminJobFairs />} />
                     <Route path="events" element={<AdminEvents />} />
                     <Route path="announcements" element={<AdminAnnouncements />} />
                     <Route path="reports" element={<AdminReports />} />
                     <Route path="statistics" element={<AdminStatistics />} />
                     <Route path="my-profile" element={<AdminProfile />} />
                     <Route path="settings" element={<AdminSettings />} />
                </Route>

            </Routes>

        </BrowserRouter>
    );
}

export default App;